#!/usr/bin/env node
/**
 * 从 ECDICT 原始 CSV 构建掰it 词典数据
 *
 * 输入：/tmp/ecdict.csv（从 github.com/skywind3000/ECDICT 下载）
 * 输出：
 *   data/word-frequency.json — 常用词列表（BNC/FRQ <= 5000），不标注这些词
 *   data/dict-ecdict.json   — 生词词典（有释义、非常用词），用于标注
 *   data/lemma-map.json     — 词形变体 → 原形映射，用于词形还原
 *
 * 用法：node scripts/build-dict-from-ecdict.mjs [--csv /path/to/ecdict.csv]
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

// ========== 配置 ==========

const COMMON_WORD_THRESHOLD = 5000; // BNC/FRQ <= 此值视为常用词
const DICT_MAX_FREQ = 30000;        // 超过此排名的词太冷僻，不收录
const MAX_DEF_LENGTH = 60;          // 释义最大字符数

// ========== CSV 解析 ==========

function parseCSV(filepath) {
  const content = readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');
  const header = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const values = parseCSVLine(line);
    const row = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = values[j] || '';
    }
    rows.push(row);
  }
  return rows;
}

/** 处理 CSV 引号和逗号 */
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

// ========== 释义精简 ==========

/** 从 ECDICT translation 提取简洁释义 */
function shortenTranslation(trans) {
  if (!trans) return '';

  // 取第一行
  let line = trans.split('\n')[0].trim();

  // 去掉开头的 [计]/[医]/[法] 等领域标记（如果整条只有一个领域意思）
  line = line.replace(/^\[(?:计|医|法|经|化|机|建|电|植|动|矿|核|农|军)\]\s*/, '');

  // 如果太长，在 ；处截断
  if (line.length > MAX_DEF_LENGTH) {
    const cut = line.lastIndexOf('；', MAX_DEF_LENGTH);
    if (cut > 10) {
      line = line.substring(0, cut);
    } else {
      const cut2 = line.lastIndexOf(',', MAX_DEF_LENGTH);
      if (cut2 > 10) {
        line = line.substring(0, cut2);
      } else {
        line = line.substring(0, MAX_DEF_LENGTH);
      }
    }
  }

  return line;
}

// ========== 基础词排除表 ==========
// 这些词及其所有变形永远不该出现在词典里，任何英语学习者都认识
const BASIC_WORDS = new Set([
  // be 动词
  'be', 'is', 'am', 'are', 'was', 'were', 'been', 'being',
  // have
  'have', 'has', 'had', 'having',
  // do
  'do', 'does', 'did', 'doing', 'done',
  // 情态动词
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
  // 代词
  'i', 'me', 'my', 'mine', 'myself',
  'you', 'your', 'yours', 'yourself',
  'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself',
  'we', 'us', 'our', 'ours', 'ourselves',
  'they', 'them', 'their', 'theirs', 'themselves',
  // 冠词、指示词、限定词
  'a', 'an', 'the', 'this', 'that', 'these', 'those',
  'some', 'any', 'no', 'every', 'each', 'all', 'both', 'many', 'much',
  'few', 'little', 'more', 'most', 'other', 'another', 'such',
  // 介词
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'by', 'about',
  'into', 'out', 'up', 'down', 'off', 'over', 'under', 'through',
  'after', 'before', 'between', 'during', 'without', 'against', 'along',
  'around', 'behind', 'below', 'beside', 'beyond', 'near', 'since', 'upon',
  // 连词
  'and', 'but', 'or', 'nor', 'so', 'yet', 'if', 'when', 'while',
  'because', 'although', 'though', 'since', 'until', 'unless', 'as',
  // 疑问词
  'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
  // 最基础的动词
  'go', 'goes', 'went', 'gone', 'going',
  'come', 'comes', 'came', 'coming',
  'get', 'gets', 'got', 'gotten', 'getting',
  'make', 'makes', 'made', 'making',
  'take', 'takes', 'took', 'taken', 'taking',
  'give', 'gives', 'gave', 'given', 'giving',
  'say', 'says', 'said', 'saying',
  'tell', 'tells', 'told', 'telling',
  'think', 'thinks', 'thought', 'thinking',
  'know', 'knows', 'knew', 'known', 'knowing',
  'see', 'sees', 'saw', 'seen', 'seeing',
  'look', 'looks', 'looked', 'looking',
  'want', 'wants', 'wanted', 'wanting',
  'need', 'needs', 'needed', 'needing',
  'like', 'likes', 'liked', 'liking',
  'use', 'uses', 'used', 'using',
  'find', 'finds', 'found', 'finding',
  'put', 'puts', 'putting',
  'keep', 'keeps', 'kept', 'keeping',
  'let', 'lets', 'letting',
  'begin', 'begins', 'began', 'begun', 'beginning',
  'seem', 'seems', 'seemed', 'seeming',
  'help', 'helps', 'helped', 'helping',
  'show', 'shows', 'showed', 'shown', 'showing',
  'hear', 'hears', 'heard', 'hearing',
  'play', 'plays', 'played', 'playing',
  'run', 'runs', 'ran', 'running',
  'move', 'moves', 'moved', 'moving',
  'live', 'lives', 'lived', 'living',
  'believe', 'believes', 'believed', 'believing',
  'bring', 'brings', 'brought', 'bringing',
  'happen', 'happens', 'happened', 'happening',
  'write', 'writes', 'wrote', 'written', 'writing',
  'sit', 'sits', 'sat', 'sitting',
  'stand', 'stands', 'stood', 'standing',
  'lose', 'loses', 'lost', 'losing',
  'pay', 'pays', 'paid', 'paying',
  'meet', 'meets', 'met', 'meeting',
  'feel', 'feels', 'felt', 'feeling',
  'try', 'tries', 'tried', 'trying',
  'leave', 'leaves', 'left', 'leaving',
  'call', 'calls', 'called', 'calling',
  'ask', 'asks', 'asked', 'asking',
  'read', 'reads', 'reading',
  'open', 'opens', 'opened', 'opening',
  'close', 'closes', 'closed', 'closing',
  'stop', 'stops', 'stopped', 'stopping',
  'start', 'starts', 'started', 'starting',
  'turn', 'turns', 'turned', 'turning',
  'set', 'sets', 'setting',
  'hold', 'holds', 'held', 'holding',
  'learn', 'learns', 'learned', 'learning',
  'change', 'changes', 'changed', 'changing',
  'follow', 'follows', 'followed', 'following',
  'talk', 'talks', 'talked', 'talking',
  'work', 'works', 'worked', 'working',
  'eat', 'eats', 'ate', 'eaten', 'eating',
  'drink', 'drinks', 'drank', 'drunk', 'drinking',
  'sleep', 'sleeps', 'slept', 'sleeping',
  'walk', 'walks', 'walked', 'walking',
  'buy', 'buys', 'bought', 'buying',
  'sell', 'sells', 'sold', 'selling',
  'send', 'sends', 'sent', 'sending',
  'build', 'builds', 'built', 'building',
  'spend', 'spends', 'spent', 'spending',
  'grow', 'grows', 'grew', 'grown', 'growing',
  'kill', 'kills', 'killed', 'killing',
  'die', 'dies', 'died', 'dying',
  'wait', 'waits', 'waited', 'waiting',
  'watch', 'watches', 'watched', 'watching',
  'pick', 'picks', 'picked', 'picking',
  'fall', 'falls', 'fell', 'fallen', 'falling',
  'cut', 'cuts', 'cutting',
  'wear', 'wears', 'wore', 'worn', 'wearing',
  'win', 'wins', 'won', 'winning',
  'catch', 'catches', 'caught', 'catching',
  'pass', 'passes', 'passed', 'passing',
  'break', 'breaks', 'broke', 'broken', 'breaking',
  'add', 'adds', 'added', 'adding',
  'love', 'loves', 'loved', 'loving',
  'hate', 'hates', 'hated', 'hating',
  // 最基础的形容词
  'good', 'better', 'best',
  'bad', 'worse', 'worst',
  'big', 'bigger', 'biggest',
  'small', 'smaller', 'smallest',
  'new', 'newer', 'newest',
  'old', 'older', 'oldest',
  'long', 'longer', 'longest',
  'short', 'shorter', 'shortest',
  'high', 'higher', 'highest',
  'low', 'lower', 'lowest',
  'great', 'young', 'right', 'wrong', 'real', 'sure', 'own', 'able',
  'first', 'last', 'next', 'same', 'different', 'important', 'large',
  'hard', 'easy', 'hot', 'cold', 'fast', 'slow', 'full', 'free',
  'nice', 'pretty', 'happy', 'sad', 'true', 'false',
  'black', 'white', 'red', 'blue', 'green',
  // 最基础的名词
  'man', 'men', 'woman', 'women', 'child', 'children', 'boy', 'girl',
  'people', 'person', 'friend', 'family',
  'time', 'day', 'night', 'year', 'week', 'month', 'today', 'tomorrow',
  'life', 'world', 'country', 'city', 'home', 'house', 'school', 'room',
  'way', 'place', 'hand', 'head', 'face', 'eye', 'body', 'water', 'food',
  'name', 'thing', 'part', 'side', 'end', 'door', 'car', 'money', 'book',
  'game', 'number', 'story', 'word', 'question', 'answer',
  // 最基础的副词
  'not', 'very', 'also', 'too', 'just', 'still', 'already', 'never',
  'always', 'often', 'here', 'there', 'then', 'now', 'only', 'even',
  'again', 'ever', 'quite', 'really', 'maybe', 'almost', 'enough',
  'away', 'back', 'well', 'far', 'soon', 'later', 'together',
  // 其他基础词
  'yes', 'no', 'ok', 'okay', 'please', 'thank', 'thanks', 'sorry',
  'than', 'like', 'just', 'about', 'very', 'really',
]);

// ========== 主流程 ==========

const csvPath = process.argv.includes('--csv')
  ? process.argv[process.argv.indexOf('--csv') + 1]
  : '/tmp/ecdict.csv';

console.log(`Reading ECDICT from: ${csvPath}`);
const rows = parseCSV(csvPath);
console.log(`Parsed ${rows.length} rows`);

// ---------- 1. 构建常用词列表 + 词典 ----------

const commonWords = new Set();
const dict = {};
const allWordsWithFreq = new Map(); // word → minFreq, for lemma resolution

let skippedMultiWord = 0;
let skippedNoTrans = 0;
let skippedNonAscii = 0;

for (const row of rows) {
  const word = row.word?.trim().toLowerCase();
  if (!word) continue;

  // 跳过多词短语
  if (word.includes(' ') || word.includes('/')) {
    skippedMultiWord++;
    continue;
  }

  // 跳过非 ASCII
  if (!/^[a-z][a-z'-]*$/i.test(word)) {
    skippedNonAscii++;
    continue;
  }

  // 需要有中文释义
  const trans = row.translation?.trim();
  if (!trans) {
    skippedNoTrans++;
    continue;
  }

  // 计算词频（取 BNC 和 FRQ 的较小值，即更常用的排名）
  const bnc = parseInt(row.bnc) || 0;
  const frq = parseInt(row.frq) || 0;
  const minFreq = Math.min(
    bnc > 0 ? bnc : 999999,
    frq > 0 ? frq : 999999
  );

  allWordsWithFreq.set(word, minFreq);

  // 基础词：永远不进词典（is, are, do, go, man, good 等）
  if (BASIC_WORDS.has(word)) {
    commonWords.add(word); // 也加入常用词确保运行时不标注
    continue;
  }

  // 常用词：加入词频列表
  if (minFreq <= COMMON_WORD_THRESHOLD) {
    commonWords.add(word);
    continue;
  }

  // 有词频数据且在合理范围内 → 收入词典
  if (minFreq <= DICT_MAX_FREQ) {
    if (!dict[word]) {
      dict[word] = shortenTranslation(trans);
    }
    continue;
  }

  // 无词频但有 Collins 评级或考试标签 → 也收入词典
  const collins = parseInt(row.collins) || 0;
  const hasTag = !!(row.tag?.trim());
  if (collins > 0 || hasTag) {
    if (!dict[word]) {
      dict[word] = shortenTranslation(trans);
    }
  }
}

// ---------- 2. 构建词形映射表 ----------

const lemmaMap = {}; // variant → base

for (const row of rows) {
  const word = row.word?.trim().toLowerCase();
  const exchange = row.exchange?.trim();
  if (!word || !exchange) continue;
  if (!/^[a-z][a-z'-]*$/i.test(word)) continue;

  // exchange 格式：s:dogs/p:dogged/d:dogged/i:dogging/3:dogs
  // 类型：0=原形, s=复数, p=过去式, d=过去分词, i=进行时, 3=第三人称, r=比较级, t=最高级
  const parts = exchange.split('/');
  for (const part of parts) {
    const colonIdx = part.indexOf(':');
    if (colonIdx < 0) continue;
    const type = part.substring(0, colonIdx);
    const variants = part.substring(colonIdx + 1).split(',');

    if (type === '0') {
      // 当前 word 的原形是 variants[0]
      const base = variants[0]?.toLowerCase();
      if (base && base !== word) {
        lemmaMap[word] = base;
      }
    } else {
      // variants 是 word 的变形
      for (const v of variants) {
        const variant = v.trim().toLowerCase();
        if (variant && variant !== word) {
          // 只在 variant 还没有映射时设置（优先保留 0: 原形映射）
          if (!lemmaMap[variant]) {
            lemmaMap[variant] = word;
          }
        }
      }
    }
  }
}

// ---------- 3. 清理词形映射 ----------

// 确保映射链不超过 1 层（variant → base → ???）
for (const [variant, base] of Object.entries(lemmaMap)) {
  if (lemmaMap[base]) {
    lemmaMap[variant] = lemmaMap[base];
  }
}

// 精简：只保留有用的映射
// - variant 本身不在常用词/词典里（否则直接查到了，不需要 lemma）
// - base 在常用词或词典里（否则查到原形也没用）
const prunedLemma = {};
for (const [variant, base] of Object.entries(lemmaMap)) {
  if (commonWords.has(variant) || dict[variant]) continue; // variant 已直接覆盖
  if (commonWords.has(base) || dict[base]) {
    prunedLemma[variant] = base;
  }
}
Object.keys(lemmaMap).forEach(k => delete lemmaMap[k]);
Object.assign(lemmaMap, prunedLemma);

// ---------- 4. 合并现代词汇补充 ----------

const modernVocabPath = join(dataDir, 'modern-vocab.json');
try {
  const modernVocab = JSON.parse(readFileSync(modernVocabPath, 'utf-8'));
  let added = 0;
  let updated = 0;
  for (const [word, def] of Object.entries(modernVocab)) {
    const lower = word.toLowerCase();
    if (commonWords.has(lower)) continue;
    if (dict[lower]) {
      // 已有 ECDICT 释义 → 追加现代义项
      if (!dict[lower].includes(def)) {
        dict[lower] = dict[lower] + '｜' + def;
        updated++;
      }
    } else {
      dict[lower] = def;
      added++;
    }
  }
  console.log(`Modern vocab: ${added} added, ${updated} updated from modern-vocab.json`);
} catch (e) {
  console.log('No modern-vocab.json found, skipping');
}

// ---------- 5. 输出 ----------

// 常用词列表（按字母排序的数组）
const freqList = [...commonWords].sort();
writeFileSync(
  join(dataDir, 'word-frequency.json'),
  JSON.stringify(freqList) + '\n'
);

// 词典（按字母排序的对象）
const sortedDict = {};
for (const key of Object.keys(dict).sort()) {
  sortedDict[key] = dict[key];
}
writeFileSync(
  join(dataDir, 'dict-ecdict.json'),
  JSON.stringify(sortedDict, null, 2) + '\n'
);

// 词形映射表
const sortedLemma = {};
for (const key of Object.keys(lemmaMap).sort()) {
  sortedLemma[key] = lemmaMap[key];
}
writeFileSync(
  join(dataDir, 'lemma-map.json'),
  JSON.stringify(sortedLemma) + '\n'
);

// ---------- 6. 报告 ----------

const freqJSON = JSON.stringify(freqList);
const dictJSON = JSON.stringify(sortedDict);
const lemmaJSON = JSON.stringify(sortedLemma);

console.log('\n=== Build Report ===');
console.log(`Skipped: ${skippedMultiWord} multi-word, ${skippedNoTrans} no-trans, ${skippedNonAscii} non-ASCII`);
console.log(`Common words (freq <= ${COMMON_WORD_THRESHOLD}): ${freqList.length} → ${(freqJSON.length / 1024).toFixed(0)}KB`);
console.log(`Dictionary entries: ${Object.keys(sortedDict).length} → ${(dictJSON.length / 1024).toFixed(0)}KB`);
console.log(`Lemma mappings: ${Object.keys(sortedLemma).length} → ${(lemmaJSON.length / 1024).toFixed(0)}KB`);
console.log(`Total data size: ${((freqJSON.length + dictJSON.length + lemmaJSON.length) / 1024).toFixed(0)}KB`);

// ---------- 7. 验证测试词 ----------

console.log('\n=== Test Words (Karpathy tweet) ===');
const testWords = ['crappy', 'bolted', 'bolt', 'exotic', 'compaction', 'suspicion',
                   'paradigm', 'realm', 'established', 'implementations'];
for (const w of testWords) {
  const isCommon = commonWords.has(w);
  const inDict = w in sortedDict;
  const lemma = lemmaMap[w];
  let status;
  if (isCommon) {
    status = `COMMON (skip)`;
  } else if (inDict) {
    status = `DICT ✓ "${sortedDict[w]}"`;
  } else if (lemma) {
    const lemmaCommon = commonWords.has(lemma);
    const lemmaInDict = lemma in sortedDict;
    status = `LEMMA → ${lemma} (${lemmaCommon ? 'common, skip' : lemmaInDict ? 'in dict ✓' : 'not in dict'})`;
  } else {
    status = `NOT FOUND ✗`;
  }
  console.log(`  ${w}: ${status}`);
}

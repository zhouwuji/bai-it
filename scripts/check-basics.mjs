import { readFileSync } from 'fs';

const freq = new Set(JSON.parse(readFileSync('data/word-frequency.json', 'utf-8')));
const dict = JSON.parse(readFileSync('data/dict-ecdict.json', 'utf-8'));

const basics = [
  "are","is","am","was","were","be","been","being",
  "has","had","have","having",
  "do","does","did","doing","done",
  "can","could","will","would","shall","should","may","might","must",
  "i","you","he","she","it","we","they","me","him","her","us","them",
  "my","your","his","its","our","their","mine","yours","ours","theirs",
  "a","an","the","this","that","these","those","some","any","every","each","all","many","much","few",
  "in","on","at","to","for","of","with","from","by","about","into","through","after","before","between",
  "and","but","or","if","when","while","because","although","though","since","until",
  "what","which","who","whom","whose","where","why","how",
  "not","very","also","too","just","still","already","never","always","often","here","there","then","now",
  "yes","no","well","so","than","more","most","other","only","even","again",
];

const missing = basics.filter(w => !freq.has(w));
const inDict = missing.filter(w => dict[w]);

console.log(`Missing from freq (${missing.length}):`);
console.log(missing.join(", "));
console.log(`\nOf those, IN dict (would be wrongly marked, ${inDict.length}):`);
inDict.forEach(w => console.log(`  ${w}: ${(dict[w]||"").substring(0,50)}`));

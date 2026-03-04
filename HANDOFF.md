# 掰it — 交接状态

> 每个 session 开始时先看这个文件，结束时更新它。

## 当前状态

**插件修复完成，发布准备中。** 198 个单元测试全通过，构建正常。

### 本次完成（0305 插件修复：Twitter Show more + DOM 策略 + 词典合并）

**三块修复一起提交：**

1. **Twitter "Show more" 修复** — 跳过含 "Show more" 按钮的推文，保留按钮让用户自己点
   - **根因**：Twitter React 通过 `scrollHeight > clientHeight` 重测量决定是否渲染 "Show more"，隐藏 tweetText 导致 React 认为无溢出，通过 reconciliation 删除按钮
   - **方案**：`scanPage` 中检测到 `[data-testid="tweet-text-show-more-link"]` → `continue` 跳过
   - 用户手动点击 "Show more" → React 加载全文 → MutationObserver 检测到变化 → `scanPage` 处理全文
2. **DOM 插入策略增强**
   - 父容器防卫：`el.querySelector(DOM_SELECTORS)` 跳过包含更具体匹配的父容器
   - 隐藏后代防卫：`el.closest(".enlearn-original-hidden")` 跳过已隐藏元素内的后代
   - `.enlearn-clamp-override` CSS 不再强制 `display: block !important`（避免破坏 flex 布局）
   - MutationObserver 增强：场景 A（原地内容更新）+ 场景 B（React 元素替换 + 孤儿清理）
   - `restoreSingleElement()` 新增：单元素恢复函数
3. **词典合并：删除 industry pack 系统**（同上次 session，之前未提交）
   - AI 义项合并进 `dict-ecdict.json`，删除 `data/industry-ai.json`
   - 移除 `loadIndustryPack`、`lookupIndustry`、`industryMaps`
   - 清理全链路：types.ts、background、useConfig、DailyReview、测试

### 上次完成（0304 设置页精简 + API 调试）

**Settings Tab 大幅精简，只保留 API Key 配置 + 测试连接。** 5 家 provider 模型列表更新为最新 ID。端到端测试连接走完整 `chunkSentences()` 链路。Gemini 3.1 Flash-Lite 和 DeepSeek 已验证跑通。

### 注意事项

- **IndexedDB 数据库名保持 `openen-data` / `openen-cache`**，改名会丢失已有用户数据
- **图标两套 PNG**：`icons/icon*.png`（默认无绿点）+ `icons/icon*-on.png`（启用态有绿点），background 通过 `chrome.action.setIcon()` 动态切换
- **辅助力度滑杆映射**：1-5 档同时控制 `chunkGranularity`（拆分规则激进度）和 `scanThreshold`（扫读最小词数），见 `src/popup/index.ts` ASSIST_TO_CONFIG
- **DOM 插入策略**：`insertChunkedElement()` 隐藏原始元素 + 兄弟插入 + 向上遍历修复 overflow/clamp
- **Twitter 兼容**：
  - 导航：`dispatchEvent` 到原始元素的 React Fiber 节点保持事件委托正常
  - Show more：跳过未展开推文，用户点 "Show more" 后 MutationObserver 自动处理
  - 短文本（< 8 词）不处理，避免干扰推文交互

---

## 下一步

**发布准备**（GitHub 开源 + Chrome Web Store 上架）：

### 发布前必做

1. **完整浏览器验收**（端到端，还没跑过）：
   - 浏览英文网页 → pending_sentences 写入 + 去重
   - 手动触发 → LLM 深度分析
   - 管理端懒处理 → 逐条填充
   - 生词 Tooltip + 掌握标记持久化
   - 引导系统各状态切换
2. **README.md 重写** — 当前版本过时（还写着"壁纸生成"等已删功能），需要面向用户重写
3. **PRIVACY.md 更新** — GitHub 仓库地址待确认后更新链接
4. **.gitignore 补充** — playground/mockup 文件、frontend-slides、截图目录
5. **publishing.md 清单推进** — 按清单逐项完成

### 发布清单概览（详见 `docs/publishing.md`）

**已完成**：MIT License、隐私政策
**待完成**：
- 开源：确认 GitHub 仓库地址、完善 README、检查 .gitignore、依赖 license 兼容性
- Chrome Web Store：注册开发者账号（$5）、准备素材（图标/截图/文案）、权限用途说明、数据披露表、提交审核

---

## 已确定的视觉方向：「锐 Sharp」

- 暗色系 #09090b + 红色 #ef4444
- Logo：ZCOOL KuaiLe 400 + Nunito 600
- UI：Syne 800（标题/数字）+ Space Grotesk 400/500（正文）
- 毛玻璃卡片 + 红色渐变边框 + noise 纹理 + 红色极光呼吸

## Playground 文件索引

| 文件 | 用途 |
|------|------|
| `playground-pages.html` | **六页面设计原型（定稿）**：总览 / Popup / 每日回味 / Content Script / 难句集 / 设置 |
| `playground-onboarding.html` | **引导态设计原型（定稿）**：三种状态切换（无 key / 有 key 无数据 / 有真实数据），示例数据 + 提示条 |
| `playground-vocab-tooltip.html` | **生词 Tooltip + 掌握态设计**：三种 tooltip 风格 + 掌握态对比（已选定"精致"风格 + inherit 融入） |
| `playground-logo-final.html` | **Logo 定稿确认**（ZCOOL KuaiLe + Nunito 600）|
| `playground-visual-directions.html` | 三种字体方向对比（已选定「锐 Sharp」）|
| `playground-logo-v5.html` | Logo 可爱度 12 档梯度微调 |
| `playground-logo-v4.html` | Logo 24 种字体组合探索 |
| `playground-logo-v3.html` | Logo v3 重新思考（一个词原则）|
| `playground-logo.html` | Logo v2 早期 10 方向探索（已过时）|
| `mockup-popup.html` | 早期 Popup 原型（白色版，已过时）|
| `mockup-scan-mode.html` | 扫读模式 mockup（讨论用）|

## 关键决策记录

### 词典统一（0304 新，替代三层词汇源）
- **删除 industry pack 系统**，AI 义项合并进 dict-ecdict.json
- 词典是唯一的标注源（不在词典中 → 不标注）
- AI 义项格式：`原义 | [AI] AI释义`，纯 AI 词条：`[AI] 释义`
- 产品名（ChatGPT、Claude 等）不入词典 → 不会被标注

### 三层体验模型（0303，替代原两层产品模型）
- **第一层**：装完即用 — 所有英文网页自动扫读，本地拆分 + 标生词，零配置
- **第二层**：手动掰句 — 用户点哪句拆哪句，无 API 时本地强制拆
- **第三层**：LLM 深度分析 — 有 API 时手动触发走 LLM，结果存管理端
- 详见 `docs/prd.md`「三层体验模型」章节

### 统一扫读（0303，替代原两种阅读模式）
- **不再区分扫读/细读**，删除 `detectReadingMode()` 站点列表
- 所有英文网页统一自动扫读 + 手动触发按需深入
- 详见 `docs/prd.md`「自动扫读 + 手动掰句」章节

### DOM 插入策略（0305 简化）
- **统一兄弟插入**：隐藏原始元素（`display: none`）+ 兄弟插入 chunked div + 向上遍历修复 overflow/clamp
- 向上遍历遇到 `<a>` / `<article>` 边界停止
- Twitter `dispatchEvent` 到原始元素保留 React 事件委托
- Twitter "Show more"：跳过未展开推文，MutationObserver 自动处理展开后的全文

### 数据采集懒处理（0303）
- 浏览时：原始句子存 `pending_sentences` 表（零成本）
- 管理端：打开时按页发 LLM（每页 10 条），翻页再发下一批
- 分析结果缓存到 `learning_records`，不重复发
- 详见 `docs/prd.md`「数据采集策略」章节

### 生词 Tooltip 设计（0304）
- **Tooltip 风格**：精致 — 词名（红色）+ 释义 + 低调掌握按钮
- **掌握态**：`color: inherit` — 融入所在行颜色
- **持久化**：`chrome.storage.local.knownWords` + IndexedDB 双写

### 生词标注方案
- **不直接显示中文释义**，用 hover 虚线（避免视觉干扰）
- **统一词典**：通用词典 + AI 义项合并 > LLM 语境化释义（仅 LLM 调用时获得）
- 所有元素（含未拆分的）都会标注生词

### 学习系统（管理端 Options 页）
- **页面结构**：四个 Tab——总览、每日回味、难句集、设置
- **核心单位是句子不是单词**：不做"生词本"，做"难句集"
- **难句卡片 6 层**：原句 → 句式标签 → 分块 → 句式讲解 → 学会表达 → 生词

### 技术栈
- 构建工具：ESBuild（沿用旧项目，加 React JSX 支持）
- 单包结构，不做 monorepo
- 浏览器测试：Puppeteer

## 已完成

- [x] Step 1-9 编码全部完成
- [x] 品牌命名 + 语言体系 + 视觉方向 + Logo 定稿
- [x] 六页面原型定稿 + 设计规范归档
- [x] Options Puppeteer 验收（39 断言 + 4 Tab 截图）
- [x] 产品方向调整 — ~~两层产品模型~~ → 三层体验模型
- [x] P0 修复：扫读模式生词释义
- [x] Popup UI 改造（锐 Sharp）
- [x] 全局改名 OpenEn → 掰it
- [x] 修复扫读模式拆分过少 + background 报错 + Tooltip 样式优化
- [x] 管理端示例数据 + 提示条（Puppeteer 截图验收通过）
- [x] 统一扫读架构讨论 + 文档更新（prd.md / architecture.md / testing.md）
- [x] **Phase 1 统一扫读重构 + Twitter/Substack 兼容**（编码 + 验证通过）
- [x] **Phase 2 数据采集 + 管理端懒处理**（编码完成）
- [x] **Options 生词 Tooltip + 掌握标记**（精致风格 + inherit 融入 + 持久化）
- [x] **设置页精简 + 模型更新 + 端到端测试连接**（Gemini 3.1 / DeepSeek 已验证跑通）
- [x] **词典合并：删除 industry pack 系统**（AI 义项合并进通用词典，198 测试通过）
- [x] **插件修复：Twitter Show more + DOM 策略增强 + MutationObserver**

## 编码细节

### 构建配置
- **ESM** 仅用于 background service worker（MV3 要求 `type: module`）
- **IIFE** 用于 content script、popup、options（Chrome 不支持 content script ESM）
- content.js 包含词汇数据打包后约 350KB（含合并后的词典），可接受

### 数据文件（data/）
- `word-frequency.json`：5000 常用词（来源：Google Trillion Word Corpus top 5000）
- `dict-ecdict.json`：6125 个词条（通用释义 + AI 等行业义项合并），格式 `原义 | [AI] AI释义`

### IndexedDB 数据层
- **数据库**：`openen-data`（与缓存数据库 `openen-cache` 独立）— 名称保持不改，避免丢失用户数据
- **10 张表**：原 9 张 + `pending_sentences`
- **全局规则**：UUID 主键、`updated_at` + `is_dirty`（V2 同步预留）、`onupgradeneeded` schema 版本管理
- **SM-2 算法**：review_items 表内置间隔重复
- **settings 表**：键值对存储，给 Options 页学习系统用。Popup/Background 的 LLM 配置仍走 `chrome.storage.sync`
- **测试**：fake-indexeddb mock，68 个单元测试覆盖全部表 CRUD + SM-2 + 跨表业务场景 + v1→v2 升级

### 浏览器测试
- Puppeteer 做浏览器验收测试
- 冒烟测试：`tests/acceptance/smoke-test.mjs`
- 扫读模式测试：`tests/acceptance/scan-mode-basic.mjs`
- Options 页测试：`tests/acceptance/options-test.mjs`
- 引导态截图：`tests/acceptance/onboarding-screenshots.mjs`

### Chrome 调试 profile 问题
旧的 `~/.chrome-debug-profile/` 无法加载扩展。新 profile `~/.chrome-debug-profile-2/` 可以正常加载但缺少 Reddit 登录状态。建议：在用户主力 Chrome 中手动加载 dist/ 目录测试。

## 参考文件

- 旧项目：`/Users/liuyujian/Documents/Enlearn/`
- 新项目规划原文：`/Users/liuyujian/Documents/Enlearn/newproject.md`
- 扫读模式视觉 mockup：`mockup-scan-mode.html`（讨论用）

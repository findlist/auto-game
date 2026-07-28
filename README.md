<div align="center">

# 色彩排序 · Color Sort Puzzle

*经典液体排序解谜 · 免费即玩的中文 H5 益智小游戏*

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)

中文 ·
[部署指南](./docs/deployment-guide.md) ·
[开发计划](./docs/development-plan.md)

</div>

---

**Color Sort Puzzle（色彩排序）** 是一款经典液体排序（Water Sort）解谜休闲小游戏：点击选中试管，再点击目标试管，让同色液体层层归类、完成闯关。**零注册、零后端、纯前端实现，支持 PWA 离线安装到手机桌面**，面向中文休闲玩家，含 100 关卡通关、每日挑战、周挑战、无尽模式、限时挑战、关卡编辑器、色彩百科（混合器/辨识测试/记忆配对/序列记忆/反应力/每日问答）、73 个成就（4 档稀有度）、每日目标、连击计数器、新手分关策略提示、本地排行榜等丰富玩法。

> 单局 1–10 分钟，碎片时间随时开玩；本地运行、数据留在您设备内。

---

## 🌐 在线访问

**生产环境**：[https://game.niuzi.asia](https://game.niuzi.asia)

---

## 🤖 Agent 自动维护

本项目采用 [自主进化 Agent 规范 v2.0](./auto-game-spec.md) 维护，当前为已上线产品的数据驱动维护期。

- 默认每天评估一次，只读取增量信号
- 信号来源：线上错误、CI、性能指标、玩家行为和反馈
- 单次最多实施一个达到评分门槛的低风险任务
- 没有合格任务时零修改、零提交结束
- 新玩法、数值、存档、埋点、依赖和发布必须获得用户授权
- 风险 ≤1、证据充分、工作区干净且验证全绿时自动单任务 commit、push
- 禁止用 Hook/组件拆分、常量抽取和装饰动画填充产出

---

## 特性

- 🎯 **完整解谜闭环** — 倾倒规则 + BFS 可解性验证 + 理论最优步数 + 死局检测 + 一步撤销 + 重置
- 🧠 **智能对手感** — 「自适应难度推荐」+「提示道具」（登录赠送 / 签到奖励，上限 10）
- 📅 **每日挑战** — 日期种子全球同题，含本地 Top5 排行榜
- ♾️ **无尽模式** — 随机无限生成、难度递增、最高分留念
- ⏱️ **限时挑战** — 120 秒倒计时连续通关
- 🛠️ **关卡编辑器** — 自创、导入/导出关卡码、分享链接
- 🏆 **73 个成就 + 4 档稀有度** — 闯关 / 无尽 / 限时 / 签到 / 步数 / 完美 / 满星 / 周挑战 / 色彩百科 / 连击 / 每日目标 全覆盖，按普通 / 稀有 / 史诗 / 传说 四档分级，解锁差异化音效与展示
- ✅ **每日签到** — 里程碑奖励 + 签到日历可视化
- 🎯 **每日目标系统** — 完成 3 关 / 获得 6 星 / 每日挑战 / 不使用提示通关四个目标，完成可领取提示道具奖励
- 🔥 **连击计数器** — 普通模式连续通关累积连击数，3/5/7/10/15/20 连击触发里程碑庆祝弹窗
- 💡 **新手分关策略提示** — 第 1-3 关分别显示绿色鼓励 / 蓝色操作 / 紫色策略提示，自动消失
- 📊 **深度统计** — 通关数 / 步数 / 星数 / 时长 / 效率 / 完美率 / 连胜、柱状图 + 趋势图 + 星级分布
- 🎨 **6 套主题** — 经典紫 / 暗黑黑 / 马卡龙 / 霓虹光 / 护眼绿 / 海洋蓝（CSS 变量动态切换）
- 🔊 **Web Audio 音效** — 选择/倒/错误/撤销/重置/死局/胜利/星星/连击/接近完成/限时滴答/时间到 + 4 段 BGM，全部本地合成
- 📱 **移动端优先** — 触控优化、长按撤销 500ms 手势、振动反馈、禁用误缩放
- ♿ **无障碍** — ARIA 标签、键盘焦点、屏幕阅读器、帮助弹窗
- ⌨️ **键盘操作** — `1–9` 选管、`Z` 撤销、`R` 重置、`H` 提示、`PageUp/Down` 切关
- 📤 **战绩分享** — Canvas 战绩图 + 保存 / 剪贴板 / 原生 Share + 回放链接 + **WebM 视频导出**
- 💾 **本地存档** — `localStorage` 自动保存 / 恢复进度（最高分 / 设置 / 最近游玩）
- 🛰️ **PWA 离线** — manifest + Service Worker 缓存优先离线策略 + 安装引导
- 🔍 **SEO 友好** — JSON-LD 结构化数据 + OG / Twitter + robots / sitemap + 中文长尾关键词
- ⚡ **极致性能** — react-vendor 分包 / TubeView React.memo / 稳定 60FPS / 首屏 JS ~265KB（主包 124KB + react-vendor 141KB，< 300KB 红线，GamePageComponent 懒加载后余量约 35KB）/ 首屏 < 3s

---

## 技术栈

| 层级 | 技术方案 | 说明 |
| --- | --- | --- |
| 框架 | React 18 · TypeScript 5 · Vite 5 | 纯 React 无第三方框架/UI 库/路由库 |
| 渲染 / 美术 | Canvas + SVG + CSS + Emoji | 零素材成本 |
| 音效 | Web Audio API | 全部音效与 BGM 本地合成 |
| 持久化 | localStorage | 进度 / 设置 / 最高分 |
| 离线 | Service Worker（自实现） | 缓存优先离线策略 |
| SEO | JSON-LD + OG + Twitter + sitemap | 完整中文 SEO |
| 部署 | Vercel / Cloudflare Pages / Netlify（免费） | 纯静态 dist/，免服务器 |

**构建产物**（`npm run build` 后 `dist/`）：

| 文件 | 大小 |
| --- | --- |
| `index.html` | ~40 KB（gzip ~13 KB） |
| `assets/index-*.js`（主包） | ~124 KB |
| `assets/react-vendor-*.js` | ~141 KB |
| 首屏 JS 合计 | ~265 KB【< 300KB 红线 ✅，GamePageComponent 懒加载后余量约 35KB】 |
| `assets/index-*.css` | ~207 KB（gzip ~37 KB） |
| `manifest.json` / `sw.js` / `*.png` / `*.svg` | PWA + 图标 + OG 图 |

---

## 玩法

1. 每关若干试管，装有若干层彩色液体
2. 点击试管 A 选中（仅点到顶部有效层），再点击试管 B 倾倒 — **仅当 B 为空或顶部颜色相同方可倾倒**
3. 目标：**让每支试管最终只装同色液体（或清空）**，完成过关，结算 1–3 星
4. 1–9 键可快速选管，`Z` 撤销，`R` 重置，`H` 使用提示道具
5. 支持死局检测与一键重新开始

### 6 种模式总览

| 模式 | 介绍 |
| --- | --- |
| **闯关模式** | 100 关（入门→专家），4–12 试管 / 2–10 色 / 容量 4–5 |
| **每日挑战** | 日期种子，全球同题，含本地 Top5 排行榜 |
| **周挑战** | 每周高难度关卡（7色+3空管），连胜记录专属成就 |
| **无尽模式** | 随机无限生成，难度递增，最高分留念 |
| **限时挑战** | 120 秒倒计时连续通关 |
| **自定义关卡** | 编辑器自创、导入/导出关卡码、分享链接 |

> 另有**色彩百科**页面，含颜色混合器、色彩辨识测试、记忆配对、序列记忆 4 个支线小游戏。

---

## 快速开始

### 环境要求

- Node.js ≥ 18

### 本地开发

```bash
git clone <repo-url> && cd auto-game
npm install
npm run dev          # Vite 开发服务器，默认 http://localhost:3000
npm run build        # 构建到 dist/
npm run preview      # 本地预览构建产物
```

### 部署到线上（任择其一）

| 平台 | 命令 / 步骤 |
| --- | --- |
| **Vercel（推荐）** | 连接 Git 仓库 → 框架选 Vite → Build `npm run build` → Output `dist` → Deploy |
| **Cloudflare Pages** | 连接 Git 仓库 → Build `npm run build` → Output `dist` |
| **Netlify** | 从 Git 导入 → Build `npm run build` → Publish `dist` |
| **Vercel CLI** | `npm i -g vercel && vercel` |

详见 [docs/deployment-guide.md](./docs/deployment-guide.md)。

#### 上线后必做

1. 填写 [docs/site-config.md](./docs/site-config.md)（线上 URL、平台、日期、统计、广告、捐赠、内购、收益）
2. 替换以下占位域名为您自己的域名：
   - `index.html` 中的 JSON-LD 结构化数据 `https://colorsort.app/`
   - `public/sitemap.xml` 中的站点 URL
   - `astro.config.mjs` 中的 `site`（本仓库为 Vite 项目，类似占位位于 SEO 资产中）

---

## 项目结构

```
auto-game/
├── src/
│   ├── main.tsx                       # 入口（主题初始化 · SW 注册 · StrictMode）
│   ├── App.tsx                        # 无路由器状态机（home/play/about/...）
│   ├── index.css                      # 全局样式 + CSS 变量
│   ├── components/
│   │   ├── GameBoard.tsx              # 核心交互（点击 · 倾倒 · 撤销 · 死局 · 胜利 · 限时）
│   │   ├── TubeView.tsx               # 试管 UI（React.memo 优化）
│   │   └── ParticleEffect.tsx         # 通关粒子动画
│   ├── pages/                         # 按需 lazy + Suspense 加载
│   │   ├── AboutPage.tsx              # 关于
│   │   ├── AchievementsPage.tsx       # 成就（73 个 + 4 档稀有度）
│   │   ├── ColorEncyclopediaPage.tsx  # 色彩百科（混合器/辨识测试/记忆配对/序列记忆/反应力/每日问答）
│   │   ├── LevelEditorPage.tsx        # 关卡编辑器
│   │   ├── PrivacyPage.tsx            # 隐私政策（广告联盟合规）
│   │   ├── SettingsPage.tsx           # 设置（音效/振动/主题/BGM/重置）
│   │   └── StatsPage.tsx              # 统计（签到日历+柱状图+趋势图+效率分析）
│   └── game/                          # 纯逻辑层，独立于 UI
│       ├── types.ts                   # ColorLayer / Tube / Level / GameState
│       ├── levelGenerator.ts          # 关卡生成 + canPour / pour / checkWin / checkDeadlock
│       ├── solver.ts                  # BFS：可解性验证 + 理论最少步数
│       ├── achievements.ts            # 成就系统（73 个 + 4 档稀有度）
│       ├── dailyChallenge.ts          # 每日挑战
│       ├── dailyCheckin.ts            # 每日签到
│       ├── dailyGoals.ts              # 每日目标系统
│       ├── dailyLeaderboard.ts        # 每日挑战本地 Top5
│       ├── weeklyChallenge.ts         # 周挑战（关卡生成，数据存取已拆分到 weeklyChallengeData）
│       ├── weeklyChallengeData.ts     # 周挑战纯数据存取模块
│       ├── comboStreak.ts             # 连击计数器
│       ├── weekendBonus.ts            # 周末奖励
│       ├── levelEditor.ts             # 自定义关卡码导出/验证
│       ├── replayShare.ts / replayVideo.ts  # 回放 + WebM 导出
│       ├── settings.ts / themeManager.ts    # 设置 / 主题持久化
│       ├── shareImage.ts              # Canvas 战绩图
│       ├── soundEngine.ts             # Web Audio 音效引擎
│       ├── statsTracker.ts            # 统计追踪
│       └── announcements.ts           # 公告 + 每日色彩知识
├── public/                            # PWA + SEO 资产
│   ├── favicon.svg · icon-192.png · icon-512.png
│   ├── manifest.json · sw.js          # PWA 清单与 Service Worker
│   ├── robots.txt · sitemap.xml       # 爬虫与 SEO
│   └── og-image.png · og-image.svg    # 社交分享图
├── docs/
│   ├── deployment-guide.md            # 多平台部署指南
│   ├── development-plan.md            # 详细版本迭代路线图
│   └── site-config.md                 # 线上站点配置模板
├── index.html                         # SEO/社交/PWA 完备的入口 HTML
├── vite.config.ts
├── tsconfig.json
└── package.json                       # v1.51.0
```

---

## 版本迭代

项目自 2026-07-02 起基于 [TRAE AI 自动迭代规范 v1.2](./auto-game-spec.md) 自主迭代开发。

| 版本 | 关键内容 |
| --- | --- |
| v1.0 → v1.2 | 核心解谜、签到、背景音乐 |
| v1.3 → v1.9 | 提示道具、签到日历、BGM 旋律、签到成就 |
| v1.10.0 | 统计柱状图 / 趋势图 / 智能推荐关卡 / 音效增强 |
| v1.11.0 | 回放分享 URL、8 个新成就、更新日志弹窗、自适应难度推荐 |
| v1.12.0 | **关卡编辑器、公告系统、WebM 视频入口、移动端长按撤销、每日排行榜、首页每日最佳** |
| v1.13 → v1.15 | 成就页大改版、智能上下文提示、死局预警、步数效率可视化、帮助 SVG 图示、星星弹出动画 |
| v1.17 → v1.18 | **周挑战模式、周末奖励、+9 成就、色彩知识百科页、暗色主题跟随系统、色弱颜色标签** |
| v1.19 → v1.22 | **颜色混合器、色彩辨识测试、色彩记忆配对、序列记忆游戏、每日色彩知识卡片、+11 成就、SEO 长尾词持续扩展** |
| v1.23 → v1.26 | **色彩反应力测试、配对计时模式、每日色彩问答（30 天循环）、百科搜索、最近浏览、题库扩充 50 题、+12 成就** |
| v1.27 → v1.31 | **难度标签、序列音高、连续答题徽章、配对最佳用时、难度分级统计、反应力最佳分数、序列自动保存、配方保存分享、悬浮音效开关** |
| v1.32 → v1.35.5 | **累计天数成就、混合配方收藏、色彩能力档案、错题本、配对自定义难度、首屏懒加载优化（281KB）、问答热力图、BGM 快捷开关、统计活跃热力图、搜索高亮** |
| v1.36 → v1.39 | **暂停功能（空格/P）、快速重玩、每日目标系统、连击计数器、连击里程碑庆祝、+9 成就（共 73）、无尽/限时模式每 5 关里程碑奖励、新手倒水鼓励提示、GamePageComponent 提取** |
| v1.40 → v1.41 | **成就稀有度分级（普通/稀有/史诗/传说）+ 差异化音效、每日目标完成动画、第 2-3 关分关策略提示、稀有度筛选与统计面板、周挑战模块拆分优化、SEO 持续扩展** |
| v1.42 → v1.47 | **HomeTopSection/HomeDialogs/HomeChrome 组件拆分、GamePageComponent 懒加载（首屏 296KB→263KB）、BGM 数据独立、回放/帮助/分享图片弹窗组件化、SEO 持续扩展** |
| v1.48 → v1.51 | **第 13-20 关分关策略提示、关卡提示配置独立模块、WinOverlay/GameOverlays 组件拆分、ReplayPanel/HelpModal/ShareImageModal 组件化、useGameModes/useDailyCheckin/useReplayVideo 三个 hook 提取、achievements 三模块拆分、GameBoard 精简至约 750 行、App.tsx 降至约 921 行** |

路线图详见 [docs/development-plan.md](./docs/development-plan.md)，当前处于阶段二（数据驱动精细化迭代），阶段三（流量变现升级）按规范推进。

---

## 文档

- [部署指南](./docs/deployment-guide.md) — Vercel / Cloudflare Pages / Netlify 三平台部署，含上线后 checklist
- [开发计划](./docs/development-plan.md) — v1.0 → v1.51 完整版本记录 + 阶段二/三路线图
- [自动迭代规范](./auto-game-spec.md) — TRAE AI Agent 自建 H5 游戏网站定时任务规范 v1.2
- [站点配置模板](./docs/site-config.md) — 上线后回写，驱动 Agent 阶段切换

---

## 设计哲学

- **纯前端、零后端** — 所有逻辑跑在您的浏览器里，数据留在 `localStorage`
- **零素材成本** — CSS / SVG / Emoji 美术 + Web Audio 合成音效，零授权费、零版权风险
- **质量红线** — 稳定 60FPS、单帧 < 16ms、JS bundle < 300KB、首屏 < 3s、三档设备完美适配
- **隐私优先** — 不收集手机号 / 身份证 / 支付信息等敏感数据，PWA 离线可玩
- **中文优先** — 全站文案、注释、SEO 关键词全部中文

---

## 🤖 定时任务 Agent 提示词

```text
你是 auto-game 的自主进化 Agent。完整读取并严格执行：
e:\work\auto-game\auto-game-spec.md

项目已上线，当前属于数据驱动维护期。只依据线上错误、测试或构建失败、Core Web Vitals、首屏体积、帧率、玩家留存、关卡完成率、玩家反馈和明确批准的任务产生候选。

只分析上次评估后变化的信号，最多列出 5 个候选并按规范评分。单次最多实施一个达到门槛的低风险任务。没有合格任务时必须零修改、零提交结束。

禁止用 Hook 或组件拆分、常量抽取、CSS 动效、版本号更新、SEO 微调和进度文档填充产出。新玩法、关卡、数值平衡、存档、埋点、依赖、PWA 策略和大范围 UI 变化必须等待用户授权。

修改前定义玩家影响和验收标准，运行与风险相称的验证。达到评分门槛、风险 ≤1、工作区干净且相关验证全部通过时，精确暂存本任务文件，自动创建一个提交并执行 git push origin HEAD；否则不得提交。单次最多推送一个提交，push 失败不得追加提交。最后按规范输出精简评估摘要。
```

---

## 🕐 质量信号任务

质量任务只为自主进化 Agent 提供候选信号，不直接修改代码。

- **健康检查**：有新增提交、线上告警或失败信号时运行构建及相关检查；无变化时跳过
- **体验巡检**：仅由玩家反馈、指标退化或视觉回归触发，不固定每日改样式
- **报告规则**：只有发现新问题时生成精简报告；无新问题时零文件结束
- **实施权限**：巡检结论先进入评分；只有风险 ≤1 且全部门槛满足时才自动单任务 commit、push

---

## 许可证

本项目基于 [Apache License 2.0](./LICENSE) 协议开源。

> Copyright © 2026 色彩排序 (Color Sort Puzzle) 研发团队。

---

<div align="center"><sub>把色彩归位，把心情归零 — Sort the colors, clear the mind.</sub></div>

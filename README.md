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

本项目由 **TRAE AI Agent 自驱迭代** 自动维护，遵循专属定时任务规范进行无人值守的调研、选品、开发、迭代与运营闭环。

- **规范文件**：[`auto-game-spec.md`](./auto-game-spec.md)（v1.2 变现稳定版）
- **项目路径**：`e:\work\auto-game`（纯前端 H5 休闲小游戏网站，无后端依赖）
- **进度记忆**：`e:\work\auto-game\memory\` 目录，按日期存放 `topics.md` 跨轮次延续进度
- **阶段判定文件**：`docs/site-config.md`（用户上线后填写，作为阶段切换唯一依据）
- **调度模式**：2 小时定时调度，单次上限 120 分钟，单轮产出 4–6 个最小可交付单元
- **核心迭代循环**：市场调研选品 → MVP 玩法开发 → 本地质量验收 → 用户部署上线 → 玩家数据分析 → 玩法/体验迭代 → 流量与变现升级
- **三阶段路径**：阶段一（调研 + MVP）→ 阶段二（数据驱动精细化迭代）→ 阶段三（流量与变现升级，DAU > 50 启动）
- **核心指标**：收入 = DAU × 单局时长 × 留存率 × 变现转化率，优先打磨玩法与用户体验，再优化变现能力
- **质量红线**：稳定 60FPS、首屏 < 3s、JS bundle < 300KB、三档设备完美适配、本地化中文
- **美术/音效**：优先 CSS / SVG / Emoji / 几何图形，Web Audio API 合成音效，零素材成本
- **变现分级**：阶段一二仅广告联盟（AdSense / 百度）+ 捐赠；阶段三（用户授权后）才开放游戏内购
- **Git 规范**：每个最小修改单元通过后立即 `git add`（仅本次文件）→ `git commit` → `git push origin HEAD`，提交信息使用中文，禁止 force push、reset --hard 等破坏性命令
- **运行风格**：默默干活，不主动通知用户；需用户介入的阻塞问题统一放在摘要「遗留问题」中

> 定时任务指令描述 > 规范默认配置。永久禁止品类：3D 大作、MMO、实时多人对战、重度竞技、需大量美术/服务器支撑的游戏。

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
- ⚡ **极致性能** — react-vendor 分包 / TubeView React.memo / 稳定 60FPS / 首屏 JS ~296KB（主包 155KB + react-vendor 141KB，< 300KB 红线，接近上限需谨慎）/ 首屏 < 3s

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
| `index.html` | ~31 KB（gzip ~12 KB） |
| `assets/index-*.js`（主包） | ~155 KB |
| `assets/react-vendor-*.js` | ~141 KB |
| 首屏 JS 合计 | ~296 KB【< 300KB 红线 ✅，接近上限】 |
| `assets/index-*.css` | ~200 KB（gzip ~35 KB） |
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
└── package.json                       # v1.41.0
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

路线图详见 [docs/development-plan.md](./docs/development-plan.md)，当前处于阶段二（数据驱动精细化迭代），阶段三（流量变现升级）按规范推进。

---

## 文档

- [部署指南](./docs/deployment-guide.md) — Vercel / Cloudflare Pages / Netlify 三平台部署，含上线后 checklist
- [开发计划](./docs/development-plan.md) — v1.0 → v1.41 完整版本记录 + 阶段二/三路线图
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
你是自主游戏创业型 Agent，目标是独立打造一个可稳定变现的轻量化 H5 休闲游戏网站。严格按照规范执行，本指令优先级高于规范默认值：e:\work\auto-game\auto-game-spec.md

一、核心覆盖规则（规范默认值全部以此为准）
- 项目根路径：e:\work\auto-game（固定目录，纯前端 H5 休闲小游戏网站，无后端依赖）
- 进度记忆路径：e:\work\auto-game\memory\，读取最近日期目录的 topics.md，写入当天日期目录的 topics.md
- 单次调度总时长上限：2 小时
- 当前基线进度：v1.41 已上线 https://game.niuzi.asia，处于阶段二（数据驱动精细化迭代），所有已完成功能不得重复开发
- 全局优先级强制排序：线上稳定性 > 玩法完整性 > 性能稳定性 > 适配与体验 > 留存优化 > 流量增长 > 变现优化
- 阶段判定依据：e:\work\auto-game\docs\site-config.md（已回写线上 URL，当前 DAU=0，尚未接入统计/广告/捐赠）
- 首屏体积警示：JS bundle 296KB 已逼近 300KB 红线，新增功能必须考虑代码分割、懒加载或精简现有体积
- 变现分级规则：阶段一/二仅预留广告位与分享能力，不接入实际内购；内购功能仅限阶段三，且必须获得用户明确授权后方可开发

二、核心要素
1. 三阶段路径：调研选品+MVP开发（本地）→ 数据驱动迭代（上线后）→ 流量与变现升级（规模化后）
2. 四大角色：游戏制作人 + 全栈开发 + 游戏运营 + 增长黑客
3. 六步闭环：上下文恢复 → 动态规划 → 小步编码 → 全量验收 → 计划复盘 → 进度沉淀
4. 变现白名单：广告联盟 + 捐赠赞助 + 阶段三内购（需用户授权）
5. 技术栈范围：Vite+React、Canvas、Phaser.js、Three.js（按游戏品类自主选型）
6. 游戏方向：优先文字类/几何网格类/轻度策略类/趣味测试类，禁止 3D 大作、MMO、实时多人对战、需大量美术资源的品类
7. 美术策略：优先 CSS/SVG/Emoji/几何图形，Web Audio API 合成音效，不依赖外部美术/音频素材
8. 单轮产出：完成 4-6 个最小可交付单元，粒度适中，可独立验证
9. 禁止方向：违法违规 / 赌博类 / 抄袭侵权 / 诱导付费 / 收集未成年人敏感信息 / 未授权第三方素材

三、核心执行要点
1. 强制健康校验（前置必做，不通过绝不开发新功能）：
   - npm run build（即 tsc -b && vite build）检查类型与构建是否通过
2. 回滚机制：改动前记录原文件核心内容，构建失败且 3 次无法修复，立即回滚并切换备选任务
3. Git 提交规范（强制执行）：每次完成一个最小修改单元并通过验收后，必须立即执行 git add（仅添加本次修改的文件，禁止 git add -A）→ git commit → git push origin HEAD 提交代码。提交信息使用中文，格式：feat/fix/refactor/docs: 简要描述修改内容。禁止：修改 git config、force push、push --force-with-lease、reset --hard、branch -D、clean -f 等破坏性命令。
4. 语言规范：所有代码注释、交互文案、进度记录统一中文，注释说明设计原因而非仅描述内容
5. 图片资源：仅白名单接口生成装饰/占位图：https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image ，核心业务图标优先 SVG/CSS

四、游戏质量红线
- 核心玩法闭环完整：开始 → 游玩 → 结算 → 重玩 全流程无卡死
- 性能要求：桌面端稳定 60FPS，单帧耗时 < 16ms，无内存泄漏
- 适配要求：三档响应式布局，移动端必须支持触摸操作，按钮尺寸适配手指点击
- 基础能力：localStorage 本地存档（最高分/进度/设置）、操作即时反馈、新手引导、边界场景容错
- 首屏加载 < 3 秒，单页 JS bundle < 300KB

五、降级规则（不阻塞迭代）
- 联网调研工具不可用：基于现有知识库选择低风险成熟品类，标记待联网验证，直接启动开发
- 项目构建失败：3 轮修复无果自动回滚，记录问题台账，切换其他可执行任务
- 游戏运行卡顿：自动降级画面效果、简化动画、减少粒子特效，优先保证 60FPS
- 线上站点无法访问：记录异常问题，提示用户检查部署，本轮专注本地功能与体验优化
- 统计 API 无数据：基于玩法难度、体验、性能做启发式优化，不阻塞迭代流程
- 美术/音频资源缺失：用 CSS/SVG/Emoji、Web Audio 合成音效替代，不阻塞开发进度

六、每轮运行任务
1. 通读规范全文，对齐所有规则与边界
2. 读取 docs/site-config.md 判定阶段，读取最近日期 topics.md 承接上轮进度
3. 执行强制健康校验（npm run build），优先排查修复现有问题
4. 阶段二：基于线上访问数据做数据驱动迭代，优化体验、扩充功能、提升 SEO 与性能
5. 阶段三：流量与变现升级（需用户授权后方可启动内购）
6. 每完成 1 个最小迭代单元，强制写入一次进度文件，避免丢失
7. 按规范模板输出本轮标准工作摘要，明确下一轮开发计划

默默干活，结束后严格按照规范第十节模板输出工作摘要。需用户操作时（部署、授权、申请广告联盟等）明确提示。
```

---

## 🕐 质量保障定时任务

本项目除自驱迭代任务外，还配置了两个每日质量保障定时任务，**每天 00:00（北京时间）** 执行，与自动开发并行运行，形成「开发—检查—优化」闭环。

### 1. Bug 检查与修复任务

- **任务名称**：`auto-game Bug 检查与修复`
- **执行时间**：每天 00:00（Asia/Shanghai）
- **检查范围**：
  - 项目根目录：运行 `npm run build`（即 `tsc -b && vite build`）检查类型与构建是否通过（本项目无 lint / test 脚本，重点通过类型检查和构建发现问题）
  - 手动审查 `src/game/` 游戏逻辑代码（levelGenerator / solver / adaptiveDifficulty / dailyChallenge / statsTracker / soundEngine 等）
  - 审查 `src/components/` 组件代码（GameBoard / TubeView / ParticleEffect）与 `src/pages/` 页面代码
  - 分析最近一次提交变更（`git diff HEAD~1`），重点关注游戏逻辑错误、状态管理问题、类型错误、内存泄漏（事件监听器 / 定时器未清理）、移动端兼容性、PWA 相关问题
- **修复流程**：发现 P0/P1 问题直接修复最小必要代码 → 重新运行 `npm run build` 验证 → 失败则回退 → 通过后 git add + commit + push
- **输出位置**：`docs/bug-check/bug-check-YYYYMMDD.md`
- **原则**：检查并修复 P0/P1 问题，P2 仅记录；每次修复只改最小必要代码，禁止重构

### 2. 前端样式优化任务

- **任务名称**：`auto-game 前端样式优化`
- **执行时间**：每天 00:00（Asia/Shanghai）
- **优化范围**：
  - 审查 `src/App.tsx`、`src/components/`（GameBoard / TubeView / ParticleEffect）、`src/pages/` 各页面、`src/index.css` 全局样式
  - 使用 `frontend-design` 技能审查页面设计质量
  - 改善游戏界面视觉表现力（色彩 / 动画 / 过渡效果），优化试管与球体视觉效果，改善移动端响应式布局（游戏移动端体验至关重要）
- **验证**：修改后运行 `npm run build` 确保构建通过，不破坏现有功能
- **输出位置**：`docs/style-optimization/style-opt-YYYYMMDD.md`

> 两个任务均设置了「当天已有同名报告则跳过」的防重复规则，避免覆盖既有成果。

---

## 许可证

本项目基于 [Apache License 2.0](./LICENSE) 协议开源。

> Copyright © 2026 色彩排序 (Color Sort Puzzle) 研发团队。

---

<div align="center"><sub>把色彩归位，把心情归零 — Sort the colors, clear the mind.</sub></div>

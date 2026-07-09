<div align="center">

# 色彩排序 · Color Sort Puzzle

*经典液体排序解谜 · 免费即玩的中文 H5 益智小游戏*

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)

中文 ·
[部署指南](./docs/deployment-guide.md) ·
[开发计划](./docs/development-plan.md)

</div>

---

**Color Sort Puzzle（色彩排序）** 是一款经典液体排序（Water Sort）解谜休闲小游戏：点击选中试管，再点击目标试管，让同色液体层层归类、完成闯关。**零注册、零后端、纯前端实现，支持 PWA 离线安装到手机桌面**，面向中文休闲玩家，含 100 关卡通关、每日挑战、无尽模式、限时挑战、关卡编辑器、成就系统、本地排行榜等丰富玩法。

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
- 🏆 **25 个成就** — 闯关 / 无尽 / 限时 / 签到 / 步数 / 完美 / 满星 全覆盖
- ✅ **每日签到** — 里程碑奖励 + 签到日历可视化
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
- ⚡ **极致性能** — react-vendor 分包 / TubeView React.memo / 稳定 60FPS / JS ~201KB（gzip ~65KB）/ 首屏 < 3s

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
| `index.html` | ~2.3 KB（gzip ~1.1 KB） |
| `assets/index-*.js` | ~201 KB（gzip ~65 KB）【< 300KB 红线 ✅】 |
| `assets/index-*.css` | ~21 KB（gzip ~5 KB） |
| `manifest.json` / `sw.js` / `*.png` / `*.svg` | PWA + 图标 + OG 图 |

---

## 玩法

1. 每关若干试管，装有若干层彩色液体
2. 点击试管 A 选中（仅点到顶部有效层），再点击试管 B 倾倒 — **仅当 B 为空或顶部颜色相同方可倾倒**
3. 目标：**让每支试管最终只装同色液体（或清空）**，完成过关，结算 1–3 星
4. 1–9 键可快速选管，`Z` 撤销，`R` 重置，`H` 使用提示道具
5. 支持死局检测与一键重新开始

### 5 种模式总览

| 模式 | 介绍 |
| --- | --- |
| **闯关模式** | 100 关（入门→专家），4–12 试管 / 2–10 色 / 容量 4–5 |
| **每日挑战** | 日期种子，全球同题，含本地 Top5 排行榜 |
| **无尽模式** | 随机无限生成，难度递增，最高分留念 |
| **限时挑战** | 120 秒倒计时连续通关 |
| **自定义关卡** | 编辑器自创、导入/导出关卡码、分享链接 |

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
│   │   ├── AchievementsPage.tsx       # 成就（25 个）
│   │   ├── LevelEditorPage.tsx        # 关卡编辑器
│   │   ├── PrivacyPage.tsx            # 隐私政策（广告联盟合规）
│   │   ├── SettingsPage.tsx           # 设置（音效/振动/主题/BGM/重置）
│   │   └── StatsPage.tsx              # 统计（签到日历+柱状图+趋势图）
│   └── game/                          # 纯逻辑层，独立于 UI
│       ├── types.ts                   # ColorLayer / Tube / Level / GameState
│       ├── levelGenerator.ts          # 关卡生成 + canPour / pour / checkWin / checkDeadlock
│       ├── solver.ts                  # BFS：可解性验证 + 理论最少步数
│       ├── achievements.ts            # 成就系统
│       ├── dailyChallenge.ts          # 每日挑战
│       ├── dailyCheckin.ts            # 每日签到
│       ├── dailyLeaderboard.ts        # 每日挑战本地 Top5
│       ├── levelEditor.ts             # 自定义关卡码导出/验证
│       ├── replayShare.ts / replayVideo.ts  # 回放 + WebM 导出
│       ├── settings.ts / themeManager.ts    # 设置 / 主题持久化
│       ├── shareImage.ts              # Canvas 战绩图
│       ├── soundEngine.ts             # Web Audio 音效引擎
│       └── statsTracker.ts            # 统计追踪
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
└── package.json                       # v1.12.0
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

路线图详见 [docs/development-plan.md](./docs/development-plan.md)，后续阶段二（数据驱动精细化迭代）与阶段三（流量变现升级）按规范推进。

---

## 文档

- [部署指南](./docs/deployment-guide.md) — Vercel / Cloudflare Pages / Netlify 三平台部署，含上线后 checklist
- [开发计划](./docs/development-plan.md) — v1.0 → v1.12 完整版本记录 + 阶段二/三路线图
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

核心覆盖规则（规范默认值全部以此为准）
- 项目根路径：e:\work\auto-game（固定目录，无需另行创建）
- 进度记忆路径：e:\work\auto-game\memory\，读取最近日期目录的 topics.md，写入当天日期目录的 topics.md
- 变现分级规则：阶段一/二仅预留广告位与分享能力，不接入实际内购；内购功能仅限阶段三，且必须获得用户明确授权后方可开发

核心要素
1. 三阶段路径：调研选品+MVP开发（本地）→ 数据驱动迭代（上线后）→ 流量与变现升级（规模化后）
2. 四大角色：游戏制作人 + 全栈开发 + 游戏运营 + 增长黑客
3. 六步闭环：上下文恢复 → 动态规划 → 小步编码 → 全量验收 → 计划复盘 → 进度沉淀
4. 阶段判定依据：e:\work\auto-game\docs\site-config.md（用户上线后回写，含线上URL与玩家数据）
5. 变现白名单：广告联盟 + 捐赠赞助 + 阶段三内购（需用户授权）
6. 技术栈范围：Vite+React、Canvas、Phaser.js、Three.js（按游戏品类自主选型）
7. 游戏方向：优先文字类/几何网格类/轻度策略类/趣味测试类，禁止 3D 大作、MMO、实时多人对战、需大量美术资源的品类
8. 美术策略：优先 CSS/SVG/Emoji/几何图形，Web Audio API 合成音效，不依赖外部美术/音频素材
9. 单轮产出：完成 4-6 个最小可交付单元，粒度适中，可独立验证
10. Git 红线：禁止 commit / push / 修改 config / 任何破坏性命令
11. 禁止方向：违法违规 / 赌博类 / 抄袭侵权 / 诱导付费 / 收集未成年人敏感信息 / 未授权第三方素材

执行原则
- 任务优先级：玩法完整性 > 性能稳定性 > 适配与体验 > 留存优化 > 流量增长 > 变现优化
- 改动前记录原内容，构建或运行失败且无法快速修复时立即回滚，切换备选任务
- 连续 2 轮纯调研无开发产出，强制锁定方向进入开发阶段
- 小步迭代，单次只改一个核心维度，便于效果归因

游戏质量红线
- 核心玩法闭环完整：开始 → 游玩 → 结算 → 重玩 全流程无卡死
- 性能要求：桌面端稳定 60FPS，单帧耗时 < 16ms，无内存泄漏
- 适配要求：三档响应式布局，移动端必须支持触摸操作，按钮尺寸适配手指点击
- 基础能力：localStorage 本地存档（最高分/进度/设置）、操作即时反馈、新手引导、边界场景容错
- 首屏加载 < 3 秒，单页 JS bundle < 300KB

首次运行任务
1. 通读规范全文，对齐所有规则与边界
2. 联网调研 2026 年热门 H5 小游戏赛道、竞品分析、玩家需求与变现潜力
3. 基于选品准入标准敲定 MVP 游戏品类，明确核心玩法与差异化设计
4. 完成技术选型，初始化项目基础架构与目录结构
5. 按规范模板输出本轮标准工作摘要，明确下一轮开发计划

默默干活，结束后严格按照规范第十节模板输出工作摘要。需用户操作时（部署、授权、申请广告联盟等）明确提示。
```

---

## 许可证

本项目基于 [Apache License 2.0](./LICENSE) 协议开源。

> Copyright © 2026 色彩排序 (Color Sort Puzzle) 研发团队。

---

<div align="center"><sub>把色彩归位，把心情归零 — Sort the colors, clear the mind.</sub></div>

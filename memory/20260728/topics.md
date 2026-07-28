# 2026-07-28 进度记录

## 本轮工作（06:00 开始 - 第七十五轮）

### 阶段判断
- **阶段二：数据驱动迭代**（站点已上线 https://game.niuzi.asia）
- DAU=0，统计工具未接入 → SEO优化 + HTML体积大幅精简 + 代码架构重构
- TypeScript 零错误，构建通过

### 第七十五轮完成任务（5个最小可交付单元）

1. ✅ **移除重复的 VideoGame JSON-LD 结构化数据**
   - `index.html` — 移除与 WebApplication JSON-LD 重复的 VideoGame 结构化数据块（141行）
   - WebApplication 已覆盖 name、description、genre、url、offers、aggregateRating 等全部信息
   - VideoGame 块额外提供了 gamePlatform、playMode、numberOfPlayers、contentRating，但这些字段在 WebApplication 中不适用，移除后不影响 SEO
   - HTML 从 36.27KB 降至 35.09KB（-1.18KB，-141行）
   - Git commit: 9eb4bf6

2. ✅ **精简 FAQPage 从 78 条降至 20 条核心 FAQ**
   - `index.html` — FAQPage JSON-LD 从 78 条 Question 降至 20 条核心 FAQ（-58 条，-2102行）
   - 保留的 20 条覆盖：游戏基础信息（是什么/免费/手机/离线）、核心玩法（模式/周挑战/成就/编辑器/百科）、辅助功能（战绩分享/色弱模式/儿童适合/成就数量/每日问答/配方保存/加载速度/暂停/每日目标/新手引导/稀有度）
   - 移除的 58 条均为细碎重复问答（如"第2关有操作提示吗"、"首页可以快速重玩上一关吗"等）
   - HTML 从 35.09KB 降至 16.27KB（-18.82KB，-54%），gzip 从 10.94KB 降至 6.05KB
   - 避免搜索引擎 JSON-LD 内容堆砌降权，提升 SEO 效果
   - Git commit: cc7517f

3. ✅ **提取 handleTutorialClose 到 useGameCallbacks hook**
   - `src/game/useGameCallbacks.ts` — 新增 handleTutorialClose 回调，接收 setShowTutorial 参数
   - 导入 markTutorialSeen，统一管理新手引导关闭逻辑（隐藏弹窗 + 标记已看过）
   - `src/App.tsx` — 移除 4 行内联 handleTutorialClose 函数，替换为 hook 调用
   - 清理 App.tsx 中未使用的 markTutorialSeen 导入
   - Git commit: 859addf

4. ✅ **提取 onPlayCustomLevel 页面跳转逻辑到 useCustomLevels hook**
   - `src/game/useCustomLevels.ts` — 新增 onPlayCustomLevel 方法，接收 (level, setPage) 参数，统一管理自定关卡播放与路由跳转
   - 保留原 handlePlayCustomLevel（仅设置状态，不跳转页面）供其他场景使用
   - `src/App.tsx` — 移除 4 行内联 onPlayCustomLevel useCallback，替换为 hook 提供的方法
   - 清理 App.tsx 中未使用的 handlePlayCustomLevel 引用
   - HomeFooterSection 和 LevelEditorPage 调用点更新为包装函数
   - Git commit: 279996e

5. ✅ **更新日志+版本号同步 v1.57.0**
   - `src/components/ChangelogModal.tsx` — 新增 v1.57.0 更新日志条目（5条记录）
   - 版本号同步至 v1.57.0（App.tsx、AboutPage、SettingsPage、ColorEncyclopediaPage、sw.js）
   - ChangelogModal chunk 从 21.05KB → 21.64KB（+0.59KB）
   - Git commit: 1af7b8f

### 修改文件
- `index.html` — 移除 VideoGame JSON-LD（-141行）+ 精简 FAQPage 从 78 条降至 20 条（-2102行）
- `src/game/useGameCallbacks.ts` — 新增 handleTutorialClose 回调，导入 markTutorialSeen
- `src/game/useCustomLevels.ts` — 新增 onPlayCustomLevel 方法
- `src/App.tsx` — 集成 handleTutorialClose/onPlayCustomLevel hook，清理未使用导入，版本号更新
- `src/components/ChangelogModal.tsx` — v1.57.0 更新日志
- `src/pages/AboutPage.tsx` — 版本号
- `src/pages/SettingsPage.tsx` — 版本号
- `src/pages/ColorEncyclopediaPage.tsx` — 版本号
- `public/sw.js` — 缓存版本更新至 v1.57.0

### 验证结果
- TypeScript：✅ 零错误（118 modules transformed）
- 构建：✅ vite build 通过（1.21s），无警告
- 首屏 JS Bundle：125.15KB + react-vendor 140.87KB = **266.02KB**（gzip 42.08KB + 45.26KB = 87.34KB）✅ < 300KB
  - 首屏 JS 从 265.89KB 增至 266.02KB（+0.13KB），因 useGameCallbacks/useCustomLevels hook 扩展
  - 余量约 33.98KB
- CSS：213.93KB（gzip 37.72KB）（无变化）
- HTML：**16.27KB**（gzip 6.05KB）← 上轮 36.27KB（-20.00KB，-55%）
  - 本轮 HTML 总共减少 20.00KB：VideoGame JSON-LD 移除（-1.18KB）+ FAQPage 精简（-18.82KB）
- ChangelogModal chunk：21.64KB（gzip 9.85KB）（+0.59KB）
- 线上站点：✅ 正常访问 https://game.niuzi.asia（HTTP 200）

### Git 提交记录
- `9eb4bf6` perf: 移除重复的VideoGame JSON-LD结构化数据,WebApplication已覆盖相同信息,HTML从36.27KB降至35.09KB(-1.18KB,-141行)
- `cc7517f` perf: 精简FAQPage从78条降至20条核心FAQ,移除58条细碎重复问答,HTML从35.09KB降至16.27KB(-18.82KB,-54%),避免搜索引擎内容堆砌降权
- `859addf` refactor: 提取handleTutorialClose到useGameCallbacks hook,统一管理新手引导关闭逻辑,清理App.tsx中markTutorialSeen未使用导入
- `279996e` refactor: 提取onPlayCustomLevel页面跳转逻辑到useCustomLevels hook,统一管理自定关卡播放与路由跳转,清理App.tsx中handlePlayCustomLevel未使用引用
- `1af7b8f` docs: 更新v1.57.0更新日志,同步版本号至v1.57.0,新增5条更新记录(VideoGame JSON-LD移除+FAQPage精简+handleTutorialClose提取+onPlayCustomLevel提取)
- 全部已 push 到 origin/main

### 遗留问题
1. 捐赠链接仍为占位符，需用户提供真实链接
2. 广告位仍为占位符，需用户申请 AdSense 后替换
3. 统计工具未接入（建议 Umami/Plausible），当前仅有本地 localStorage 统计
4. Google Search Console 验证 meta 标签为占位值，需用户替换实际验证码
5. App.tsx 约 630 行，主要是页面路由和渲染逻辑，进一步提取空间有限
6. SoundEngineLazy 的 isBGMPlaying/toggleBGM 同步返回 false，BGM 按钮状态依赖 GameSettings.getBGM()（同步 localStorage），实际不影响用户体验
7. useGameModes hook 中 startNormalMode 未被 App.tsx 使用（App 直接管理普通模式启动），可考虑后续统一
8. settings.ts 通过 themeManager.ts 在首屏加载，无法懒加载（initTheme 必须在应用启动时执行）
9. index.html 中仍有大量空行（每行后跟空行），后续可清理进一步减小 HTML 体积

### 下轮建议
1. **HTML 已降至 16.27KB**，首屏 JS 266.02KB，余量约 33.98KB，后续新功能仍有空间
2. 考虑清理 index.html 中的空行问题，可进一步减小 HTML 体积
3. 考虑将 App.tsx 中的页面路由逻辑提取为独立组件或路由配置
4. 考虑添加游戏内的操作提示动画（首次进入游戏时展示操作引导）
5. 考虑优化 SEO：更新 sitemap.xml lastmod、提交 Google Search Console
6. 考虑添加更多游戏模式或关卡变体
7. 考虑将 useGameModes hook 中的 startNormalMode 与 App.tsx 中的普通模式启动统一
8. 考虑添加 Open Graph 社交分享标签优化（og:title, og:description, og:image 等）

### 需用户操作
**站点已上线，进入阶段二数据驱动迭代。** 本轮完成了 HTML 体积大幅精简（从 36.27KB 降至 16.27KB，-55%），移除了重复的 VideoGame JSON-LD 和 58 条细碎 FAQ，提取了 handleTutorialClose/onPlayCustomLevel 两个 hook。代码已提交推送到 GitHub，Vercel 应自动部署。**请尽快完成以下操作以加速迭代：**
1. 在 Google Search Console 添加并验证站点（替换 index.html 中的 `YOUR_GOOGLE_VERIFICATION_CODE`）
2. 提交更新后的 sitemap（https://game.niuzi.asia/sitemap.xml）
3. 接入统计工具（推荐 Umami 或 Plausible），更新 `docs/site-config.md` 统计配置

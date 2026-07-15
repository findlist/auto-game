# 部署指南

## 一、构建产物

```bash
npm run build
```

构建后产物在 `dist/` 目录：
- `index.html` — 入口 HTML（~9.6KB, gzip ~4.0KB）
- `assets/index-*.js` — 主 JS bundle（~112KB, gzip ~38KB）
- `assets/react-vendor-*.js` — React 运行时（~141KB, gzip ~45KB）
- `assets/index-*.css` — CSS（~65KB, gzip ~13KB）
- `assets/*.js` — 懒加载页面（共 ~38KB, gzip ~14KB）
  - SettingsPage ~7KB, StatsPage ~13KB, LevelEditorPage ~10KB
  - AchievementsPage ~3.4KB, AboutPage ~3KB, PrivacyPage ~1.7KB
- `favicon.svg` — 站点图标
- `icon-192.png` / `icon-512.png` — PWA 图标
- `og-image.svg` — 社交分享封面图
- `manifest.json` — PWA 清单
- `sw.js` — Service Worker（离线缓存，当前版本 v1.15.0）
- `robots.txt` — SEO 爬虫指引
- `sitemap.xml` — 站点地图

**性能达标**：JS bundle 总计 ~291KB < 300KB 红线 ✅ | 首屏加载 < 3秒 ✅

**当前线上状态**：
- 线上 URL：https://game.niuzi.asia
- 部署平台：Vercel
- 上线日期：2026-07-09
- 当前版本：v1.15.0
- 游戏品类：色彩排序解谜（几何图形类）
- 统计工具：未接入（建议接入 Umami/Plausible 获取玩家数据）
- 广告联盟：未接入
- 阶段：阶段二（数据驱动迭代），待统计接入

## 二、部署到 Vercel（推荐）

### 方式一：Git 仓库连接（推荐）
1. 将项目代码推送到 GitHub 仓库
2. 注册/登录 [Vercel](https://vercel.com)
3. 点击 "New Project" → 导入 GitHub 仓库
4. 框架选择 Vite（自动检测），构建命令 `npm run build`，输出目录 `dist`
5. 点击 "Deploy" 即可

### 方式二：CLI 部署
```bash
npm i -g vercel
vercel
```
按提示操作，部署完成后获取域名。

## 三、部署到 Cloudflare Pages

1. 注册/登录 [Cloudflare Pages](https://pages.cloudflare.com)
2. 点击 "Create a project" → 连接 Git 仓库
3. 构建命令：`npm run build`
4. 输出目录：`dist`
5. 部署完成后获取 `*.pages.dev` 域名

## 四、部署到 Netlify

1. 注册/登录 [Netlify](https://netlify.com)
2. 点击 "Add new site" → 从 Git 导入仓库
3. 构建命令：`npm run build`
4. 发布目录：`dist`
5. 部署完成后获取 `*.netlify.app` 域名

## 五、上线后操作（重要！）

### 1. 填写站点配置
部署成功后，请编辑 `docs/site-config.md` 文件，填写：
- 线上 URL（你的部署域名）
- 部署平台
- 上线日期

### 2. 测试验证
- [ ] 首页正常加载
- [ ] 游戏可正常游玩（开始→游玩→结算→重玩）
- [ ] 移动端触控正常
- [ ] PWA 安装提示正常
- [ ] 离线状态下可访问
- [ ] localStorage 存档功能正常
- [ ] 各模式（闯关/每日/无尽/限时）均可进入
- [ ] 帮助弹窗 SVG 图示正常显示（移动端响应式）
- [ ] 胜利结算星星弹出动画正常
- [ ] 每日推荐关卡正常展示

### 3. 接入统计（强烈建议）
线上站点已部署，但无统计工具，无法获取玩家数据。建议尽快接入：
- [Umami](https://umami.is) — 开源、自部署，隐私友好
- [Plausible](https://plausible.io) — 轻量、合规
- 接入后更新 `docs/site-config.md` 中的统计配置

### 4. 接入广告（可选）
- 申请 [Google AdSense](https://adsense.google.com)
- 审核通过后，替换代码中广告位占位符
- 更新 `docs/site-config.md` 中的广告配置

### 5. SEO 优化（建议）
- 在 Google Search Console 添加并验证站点
- 替换 `index.html` 中的 `YOUR_GOOGLE_VERIFICATION_CODE`
- 提交 sitemap：https://game.niuzi.asia/sitemap.xml

## 六、项目功能概览（v1.15.0）

### 游戏模式
- **闯关模式**：100 关，难度递增，星级评价系统
- **每日挑战**：基于日期种子生成，每天一题
- **无尽模式**：难度无限递增
- **限时挑战**：120 秒极限通关

### 游戏特色
- 四种主题切换（经典/暗黑/柔和/霓虹/森林/海洋）
- 成就系统（多分类、进度可视化）
- 每日签到 + 提示道具系统
- 操作回放 + 分享回放链接
- 战绩图生成 + 视频导出
- 关卡编辑器 + 自定义关卡分享
- 自适应难度系统
- 连胜系统 + 连击音效
- 死局检测 + 预警提示
- 新手分步引导
- PWA 离线支持

### 技术架构
- 技术栈：Vite + React + TypeScript
- 状态管理：React Hooks + localStorage
- 音效：Web Audio API 合成
- 美术：CSS/SVG/Emoji，零外部素材
- 部署：Vercel（纯静态，无后端）

## 七、环境变量

当前无环境变量需求。后续接入广告或统计服务时可能需要添加：
- `VITE_ADSENSE_ID` — Google AdSense ID
- `VITE_ANALYTICS_URL` — 统计 API 地址

## 八、注意事项

- 确保部署平台支持 SPA（单页应用）路由
- 建议启用 HTTPS（大多数平台默认启用）
- 建议配置自定义域名以提升 SEO
- Service Worker 需 HTTPS 环境才能生效
- 部署后检查 `manifest.json` 和 `sw.js` 是否正常加载
- 每次部署后 Service Worker 会自动更新缓存（版本号递增）

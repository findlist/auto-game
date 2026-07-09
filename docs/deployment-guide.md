# 部署指南

## 一、构建产物

```bash
npm run build
```

构建后产物在 `dist/` 目录：
- `index.html` — 入口 HTML（~5.7KB, gzip ~2.5KB）
- `assets/index-*.js` — 主 JS bundle（~92KB, gzip ~31KB）
- `assets/react-vendor-*.js` — React 运行时（~141KB, gzip ~45KB）
- `assets/index-*.css` — CSS（~36KB, gzip ~7.5KB）
- `assets/*.js` — 懒加载页面（共 ~33KB, gzip ~12KB）
- `favicon.svg` — 站点图标
- `icon-192.png` / `icon-512.png` — PWA 图标
- `og-image.png` / `og-image.svg` — 社交分享封面图
- `manifest.json` — PWA 清单
- `sw.js` — Service Worker（离线缓存）
- `robots.txt` — SEO 爬虫指引
- `sitemap.xml` — 站点地图

**性能达标**：JS bundle 总计 233KB < 300KB 红线 ✅ | 首屏加载 < 3秒 ✅

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

### 3. 接入广告（可选）
- 申请 [Google AdSense](https://adsense.google.com)
- 审核通过后，替换代码中广告位占位符
- 更新 `docs/site-config.md` 中的广告配置

### 4. 接入统计（可选）
推荐使用免费隐私友好的统计工具：
- [Umami](https://umami.is) — 开源、自部署
- [Plausible](https://plausible.io) — 轻量、合规

## 六、环境变量

当前无环境变量需求。后续接入广告或统计服务时可能需要添加：
- `VITE_ADSENSE_ID` — Google AdSense ID
- `VITE_ANALYTICS_URL` — 统计 API 地址

## 七、注意事项

- 确保部署平台支持 SPA（单页应用）路由
- 建议启用 HTTPS（大多数平台默认启用）
- 建议配置自定义域名以提升 SEO
- Service Worker 需 HTTPS 环境才能生效
- 部署后检查 `manifest.json` 和 `sw.js` 是否正常加载

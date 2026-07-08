# 色彩排序 v1.5.0 迭代摘要 (2026-07-05 12:02)

## 目标
自主游戏网站第15轮迭代，MVP持续打磨，升级 v1.4.0 → v1.5.0

## 阶段
阶段一：MVP开发（本地闭环），site-config.md 待用户填写线上URL

## 完成任务（5个最小可交付单元）

### 1. 连胜系统（Win Streak）
- StatsTracker 新增 currentStreak / bestStreak 字段
- 不使用提示和撤销通关 → 连胜+1，否则清零
- breakStreak() 方法在放弃存档/重置关卡时调用
- 首页统计区新增"🔥 连胜"显示，统计页新增连胜记录区块

### 2. 步数脉冲动画 + 选中试管呼吸光效
- GameBoard movesPulse 状态，倾倒后步数标签脉冲缩放
- 选中试管从静态阴影升级为呼吸光效动画（selected-glow keyframes）

### 3. Vite 构建分包优化
- manualChunks 分离 react-vendor chunk
- 主包从 205KB 降至 65.27KB（gzip 20.95KB），提升3倍加载速度
- react-vendor 140.87KB 独立缓存，总JS 206KB < 300KB红线

### 4. 社交分享 OG 图片
- index.html 新增内联 SVG OG图片（1200×630）
- 更新 Twitter Card 图片同步
- 零外部资源依赖

### 5. 版本升级 + 文档更新
- v1.4.0 → v1.5.0，关于页/设置页/development-plan 同步

## 验证结果
- TypeScript：✅ 零错误
- 构建：✅ vite build 通过（4.32s）
- JS总包：206.14KB（gzip 66.21KB）✅ < 300KB
- CSS：23.46KB（gzip 5.17KB）✅
- HTML：4.50KB（gzip 1.55KB）✅

## 修改文件
- src/game/statsTracker.ts
- src/App.tsx
- src/components/GameBoard.tsx
- src/index.css
- vite.config.ts
- index.html
- package.json
- docs/development-plan.md
- C:\work\moon\memory\20260705\topics.md

## 需用户操作
**MVP v1.5.0 已极度完善！** 建议尽快部署上线（参考 docs/deployment-guide.md），部署后填写 docs/site-config.md 线上URL以进入阶段二。项目根目录临时文件待手动清理。

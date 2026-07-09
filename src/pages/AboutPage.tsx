import React from 'react';

interface AboutPageProps {
  onBack: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="app">
      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← 返回</button>
        <h1 className="game-title">关于</h1>
        <div style={{ width: '40px' }} />
      </header>
      <main className="info-page">
        <h2>🎨 色彩排序</h2>
        <p>一款经典好玩的颜色排序益智游戏。通过逻辑推理将混乱的颜色归类到试管中，挑战你的思维与耐心。</p>

        <h3>玩法说明</h3>
        <ul>
          <li>点击试管选中，再点击其他试管倒入颜色</li>
          <li>只能将颜色倒入空管或顶部颜色相同的试管</li>
          <li>试管容量有限，不能超出上限</li>
          <li>将所有颜色在试管中分类整理即获胜</li>
        </ul>

        <h3>游戏特色</h3>
        <div className="feature-section">
          <h4>🎯 游戏模式</h4>
          <ul>
            <li>100关闯关模式，难度循序渐进（入门→大师）</li>
            <li>📅 每日挑战，全球同一关卡，本地排行榜</li>
            <li>∞ 无尽模式，连续过关难度递增</li>
            <li>⏱ 限时挑战，120秒极限通关</li>
            <li>🔧 关卡编辑器，自创关卡并分享给好友</li>
          </ul>
        </div>
        <div className="feature-section">
          <h4>🏆 成就系统</h4>
          <ul>
            <li>31个成就，记录玩家的不断进步</li>
            <li>星级评价（1-3星），追求三星通关</li>
            <li>连胜系统，不使用提示/撤销连续通关</li>
            <li>每日签到，连续签到奖励递增</li>
            <li>提示道具系统，签到可领取</li>
          </ul>
        </div>
        <div className="feature-section">
          <h4>🌈 视觉与音效</h4>
          <ul>
            <li>6套精美配色主题可切换</li>
            <li>倒色动画与通关粒子特效</li>
            <li>Web Audio API 合成音效，无需音频文件</li>
            <li>可开关的背景音乐循环</li>
          </ul>
        </div>
        <div className="feature-section">
          <h4>📊 数据与统计</h4>
          <ul>
            <li>游戏统计仪表盘，全面记录数据</li>
            <li>步数分布图、通关时间趋势图</li>
            <li>星级分布图、通关进度热力图</li>
            <li>智能关卡推荐，根据表现推荐合适难度</li>
          </ul>
        </div>
        <div className="feature-section">
          <h4>⚙️ 功能与优化</h4>
          <ul>
            <li>PWA 离线可用，安装到桌面随时游玩</li>
            <li>响应式布局，完美适配手机/平板/桌面</li>
            <li>键盘快捷键（数字键选管、Z撤销、R重置、H提示）</li>
            <li>移动端长按试管可撤销操作</li>
            <li>自动保存进度，刷新不丢失</li>
            <li>存档导出/导入功能</li>
          </ul>
        </div>
        <div className="feature-section">
          <h4>📣 社交与分享</h4>
          <ul>
            <li>战绩图生成，分享你的高分成绩</li>
            <li>回放分享与导入，好友可查看操作过程</li>
            <li>回放视频导出（WebM格式）</li>
            <li>社交分享支持 OG 封面图</li>
          </ul>
        </div>

        <h3>技术栈</h3>
        <p>React 18 + Vite 5 + TypeScript，纯前端实现，无后端依赖。所有美术资源使用 CSS/SVG/Emoji 生成，音效使用 Web Audio API 合成，零外部素材依赖。</p>

        <p className="version">版本: v1.12.0 | 2026</p>
      </main>
    </div>
  );
};

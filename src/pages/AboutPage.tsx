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
        <p>一款经典好玩的颜色游戏。</p>
        <h3>玩法说明</h3>
        <ul>
          <li>点击试管选中，再点击其他试管倒入颜色</li>
          <li>只能将颜色倒入空管或顶部颜色相同的试管</li>
          <li>试管容量有限，不能超出上限</li>
          <li>将所有颜色在试管中分类整理胜利</li>
        </ul>
        <h3>玩法与特色</h3>
        <div className="feature-section">
          <h4>🎯 游戏模式</h4>
          <ul>
            <li>100关闲关模式，难度循序渐进</li>
            <li>每日挑战，全球同一关卡</li>
            <li>无尽模式，连续过关难度递增</li>
            <li>限时挑战，120秒极限通关</li>
          </ul>
        </div>
        <div className="feature-section">
          <h4>🏆 成就系统</h4>
          <ul>
            <li>31 个成就，记录玩家的不断进步</li>
            <li>星级评价，追求三星通关</li>
            <li>连胜系统，不使用提示/撒销连续通关</li>
            <li>每日签到，连续签到奖励递增</li>
            <li>签到奖励加倍发放</li>
            <li>提示道具系统</li>
          </ul>
        </div>
        <div className="feature-section">
          <h4>🌈 视觉体验</h4>
          <ul>
            <li>6 套精美配色主题可切换</li>
            <li>倒色动画与粒子特效</li>
            <li>通关粒子特效</li>
            <li>点击试管和操作时的音效</li>
            <li>按钮点击音效</li>
          </ul>
        </div>
        <div className="feature-section">
          <h4>📊 数据与统计</h4>
          <ul>
            <li>游戏统计仪表盘，全面记录数据</li>
            <li>步数分布图、通关时间趋势图</li>
            <li>星级分布图、通关进度热力图</li>
            <li>游戏时长精确统计每次时间</li>
            <li>智能关卡推荐</li>
          </ul>
        </div>
        <div className="feature-section">
          <h4>🔊 音效系统</h4>
          <ul>
            <li>Web Audio 合成音效，无需音频文件</li>
            <li>背景音乐，可开关的循环音乐</li>
            <li>获胜提示、倒色等专属音效</li>
            <li>不同场景专属音效</li>
          </ul>
        </div>
        <div className="feature-section">
          <h4>⚙️ 功能与优化</h4>
          <ul>
            <li>PWA 离线可用，随时随地游戏</li>
            <li>PWA 安装后更流畅的体验</li>
            <li>响应式布局（手机/平板/桌面）</li>
            <li>支持横竖屏，支持屏幕旋转</li>
            <li>键盘快捷键，高效操作</li>
            <li>存档导出/导入功能</li>
            <li>游戏自动保存，刷新不丢失</li>
            <li>数据安全优化，避免重复覆盖</li>
          </ul>
        </div>
        <div className="feature-section">
          <h4>📣 社交与分享</h4>
          <ul>
            <li>战绩图生成，分享你的成绩</li>
            <li>社交分享支持 OG 图片</li>
            <li>回放分享与导入</li>
            <li>回放分享功能，支持好友查看和导入回放</li>
          </ul>
        </div>
        <p className="version">版本: v1.12.0 | 2026</p>
      </main>
    </div>
  );
};

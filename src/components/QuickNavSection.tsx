// 首页快捷功能导航组件
// 从 App.tsx 提取，展示6个快捷入口卡片，提升功能发现率与 SEO 内链
import React from 'react';

interface QuickNavSectionProps {
  onNavigate: (page: string) => void;  // 页面跳转回调
  onDailyChallenge: () => void;        // 每日挑战回调
  onShowHelp: () => void;              // 显示帮助弹窗回调
}

/**
 * 快捷功能导航区
 * 包含色彩百科、成就大厅、游戏统计、关卡编辑器、每日挑战、玩法教程6个入口
 */
export const QuickNavSection: React.FC<QuickNavSectionProps> = React.memo(({ onNavigate, onDailyChallenge, onShowHelp }) => {
  return (
    <div className="quick-nav-section">
      <h3>🧭 探索更多</h3>
      <div className="quick-nav-grid">
        <button className="quick-nav-card" onClick={() => onNavigate('encyclopedia')}>
          <span className="quick-nav-icon">🎨</span>
          <span className="quick-nav-label">色彩百科</span>
          <span className="quick-nav-desc">颜色知识·问答·小游戏</span>
        </button>
        <button className="quick-nav-card" onClick={() => onNavigate('achievements')}>
          <span className="quick-nav-icon">🏆</span>
          <span className="quick-nav-label">成就大厅</span>
          <span className="quick-nav-desc">73个成就等你解锁</span>
        </button>
        <button className="quick-nav-card" onClick={() => onNavigate('stats')}>
          <span className="quick-nav-icon">📊</span>
          <span className="quick-nav-label">游戏统计</span>
          <span className="quick-nav-desc">游玩数据与进度分析</span>
        </button>
        <button className="quick-nav-card" onClick={() => onNavigate('editor')}>
          <span className="quick-nav-icon">🔧</span>
          <span className="quick-nav-label">关卡编辑器</span>
          <span className="quick-nav-desc">创建·分享·导入关卡</span>
        </button>
        <button className="quick-nav-card" onClick={onDailyChallenge}>
          <span className="quick-nav-icon">📅</span>
          <span className="quick-nav-label">每日挑战</span>
          <span className="quick-nav-desc">每天一题等你来解</span>
        </button>
        <button className="quick-nav-card" onClick={onShowHelp}>
          <span className="quick-nav-icon">📖</span>
          <span className="quick-nav-label">玩法教程</span>
          <span className="quick-nav-desc">新手必看快速上手</span>
        </button>
      </div>
    </div>
  );
});

QuickNavSection.displayName = 'QuickNavSection';

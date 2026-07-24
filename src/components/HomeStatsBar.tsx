// 首页统计卡片组件
// 从 App.tsx 提取，展示玩家核心统计数据（已过关卡、总星数、连胜、无尽记录、游戏时长、平均星级）
// 使用 React.memo 优化重渲染，仅当 props 变化时重新渲染
import React from 'react';
import { StatsTracker } from '../game/statsTracker';

interface HomeStatsBarProps {
  completedCount: number;     // 已通关卡数
  totalStars: number;         // 总星数
  endlessHighScore: number;   // 无尽模式最高分
}

/**
 * 首页统计卡片区域
 * 展示6项核心统计数据，数据来源为 props 和 StatsTracker 静态调用
 */
export const HomeStatsBar: React.FC<HomeStatsBarProps> = React.memo(({ completedCount, totalStars, endlessHighScore }) => {
  const stats = StatsTracker.get();
  const avgStars = stats.totalWins > 0 ? (stats.totalStars / stats.totalWins).toFixed(1) : '0';

  return (
    <div className="home-stats">
      <div className="stat-item">
        <span className="stat-value">{completedCount}</span>
        <span className="stat-label">已过关卡</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{totalStars}</span>
        <span className="stat-label">总星数</span>
      </div>
      <div className="stat-item">
        <span className={`stat-value${stats.currentStreak > 0 ? ' stat-value-streak-hot' : ''}`}>🔥{stats.currentStreak}</span>
        <span className="stat-label">连胜</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{endlessHighScore}</span>
        <span className="stat-label">无尽记录</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{StatsTracker.formatTime(stats.totalPlayTime)}</span>
        <span className="stat-label">游戏时长</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{avgStars}</span>
        <span className="stat-label">平均星级</span>
      </div>
    </div>
  );
});

HomeStatsBar.displayName = 'HomeStatsBar';

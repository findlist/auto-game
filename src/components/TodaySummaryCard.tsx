// 首页今日概览卡片组件
// 从 App.tsx 提取，展示当日游玩数据（通关数、星数、连击数）
import { StatsTracker } from '../game/statsTracker';

interface TodaySummaryCardProps {
  comboStreak: number;
}

export function TodaySummaryCard({ comboStreak }: TodaySummaryCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const stats = StatsTracker.get();
  const todayRecords = stats.recentRecords.filter(r => r.timestamp >= todayMs);
  const todayWins = todayRecords.length;
  const todayStars = todayRecords.reduce((sum, r) => sum + r.stars, 0);

  // 无数据时隐藏
  if (todayWins === 0 && comboStreak === 0) return null;

  return (
    <div className="today-summary-card">
      <div className="today-summary-item">
        <span className="today-summary-icon">🎯</span>
        <span className="today-summary-value">{todayWins}</span>
        <span className="today-summary-label">今日通关</span>
      </div>
      <div className="today-summary-item">
        <span className="today-summary-icon">⭐</span>
        <span className="today-summary-value">{todayStars}</span>
        <span className="today-summary-label">今日星数</span>
      </div>
      {comboStreak >= 2 && (
        <div className="today-summary-item">
          <span className="today-summary-icon">🔥</span>
          <span className="today-summary-value">{comboStreak}</span>
          <span className="today-summary-label">连击</span>
        </div>
      )}
    </div>
  );
}

// 首页每日目标卡片组件
// 从 App.tsx 提取，减少主文件体积，提升可维护性
// 增强：目标完成时打钩动画、进度条充能动画、全部完成时庆祝效果
import { useEffect, useRef, useState } from 'react';
import { DailyGoal } from '../game/dailyGoals';

interface DailyGoalsCardProps {
  goals: DailyGoal[];
  onClaim: (type: string) => void;
  claimToast: string | null;
}

export function DailyGoalsCard({ goals, onClaim, claimToast }: DailyGoalsCardProps) {
  const completedCount = goals.filter(g => g.completed).length;
  const totalCount = goals.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allDone = completedCount === totalCount && totalCount > 0;

  // 追踪上一次完成数，用于触发完成动画
  const prevCompletedRef = useRef(completedCount);
  const [justCompletedGoal, setJustCompletedGoal] = useState<string | null>(null);
  const [showAllDoneBurst, setShowAllDoneBurst] = useState(false);

  useEffect(() => {
    // 检测新完成的目标
    const prevCompleted = prevCompletedRef.current;
    if (completedCount > prevCompleted) {
      // 找到刚完成的目标
      const newlyCompleted = goals.find(g => g.completed && !g.claimed);
      if (newlyCompleted) {
        setJustCompletedGoal(newlyCompleted.type);
        setTimeout(() => setJustCompletedGoal(null), 1200);
      }
      // 全部完成时触发庆祝
      if (completedCount === totalCount && totalCount > 0) {
        setShowAllDoneBurst(true);
        setTimeout(() => setShowAllDoneBurst(false), 2000);
      }
    }
    prevCompletedRef.current = completedCount;
  }, [completedCount, totalCount, goals]);

  return (
    <>
      <div className={`daily-goals-card ${allDone ? 'all-goals-done' : ''}`}>
        <div className="daily-goals-header">
          <span className="daily-goals-title">🎯 每日目标</span>
          <span className="daily-goals-progress">{completedCount}/{totalCount}</span>
        </div>
        {/* 整体进度条 — 全部完成时渐变彩虹 */}
        <div className="daily-goals-bar">
          <div className={`daily-goals-bar-fill ${allDone ? 'bar-fill-rainbow' : ''}`} style={{ width: `${progressPct}%` }} />
        </div>
        {/* 全部完成庆祝文字 */}
        {allDone && (
          <div className="all-goals-done-text">🎉 今日目标全部完成！</div>
        )}
        <div className="daily-goals-list">
          {goals.map(goal => {
            const isJustDone = justCompletedGoal === goal.type;
            return (
              <div
                key={goal.type}
                className={`daily-goal-item ${goal.completed ? 'goal-completed' : ''} ${goal.claimed ? 'goal-claimed' : ''} ${isJustDone ? 'goal-just-completed' : ''}`}
              >
                <span className="goal-icon">{goal.icon}</span>
                <div className="goal-content">
                  <div className="goal-row">
                    <span className="goal-desc">{goal.description}</span>
                    <span className="goal-progress-text">{goal.current}/{goal.target}</span>
                  </div>
                  {/* 单目标进度条 — 完成时充能动画 */}
                  <div className="goal-progress-bar">
                    <div
                      className={`goal-progress-fill ${goal.completed ? 'goal-progress-done' : ''} ${isJustDone ? 'goal-progress-charging' : ''}`}
                      style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}
                    />
                  </div>
                </div>
                {goal.completed && !goal.claimed ? (
                  <button className={`goal-claim-btn ${isJustDone ? 'claim-btn-pulse' : ''}`} onClick={() => onClaim(goal.type)}>领取+{goal.reward}</button>
                ) : goal.claimed ? (
                  <span className="goal-claimed-icon" style={isJustDone ? { animation: 'checkPop 0.5s ease-out' } : undefined}>✅</span>
                ) : (
                  <span className="goal-pending-icon">○</span>
                )}
              </div>
            );
          })}
        </div>
        {/* 全部完成时的粒子飘落效果 */}
        {showAllDoneBurst && (
          <div className="goals-celebration-burst">
            {['🎉', '🎊', '⭐', '🌟', '✨', '🎈', '🏆', '💎'].map((emoji, i) => (
              <span
                key={i}
                className="burst-particle"
                style={{
                  left: `${10 + i * 11}%`,
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>
        )}
      </div>
      {claimToast && (
        <div className="goal-claim-toast">{claimToast}</div>
      )}
    </>
  );
}

// 首页每日目标卡片组件
// 从 App.tsx 提取，减少主文件体积，提升可维护性
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

  return (
    <>
      <div className="daily-goals-card">
        <div className="daily-goals-header">
          <span className="daily-goals-title">🎯 每日目标</span>
          <span className="daily-goals-progress">{completedCount}/{totalCount}</span>
        </div>
        {/* 整体进度条 */}
        <div className="daily-goals-bar">
          <div className="daily-goals-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="daily-goals-list">
          {goals.map(goal => (
            <div key={goal.type} className={`daily-goal-item ${goal.completed ? 'goal-completed' : ''} ${goal.claimed ? 'goal-claimed' : ''}`}>
              <span className="goal-icon">{goal.icon}</span>
              <div className="goal-content">
                <div className="goal-row">
                  <span className="goal-desc">{goal.description}</span>
                  <span className="goal-progress-text">{goal.current}/{goal.target}</span>
                </div>
                {/* 单目标进度条 */}
                <div className="goal-progress-bar">
                  <div className={`goal-progress-fill ${goal.completed ? 'goal-progress-done' : ''}`} style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }} />
                </div>
              </div>
              {goal.completed && !goal.claimed ? (
                <button className="goal-claim-btn" onClick={() => onClaim(goal.type)}>领取+{goal.reward}</button>
              ) : goal.claimed ? (
                <span className="goal-claimed-icon">✅</span>
              ) : (
                <span className="goal-pending-icon">○</span>
              )}
            </div>
          ))}
        </div>
      </div>
      {claimToast && (
        <div className="goal-claim-toast">{claimToast}</div>
      )}
    </>
  );
}

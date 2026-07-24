import { DailyCheckin } from '../game/dailyCheckin';
import { MAX_HINT_ITEMS } from '../game/hintItems';
import { getTodayLeaderboard } from '../game/dailyLeaderboard';
import { SoundEngine } from '../game/soundEngine';
import type { Progress, RecentPlay } from '../game/homeStorage';
import { DailyGoalsCard } from './DailyGoalsCard';
import { TodaySummaryCard } from './TodaySummaryCard';
import type { DailyGoal } from '../game/dailyGoals';

// 首页顶部区域组件：签到+提示道具+快速重玩+每日目标+游戏模式+周挑战+周末奖励
// 从 App.tsx 提取，减少主组件代码量，提升可维护性

interface WeeklyDisplay {
  week: number;
  recordMoves?: number;
  recordStars?: number;
  streak: number;
}

interface WeekendBonusInfo {
  isWeekend: boolean;
  claimed: boolean;
  totalClaimed: number;
}

interface HomeTopSectionProps {
  // 签到状态
  checkinDone: boolean;
  checkinStreak: number;
  checkinTotal: number;
  onCheckin: () => void;
  // 提示道具
  hintItems: number;
  // 每日目标
  dailyGoals: DailyGoal[];
  goalClaimToast: string | null;
  onClaimGoal: (type: string) => void;
  // 连击
  comboStreak: number;
  // 进度
  progress: Progress;
  levelStars: Record<number, number>;
  recentPlay: RecentPlay | null;
  // 游戏模式
  dailyCompletedToday: boolean;
  endlessHighScore: number;
  onStartGame: () => void;
  onDailyChallenge: () => void;
  onEndlessMode: () => void;
  onTimedMode: () => void;
  onSelectLevel: (level: number) => void;
  // 周挑战
  weeklyDisplay: WeeklyDisplay | null;
  weeklyCompleted: boolean;
  onWeeklyChallenge: () => void;
  // 周末奖励
  weekendBonusInfo: WeekendBonusInfo;
  onClaimWeekendBonus: () => void;
}

function HomeTopSectionInner({
  checkinDone,
  checkinStreak,
  checkinTotal,
  onCheckin,
  hintItems,
  dailyGoals,
  goalClaimToast,
  onClaimGoal,
  comboStreak,
  progress,
  levelStars,
  recentPlay,
  dailyCompletedToday,
  onStartGame,
  onDailyChallenge,
  onEndlessMode,
  onTimedMode,
  onSelectLevel,
  weeklyDisplay,
  weeklyCompleted,
  onWeeklyChallenge,
  weekendBonusInfo,
  onClaimWeekendBonus,
}: HomeTopSectionProps) {
  return (
    <div className="mode-entry">
      {/* 签到 + 提示道具 合并行 */}
      <div className="status-bar">
        <div className={`checkin-card checkin-card-compact ${checkinDone ? 'checkin-done' : ''}`}>
          <div className="checkin-info">
            <span className="checkin-icon">📅</span>
            <div className="checkin-text">
              <span className="checkin-title">{checkinDone ? '已签到' : '签到'}</span>
              <span className="checkin-streak">🔥{checkinStreak}天</span>
            </div>
          </div>
          {checkinDone ? (
            <span className="checkin-checked">✅</span>
          ) : (
            <button className="checkin-btn" onClick={onCheckin}>签到</button>
          )}
        </div>
        <div className="hint-items-card hint-items-card-compact">
          <span className="hint-items-icon">💡</span>
          <div className="hint-items-info">
            <span className="hint-items-text">提示 <strong>{hintItems}</strong>/{MAX_HINT_ITEMS}</span>
            <span className="hint-items-tip">签到可领</span>
          </div>
        </div>
      </div>
      {/* 下一个签到奖励提示 */}
      {(() => {
        const next = DailyCheckin.getNextMilestone();
        if (!next) return null;
        return (
          <div className="checkin-milestone-hint">
            <span>{next.icon} 再签 {next.remaining} 天可得: {next.reward} · 累计{checkinTotal}天</span>
          </div>
        );
      })()}

      {/* 快速重玩上一关 */}
      {recentPlay && progress.completedLevels.length > 0 && (
        <div className="recent-play-card" onClick={() => {
          if (recentPlay.mode === 'daily') onDailyChallenge();
          else if (recentPlay.mode === 'endless') onEndlessMode();
          else if (recentPlay.mode === 'timed') onTimedMode();
          else onSelectLevel(recentPlay.level);
        }}>
          <span className="recent-icon">▶️</span>
          <span className="recent-text">
            <span className="recent-label">继续上次</span>
            <span className="recent-level">
              {recentPlay.mode === 'daily' ? '每日挑战' : recentPlay.mode === 'endless' ? '无尽模式' : recentPlay.mode === 'timed' ? '限时挑战' : `第 ${recentPlay.level} 关`}
              <span className="recent-mode-tag">{
                recentPlay.mode === 'daily' ? '📅' : recentPlay.mode === 'endless' ? '∞' : recentPlay.mode === 'timed' ? '⏱' : '🎯'
              }</span>
            </span>
          </span>
          <span className="recent-arrow">→</span>
        </div>
      )}

      {/* 快速重玩上一关：让玩家可快速重玩最近通关的关卡，提升重玩率 */}
      {progress.completedLevels.length > 0 && (() => {
        const lastCompleted = progress.completedLevels[progress.completedLevels.length - 1];
        return (
          <div className="replay-last-card" onClick={() => { SoundEngine.click(); onSelectLevel(lastCompleted); }} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); SoundEngine.click(); onSelectLevel(lastCompleted); } }}>
            <span className="replay-last-icon">🔄</span>
            <div className="replay-last-info">
              <span className="replay-last-label">重玩上一关</span>
              <span className="replay-last-detail">第 {lastCompleted} 关 · {levelStars[lastCompleted] ? '⭐'.repeat(levelStars[lastCompleted]) : '未评星'}</span>
            </div>
            <span className="replay-last-arrow">→</span>
          </div>
        );
      })()}

      {/* 今日概览卡片：展示当日游玩数据，提升首页信息密度 */}
      <TodaySummaryCard comboStreak={comboStreak} />

      {/* 每日目标卡片：增强日活留存，完成小目标领取提示道具奖励 */}
      <DailyGoalsCard goals={dailyGoals} onClaim={onClaimGoal} claimToast={goalClaimToast} />

      {/* 游戏模式 2×2 网格 */}
      <div className="mode-grid">
        <button className="btn btn-primary mode-grid-btn" onClick={onStartGame}>
          <span className="mode-grid-icon">🎯</span>
          <span className="mode-grid-label">{progress.currentLevel > 1 ? `继续游戏` : "开始游戏"}</span>
          <span className="mode-grid-sub">{progress.currentLevel > 1 ? `第${progress.currentLevel}关` : '100关闯关'}</span>
        </button>
        <button
          className={`btn mode-grid-btn ${dailyCompletedToday ? 'btn-daily-done' : 'btn-daily'}`}
          onClick={onDailyChallenge}
        >
          <span className="mode-grid-icon">📅</span>
          <span className="mode-grid-label">{dailyCompletedToday ? "已完成" : "每日挑战"}</span>
          <span className="mode-grid-sub">{dailyCompletedToday && getTodayLeaderboard()[0] ? `最佳${getTodayLeaderboard()[0].moves}步` : '每天一题'}</span>
        </button>
        <button
          className="btn btn-endless mode-grid-btn"
          onClick={onEndlessMode}
        >
          <span className="mode-grid-icon">∞</span>
          <span className="mode-grid-label">无尽模式</span>
          <span className="mode-grid-sub">每5关奖提示道具</span>
        </button>
        <button
          className="btn btn-timed mode-grid-btn"
          onClick={onTimedMode}
        >
          <span className="mode-grid-icon">⏱</span>
          <span className="mode-grid-label">限时挑战</span>
          <span className="mode-grid-sub">120秒极限·每5关奖道具</span>
        </button>
      </div>

      {/* 周挑战入口 */}
      {weeklyDisplay && (() => {
        return (
          <div className={`weekly-challenge-banner ${weeklyCompleted ? 'weekly-done' : ''}`} onClick={() => { if (!weeklyCompleted) onWeeklyChallenge(); }} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!weeklyCompleted) onWeeklyChallenge(); } }}>
            <div className="weekly-banner-icon">🏆</div>
            <div className="weekly-banner-content">
              <span className="weekly-banner-title">{weeklyCompleted ? '本周挑战已完成' : `第${weeklyDisplay.week}周挑战`}</span>
              <span className="weekly-banner-sub">
                {weeklyCompleted && weeklyDisplay.recordMoves ? `✅ ${weeklyDisplay.recordMoves}步 · ${'⭐'.repeat(weeklyDisplay.recordStars || 0)}` : '高难度关卡,等你来战!'}
                {weeklyDisplay.streak > 0 ? ` · 🔥${weeklyDisplay.streak}周连续` : ''}
              </span>
            </div>
            {!weeklyCompleted && <span className="weekly-banner-arrow">→</span>}
          </div>
        );
      })()}

      {/* 周末奖励横幅 */}
      {weekendBonusInfo.isWeekend && (
        <div
          className={`weekend-bonus-banner ${weekendBonusInfo.claimed ? 'weekend-claimed' : ''}`}
          onClick={() => { if (!weekendBonusInfo.claimed) onClaimWeekendBonus(); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!weekendBonusInfo.claimed) onClaimWeekendBonus(); } }}
        >
          <div className="weekend-banner-icon">🎁</div>
          <div className="weekend-banner-content">
            <span className="weekend-banner-title">{weekendBonusInfo.claimed ? '周末奖励已领取' : '周末免费提示道具'}</span>
            <span className="weekend-banner-sub">
              {weekendBonusInfo.claimed ? '明天再来吧~' : '点击领取 1 个提示道具'}
              {weekendBonusInfo.totalClaimed > 0 ? ` · 累计领取${weekendBonusInfo.totalClaimed}次` : ''}
            </span>
          </div>
          {!weekendBonusInfo.claimed && <span className="weekend-banner-arrow">→</span>}
        </div>
      )}

      {progress.currentLevel > 1 && (
        <button className="btn btn-secondary" onClick={() => onSelectLevel(1)}>
          🔄 从头开始
        </button>
      )}
    </div>
  );
}

// 使用 React.memo 优化重渲染性能，仅当 props 变化时重新渲染
export const HomeTopSection = HomeTopSectionInner;

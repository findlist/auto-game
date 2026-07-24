import { memo } from 'react';
import { getDailyRecommend } from '../game/dailyRecommend';
import { getAdaptiveRecommendation } from '../game/adaptiveDifficulty';
import { StatsTracker } from '../game/statsTracker';

type Page = 'home' | 'game' | 'about' | 'privacy' | 'achievements' | 'settings' | 'stats' | 'editor' | 'editor-play' | 'encyclopedia';

interface SmartRecommendSectionProps {
  completedLevels: number[];
  levelStars: Record<number, number>;
  currentLevel: number;
  checkinDone: boolean;
  dailyCompletedToday: boolean;
  onStartGame: () => void;
  onEndlessMode: () => void;
  onDailyChallenge: () => void;
  onNavigateToEncyclopedia: () => void;
  onSelectLevel: (level: number) => void;
}

/**
 * 首页智能推荐区块：每日挑战入口 + 每日推荐关卡 + 智能推荐游玩模式 + 智能推荐关卡
 * 根据玩家进度、时段和历史数据智能推荐内容，提升留存和重玩率
 */
function SmartRecommendSectionComponent({
  completedLevels,
  levelStars,
  currentLevel,
  checkinDone,
  dailyCompletedToday,
  onStartGame,
  onEndlessMode,
  onDailyChallenge,
  onNavigateToEncyclopedia,
  onSelectLevel,
}: SmartRecommendSectionProps) {
  const handleEnterPress = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };

  return (
    <>
      {/* 每日挑战醒目入口 - 未完成时展示 */}
      {!dailyCompletedToday && (
        <div className="daily-challenge-banner" onClick={onDailyChallenge} role="button" tabIndex={0}
          onKeyDown={handleEnterPress(onDailyChallenge)}>
          <div className="daily-banner-icon">📅</div>
          <div className="daily-banner-content">
            <span className="daily-banner-title">今日挑战未完成</span>
            <span className="daily-banner-sub">每天一题,等你来解!</span>
          </div>
          <span className="daily-banner-arrow">→</span>
        </div>
      )}

      {/* 每日推荐关卡 - 基于日期种子推荐重玩 */}
      {(() => {
        const dailyRec = getDailyRecommend(completedLevels, levelStars, currentLevel);
        if (!dailyRec) return null;
        return (
          <div className="daily-recommend-card" onClick={() => onSelectLevel(dailyRec.level)} role="button" tabIndex={0}
            onKeyDown={handleEnterPress(() => onSelectLevel(dailyRec.level))}>
            <span className="daily-rec-icon">{dailyRec.icon}</span>
            <div className="daily-rec-info">
              <span className="daily-rec-label">📌 今日推荐</span>
              <span className="daily-rec-detail">第 {dailyRec.level} 关 · {dailyRec.reason}</span>
            </div>
            <span className="daily-rec-arrow">→</span>
          </div>
        );
      })()}

      {/* 智能推荐游玩模式 - 基于历史游玩模式和时间推荐不同玩法 */}
      {(() => {
        // 基于已玩游戏模式和当前状态推荐游玩内容
        const hour = new Date().getHours();
        const stats = StatsTracker.get();
        let recommendGame = { icon: '🎨', label: '今日推荐游玩', title: '色彩百科', desc: '探索色彩知识,玩迷你游戏', target: 'encyclopedia' as Page };
        // 根据时段和游玩历史智能推荐
        if (hour >= 6 && hour < 12) {
          // 早上:推荐每日问答或签到
          if (!checkinDone) {
            recommendGame = { icon: '📅', label: '今日推荐游玩', title: '每日签到', desc: '签到领取提示道具奖励', target: 'home' as Page };
          } else {
            recommendGame = { icon: '📚', label: '今日推荐游玩', title: '每日色彩问答', desc: '每天一题,涨色彩知识', target: 'encyclopedia' as Page };
          }
        } else if (hour >= 12 && hour < 18) {
          // 下午:推荐闯关或无尽模式
          if (stats.totalWins < 5) {
            recommendGame = { icon: '🎯', label: '今日推荐游玩', title: '经典闯关', desc: '挑战100关色彩排序', target: 'game' as Page };
          } else {
            recommendGame = { icon: '∞', label: '今日推荐游玩', title: '无尽模式', desc: '难度无限递增,挑战极限', target: 'home' as Page };
          }
        } else if (hour >= 18 && hour < 23) {
          // 晚上:推荐百科小游戏或每日挑战
          if (!dailyCompletedToday) {
            recommendGame = { icon: '📅', label: '今日推荐游玩', title: '每日挑战', desc: '今天还没做每日挑战哦', target: 'home' as Page };
          } else {
            recommendGame = { icon: '🧠', label: '今日推荐游玩', title: '色彩记忆配对', desc: '翻开卡片找到相同颜色', target: 'encyclopedia' as Page };
          }
        } else {
          // 深夜:推荐序列记忆或辨识测试
          recommendGame = { icon: '🎵', label: '今日推荐游玩', title: '色彩序列记忆', desc: '安静时段适合锻炼记忆力', target: 'encyclopedia' as Page };
        }
        // 如果推荐目标不是当前页面,则显示卡片
        if (recommendGame.target === 'home' && recommendGame.title === '每日签到' && checkinDone) return null;
        if (recommendGame.target === 'home' && recommendGame.title === '每日挑战' && dailyCompletedToday) return null;

        const handleRecommendClick = () => {
          if (recommendGame.target === 'game') onStartGame();
          else if (recommendGame.target === 'encyclopedia') onNavigateToEncyclopedia();
          else if (recommendGame.title === '无尽模式') onEndlessMode();
          else if (recommendGame.title === '每日挑战') onDailyChallenge();
        };

        return (
          <div className="smart-recommend-card" onClick={handleRecommendClick} role="button" tabIndex={0}
            onKeyDown={handleEnterPress(handleRecommendClick)}>
            <span className="smart-rec-icon">{recommendGame.icon}</span>
            <div className="smart-rec-info">
              <span className="smart-rec-label">{recommendGame.label}</span>
              <span className="smart-rec-title">{recommendGame.title}</span>
              <span className="smart-rec-desc">{recommendGame.desc}</span>
            </div>
            <span className="smart-rec-arrow">→</span>
          </div>
        );
      })()}

      {/* 智能推荐关卡 */}
      {(() => {
        const recommend = getAdaptiveRecommendation(completedLevels, levelStars, currentLevel);
        if (!recommend) return null;
        return (
          <div className="recommend-card" onClick={() => onSelectLevel(recommend.level)}>
            <span className="recommend-icon">{recommend.icon}</span>
            <div className="recommend-info">
              <span className="recommend-label">推荐关卡</span>
              <span className="recommend-detail">第 {recommend.level} 关 · {recommend.reason}</span>
            </div>
            <span className="recommend-arrow">→</span>
          </div>
        );
      })()}
    </>
  );
}

export const SmartRecommendSection = memo(SmartRecommendSectionComponent);

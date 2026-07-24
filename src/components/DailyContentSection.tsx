import { useState, useCallback, memo } from 'react';
import { SoundEngine } from '../game/soundEngine';
import { getAllDailyTips, getTodayTip, getTodayColorKnowledge, getTodayColorQuiz, getDailyQuizHistory, getQuizStreak } from '../game/announcements';

interface DailyContentSectionProps {
  onNavigateToEncyclopedia: () => void;
}

/**
 * 首页每日内容区块：每日策略小贴士 + 每日色彩知识 + 每日色彩问答入口
 * 三者都是日轮播内容，合并为一个独立组件减少 App.tsx 代码量
 */
function DailyContentSectionComponent({ onNavigateToEncyclopedia }: DailyContentSectionProps) {
  // 每日贴士手动浏览：支持点击切换上一篇/下一篇
  const ALL_TIPS = getAllDailyTips();
  const [tipIndex, setTipIndex] = useState(() => {
    const todayTip = getTodayTip();
    return ALL_TIPS.findIndex(t => t.title === todayTip.title);
  });

  const handlePrevTip = useCallback(() => {
    SoundEngine.click();
    setTipIndex(i => (i - 1 + ALL_TIPS.length) % ALL_TIPS.length);
  }, [ALL_TIPS.length]);

  const handleNextTip = useCallback(() => {
    SoundEngine.click();
    setTipIndex(i => (i + 1) % ALL_TIPS.length);
  }, [ALL_TIPS.length]);

  const handleEnterPress = useCallback((fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  }, []);

  // 每日色彩知识
  const knowledge = getTodayColorKnowledge();

  // 每日色彩问答数据
  const quiz = getTodayColorQuiz();
  const history = getDailyQuizHistory();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const answeredToday = history.some(h => h.dayIndex === quiz.dayIndex && h.date === todayStr);
  const correctCount = history.filter(h => h.correct).length;
  const quizStreak = getQuizStreak();
  // 连续答题里程碑提示
  const nextMilestone = quizStreak < 3 ? 3 : quizStreak < 7 ? 7 : quizStreak < 14 ? 14 : quizStreak < 30 ? 30 : quizStreak < 50 ? 50 : null;
  const milestoneEmoji = quizStreak >= 30 ? '🏆' : quizStreak >= 14 ? '💎' : quizStreak >= 7 ? '🔥' : quizStreak >= 3 ? '⭐' : '';

  const tip = ALL_TIPS[tipIndex] || ALL_TIPS[0];

  return (
    <>
      {/* 每日策略小贴士 - 支持手动切换浏览 */}
      <div className="daily-tip-card">
        <span className="daily-tip-icon">{tip.icon}</span>
        <div className="daily-tip-content">
          <span className="daily-tip-label">💡 小贴士 {tipIndex + 1}/{ALL_TIPS.length}</span>
          <span className="daily-tip-title">{tip.title}</span>
          <span className="daily-tip-text">{tip.content}</span>
        </div>
        <div className="daily-tip-nav">
          <button className="daily-tip-nav-btn" onClick={handlePrevTip} aria-label="上一条">←</button>
          <button className="daily-tip-nav-btn" onClick={handleNextTip} aria-label="下一条">→</button>
        </div>
      </div>

      {/* 每日色彩知识 */}
      <div className="daily-color-knowledge-card" onClick={onNavigateToEncyclopedia} role="button" tabIndex={0}
        onKeyDown={handleEnterPress(onNavigateToEncyclopedia)}>
        <span className="daily-color-knowledge-emoji">{knowledge.emoji}</span>
        <div className="daily-color-knowledge-content">
          <span className="daily-color-knowledge-label">🎨 每日色彩知识</span>
          <span className="daily-color-knowledge-title">{knowledge.name}</span>
          <span className="daily-color-knowledge-text">{knowledge.text}</span>
        </div>
        <span className="daily-color-knowledge-arrow">→</span>
      </div>

      {/* 每日色彩问答入口卡片 */}
      <div className={`daily-quiz-entry-card ${!answeredToday ? 'quiz-unanswered' : ''}`} onClick={onNavigateToEncyclopedia} role="button" tabIndex={0}
        onKeyDown={handleEnterPress(onNavigateToEncyclopedia)}>
        <span className="daily-quiz-entry-icon">{answeredToday ? '✅' : '📝'}</span>
        <div className="daily-quiz-entry-content">
          <span className="daily-quiz-entry-label">📚 每日色彩问答 {quizStreak > 0 && <span className="quiz-streak-badge">{milestoneEmoji} 连续{quizStreak}天</span>}</span>
          <span className="daily-quiz-entry-title">{answeredToday ? '今日已答题' : quiz.question}</span>
          <span className="daily-quiz-entry-sub">{answeredToday ? `累计正确 ${correctCount}/${history.length} 题${nextMilestone ? ` · 再答${nextMilestone - quizStreak}天解锁新徽章` : ''}` : '点击进入答题,每天一题涨知识!'}</span>
        </div>
        <span className="daily-quiz-entry-arrow">→</span>
      </div>
    </>
  );
}

export const DailyContentSection = memo(DailyContentSectionComponent);

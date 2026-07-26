// 色彩百科页成就回调 hook — 从 App.tsx 拆分，集中管理百科页的成就检查逻辑
// 统一"检查成就 → 追加到 newAchievements"模式，减少 App.tsx 内联回调代码量

import { useCallback } from 'react';
import { Achievement } from './achievements';
import { EncyclopediaAchievementChecks } from './achievementEncyclopediaChecks';
import { getQuizStreak, getDailyQuizHistory } from './announcements';

export function useEncyclopediaAchievements(
  setNewAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>
) {
  // 色彩辨识测试完成
  const onTestComplete = useCallback((score: number) => {
    const achievements = EncyclopediaAchievementChecks.checkColorPerceptionAchievements(score);
    if (achievements.length > 0) {
      setNewAchievements(prev => [...prev, ...achievements]);
    }
  }, [setNewAchievements]);

  // 颜色混合器使用
  const onMixerUse = useCallback((useCount: number) => {
    const achievements = EncyclopediaAchievementChecks.checkColorMixerAchievements(useCount);
    if (achievements.length > 0) {
      setNewAchievements(prev => [...prev, ...achievements]);
    }
  }, [setNewAchievements]);

  // 色彩序列记忆完成
  const onSequenceComplete = useCallback((level: number) => {
    const achievements = EncyclopediaAchievementChecks.checkSequenceMemoryAchievements(level);
    if (achievements.length > 0) {
      setNewAchievements(prev => [...prev, ...achievements]);
    }
  }, [setNewAchievements]);

  // 色彩配对完成（统一检查所有难度）
  const onPairMatchComplete = useCallback((moves: number) => {
    const achievements = EncyclopediaAchievementChecks.checkPairMatchAchievements('hard', moves);
    if (achievements.length > 0) {
      setNewAchievements(prev => [...prev, ...achievements]);
    }
  }, [setNewAchievements]);

  // 色彩反应力测试完成
  const onReactionComplete = useCallback((score: number) => {
    const achievements = EncyclopediaAchievementChecks.checkReactionTestAchievements(score, 8);
    if (achievements.length > 0) {
      setNewAchievements(prev => [...prev, ...achievements]);
    }
  }, [setNewAchievements]);

  // 每日色彩问答完成（含连续答题里程碑和答题高手成就检查）
  const onQuizComplete = useCallback((totalCompleted: number) => {
    // 传入连续答题天数，用于检查连续答题里程碑成就
    const quizAchievements = EncyclopediaAchievementChecks.checkDailyQuizAchievements(totalCompleted, getQuizStreak());
    if (quizAchievements.length > 0) {
      setNewAchievements(prev => [...prev, ...quizAchievements]);
    }
    // 检查答题高手成就
    const history = getDailyQuizHistory();
    const correctCount = history.filter(h => h.correct).length;
    const expertAchievements = EncyclopediaAchievementChecks.checkQuizExpertAchievement(correctCount);
    if (expertAchievements.length > 0) {
      setNewAchievements(prev => [...prev, ...expertAchievements]);
    }
  }, [setNewAchievements]);

  // 百科搜索
  const onSearch = useCallback(() => {
    const achievements = EncyclopediaAchievementChecks.checkKnowledgeExplorerAchievement();
    if (achievements.length > 0) {
      setNewAchievements(prev => [...prev, ...achievements]);
    }
  }, [setNewAchievements]);

  // 分享每日问答结果
  const onQuizShare = useCallback(() => {
    const achievements = EncyclopediaAchievementChecks.checkQuizSharerAchievement();
    if (achievements.length > 0) {
      setNewAchievements(prev => [...prev, ...achievements]);
    }
  }, [setNewAchievements]);

  // 浏览颜色详解
  const onColorView = useCallback((viewedCount: number) => {
    const achievements = EncyclopediaAchievementChecks.checkEncyclopediaExplorerAchievement(viewedCount);
    if (achievements.length > 0) {
      setNewAchievements(prev => [...prev, ...achievements]);
    }
  }, [setNewAchievements]);

  // 体验百科小游戏（记录已玩游戏，检查全能玩家成就）
  const onGamePlayed = useCallback((gameId: string) => {
    try {
      const data = localStorage.getItem('encyclopedia_played_games');
      const played: string[] = data ? JSON.parse(data) : [];
      if (!played.includes(gameId)) {
        played.push(gameId);
        localStorage.setItem('encyclopedia_played_games', JSON.stringify(played));
      }
      const achievements = EncyclopediaAchievementChecks.checkAllEncyclopediaGamesAchievement(played);
      if (achievements.length > 0) {
        setNewAchievements(prev => [...prev, ...achievements]);
      }
    } catch (e) { /* 忽略 localStorage 读写异常 */ }
  }, [setNewAchievements]);

  return {
    onTestComplete,
    onMixerUse,
    onSequenceComplete,
    onPairMatchComplete,
    onReactionComplete,
    onQuizComplete,
    onSearch,
    onQuizShare,
    onColorView,
    onGamePlayed,
  };
}

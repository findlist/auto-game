// 百科相关成就检查方法 — 从 achievements.ts 拆分
// 包含色彩百科、辨识测试、混合器、序列记忆、配对、反应力、问答等百科小游戏相关成就
// 设计原因：百科成就检查方法数量多且功能内聚，独立模块便于维护和扩展

import type { Achievement } from './achievements';
import { AchievementManager } from './achievements';
import { loadState } from './achievementState';

/**
 * 百科相关成就检查方法集合
 * 通过调用 AchievementManager.unlock 实现成就解锁
 */
export const EncyclopediaAchievementChecks = {
  // 检查色彩知识成就
  checkEncyclopediaAchievements(level100Completed: boolean): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (!('encyclopedia_visitor' in loadState().unlocked)) {
      newlyUnlocked.push(...AchievementManager.unlock('encyclopedia_visitor'));
    }
    if (level100Completed && !('color_master_all' in loadState().unlocked)) {
      newlyUnlocked.push(...AchievementManager.unlock('color_master_all'));
    }
    return newlyUnlocked;
  },

  // 检查色彩辨识测试成就
  checkColorPerceptionAchievements(score: number): Achievement[] {
    if (score >= 8 && !('color_perception_8' in loadState().unlocked)) {
      return AchievementManager.unlock('color_perception_8');
    }
    return [];
  },

  // 检查颜色混合器使用成就
  checkColorMixerAchievements(useCount: number): Achievement[] {
    if (useCount >= 10 && !('color_mixer_10' in loadState().unlocked)) {
      return AchievementManager.unlock('color_mixer_10');
    }
    return [];
  },

  // 检查色彩序列记忆成就
  checkSequenceMemoryAchievements(level: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (level >= 5 && !('sequence_memory_5' in loadState().unlocked)) {
      newlyUnlocked.push(...AchievementManager.unlock('sequence_memory_5'));
    }
    if (level >= 10 && !('sequence_memory_10' in loadState().unlocked)) {
      newlyUnlocked.push(...AchievementManager.unlock('sequence_memory_10'));
    }
    return newlyUnlocked;
  },

  // 检查色彩配对成就
  checkPairMatchAchievements(difficulty: string, moves: number, timedCompleted: boolean = false): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    // 困难模式完成即解锁
    if (difficulty === 'hard' && moves > 0 && !('pair_match_master' in loadState().unlocked)) {
      newlyUnlocked.push(...AchievementManager.unlock('pair_match_master'));
    }
    // 计时模式完成成就
    if (timedCompleted) {
      if (difficulty === 'easy' && !('pair_speed_easy' in loadState().unlocked)) {
        newlyUnlocked.push(...AchievementManager.unlock('pair_speed_easy'));
      }
      if (difficulty === 'hard' && !('pair_speed_hard' in loadState().unlocked)) {
        newlyUnlocked.push(...AchievementManager.unlock('pair_speed_hard'));
      }
    }
    return newlyUnlocked;
  },

  // 检查色彩反应力测试成就
  checkReactionTestAchievements(score: number, totalRounds: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (score >= 6 && !('reaction_sharp' in loadState().unlocked)) {
      newlyUnlocked.push(...AchievementManager.unlock('reaction_sharp'));
    }
    if (score >= totalRounds && !('reaction_perfect' in loadState().unlocked)) {
      newlyUnlocked.push(...AchievementManager.unlock('reaction_perfect'));
    }
    return newlyUnlocked;
  },

  // 检查每日问答成就（传入累计完成次数，可选传入连续天数）
  checkDailyQuizAchievements(totalCompleted: number, consecutiveDays?: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (totalCompleted >= 1 && !('quiz_first' in loadState().unlocked)) {
      newlyUnlocked.push(...AchievementManager.unlock('quiz_first'));
    }
    if (totalCompleted >= 7 && !('quiz_streak_7' in loadState().unlocked)) {
      newlyUnlocked.push(...AchievementManager.unlock('quiz_streak_7'));
    }
    if (totalCompleted >= 30 && !('quiz_streak_30' in loadState().unlocked)) {
      newlyUnlocked.push(...AchievementManager.unlock('quiz_streak_30'));
    }
    // 连续答题成就：30天和100天里程碑，激励长期回访
    if (consecutiveDays !== undefined) {
      if (consecutiveDays >= 30 && !('quiz_consecutive_30' in loadState().unlocked)) {
        newlyUnlocked.push(...AchievementManager.unlock('quiz_consecutive_30'));
      }
      if (consecutiveDays >= 100 && !('quiz_consecutive_100' in loadState().unlocked)) {
        newlyUnlocked.push(...AchievementManager.unlock('quiz_consecutive_100'));
      }
    }
    return newlyUnlocked;
  },

  // 检查知识探索者成就（百科搜索）
  checkKnowledgeExplorerAchievement(): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (!('knowledge_explorer' in loadState().unlocked)) {
      newlyUnlocked.push(...AchievementManager.unlock('knowledge_explorer'));
    }
    return newlyUnlocked;
  },

  // 检查知识传播者成就（分享每日问答）
  checkQuizSharerAchievement(): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (!('quiz_sharer' in loadState().unlocked)) {
      newlyUnlocked.push(...AchievementManager.unlock('quiz_sharer'));
    }
    return newlyUnlocked;
  },

  // 检查百科探索者成就（浏览5种以上颜色详解）
  checkEncyclopediaExplorerAchievement(viewedCount: number): Achievement[] {
    if (viewedCount >= 5 && !('encyclopedia_explorer' in loadState().unlocked)) {
      return AchievementManager.unlock('encyclopedia_explorer');
    }
    return [];
  },

  // 检查答题高手成就（累计正确10题）
  checkQuizExpertAchievement(correctCount: number): Achievement[] {
    if (correctCount >= 10 && !('quiz_expert' in loadState().unlocked)) {
      return AchievementManager.unlock('quiz_expert');
    }
    return [];
  },

  // 检查全能玩家成就（体验所有百科小游戏）
  checkAllEncyclopediaGamesAchievement(playedGames: string[]): Achievement[] {
    // 需要体验的百科小游戏列表
    const requiredGames = ['perception', 'sequence', 'pair', 'reaction', 'mixer'];
    const allPlayed = requiredGames.every(g => playedGames.includes(g));
    if (allPlayed && !('all_encyclopedia_games' in loadState().unlocked)) {
      return AchievementManager.unlock('all_encyclopedia_games');
    }
    return [];
  },
};

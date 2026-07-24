// 成就系统
// 记录玩家成就，增加长期留存和目标感
// 成就定义数据(ACHIEVEMENT_RARITY/ACHIEVEMENT_DEFS)已拆分至 achievementDefs.ts，便于独立维护和扩展

import { ACHIEVEMENT_RARITY, ACHIEVEMENT_DEFS } from './achievementDefs';

/** 获取成就稀有度 */
export function getAchievementRarity(id: string): AchievementRarity {
  return ACHIEVEMENT_RARITY[id] || 'common';
}

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji
  unlocked: boolean;
  unlockedAt?: number; // 解锁时间戳
  rarity?: AchievementRarity; // 稀有度，用于差异化音效和展示
}

// 成就稀有度映射表和成就定义已移至 achievementDefs.ts


import { STORAGE_KEYS } from './storageKeys';

const ACHIEVEMENT_KEY = STORAGE_KEYS.ACHIEVEMENTS;

// 成就状态（含连续不使用提示计数）
interface AchievementState {
  unlocked: Record<string, number>; // id -> 解锁时间戳
  consecutiveNoHint: number; // 连续不使用提示通关数
  dailyStreak: number; // 每日挑战连续天数
  lastDailyDate: string | null; // 上次完成每日挑战的日期
  playDays: number; // 累计游玩天数（不同自然日）
  lastPlayDate: string | null; // 上次游玩日期，用于判断是否为新的一天
}

// 本地日期字符串（与 dailyChallenge.ts 的 getTodayString 保持一致）
// 修复：原代码用 toISOString().slice(0,10) 取 UTC 日期，
// 与每日挑战的本地日期判断不一致，导致连胜计数在跨日时失效
function getLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadState(): AchievementState {
  try {
    const data = localStorage.getItem(ACHIEVEMENT_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // 修复 P1：JSON.parse("null")/数字/字符串均不抛错，但后续 state.unlocked 会抛 TypeError
      // 此处校验返回结构，非对象或缺少 unlocked 字段则回退到默认值
      if (parsed && typeof parsed === 'object' && parsed.unlocked && typeof parsed.unlocked === 'object') {
        return {
          unlocked: parsed.unlocked,
          consecutiveNoHint: typeof parsed.consecutiveNoHint === 'number' ? parsed.consecutiveNoHint : 0,
          dailyStreak: typeof parsed.dailyStreak === 'number' ? parsed.dailyStreak : 0,
          lastDailyDate: typeof parsed.lastDailyDate === 'string' ? parsed.lastDailyDate : null,
          playDays: typeof parsed.playDays === 'number' ? parsed.playDays : 0,
          lastPlayDate: typeof parsed.lastPlayDate === 'string' ? parsed.lastPlayDate : null,
        };
      }
    }
  } catch (e) { /* 忽略 */ }
  return { unlocked: {}, consecutiveNoHint: 0, dailyStreak: 0, lastDailyDate: null, playDays: 0, lastPlayDate: null };
}

function saveState(state: AchievementState) {
  try {
    localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(state));
  } catch (e) { /* 忽略 */ }
}

// 成就管理器
export const AchievementManager = {
  // 获取所有成就（含解锁状态和稀有度）
  getAll(): Achievement[] {
    const state = loadState();
    return ACHIEVEMENT_DEFS.map(def => ({
      ...def,
      unlocked: def.id in state.unlocked,
      unlockedAt: state.unlocked[def.id],
      rarity: getAchievementRarity(def.id),
    }));
  },

  // 解锁成就，返回新解锁的成就列表
  unlock(achievementId: string): Achievement[] {
    const state = loadState();
    if (achievementId in state.unlocked) return [];
    
    state.unlocked[achievementId] = Date.now();
    saveState(state);
    
    const def = ACHIEVEMENT_DEFS.find(d => d.id === achievementId);
    if (def) {
      return [{ ...def, unlocked: true, unlockedAt: state.unlocked[achievementId], rarity: getAchievementRarity(achievementId) }];
    }
    return [];
  },

  // 检查并解锁关卡相关成就
  checkLevelAchievements(level: number, moves: number, usedHint: boolean, theoreticalMin: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    const state = loadState();
    
    // 首次通关
    if (level === 1 && !('first_win' in state.unlocked)) {
      newlyUnlocked.push(...this.unlock('first_win'));
    }
    // 通过第10关
    if (level >= 10 && !('level_10' in state.unlocked)) {
      newlyUnlocked.push(...this.unlock('level_10'));
    }
    // 通过第25关
    if (level >= 25 && !('level_25' in state.unlocked)) {
      newlyUnlocked.push(...this.unlock('level_25'));
    }
    // 通过第50关
    if (level >= 50 && !('level_50' in state.unlocked)) {
      newlyUnlocked.push(...this.unlock('level_50'));
    }
    
    // 连续不使用提示
    const newState = loadState();
    if (usedHint) {
      newState.consecutiveNoHint = 0;
      saveState(newState);
    } else {
      newState.consecutiveNoHint = (state.consecutiveNoHint || 0) + 1;
      saveState(newState);
      if (newState.consecutiveNoHint >= 5 && !('no_hint_5' in state.unlocked)) {
        newlyUnlocked.push(...this.unlock('no_hint_5'));
      }
    }
    
    // 闪电手：10步以内完成
    if (moves <= 10 && !('speed_run' in state.unlocked)) {
      newlyUnlocked.push(...this.unlock('speed_run'));
    }
    
    // 效率专家：达到理论最优步数
    if (theoreticalMin > 0 && moves <= theoreticalMin && !('efficient' in state.unlocked)) {
      newlyUnlocked.push(...this.unlock('efficient'));
    }
    
    return newlyUnlocked;
  },

  // 检查每日挑战成就
  checkDailyAchievements(): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    const state = loadState();
    // 使用本地日期，与 dailyChallenge.hasCompletedDailyToday 保持一致
    const today = getLocalDateString(new Date());

    // 首次每日挑战
    if (!('daily_first' in state.unlocked)) {
      newlyUnlocked.push(...this.unlock('daily_first'));
    }

    // 连续天数计算
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    const newState = loadState();
    if (state.lastDailyDate === yesterdayStr) {
      newState.dailyStreak = (state.dailyStreak || 0) + 1;
    } else if (state.lastDailyDate !== today) {
      newState.dailyStreak = 1;
    }
    newState.lastDailyDate = today;
    saveState(newState);
    
    if (newState.dailyStreak >= 7 && !('daily_streak_7' in state.unlocked)) {
      newlyUnlocked.push(...this.unlock('daily_streak_7'));
    }
    
    return newlyUnlocked;
  },

  // 记录死局后通关
  checkPersistentAchievement(recoveredFromDeadlock: boolean): Achievement[] {
    if (recoveredFromDeadlock && !('persistent' in loadState().unlocked)) {
      return this.unlock('persistent');
    }
    return [];
  },

  // 检查无尽模式成就
  checkEndlessAchievements(score: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (score >= 5 && !('endless_5' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('endless_5'));
    }
    if (score >= 15 && !('endless_15' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('endless_15'));
    }
    if (score >= 30 && !('endless_30' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('endless_30'));
    }
    return newlyUnlocked;
  },

  // 检查连胜成就（在通关后调用，传入当前连胜数）
  checkStreakAchievements(streak: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (streak >= 3 && !('streak_3' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('streak_3'));
    }
    if (streak >= 5 && !('streak_5' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('streak_5'));
    }
    if (streak >= 10 && !('streak_10' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('streak_10'));
    }
    return newlyUnlocked;
  },

  // 检查限时模式成就
  checkTimedAchievements(score: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (score >= 5 && !('timed_5' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('timed_5'));
    }
    if (score >= 10 && !('timed_10' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('timed_10'));
    }
    if (score >= 20 && !('timed_20' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('timed_20'));
    }
    return newlyUnlocked;
  },

  // 检查签到成就
  checkCheckinAchievements(currentStreak: number, totalDays: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (totalDays >= 1 && !('checkin_first' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('checkin_first'));
    }
    if (currentStreak >= 7 && !('checkin_7' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('checkin_7'));
    }
    if (totalDays >= 30 && !('checkin_30' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('checkin_30'));
    }
    if (totalDays >= 100 && !('checkin_100' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('checkin_100'));
    }
    return newlyUnlocked;
  },

  // 检查累计游玩天数里程碑成就 — 每次进入游戏页面时调用
  // 通过比较当天日期与上次游玩日期，判断是否为新的一天
  checkPlayDaysAchievements(): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    const state = loadState();
    const today = getLocalDateString(new Date());
    
    // 如果今天还没记录过游玩，则增加累计天数
    if (state.lastPlayDate !== today) {
      state.playDays = (state.playDays || 0) + 1;
      state.lastPlayDate = today;
      saveState(state);
      
      if (state.playDays >= 7 && !('play_days_7' in state.unlocked)) {
        newlyUnlocked.push(...this.unlock('play_days_7'));
      }
      if (state.playDays >= 30 && !('play_days_30' in state.unlocked)) {
        newlyUnlocked.push(...this.unlock('play_days_30'));
      }
      if (state.playDays >= 100 && !('play_days_100' in state.unlocked)) {
        newlyUnlocked.push(...this.unlock('play_days_100'));
      }
    }
    
    return newlyUnlocked;
  },

  // 检查步数里程碑成就（传入累计总步数）
  checkTotalMovesAchievements(totalMoves: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (totalMoves >= 1000 && !('total_100_moves' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('total_100_moves'));
    }
    if (totalMoves >= 5000 && !('total_5000_moves' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('total_5000_moves'));
    }
    return newlyUnlocked;
  },

  // 检查速度成就（传入本局用时秒数）
  checkSpeedAchievements(playTimeSec: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (playTimeSec > 0 && playTimeSec <= 30 && !('speed_30s' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('speed_30s'));
    }
    if (playTimeSec > 0 && playTimeSec <= 15 && !('speed_15s' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('speed_15s'));
    }
    return newlyUnlocked;
  },

  // 检查满星成就（传入满星关卡总数）
  checkPerfectStarAchievements(perfectCount: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (perfectCount >= 10 && !('perfect_10' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('perfect_10'));
    }
    if (perfectCount >= 30 && !('perfect_30' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('perfect_30'));
    }
    return newlyUnlocked;
  },

  // 检查通关里程碑成就
  checkMilestoneAchievements(level: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (level >= 75 && !('level_75' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('level_75'));
    }
    if (level >= 100 && !('level_100' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('level_100'));
    }
    return newlyUnlocked;
  },

  // 检查周挑战成就
  checkWeeklyAchievements(weeklyStreak: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (!('weekly_first' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('weekly_first'));
    }
    if (weeklyStreak >= 4 && !('weekly_streak_4' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('weekly_streak_4'));
    }
    if (weeklyStreak >= 12 && !('weekly_streak_12' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('weekly_streak_12'));
    }
    return newlyUnlocked;
  },

  // 检查关卡探索者成就（传入已通关卡总数）
  checkExplorerAchievements(completedCount: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (completedCount >= 20 && !('explorer_20' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('explorer_20'));
    }
    if (completedCount >= 50 && !('explorer_50' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('explorer_50'));
    }
    return newlyUnlocked;
  },

  // 检查色彩收藏家成就（传入本关颜色种类数）
  checkColorMasterAchievements(colorCount: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (colorCount >= 5 && !('color_master_5' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('color_master_5'));
    }
    if (colorCount >= 8 && !('color_master_8' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('color_master_8'));
    }
    return newlyUnlocked;
  },

  // 检查全模式体验成就
  checkAllRoundAchievements(modesPlayed: string[]): Achievement[] {
    const allModes = ['normal', 'daily', 'endless', 'timed', 'weekly'];
    const hasAll = allModes.every(m => modesPlayed.includes(m));
    if (hasAll && !('all_round' in loadState().unlocked)) {
      return this.unlock('all_round');
    }
    return [];
  },

  // 检查色彩知识成就
  checkEncyclopediaAchievements(level100Completed: boolean): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (!('encyclopedia_visitor' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('encyclopedia_visitor'));
    }
    if (level100Completed && !('color_master_all' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('color_master_all'));
    }
    return newlyUnlocked;
  },

  // 检查色彩辨识测试成就
  checkColorPerceptionAchievements(score: number): Achievement[] {
    if (score >= 8 && !('color_perception_8' in loadState().unlocked)) {
      return this.unlock('color_perception_8');
    }
    return [];
  },

  // 检查颜色混合器使用成就
  checkColorMixerAchievements(useCount: number): Achievement[] {
    if (useCount >= 10 && !('color_mixer_10' in loadState().unlocked)) {
      return this.unlock('color_mixer_10');
    }
    return [];
  },

  // 检查色彩序列记忆成就
  checkSequenceMemoryAchievements(level: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (level >= 5 && !('sequence_memory_5' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('sequence_memory_5'));
    }
    if (level >= 10 && !('sequence_memory_10' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('sequence_memory_10'));
    }
    return newlyUnlocked;
  },

  // 检查色彩配对成就
  checkPairMatchAchievements(difficulty: string, moves: number, timedCompleted: boolean = false): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    // 困难模式完成即解锁
    if (difficulty === 'hard' && moves > 0 && !('pair_match_master' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('pair_match_master'));
    }
    // 计时模式完成成就
    if (timedCompleted) {
      if (difficulty === 'easy' && !('pair_speed_easy' in loadState().unlocked)) {
        newlyUnlocked.push(...this.unlock('pair_speed_easy'));
      }
      if (difficulty === 'hard' && !('pair_speed_hard' in loadState().unlocked)) {
        newlyUnlocked.push(...this.unlock('pair_speed_hard'));
      }
    }
    return newlyUnlocked;
  },

  // 检查色彩反应力测试成就
  checkReactionTestAchievements(score: number, totalRounds: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (score >= 6 && !('reaction_sharp' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('reaction_sharp'));
    }
    if (score >= totalRounds && !('reaction_perfect' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('reaction_perfect'));
    }
    return newlyUnlocked;
  },

  // 检查统计页面查看成就
  checkStatsViewerAchievements(): Achievement[] {
    if (!('stats_viewer' in loadState().unlocked)) {
      return this.unlock('stats_viewer');
    }
    return [];
  },

  // 检查每日问答成就（传入累计完成次数，可选传入连续天数）
  checkDailyQuizAchievements(totalCompleted: number, consecutiveDays?: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (totalCompleted >= 1 && !('quiz_first' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('quiz_first'));
    }
    if (totalCompleted >= 7 && !('quiz_streak_7' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('quiz_streak_7'));
    }
    if (totalCompleted >= 30 && !('quiz_streak_30' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('quiz_streak_30'));
    }
    // 连续答题成就：30天和100天里程碑，激励长期回访
    if (consecutiveDays !== undefined) {
      if (consecutiveDays >= 30 && !('quiz_consecutive_30' in loadState().unlocked)) {
        newlyUnlocked.push(...this.unlock('quiz_consecutive_30'));
      }
      if (consecutiveDays >= 100 && !('quiz_consecutive_100' in loadState().unlocked)) {
        newlyUnlocked.push(...this.unlock('quiz_consecutive_100'));
      }
    }
    return newlyUnlocked;
  },

  // 检查知识探索者成就（百科搜索）
  checkKnowledgeExplorerAchievement(): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (!('knowledge_explorer' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('knowledge_explorer'));
    }
    return newlyUnlocked;
  },

  // 检查知识传播者成就（分享每日问答）
  checkQuizSharerAchievement(): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (!('quiz_sharer' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('quiz_sharer'));
    }
    return newlyUnlocked;
  },

  // 检查百科探索者成就（浏览5种以上颜色详解）
  checkEncyclopediaExplorerAchievement(viewedCount: number): Achievement[] {
    if (viewedCount >= 5 && !('encyclopedia_explorer' in loadState().unlocked)) {
      return this.unlock('encyclopedia_explorer');
    }
    return [];
  },

  // 检查答题高手成就（累计正确10题）
  checkQuizExpertAchievement(correctCount: number): Achievement[] {
    if (correctCount >= 10 && !('quiz_expert' in loadState().unlocked)) {
      return this.unlock('quiz_expert');
    }
    return [];
  },

  // 检查全能玩家成就（体验所有百科小游戏）
  checkAllEncyclopediaGamesAchievement(playedGames: string[]): Achievement[] {
    // 需要体验的百科小游戏列表
    const requiredGames = ['perception', 'sequence', 'pair', 'reaction', 'mixer'];
    const allPlayed = requiredGames.every(g => playedGames.includes(g));
    if (allPlayed && !('all_encyclopedia_games' in loadState().unlocked)) {
      return this.unlock('all_encyclopedia_games');
    }
    return [];
  },

  // 检查连击里程碑成就（传入当前连击数）
  checkComboAchievements(combo: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (combo >= 5 && !('combo_5' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('combo_5'));
    }
    if (combo >= 10 && !('combo_10' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('combo_10'));
    }
    if (combo >= 20 && !('combo_20' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('combo_20'));
    }
    return newlyUnlocked;
  },

  // 检查累计连击成就（传入累计连击总次数）
  checkTotalComboAchievements(totalCombo: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (totalCombo >= 50 && !('total_combo_50' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('total_combo_50'));
    }
    if (totalCombo >= 100 && !('total_combo_100' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('total_combo_100'));
    }
    if (totalCombo >= 200 && !('total_combo_200' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('total_combo_200'));
    }
    return newlyUnlocked;
  },

  // 检查每日目标成就（传入已完成目标数、总目标数、是否全部完成）
  checkDailyGoalAchievements(completedCount: number, totalGoals: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    if (completedCount >= 1 && !('daily_goal_first' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('daily_goal_first'));
    }
    if (completedCount >= totalGoals && totalGoals > 0 && !('daily_goal_all' in loadState().unlocked)) {
      newlyUnlocked.push(...this.unlock('daily_goal_all'));
    }
    return newlyUnlocked;
  },

  // 重置所有成就
  reset() {
    localStorage.removeItem(ACHIEVEMENT_KEY);
  },
};

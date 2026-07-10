// 成就系统
// 记录玩家成就，增加长期留存和目标感

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji
  unlocked: boolean;
  unlockedAt?: number; // 解锁时间戳
}

// 成就定义
export const ACHIEVEMENT_DEFS = [
  {
    id: 'first_win',
    name: '初出茅庐',
    description: '完成第一关',
    icon: '🎯',
  },
  {
    id: 'level_10',
    name: '小试牛刀',
    description: '通过第 10 关',
    icon: '🏅',
  },
  {
    id: 'level_25',
    name: '渐入佳境',
    description: '通过第 25 关',
    icon: '🥈',
  },
  {
    id: 'level_50',
    name: '色彩大师',
    description: '通过第 50 关',
    icon: '🥇',
  },
  {
    id: 'no_hint_5',
    name: '独立思考',
    description: '连续 5 关不使用提示',
    icon: '🧠',
  },
  {
    id: 'speed_run',
    name: '闪电手',
    description: '10 步以内完成任意关卡',
    icon: '⚡',
  },
  {
    id: 'efficient',
    name: '效率专家',
    description: '用最少步数完成关卡（达到理论最优）',
    icon: '💎',
  },
  {
    id: 'daily_first',
    name: '每日挑战者',
    description: '完成首次每日挑战',
    icon: '📅',
  },
  {
    id: 'daily_streak_7',
    name: '坚持不懈',
    description: '连续 7 天完成每日挑战',
    icon: '🔥',
  },
  {
    id: 'persistent',
    name: '永不言弃',
    description: '在死局后撤销并最终通关',
    icon: '💪',
  },
  {
    id: 'streak_3',
    name: '三连奏',
    description: '连续 3 关不使用提示和撤销通关',
    icon: '🔥',
  },
  {
    id: 'streak_5',
    name: '五连捷',
    description: '连续 5 关不使用提示和撤销通关',
    icon: '🔥',
  },
  {
    id: 'streak_10',
    name: '十连霸',
    description: '连续 10 关不使用提示和撤销通关',
    icon: '👑',
  },
  {
    id: 'endless_5',
    name: '无尽探索者',
    description: '无尽模式连续通过 5 关',
    icon: '🌌',
  },
  {
    id: 'endless_15',
    name: '无尽征服者',
    description: '无尽模式连续通过 15 关',
    icon: '🚀',
  },
  {
    id: 'endless_30',
    name: '无尽传奇',
    description: '无尽模式连续通过 30 关',
    icon: '👑',
  },
  {
    id: 'timed_5',
    name: '速度之星',
    description: '限时模式单局通过 5 关',
    icon: '⏱️',
  },
  {
    id: 'timed_10',
    name: '风驰电掣',
    description: '限时模式单局通过 10 关',
    icon: '🌪️',
  },
  {
    id: 'timed_20',
    name: '超越极限',
    description: '限时模式单局通过 20 关',
    icon: '💥',
  },
  // 签到成就
  {
    id: 'checkin_first',
    name: '初次签到',
    description: '完成首次每日签到',
    icon: '📝',
  },
  {
    id: 'checkin_7',
    name: '坚持签到',
    description: '连续签到 7 天',
    icon: '🗓️',
  },
  {
    id: 'checkin_30',
    name: '签到达人',
    description: '累计签到 30 天',
    icon: '🎖️',
  },
  {
    id: 'checkin_100',
    name: '签到传说',
    description: '累计签到 100 天',
    icon: '👑',
  },
  // 步数与效率成就
  {
    id: 'total_100_moves',
    name: '步数大师',
    description: '累计操作达到 1000 步',
    icon: '👣',
  },
  {
    id: 'total_5000_moves',
    name: '千步行者',
    description: '累计操作达到 5000 步',
    icon: '🚶',
  },
  // 速度成就
  {
    id: 'speed_30s',
    name: '速度狂人',
    description: '30 秒内完成任意关卡',
    icon: '🏃',
  },
  {
    id: 'speed_15s',
    name: '极速通关',
    description: '15 秒内完成任意关卡',
    icon: '⚡',
  },
  // 满星成就
  {
    id: 'perfect_10',
    name: '满星达人',
    description: '获得 10 个三星评价',
    icon: '🌟',
  },
  {
    id: 'perfect_30',
    name: '满星大师',
    description: '获得 30 个三星评价',
    icon: '✨',
  },
  // 通关里程碑
  {
    id: 'level_75',
    name: '色彩专家',
    description: '通过第 75 关',
    icon: '🏆',
  },
  {
    id: 'level_100',
    name: '色彩王者',
    description: '通过第 100 关',
    icon: '👑',
  },
  // 周挑战成就
  {
    id: 'weekly_first',
    name: '周挑战者',
    description: '完成首次周挑战',
    icon: '🏆',
  },
  {
    id: 'weekly_streak_4',
    name: '月度坚持',
    description: '连续 4 周完成周挑战',
    icon: '🏅',
  },
  {
    id: 'weekly_streak_12',
    name: '季度挑战王',
    description: '连续 12 周完成周挑战',
    icon: '👑',
  },
  // 关卡探索者成就
  {
    id: 'explorer_20',
    name: '探索新手',
    description: '通关 20 个不同关卡',
    icon: '🗺️',
  },
  {
    id: 'explorer_50',
    name: '探索达人',
    description: '通关 50 个不同关卡',
    icon: '🧭',
  },
  // 色彩收藏家成就
  {
    id: 'color_master_5',
    name: '色彩收藏家',
    description: '在单关中整理 5 种以上颜色',
    icon: '🌈',
  },
  {
    id: 'color_master_8',
    name: '色彩指挥家',
    description: '在单关中整理 8 种以上颜色',
    icon: '🎨',
  },
  // 全模式体验成就
  {
    id: 'all_round',
    name: '全能玩家',
    description: '体验所有游戏模式（闯关/每日/无尽/限时/周挑战）',
    icon: '🎮',
  },
];

import { STORAGE_KEYS } from './storageKeys';

const ACHIEVEMENT_KEY = STORAGE_KEYS.ACHIEVEMENTS;

// 成就状态（含连续不使用提示计数）
interface AchievementState {
  unlocked: Record<string, number>; // id -> 解锁时间戳
  consecutiveNoHint: number; // 连续不使用提示通关数
  dailyStreak: number; // 每日挑战连续天数
  lastDailyDate: string | null; // 上次完成每日挑战的日期
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
    if (data) return JSON.parse(data);
  } catch (e) { /* 忽略 */ }
  return { unlocked: {}, consecutiveNoHint: 0, dailyStreak: 0, lastDailyDate: null };
}

function saveState(state: AchievementState) {
  try {
    localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(state));
  } catch (e) { /* 忽略 */ }
}

// 成就管理器
export const AchievementManager = {
  // 获取所有成就（含解锁状态）
  getAll(): Achievement[] {
    const state = loadState();
    return ACHIEVEMENT_DEFS.map(def => ({
      ...def,
      unlocked: def.id in state.unlocked,
      unlockedAt: state.unlocked[def.id],
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
      return [{ ...def, unlocked: true, unlockedAt: state.unlocked[achievementId] }];
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

  // 重置所有成就
  reset() {
    localStorage.removeItem(ACHIEVEMENT_KEY);
  },
};

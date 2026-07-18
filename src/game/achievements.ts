// 成就系统
// 记录玩家成就，增加长期留存和目标感

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

// 成就稀有度映射表 — 根据成就解锁难度分为四档
// common: 初期即可解锁的引导型成就
// rare: 需要一定技巧或坚持的中等难度成就
// epic: 需要长期坚持或高超技巧的高难度成就
// legendary: 极少数玩家可达成的终极成就
const ACHIEVEMENT_RARITY: Record<string, AchievementRarity> = {
  // common — 引导型，初期自然解锁
  first_win: 'common',
  daily_first: 'common',
  checkin_first: 'common',
  all_round: 'common',
  stats_viewer: 'common',
  encyclopedia_visitor: 'common',
  quiz_first: 'common',
  daily_goal_first: 'common',
  pair_speed_easy: 'common',
  color_mixer_10: 'common',
  knowledge_explorer: 'common',
  quiz_sharer: 'common',

  // rare — 中等难度，需要技巧或短期坚持
  level_10: 'rare',
  level_25: 'rare',
  no_hint_5: 'rare',
  speed_run: 'rare',
  streak_3: 'rare',
  endless_5: 'rare',
  timed_5: 'rare',
  checkin_7: 'rare',
  play_days_7: 'rare',
  total_100_moves: 'rare',
  speed_30s: 'rare',
  perfect_10: 'rare',
  explorer_20: 'rare',
  color_master_5: 'rare',
  color_perception_8: 'rare',
  sequence_memory_5: 'rare',
  pair_match_master: 'rare',
  reaction_sharp: 'rare',
  pair_speed_hard: 'rare',
  quiz_streak_7: 'rare',
  encyclopedia_explorer: 'rare',
  quiz_expert: 'rare',
  color_master_8: 'rare',
  combo_5: 'rare',
  total_combo_50: 'rare',
  weekly_first: 'rare',
  all_encyclopedia_games: 'rare',

  // epic — 高难度，需要长期坚持或高超技巧
  level_50: 'epic',
  level_75: 'epic',
  efficient: 'epic',
  streak_5: 'epic',
  endless_15: 'epic',
  timed_10: 'epic',
  daily_streak_7: 'epic',
  checkin_30: 'epic',
  play_days_30: 'epic',
  total_5000_moves: 'epic',
  speed_15s: 'epic',
  perfect_30: 'epic',
  explorer_50: 'epic',
  sequence_memory_10: 'epic',
  reaction_perfect: 'epic',
  quiz_streak_30: 'epic',
  combo_10: 'epic',
  total_combo_100: 'epic',
  weekly_streak_4: 'epic',
  daily_goal_all: 'epic',
  persistent: 'epic',
  color_master_all: 'epic',

  // legendary — 终极成就，极少数玩家可达成
  level_100: 'legendary',
  streak_10: 'legendary',
  endless_30: 'legendary',
  timed_20: 'legendary',
  checkin_100: 'legendary',
  play_days_100: 'legendary',
  weekly_streak_12: 'legendary',
  quiz_consecutive_30: 'legendary',
  quiz_consecutive_100: 'legendary',
  combo_20: 'legendary',
  total_combo_200: 'legendary',
  daily_goal_7days: 'legendary',
};

/** 获取成就稀有度 */
export function getAchievementRarity(id: string): AchievementRarity {
  return ACHIEVEMENT_RARITY[id] || 'common';
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
  // 累计游玩天数里程碑成就 — 激励玩家长期回访，增强留存
  {
    id: 'play_days_7',
    name: '一周常客',
    description: '累计游玩 7 天',
    icon: '📅',
  },
  {
    id: 'play_days_30',
    name: '月度忠实玩家',
    description: '累计游玩 30 天',
    icon: '🗓️',
  },
  {
    id: 'play_days_100',
    name: '百日传奇',
    description: '累计游玩 100 天',
    icon: '🏆',
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
  // 色彩知识成就
  {
    id: 'encyclopedia_visitor',
    name: '色彩学家',
    description: '访问色彩百科页面',
    icon: '📚',
  },
  {
    id: 'color_master_all',
    name: '色彩百科全书',
    description: '通关100关并访问色彩百科',
    icon: '📖',
  },
  // 色彩辨识与混合成就
  {
    id: 'color_perception_8',
    name: '色彩辨识者',
    description: '色彩辨识测试得分8分以上',
    icon: '👁️',
  },
  {
    id: 'color_mixer_10',
    name: '混合大师',
    description: '使用颜色混合器10次',
    icon: '🎭',
  },
  // 色彩序列记忆成就
  {
    id: 'sequence_memory_5',
    name: '序列记忆者',
    description: '色彩序列记忆到达第5关',
    icon: '🎵',
  },
  {
    id: 'sequence_memory_10',
    name: '记忆大师',
    description: '色彩序列记忆到达第10关',
    icon: '🧠',
  },
  // 色彩配对成就
  {
    id: 'pair_match_master',
    name: '配对达人',
    description: '困难模式配对完成',
    icon: '🃏',
  },
  // 色彩反应力测试成就
  {
    id: 'reaction_perfect',
    name: '反应大师',
    description: '色彩反应力测试全部正确',
    icon: '⚡',
  },
  {
    id: 'reaction_sharp',
    name: '反应敏捷',
    description: '色彩反应力测试正确6个以上',
    icon: '🎯',
  },
  // 配对计时模式成就
  {
    id: 'pair_speed_easy',
    name: '闪电配对',
    description: '计时模式简单难度完成配对',
    icon: '⏱️',
  },
  {
    id: 'pair_speed_hard',
    name: '极速配对',
    description: '计时模式困难难度完成配对',
    icon: '🚀',
  },
  // 统计成就
  {
    id: 'stats_viewer',
    name: '数据控',
    description: '查看游戏统计页面',
    icon: '📊',
  },
  // 每日问答成就
  {
    id: 'quiz_first',
    name: '色彩学徒',
    description: '完成首次每日色彩问答',
    icon: '📝',
  },
  {
    id: 'quiz_streak_7',
    name: '好学不倦',
    description: '累计完成7次每日色彩问答',
    icon: '📚',
  },
  {
    id: 'quiz_streak_30',
    name: '色彩学者',
    description: '累计完成30次每日色彩问答',
    icon: '🎓',
  },
  {
    id: 'quiz_consecutive_30',
    name: '色彩智者',
    description: '连续30天完成每日色彩问答',
    icon: '🧙',
  },
  {
    id: 'quiz_consecutive_100',
    name: '色彩圣贤',
    description: '连续100天完成每日色彩问答',
    icon: '🌟',
  },
  {
    id: 'knowledge_explorer',
    name: '知识探索者',
    description: '在色彩百科中使用搜索功能',
    icon: '🔍',
  },
  {
    id: 'quiz_sharer',
    name: '知识传播者',
    description: '分享每日色彩问答结果',
    icon: '📤',
  },
  {
    id: 'encyclopedia_explorer',
    name: '百科探索者',
    description: '在色彩百科中浏览5种以上颜色详解',
    icon: '📖',
  },
  {
    id: 'quiz_expert',
    name: '答题高手',
    description: '每日问答累计正确10题',
    icon: '🎓',
  },
  {
    id: 'all_encyclopedia_games',
    name: '全能玩家',
    description: '体验色彩百科中所有小游戏',
    icon: '🏅',
  },
  // 连击里程碑成就 — 激励玩家保持连续通关
  {
    id: 'combo_5',
    name: '连击新手',
    description: '单次连续通关达到 5 连击',
    icon: '⚡',
  },
  {
    id: 'combo_10',
    name: '连击高手',
    description: '单次连续通关达到 10 连击',
    icon: '🔥',
  },
  {
    id: 'combo_20',
    name: '连击传奇',
    description: '单次连续通关达到 20 连击',
    icon: '👑',
  },
  // 累计连击成就 — 长期目标感
  {
    id: 'total_combo_50',
    name: '连击累计者',
    description: '累计连击通关 50 次',
    icon: '💪',
  },
  {
    id: 'total_combo_100',
    name: '连击百次达成',
    description: '累计连击通关 100 次',
    icon: '💯',
  },
  {
    id: 'total_combo_200',
    name: '连击大师',
    description: '累计连击通关 200 次',
    icon: '🏆',
  },
  // 每日目标成就 — 引导玩家参与每日目标系统
  {
    id: 'daily_goal_first',
    name: '目标达成',
    description: '完成首个每日目标',
    icon: '🎯',
  },
  {
    id: 'daily_goal_all',
    name: '全线飘绿',
    description: '单日完成所有每日目标',
    icon: '🌟',
  },
  {
    id: 'daily_goal_7days',
    name: '目标坚持者',
    description: '连续 7 天完成所有每日目标',
    icon: '📅',
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

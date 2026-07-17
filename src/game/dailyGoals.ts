// 每日目标系统
// 为玩家提供每日小目标，增强日活留存和重复游玩动力
// 每日自动重置，完成目标后可领取提示道具奖励
import { STORAGE_KEYS } from './storageKeys';

const DAILY_GOALS_KEY = STORAGE_KEYS.DAILY_GOALS;

/** 每日目标类型 */
export type GoalType = 'complete_levels' | 'earn_stars' | 'daily_challenge' | 'use_hint' | 'no_hint_clear';

/** 每日目标定义 */
export interface DailyGoal {
  type: GoalType;
  description: string;
  icon: string;
  target: number;
  current: number;
  completed: boolean;
  claimed: boolean;
  reward: number; // 奖励提示道具数量
}

/** 每日目标存储结构 */
interface DailyGoalsData {
  date: string;
  goals: DailyGoal[];
}

/** 获取今日日期字符串 (YYYY-MM-DD) */
function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** 默认每日目标模板 */
function getDefaultGoals(): DailyGoal[] {
  return [
    {
      type: 'complete_levels',
      description: '完成 3 关',
      icon: '🎯',
      target: 3,
      current: 0,
      completed: false,
      claimed: false,
      reward: 1,
    },
    {
      type: 'earn_stars',
      description: '获得 6 颗星',
      icon: '⭐',
      target: 6,
      current: 0,
      completed: false,
      claimed: false,
      reward: 1,
    },
    {
      type: 'daily_challenge',
      description: '完成每日挑战',
      icon: '📅',
      target: 1,
      current: 0,
      completed: false,
      claimed: false,
      reward: 2,
    },
    {
      type: 'no_hint_clear',
      description: '不使用提示通关 1 关',
      icon: '🏅',
      target: 1,
      current: 0,
      completed: false,
      claimed: false,
      reward: 1,
    },
  ];
}

/** 读取每日目标数据，自动按日期重置 */
export function getDailyGoals(): DailyGoal[] {
  try {
    const data = localStorage.getItem(DAILY_GOALS_KEY);
    if (data) {
      const parsed: DailyGoalsData = JSON.parse(data);
      const today = getTodayString();
      if (parsed.date === today) {
        return parsed.goals;
      }
    }
  } catch (e) { /* 忽略 */ }
  // 日期不匹配或无数据，初始化今日目标
  const goals = getDefaultGoals();
  saveDailyGoals(goals);
  return goals;
}

/** 保存每日目标数据 */
function saveDailyGoals(goals: DailyGoal[]) {
  try {
    const data: DailyGoalsData = { date: getTodayString(), goals };
    localStorage.setItem(DAILY_GOALS_KEY, JSON.stringify(data));
  } catch (e) { /* 忽略 */ }
}

/** 更新目标进度 */
export function updateGoalProgress(type: GoalType, increment: number = 1) {
  const goals = getDailyGoals();
  let changed = false;
  for (const goal of goals) {
    if (goal.type === type && !goal.completed) {
      goal.current = Math.min(goal.target, goal.current + increment);
      if (goal.current >= goal.target) {
        goal.completed = true;
      }
      changed = true;
    }
  }
  if (changed) {
    saveDailyGoals(goals);
  }
}

/** 领取已完成目标的奖励，返回奖励的提示道具数量 */
export function claimGoalReward(type: GoalType): number {
  const goals = getDailyGoals();
  for (const goal of goals) {
    if (goal.type === type && goal.completed && !goal.claimed) {
      goal.claimed = true;
      saveDailyGoals(goals);
      return goal.reward;
    }
  }
  return 0;
}

/** 获取今日已领取的总奖励数 */
export function getClaimedRewards(): number {
  const goals = getDailyGoals();
  return goals.filter(g => g.claimed).reduce((sum, g) => sum + g.reward, 0);
}

/** 获取今日已完成未领取的目标数 */
export function getUnclaimedCount(): number {
  const goals = getDailyGoals();
  return goals.filter(g => g.completed && !g.claimed).length;
}

/** 获取今日目标完成进度（已完成数/总数） */
export function getDailyGoalsProgress(): { completed: number; total: number; allClaimed: boolean } {
  const goals = getDailyGoals();
  const completed = goals.filter(g => g.completed).length;
  const total = goals.length;
  const allClaimed = goals.every(g => !g.completed || g.claimed);
  return { completed, total, allClaimed };
}

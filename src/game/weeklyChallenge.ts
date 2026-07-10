// 周挑战系统
// 每周一个特别关卡，难度高于每日挑战，增强回访动力
// 基于年份+周数种子生成确定性关卡

import { SeededRandom } from './seededRandom';
import { Tube, Level, ColorLayer, COLOR_KEYS } from './types';
import { isSolvable } from './solver';

const WEEKLY_RECORD_KEY = 'color-sort-weekly-record';
const WEEKLY_STREAK_KEY = 'color-sort-weekly-streak';

// 获取当前年份的第几周
function getWeekNumber(date: Date): { year: number; week: number } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // ISO 周计算
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: d.getFullYear(), week: weekNo };
}

// 获取周挑战种子数字
function getWeeklySeedNum(): number {
  const { year, week } = getWeekNumber(new Date());
  return year * 100 + week;
}

// 获取周挑战种子字符串
function getWeeklySeedString(): string {
  const { year, week } = getWeekNumber(new Date());
  return `weekly-${year}-W${week}`;
}

// 基于种子生成周挑战关卡
// 难度固定为 7 色 + 容量 5，相当于第 31-50 关难度区间
export function generateWeeklyChallenge(): Level {
  const seed = getWeeklySeedNum();
  const rng = new SeededRandom(seed);

  const colorCount = 7;
  const capacity = 5;
  const tubeCount = 10; // 7 色填充 + 3 空管

  // 使用种子随机选择颜色
  const shuffledColors = rng.shuffle(COLOR_KEYS);
  const selectedColors = shuffledColors.slice(0, colorCount);

  // 创建颜色层池
  const colorPool: ColorLayer[] = [];
  for (const color of selectedColors) {
    for (let i = 0; i < capacity; i++) {
      colorPool.push({ color });
    }
  }

  // 使用种子洗牌
  const shuffledPool = rng.shuffle(colorPool);

  // 分配到试管
  const tubes: Tube[] = [];
  let poolIndex = 0;
  for (let i = 0; i < colorCount; i++) {
    const layers: ColorLayer[] = [];
    for (let j = 0; j < capacity; j++) {
      layers.push(shuffledPool[poolIndex++]);
    }
    tubes.push({ id: i, layers, capacity });
  }

  // 添加空试管
  const emptyCount = tubeCount - colorCount;
  for (let i = 0; i < emptyCount; i++) {
    tubes.push({ id: colorCount + i, layers: [], capacity });
  }

  // 使用种子打乱试管顺序
  const finalTubes = rng.shuffle(tubes);
  finalTubes.forEach((t, i) => { t.id = i; });

  // 验证可解性，不可解时微调（交换前两管顶层颜色）
  let solvableTubes = finalTubes;
  if (!isSolvable(solvableTubes)) {
    if (solvableTubes[0].layers.length > 0 && solvableTubes[1].layers.length > 0) {
      const temp = solvableTubes[0].layers[solvableTubes[0].layers.length - 1];
      solvableTubes[0].layers[solvableTubes[0].layers.length - 1] = solvableTubes[1].layers[solvableTubes[1].layers.length - 1];
      solvableTubes[1].layers[solvableTubes[1].layers.length - 1] = temp;
    }
  }

  return {
    id: -4, // 周挑战特殊 ID
    tubes: solvableTubes,
    tubeCapacity: capacity,
    difficulty: '周挑战',
    minSteps: -1, // 周挑战不计算最优步数，避免 BFS 超时
  };
}

// 本周是否已完成
export function hasCompletedWeeklyThisWeek(): boolean {
  try {
    const record = localStorage.getItem(WEEKLY_RECORD_KEY);
    if (!record) return false;
    const data = JSON.parse(record);
    return data.seed === getWeeklySeedString();
  } catch (e) {
    return false;
  }
}

// 保存周挑战成绩
export function saveWeeklyRecord(moves: number, playTimeSec: number, stars: number): void {
  try {
    const seed = getWeeklySeedString();
    const record = { seed, moves, playTimeSec, stars, completedAt: Date.now() };

    // 保存本周成绩
    localStorage.setItem(WEEKLY_RECORD_KEY, JSON.stringify(record));

    // 更新连胜
    const streakData = loadWeeklyStreak();
    const lastWeekSeed = streakData.lastSeed;

    // 检查上周是否完成
    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const lastWeekInfo = getWeekNumber(lastWeekDate);
    const lastWeekSeedStr = `weekly-${lastWeekInfo.year}-W${lastWeekInfo.week}`;

    if (lastWeekSeed === lastWeekSeedStr) {
      streakData.currentStreak = (streakData.currentStreak || 0) + 1;
    } else if (lastWeekSeed !== seed) {
      streakData.currentStreak = 1;
    }
    streakData.lastSeed = seed;
    streakData.bestStreak = Math.max(streakData.bestStreak || 0, streakData.currentStreak);
    streakData.totalCompletions = (streakData.totalCompletions || 0) + 1;

    localStorage.setItem(WEEKLY_STREAK_KEY, JSON.stringify(streakData));
  } catch (e) {
    // 忽略存储错误
  }
}

interface WeeklyStreak {
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  lastSeed: string | null;
}

function loadWeeklyStreak(): WeeklyStreak {
  try {
    const data = localStorage.getItem(WEEKLY_STREAK_KEY);
    if (data) return JSON.parse(data);
  } catch (e) { /* 忽略 */ }
  return { currentStreak: 0, bestStreak: 0, totalCompletions: 0, lastSeed: null };
}

export function getWeeklyStreak(): WeeklyStreak {
  return loadWeeklyStreak();
}

// 获取本周成绩
export function getWeeklyRecord(): { moves: number; playTimeSec: number; stars: number; completedAt: number } | null {
  try {
    const record = localStorage.getItem(WEEKLY_RECORD_KEY);
    if (!record) return null;
    const data = JSON.parse(record);
    if (data.seed !== getWeeklySeedString()) return null;
    return data;
  } catch (e) {
    return null;
  }
}

// 获取周数信息（用于 UI 展示）
export function getWeeklyInfo(): { year: number; week: number; seed: string } {
  const { year, week } = getWeekNumber(new Date());
  return { year, week, seed: getWeeklySeedString() };
}

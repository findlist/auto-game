// 周挑战系统
// 每周一个特别关卡，难度高于每日挑战，增强回访动力
// 基于年份+周数种子生成确定性关卡

import { SeededRandom } from './seededRandom';
import { Tube, Level, ColorLayer, COLOR_KEYS } from './types';
import { isSolvable } from './solver';
import { STORAGE_KEYS } from './storageKeys';

const WEEKLY_RECORD_KEY = STORAGE_KEYS.WEEKLY_RECORD;
const WEEKLY_STREAK_KEY = STORAGE_KEYS.WEEKLY_STREAK;

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

  // 验证可解性，不可解时用不同种子偏移重试
  // 修复：原代码仅交换前两管顶层颜色但不重新验证可解性，交换后仍不可解则返回死关
  // 改为参考 dailyChallenge.ts 的重试机制，不可解时保留初始 finalTubes 作为兜底
  let solvableTubes = finalTubes;
  if (!isSolvable(solvableTubes)) {
    for (let offset = 1; offset <= 5; offset++) {
      const retryRng = new SeededRandom(seed + offset * 7919);
      const retryPool = retryRng.shuffle(colorPool);
      let idx = 0;
      const retryTubes: Tube[] = [];
      for (let i = 0; i < colorCount; i++) {
        const layers: ColorLayer[] = [];
        for (let j = 0; j < capacity; j++) {
          layers.push(retryPool[idx++]);
        }
        retryTubes.push({ id: i, layers, capacity });
      }
      const emptyCount = tubeCount - colorCount;
      for (let i = 0; i < emptyCount; i++) {
        retryTubes.push({ id: colorCount + i, layers: [], capacity });
      }
      const shuffledRetry = retryRng.shuffle(retryTubes);
      shuffledRetry.forEach((t, i) => { t.id = i; });
      if (isSolvable(shuffledRetry)) {
        solvableTubes = shuffledRetry;
        break;
      }
      // 不覆盖 solvableTubes，保留初始 finalTubes 作为兜底
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
    // 仅在本周首次完成时累加，避免重复调用导致 totalCompletions 虚高
    if (lastWeekSeed !== seed) {
      streakData.totalCompletions = (streakData.totalCompletions || 0) + 1;
    }

    localStorage.setItem(WEEKLY_STREAK_KEY, JSON.stringify(streakData));

    // 保存到历史记录
    const { year, week } = getWeekNumber(new Date());
    saveWeeklyHistory({
      year, week, seed, moves, playTimeSec, stars, completedAt: Date.now(),
    });
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
    if (data) {
      const parsed = JSON.parse(data);
      // 修复 P1：JSON.parse("null") 返回 null，调用方访问属性会抛 TypeError
      if (parsed && typeof parsed === 'object') return parsed;
    }
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

const WEEKLY_HISTORY_KEY = STORAGE_KEYS.WEEKLY_HISTORY;

export interface WeeklyHistoryEntry {
  year: number;
  week: number;
  seed: string;
  moves: number;
  playTimeSec: number;
  stars: number;
  completedAt: number;
}

// 保存周挑战成绩到历史（在 saveWeeklyRecord 中调用）
function saveWeeklyHistory(entry: WeeklyHistoryEntry): void {
  try {
    const data = localStorage.getItem(WEEKLY_HISTORY_KEY);
    const parsed = data ? JSON.parse(data) : [];
    // 修复 P1：JSON.parse 可能返回非数组（null/对象等），findIndex/push 会抛 TypeError
    const history: WeeklyHistoryEntry[] = Array.isArray(parsed) ? parsed : [];
    // 避免重复记录同一周
    const existingIdx = history.findIndex(h => h.seed === entry.seed);
    if (existingIdx >= 0) {
      history[existingIdx] = entry;
    } else {
      history.push(entry);
    }
    // 保留最近 52 周记录
    if (history.length > 52) history.shift();
    localStorage.setItem(WEEKLY_HISTORY_KEY, JSON.stringify(history));
  } catch (e) { /* 忽略 */ }
}

// 获取周挑战历史记录
export function getWeeklyHistory(): WeeklyHistoryEntry[] {
  try {
    const data = localStorage.getItem(WEEKLY_HISTORY_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // 修复 P1：校验返回数组，非数组则回退到空数组，避免调用方崩溃
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) { /* 忽略 */ }
  return [];
}

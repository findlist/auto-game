// 每日挑战关卡生成器
// 基于日期种子生成可复现的关卡，每天一关

import { Tube, Level, ColorLayer, COLOR_KEYS } from './types';
import { SeededRandom, getDailySeed } from './seededRandom';
import { isSolvable, getMinSteps } from './solver';

// 每日挑战难度配置（随天数变化难度）
function getDailyConfig(seed: number) {
  const rng = new SeededRandom(seed);
  // 随机选择难度档位
  const tier = rng.nextInt(2, 5); // 跳过最简单的，从普通开始
  
  const configs = [
    { tubes: 4, colors: 2, capacity: 4, difficulty: '入门' },
    { tubes: 5, colors: 3, capacity: 4, difficulty: '简单' },
    { tubes: 6, colors: 4, capacity: 4, difficulty: '普通' },
    { tubes: 7, colors: 5, capacity: 4, difficulty: '中等' },
    { tubes: 8, colors: 6, capacity: 4, difficulty: '困难' },
    { tubes: 9, colors: 7, capacity: 5, difficulty: '挑战' },
  ];
  
  return configs[Math.min(tier, configs.length - 1)];
}

/**
 * 生成每日挑战关卡
 * 同一天生成的关卡完全相同（基于日期种子）
 */
export function generateDailyChallenge(): Level {
  const seed = getDailySeed();
  const rng = new SeededRandom(seed);
  const config = getDailyConfig(seed);
  const { tubes: tubeCount, colors: colorCount, capacity } = config;

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

  // 种子洗牌
  const shuffledPool = rng.shuffle(colorPool);

  // 分配到试管
  const tubes: Tube[] = [];
  let poolIndex = 0;
  const filledTubeCount = colorCount;

  for (let i = 0; i < filledTubeCount; i++) {
    const layers: ColorLayer[] = [];
    for (let j = 0; j < capacity; j++) {
      layers.push(shuffledPool[poolIndex++]);
    }
    tubes.push({ id: i, layers, capacity });
  }

  // 添加空试管
  const emptyTubeCount = tubeCount - filledTubeCount;
  for (let i = 0; i < emptyTubeCount; i++) {
    tubes.push({ id: filledTubeCount + i, layers: [], capacity });
  }

  // 种子打乱试管顺序
  const finalTubes = rng.shuffle(tubes);
  finalTubes.forEach((t, i) => { t.id = i; });

  // 验证可解性（每日挑战不重试，如果无解则调整）
  // 修复：不可解时保留初始 finalTubes，不用可能不可解的最后一次覆盖
  let resultTubes = finalTubes;
  if (!isSolvable(resultTubes)) {
    // 用不同偏移的种子重试
    for (let offset = 1; offset <= 5; offset++) {
      const retryRng = new SeededRandom(seed + offset * 7919);
      const retryPool = retryRng.shuffle(colorPool);
      let idx = 0;
      const retryTubes: Tube[] = [];
      for (let i = 0; i < filledTubeCount; i++) {
        const layers: ColorLayer[] = [];
        for (let j = 0; j < capacity; j++) {
          layers.push(retryPool[idx++]);
        }
        retryTubes.push({ id: i, layers, capacity });
      }
      for (let i = 0; i < emptyTubeCount; i++) {
        retryTubes.push({ id: filledTubeCount + i, layers: [], capacity });
      }
      const shuffledRetry = retryRng.shuffle(retryTubes);
      shuffledRetry.forEach((t, i) => { t.id = i; });
      if (isSolvable(shuffledRetry)) {
        resultTubes = shuffledRetry;
        break;
      }
    }
  }

  // 计算今日是第几天（从项目开始日算）
  const today = new Date();
  const startDate = new Date(2026, 6, 2); // 2026-07-02 项目开始日
  const dayNumber = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // 计算理论最少步数
  let minSteps = -1;
  if (colorCount <= 5) {
    try {
      minSteps = getMinSteps(resultTubes, 6000);
    } catch (e) {
      minSteps = -1;
    }
  }

  return {
    id: -1, // -1 表示每日挑战
    tubes: resultTubes,
    tubeCapacity: capacity,
    difficulty: `每日挑战 #${dayNumber}`,
    minSteps,
  };
}

// 每日挑战的本地存储键
const DAILY_KEY = 'color-sort-daily';

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  completed: boolean;
  moves: number;
}

export function getDailyRecord(): DailyRecord | null {
  try {
    const data = localStorage.getItem(DAILY_KEY);
    if (data) return JSON.parse(data);
  } catch (e) { /* 忽略 */ }
  return null;
}

export function saveDailyRecord(record: DailyRecord) {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(record));
  } catch (e) { /* 忽略 */ }
}

export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function hasCompletedDailyToday(): boolean {
  const record = getDailyRecord();
  if (!record) return false;
  return record.date === getTodayString() && record.completed;
}

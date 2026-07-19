// 周挑战系统 — 关卡生成模块
// 每周一个特别关卡，难度高于每日挑战，增强回访动力
// 基于年份+周数种子生成确定性关卡
// 数据存取函数已拆分到 weeklyChallengeData.ts，避免动态导入警告

import { SeededRandom } from './seededRandom';
import { Tube, Level, ColorLayer, COLOR_KEYS } from './types';
import { isSolvable } from './solver';
import { getWeeklySeedNum } from './weeklyChallengeData';

// 重导出数据模块的函数，保持向后兼容
export {
  hasCompletedWeeklyThisWeek,
  saveWeeklyRecord,
  getWeeklyRecord,
  getWeeklyInfo,
  getWeeklyStreak,
  getWeeklyHistory,
  getWeeklySeedString,
  getWeeklySeedNum,
} from './weeklyChallengeData';
export type { WeeklyHistoryEntry } from './weeklyChallengeData';

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

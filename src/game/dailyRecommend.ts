// 每日推荐关卡
// 基于日期种子从已通关关卡中挑选推荐重玩关卡，增强回访动力
// 与每日挑战不同：每日挑战是种子生成的独立关卡，每日推荐是从已有100关中挑选

import { getDailySeed } from './seededRandom';
import { SeededRandom } from './seededRandom';

export interface DailyRecommend {
  level: number;
  reason: string;
  icon: string;
}

/**
 * 获取今日推荐关卡
 * 规则：
 * 1. 基于日期种子随机选取关卡范围
 * 2. 优先推荐玩家已通关但未满星的关卡（鼓励刷星）
 * 3. 若已通关关卡不足，推荐当前进度附近的关卡
 * 4. 每天固定推荐同一关，次日切换
 */
export function getDailyRecommend(
  completedLevels: number[],
  starsRecord: Record<number, number>,
  currentLevel: number
): DailyRecommend | null {
  const seed = getDailySeed();
  const rng = new SeededRandom(seed);

  // 候选1：已通关但未满3星的关卡
  const notPerfectLevels = completedLevels.filter(lvl => {
    const stars = starsRecord[lvl] || 0;
    return stars < 3;
  });

  // 候选2：已通关的关卡（满星也算）
  const completedPool = completedLevels.length > 0 ? completedLevels : [];

  // 候选3：当前进度附近的关卡（±5关范围）
  const nearbyLevels: number[] = [];
  for (let i = Math.max(1, currentLevel - 5); i <= Math.min(100, currentLevel + 5); i++) {
    nearbyLevels.push(i);
  }

  let level: number;
  let reason: string;
  let icon: string;

  if (notPerfectLevels.length > 0) {
    // 优先推荐未满星关卡
    const idx = rng.nextInt(0, notPerfectLevels.length - 1);
    level = notPerfectLevels[idx];
    const stars = starsRecord[level] || 0;
    reason = `当前${stars}星，挑战满分`;
    icon = '⭐';
  } else if (completedPool.length > 0) {
    // 推荐已通关关卡重玩
    const idx = rng.nextInt(0, completedPool.length - 1);
    level = completedPool[idx];
    reason = '重温经典关卡';
    icon = '🔄';
  } else if (nearbyLevels.length > 0) {
    // 推荐附近关卡
    const idx = rng.nextInt(0, nearbyLevels.length - 1);
    level = nearbyLevels[idx];
    reason = '今日推荐尝试';
    icon = '🎯';
  } else {
    return null;
  }

  return { level, reason, icon };
}

// 关卡难度自适应系统
// 根据玩家近期表现，智能推荐关卡和调整难度提示

import { StatsTracker } from './statsTracker';

export interface AdaptiveRecommendation {
  level: number;
  reason: string;
  icon: string;
  difficulty: 'easy' | 'normal' | 'challenge';
}

/**
 * 分析玩家表现，生成自适应推荐
 */
export function getAdaptiveRecommendation(
  completedLevels: number[],
  levelStars: Record<number, number>,
  _currentLevel: number
): AdaptiveRecommendation | null {
  const stats = StatsTracker.get();
  const recentRecords = stats.recentRecords.slice(-10); // 最近10条记录

  // 分析玩家水平
  const avgStars = stats.totalWins > 0 ? stats.totalStars / stats.totalWins : 0;
  const perfectRate = stats.totalWins > 0 ? stats.perfectLevels / stats.totalWins : 0;
  const avgPlayTime = recentRecords.length > 0
    ? recentRecords.reduce((sum, r) => sum + r.playTimeSec, 0) / recentRecords.length
    : 0;

  // 找到未通关的最低关卡
  let lowestIncomplete = -1;
  for (let i = 1; i <= 100; i++) {
    if (!completedLevels.includes(i)) {
      lowestIncomplete = i;
      break;
    }
  }
  if (lowestIncomplete === -1) return null;

  // 找到低星关卡（1-2星），优先推荐提升
  const lowStarLevels = Object.entries(levelStars)
    .filter(([, s]) => s > 0 && s < 3)
    .map(([l]) => parseInt(l, 10))
    .sort((a, b) => a - b);

  // 1. 如果玩家连续低星通关（平均星 < 1.5），推荐回去刷低星关卡
  if (avgStars < 1.5 && lowStarLevels.length > 0 && stats.totalWins >= 5) {
    return {
      level: lowStarLevels[0],
      reason: '回顾低星关卡，提升星级',
      icon: '⭐',
      difficulty: 'easy',
    };
  }

  // 2. 如果玩家表现优秀（平均星 > 2.5，完美率 > 50%），推荐挑战更高难度
  if (avgStars > 2.5 && perfectRate > 0.5 && stats.totalWins >= 10) {
    return {
      level: lowestIncomplete,
      reason: '表现出色，继续挑战新关卡',
      icon: '🚀',
      difficulty: 'challenge',
    };
  }

  // 3. 如果最近用时偏长（平均 > 120秒），提示练习
  if (avgPlayTime > 120 && lowStarLevels.length > 0) {
    return {
      level: lowStarLevels[0],
      reason: '多练几关提升速度',
      icon: '🏃',
      difficulty: 'normal',
    };
  }

  // 4. 如果连胜中（≥3），保持势头
  if (stats.currentStreak >= 3) {
    return {
      level: lowestIncomplete,
      reason: `连胜 ${stats.currentStreak} 关，保持势头`,
      icon: '🔥',
      difficulty: 'normal',
    };
  }

  // 5. 默认推荐下一关
  return {
    level: lowestIncomplete,
    reason: '下一关挑战',
    icon: '▶️',
    difficulty: 'normal',
  };
}

/**
 * 获取难度提示文案
 */
export function getDifficultyHint(level: number): string {
  if (level <= 6) return '入门关卡，轻松上手';
  if (level <= 20) return '基础关卡，巩固技巧';
  if (level <= 50) return '进阶关卡，挑战自我';
  if (level <= 90) return '高难度关卡，需要策略';
  return '大师关卡，极限挑战';
}

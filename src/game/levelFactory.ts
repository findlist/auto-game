import { Level } from './types';
import { getAdaptiveDifficultyModifier } from './adaptiveDifficulty';

/**
 * 应用自适应难度修正到关卡数据
 * 仅对普通关卡（level > 0）生效：根据玩家历史表现调整空试管数量
 * - 增加空试管降低难度（连续失败时）
 * - 减少空试管增加难度（连续高星通关时），但至少保留1个空试管
 */
export function applyAdaptiveDifficulty(levelData: Level, level: number): Level {
  if (level <= 0) return levelData;

  const modifier = getAdaptiveDifficultyModifier(level);
  if (modifier.extraEmptyTubes === 0) return levelData;

  const adjustedTubes = [...levelData.tubes];

  if (modifier.extraEmptyTubes > 0) {
    // 增加空试管（降低难度）
    for (let i = 0; i < modifier.extraEmptyTubes; i++) {
      adjustedTubes.push({
        id: adjustedTubes.length,
        layers: [],
        capacity: levelData.tubeCapacity,
      });
    }
  } else if (modifier.extraEmptyTubes < 0) {
    // 减少空试管（增加难度），但至少保留1个空试管
    const emptyIndices = adjustedTubes
      .map((t, i) => ({ idx: i, empty: t.layers.length === 0 }))
      .filter(x => x.empty);
    const removeCount = Math.min(-modifier.extraEmptyTubes, emptyIndices.length - 1);
    for (let i = 0; i < removeCount; i++) {
      const lastEmpty = adjustedTubes
        .map((t, idx) => ({ idx, empty: t.layers.length === 0 }))
        .filter(x => x.empty)
        .pop();
      if (lastEmpty) {
        adjustedTubes.splice(lastEmpty.idx, 1);
      }
    }
  }

  // 重新编号试管 ID
  adjustedTubes.forEach((t, i) => { t.id = i; });

  return { ...levelData, tubes: adjustedTubes };
}

/**
 * 根据关卡编号和模式生成关卡数据
 * 统一关卡生成入口：普通关卡、每日挑战、无尽模式、限时模式、周挑战
 */
export function generateLevelForMode(
  level: number,
  endlessScore: number,
  timedScore: number,
): Level {
  const newLevel = level === -1
    ? generateDailyChallenge()
    : level === -2
    ? generateEndlessLevel(endlessScore)
    : level === -3
    ? generateTimedLevel(timedScore)
    : level === -4
    ? generateWeeklyChallenge()
    : generateLevel(level);

  return applyAdaptiveDifficulty(newLevel, level);
}

// 延迟导入避免循环依赖
import { generateLevel, generateEndlessLevel, generateTimedLevel } from './levelGenerator';
import { generateDailyChallenge } from './dailyChallenge';
import { generateWeeklyChallenge } from './weeklyChallenge';

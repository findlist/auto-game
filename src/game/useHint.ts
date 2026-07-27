// 提示功能 hook —— 从 App.tsx 提取
// 管理：提示道具检查、消耗、查找可操作试管并高亮
// 依赖：currentTubesRef（GameBoard 共享 ref）、consumeHint（useDailyCheckin 提供）
import { useCallback, useState, RefObject } from 'react';
import { Tube } from './types';
import { canPour } from './levelGenerator';
import { getHintItems } from './hintItems';
import { StatsTracker } from './statsTracker';
import { SoundEngineLazy as SoundEngine } from './soundEngineLazy';

export function useHint(
  currentTubesRef: RefObject<Tube[] | null>,
  consumeHint: () => boolean,
  setUsedHintThisLevel: (v: boolean) => void
) {
  const [hintPair, setHintPair] = useState<[number, number] | null>(null);

  const handleHint = useCallback(() => {
    // 提示道具不足，播放错误音效并返回
    const currentItems = getHintItems();
    if (currentItems <= 0) {
      SoundEngine.error();
      return;
    }
    // 消耗提示道具（内部已处理音效恢复）
    const success = consumeHint();
    if (!success) {
      SoundEngine.error();
      return;
    }
    setUsedHintThisLevel(true);
    StatsTracker.recordHint();

    const tubes = currentTubesRef.current;
    if (!tubes) return;

    // 优先找同色合并的管子（收益最大）
    for (let i = 0; i < tubes.length; i++) {
      if (tubes[i].layers.length === 0) continue;
      const fromTop = tubes[i].layers[tubes[i].layers.length - 1].color;
      for (let j = 0; j < tubes.length; j++) {
        if (i === j) continue;
        if (tubes[j].layers.length >= tubes[j].capacity) continue;
        if (tubes[j].layers.length > 0) {
          const toTop = tubes[j].layers[tubes[j].layers.length - 1].color;
          if (fromTop === toTop && canPour(tubes[i], tubes[j])) {
            setHintPair([i, j]);
            return;
          }
        }
      }
    }
    // 再找可以倒入空管的 pair（兜底策略）
    for (let i = 0; i < tubes.length; i++) {
      if (tubes[i].layers.length === 0) continue;
      for (let j = 0; j < tubes.length; j++) {
        if (i === j) continue;
        if (tubes[j].layers.length === 0 && canPour(tubes[i], tubes[j])) {
          setHintPair([i, j]);
          return;
        }
      }
    }
  }, [currentTubesRef, consumeHint, setUsedHintThisLevel]);

  const clearHint = useCallback(() => setHintPair(null), []);

  return { hintPair, setHintPair, clearHint, handleHint };
}

// 自动存档管理 hook — 从 App.tsx 提取
// 管理游戏自动存档的保存与清除
// 设计原因：将存档逻辑与游戏状态解耦，便于独立测试和维护

import { useCallback } from 'react';
import { saveAutosave, clearAutosave, AutosaveData } from './homeStorage';

/**
 * 自动存档 hook
 * 在游戏过程中自动保存当前状态，方便中断后恢复
 */
export function useAutosave() {
  // 保存当前游戏状态到 localStorage
  // 仅在有步数且未通关时保存，否则清除存档
  const autoSaveGame = useCallback((level: number, mode: string, moves: number, isWon: boolean, extra?: Record<string, number>) => {
    if (moves > 0 && !isWon) {
      saveAutosave({ level, mode, moves, isWon: false, ...extra } as AutosaveData);
    } else {
      clearAutosave();
    }
  }, []);

  return { autoSaveGame };
}

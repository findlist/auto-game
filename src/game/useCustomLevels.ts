import { useState, useCallback } from 'react';
import { CustomLevel } from './levelEditor';
import { STORAGE_KEYS } from './storageKeys';
import { SoundEngine } from './soundEngine';

// levelEditor 模块改为动态导入，降低首屏 bundle 体积（仅在用户操作自定关卡时加载）
const levelEditorModule = () => import('./levelEditor');

/**
 * 自定关卡管理 hook
 * 从 App.tsx 提取：自定关卡的增删改查、导入、播放状态管理
 * 懒初始化 localStorage 读取，避免首屏加载 levelEditor 模块
 */
export function useCustomLevels() {
  // 自定关卡列表：懒初始化，避免首屏加载 levelEditor 模块
  const [customLevels, setCustomLevels] = useState<CustomLevel[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_LEVELS);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  // 当前播放的自定关卡
  const [playingCustomLevel, setPlayingCustomLevel] = useState<CustomLevel | null>(null);

  // 播放自定关卡：设置当前播放关卡并跳转页面
  const handlePlayCustomLevel = useCallback((level: CustomLevel) => {
    setPlayingCustomLevel(level);
    SoundEngine.resume();
  }, []);

  // 删除自定关卡
  const handleDeleteCustomLevel = useCallback(async (id: string) => {
    const { deleteCustomLevel, getCustomLevels } = await levelEditorModule();
    deleteCustomLevel(id);
    setCustomLevels(getCustomLevels());
  }, []);

  // 保存自定关卡
  const handleSaveCustomLevel = useCallback(async (level: CustomLevel) => {
    const { saveCustomLevel, getCustomLevels } = await levelEditorModule();
    saveCustomLevel(level);
    setCustomLevels(getCustomLevels());
  }, []);

  // 导入关卡码：成功返回 true，失败返回 false
  const handleImportLevel = useCallback(async (code: string): Promise<boolean> => {
    const { importLevelCode, saveCustomLevel, getCustomLevels } = await levelEditorModule();
    const level = importLevelCode(code);
    if (level) {
      saveCustomLevel(level);
      setCustomLevels(getCustomLevels());
      return true;
    }
    return false;
  }, []);

  // 通关后更新自定关卡状态（最佳步数、通关标记）
  const handleCustomLevelWin = useCallback(async (level: CustomLevel, moves: number): Promise<CustomLevel> => {
    const { saveCustomLevel, getCustomLevels } = await levelEditorModule();
    const updated: CustomLevel = {
      ...level,
      completed: true,
      bestMoves: level.bestMoves ? Math.min(level.bestMoves, moves) : moves,
    };
    saveCustomLevel(updated);
    setCustomLevels(getCustomLevels());
    setPlayingCustomLevel(updated);
    return updated;
  }, []);

  return {
    customLevels,
    playingCustomLevel,
    setPlayingCustomLevel,
    handlePlayCustomLevel,
    handleDeleteCustomLevel,
    handleSaveCustomLevel,
    handleImportLevel,
    handleCustomLevelWin,
  };
}

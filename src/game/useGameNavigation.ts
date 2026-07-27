// 游戏导航管理 hook — 从 App.tsx 提取
// 统一管理返回首页、确认返回、下一关、上一关等导航逻辑
// 设计原因：App.tsx 中导航函数分散且互相依赖，集中管理可降低耦合度、提升可维护性

import { useCallback } from 'react';
// import { SoundEngineLazy as SoundEngine } from './soundEngineLazy';
// SoundEngine 未在此 hook 中使用，导航操作不涉及音效
import { StatsTracker } from './statsTracker';
import { clearAutosave } from './homeStorage';

interface UseGameNavigationParams {
  // 模式状态
  isDailyMode: boolean;
  isEndlessMode: boolean;
  isTimedMode: boolean;
  isWeeklyMode: boolean;
  // 状态设置器
  setPage: (page: 'home' | 'game' | 'about' | 'privacy' | 'achievements' | 'settings' | 'stats' | 'editor' | 'editor-play' | 'encyclopedia') => void;
  setHintPair: (v: [number, number] | null) => void;
  setUsedHintThisLevel: (v: boolean) => void;
  setRecoveredFromDeadlock: (v: boolean) => void;
  setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
  setEndlessScore: React.Dispatch<React.SetStateAction<number>>;
  setTimedScore: React.Dispatch<React.SetStateAction<number>>;
  // 模式重置
  resetAllModes: () => void;
  // 连击重置（非通关返回时调用）
  resetCombo: () => void;
  // 当前步数（用于判断是否有进度可能丢失）
  currentMoves: number;
}

/**
 * 游戏导航 hook
 * 管理所有页面跳转和关卡导航逻辑
 */
export function useGameNavigation(params: UseGameNavigationParams) {
  const {
    isDailyMode, isEndlessMode, isTimedMode, isWeeklyMode,
    setPage, setHintPair, setUsedHintThisLevel, setRecoveredFromDeadlock,
    setCurrentLevel, setEndlessScore, setTimedScore,
    resetAllModes, resetCombo, currentMoves,
  } = params;

  // 返回首页：重置所有模式状态，清除自动存档
  const handleGoHome = useCallback(() => {
    setPage('home');
    setHintPair(null);
    resetAllModes();
    setUsedHintThisLevel(false);
    setRecoveredFromDeadlock(false);
    clearAutosave();
    // 非通关返回首页时重置连击（不算连续通关）
    if (currentMoves > 0 && !isDailyMode && !isEndlessMode && !isTimedMode && !isWeeklyMode) {
      resetCombo();
    }
  }, [setPage, setHintPair, resetAllModes, setUsedHintThisLevel, setRecoveredFromDeadlock, currentMoves, isDailyMode, isEndlessMode, isTimedMode, isWeeklyMode, resetCombo]);

  // 确认返回首页：防止误退出，有进度时弹窗确认
  const handleGoHomeWithConfirm = useCallback(() => {
    if (currentMoves > 0 && !isDailyMode && !isEndlessMode && !isTimedMode && !isWeeklyMode) {
      if (!confirm('当前关卡进度将丢失,确认返回首页?')) return;
      StatsTracker.breakStreak();
    }
    handleGoHome();
  }, [currentMoves, isDailyMode, isEndlessMode, isTimedMode, isWeeklyMode, handleGoHome]);

  // 下一关（普通模式）：关卡+1，重置提示和死锁状态
  const handleNextLevel = useCallback(() => {
    setCurrentLevel(l => l + 1);
    setHintPair(null);
    setUsedHintThisLevel(false);
    setRecoveredFromDeadlock(false);
  }, [setCurrentLevel, setHintPair, setUsedHintThisLevel, setRecoveredFromDeadlock]);

  // 上一关（仅普通模式可回退）
  const handlePrevLevel = useCallback(() => {
    if (isDailyMode || isEndlessMode || isTimedMode || isWeeklyMode) return;
    setCurrentLevel(l => Math.max(1, l - 1));
    setHintPair(null);
    setUsedHintThisLevel(false);
    setRecoveredFromDeadlock(false);
  }, [isDailyMode, isEndlessMode, isTimedMode, isWeeklyMode, setCurrentLevel, setHintPair, setUsedHintThisLevel, setRecoveredFromDeadlock]);

  // 下一关动作：根据当前模式决定行为
  // 每日/周挑战 → 返回首页；无尽/限时 → 累加分数继续；普通 → 下一关
  const handleNextLevelAction = useCallback(() => {
    if (isDailyMode || isWeeklyMode) {
      // 每日挑战和周挑战为单局模式,通关后返回首页
      handleGoHome();
    } else if (isEndlessMode) {
      // 无尽模式：分数+1触发下一关生成，难度递增
      setEndlessScore(s => s + 1);
      setHintPair(null);
      setUsedHintThisLevel(false);
      setRecoveredFromDeadlock(false);
    } else if (isTimedMode) {
      // 限时模式：分数+1触发下一关生成
      setTimedScore(s => s + 1);
      setHintPair(null);
      setUsedHintThisLevel(false);
      setRecoveredFromDeadlock(false);
    } else {
      handleNextLevel();
    }
  }, [isDailyMode, isWeeklyMode, isEndlessMode, isTimedMode, handleGoHome, setEndlessScore, setTimedScore, setHintPair, setUsedHintThisLevel, setRecoveredFromDeadlock, handleNextLevel]);

  return {
    handleGoHome,
    handleGoHomeWithConfirm,
    handleNextLevel,
    handlePrevLevel,
    handleNextLevelAction,
  };
}

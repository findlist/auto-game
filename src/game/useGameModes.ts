// 游戏模式管理 hook — 从 App.tsx 提取
// 统一管理普通/每日/无尽/限时/周挑战五种模式的状态与切换逻辑
// 设计原因：App.tsx 中模式相关状态分散在多处，集中管理可降低复杂度、提升可维护性

import { useState, useCallback } from 'react';
import { SoundEngine } from './soundEngine';
import { saveEndlessScore, getEndlessHighScore } from './levelGenerator';
import { saveTimedHighScore, loadTimedHighScore } from './homeStorage';
import { recordPlayedMode } from './playedModes';
import { hasCompletedDailyToday } from './dailyChallenge';
import { getWeeklyInfo, getWeeklyRecord, getWeeklyStreak, saveWeeklyRecord } from './weeklyChallengeData';

export type GameMode = 'normal' | 'daily' | 'endless' | 'timed' | 'weekly';

export interface GameModesState {
  isDailyMode: boolean;
  isEndlessMode: boolean;
  isTimedMode: boolean;
  isWeeklyMode: boolean;
  endlessScore: number;
  endlessHighScore: number;
  timedScore: number;
  timedHighScore: number;
  dailyCompletedToday: boolean;
  weeklyCompleted: boolean;
  weeklyDisplay: { week: number; recordMoves?: number; recordStars?: number; streak: number } | null;
}

export interface GameModesActions {
  setDailyMode: (v: boolean) => void;
  setEndlessMode: (v: boolean) => void;
  setTimedMode: (v: boolean) => void;
  setWeeklyMode: (v: boolean) => void;
  setEndlessScore: React.Dispatch<React.SetStateAction<number>>;
  setTimedScore: React.Dispatch<React.SetStateAction<number>>;
  setTimedHighScore: (v: number) => void;
  setEndlessHighScore: (v: number) => void;
  setDailyCompletedToday: (v: boolean) => void;
  setWeeklyCompleted: (v: boolean) => void;
  setWeeklyDisplay: React.Dispatch<React.SetStateAction<{ week: number; recordMoves?: number; recordStars?: number; streak: number } | null>>;
}

/**
 * 游戏模式管理 hook
 * 集中管理五种游戏模式的启动、切换、分数记录
 * currentLevel 由外部管理（与进度关联），通过 setCurrentLevel 回调传入
 */
export function useGameModes(
  _initialLevel: number,
  onCheckPlayDays?: () => void,
) {
  // 模式状态
  const [isDailyMode, setIsDailyMode] = useState(false);
  const [isEndlessMode, setIsEndlessMode] = useState(false);
  const [isTimedMode, setIsTimedMode] = useState(false);
  const [isWeeklyMode, setIsWeeklyMode] = useState(false);

  // 无尽模式
  const [endlessScore, setEndlessScore] = useState(0);
  const [endlessHighScore, setEndlessHighScore] = useState(getEndlessHighScore());

  // 限时模式
  const [timedScore, setTimedScore] = useState(0);
  const [timedHighScore, setTimedHighScore] = useState(() => loadTimedHighScore());

  // 每日挑战完成状态
  const [dailyCompletedToday, setDailyCompletedToday] = useState(hasCompletedDailyToday());

  // 周挑战完成状态（懒初始化，避免首屏加载 weeklyChallenge 模块）
  const [weeklyCompleted, setWeeklyCompleted] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('color-sort-weekly-record');
      if (!raw) return false;
      const record = JSON.parse(raw);
      const now = new Date();
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      const currentSeed = `weekly-${d.getFullYear()}-W${weekNo}`;
      return record.seed === currentSeed;
    } catch { return false; }
  });

  // 周挑战展示信息
  const [weeklyDisplay, setWeeklyDisplay] = useState<{ week: number; recordMoves?: number; recordStars?: number; streak: number } | null>(null);

  // 启动普通模式
  const startNormalMode = useCallback((setCurrentLevel: (level: number) => void, level: number) => {
    setIsDailyMode(false);
    setIsEndlessMode(false);
    setIsTimedMode(false);
    setIsWeeklyMode(false);
    setCurrentLevel(level);
    SoundEngine.resume();
    recordPlayedMode('normal');
    onCheckPlayDays?.();
  }, [onCheckPlayDays]);

  // 启动每日挑战
  const startDailyMode = useCallback((setCurrentLevel: (level: number) => void) => {
    setIsDailyMode(true);
    setIsEndlessMode(false);
    setIsTimedMode(false);
    setIsWeeklyMode(false);
    setCurrentLevel(-1);
    SoundEngine.resume();
    recordPlayedMode('daily');
    onCheckPlayDays?.();
  }, [onCheckPlayDays]);

  // 启动无尽模式
  const startEndlessMode = useCallback((setCurrentLevel: (level: number) => void) => {
    setIsEndlessMode(true);
    setIsDailyMode(false);
    setIsTimedMode(false);
    setIsWeeklyMode(false);
    setEndlessScore(0);
    setCurrentLevel(-2);
    SoundEngine.resume();
    recordPlayedMode('endless');
    onCheckPlayDays?.();
  }, [onCheckPlayDays]);

  // 启动限时模式
  const startTimedMode = useCallback((setCurrentLevel: (level: number) => void) => {
    setIsTimedMode(true);
    setIsEndlessMode(false);
    setIsDailyMode(false);
    setIsWeeklyMode(false);
    setTimedScore(0);
    setCurrentLevel(-3);
    SoundEngine.resume();
    recordPlayedMode('timed');
    onCheckPlayDays?.();
  }, [onCheckPlayDays]);

  // 启动周挑战
  const startWeeklyMode = useCallback((setCurrentLevel: (level: number) => void) => {
    setIsWeeklyMode(true);
    setIsDailyMode(false);
    setIsEndlessMode(false);
    setIsTimedMode(false);
    setCurrentLevel(-4);
    SoundEngine.resume();
    recordPlayedMode('weekly');
  }, []);

  // 重置所有模式（返回首页时调用）
  const resetAllModes = useCallback(() => {
    setIsDailyMode(false);
    setIsEndlessMode(false);
    setIsTimedMode(false);
    setIsWeeklyMode(false);
  }, []);

  // 从自动存档恢复模式状态
  const restoreFromAutosave = useCallback((autosaveData: { mode: string; level: number; endlessScore?: number; timedScore?: number }, setCurrentLevel: (level: number) => void) => {
    if (autosaveData.mode === 'endless') {
      setIsEndlessMode(true);
      setEndlessScore(autosaveData.endlessScore ?? 0);
      setCurrentLevel(-2);
    } else if (autosaveData.mode === 'timed') {
      setIsTimedMode(true);
      setTimedScore(autosaveData.timedScore ?? 0);
      setCurrentLevel(-3);
    } else if (autosaveData.mode === 'daily') {
      setIsDailyMode(true);
      setCurrentLevel(-1);
    } else if (autosaveData.mode === 'weekly') {
      setIsWeeklyMode(true);
      setCurrentLevel(-4);
    } else {
      setCurrentLevel(autosaveData.level);
    }
    SoundEngine.resume();
  }, []);

  // 初始化周挑战展示信息
  const initWeeklyDisplay = useCallback(() => {
    const info = getWeeklyInfo();
    const record = getWeeklyRecord();
    const streak = getWeeklyStreak();
    setWeeklyDisplay({
      week: info.week,
      recordMoves: record?.moves,
      recordStars: record?.stars,
      streak: streak.currentStreak,
    });
  }, []);

  // 周挑战完成时更新展示信息
  const updateWeeklyAfterCompletion = useCallback((winMoves: number, playTimeSec: number, stars: number) => {
    saveWeeklyRecord(winMoves, playTimeSec, stars);
    setWeeklyCompleted(true);
    const weeklyStreak = getWeeklyStreak();
    const wInfo = getWeeklyInfo();
    setWeeklyDisplay({ week: wInfo.week, recordMoves: winMoves, recordStars: stars, streak: weeklyStreak.currentStreak });
  }, []);

  // 无尽模式分数更新
  const updateEndlessScore = useCallback((newScore: number) => {
    saveEndlessScore(newScore);
    setEndlessHighScore(getEndlessHighScore());
  }, []);

  // 限时模式分数更新
  const updateTimedScore = useCallback((newScore: number) => {
    saveTimedHighScore(newScore);
    setTimedHighScore(newScore);
  }, []);

  return {
    // 状态
    isDailyMode,
    isEndlessMode,
    isTimedMode,
    isWeeklyMode,
    endlessScore,
    endlessHighScore,
    timedScore,
    timedHighScore,
    dailyCompletedToday,
    weeklyCompleted,
    weeklyDisplay,
    // 状态设置器（供外部直接修改）
    setIsDailyMode,
    setIsEndlessMode,
    setIsTimedMode,
    setIsWeeklyMode,
    setEndlessScore,
    setTimedScore,
    setTimedHighScore,
    setEndlessHighScore,
    setDailyCompletedToday,
    setWeeklyCompleted,
    setWeeklyDisplay,
    // 动作
    startNormalMode,
    startDailyMode,
    startEndlessMode,
    startTimedMode,
    startWeeklyMode,
    resetAllModes,
    restoreFromAutosave,
    initWeeklyDisplay,
    updateWeeklyAfterCompletion,
    updateEndlessScore,
    updateTimedScore,
  };
}

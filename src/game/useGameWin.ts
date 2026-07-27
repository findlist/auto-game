// 通关胜利处理 hook —— 从 App.tsx 提取
// 管理：通关进度更新、星级保存、成就检查、统计记录、各模式完成处理
// 依赖较多，通过参数传入所需状态与回调
import { useCallback } from 'react';
import { AchievementManager, Achievement } from './achievements';
import { getTodayString, saveDailyRecord } from './dailyChallenge';
import { addDailyLeaderboardEntry } from './dailyLeaderboard';
import { StatsTracker } from './statsTracker';
import { getWeeklyStreak } from './weeklyChallengeData';
import { getPlayedModes } from './playedModes';
import { getDailyGoalsProgress, updateGoalProgress } from './dailyGoals';
import {
  saveProgress, Progress, saveBestScore, loadBestScores,
  saveStars, loadStars, clearAutosave,
} from './homeStorage';

// 模式状态与回调的类型定义
interface ModeState {
  isDailyMode: boolean;
  isEndlessMode: boolean;
  isTimedMode: boolean;
  isWeeklyMode: boolean;
  endlessScore: number;
  timedScore: number;
  timedHighScore: number;
}

interface ModeCallbacks {
  setProgress: (p: Progress) => void;
  setBestScores: (fn: () => Record<number, number>) => void;
  setLevelStars: (fn: () => Record<number, number>) => void;
  setDailyCompletedToday: (v: boolean) => void;
  updateEndlessScore: (s: number) => void;
  updateTimedScore: (s: number) => void;
  updateWeeklyAfterCompletion: (moves: number, time: number, stars: number) => void;
  checkAchievements: (achievements: Achievement[]) => void;
  onNormalWin: () => { newCombo: number; totalCombo: number };
  addHints: (n: number) => void;
  setGoalClaimToast: (msg: string | null) => void;
}

export function useGameWin(
  progress: Progress,
  currentLevel: number,
  usedHintThisLevel: boolean,
  recoveredFromDeadlock: boolean,
  modeState: ModeState,
  callbacks: ModeCallbacks
) {
  const handleWin = useCallback(async (winMoves: number, minSteps: number, stars: number, playTimeSec: number) => {
    try {
      const { isDailyMode, isEndlessMode, isTimedMode, isWeeklyMode, endlessScore, timedScore, timedHighScore } = modeState;
      const { setProgress, setBestScores, setLevelStars, setDailyCompletedToday,
        updateEndlessScore, updateTimedScore, updateWeeklyAfterCompletion,
        checkAchievements, onNormalWin, addHints, setGoalClaimToast } = callbacks;

      // 仅普通模式(currentLevel > 0)更新通关进度和最佳成绩,避免写入 bestScores[-1/-2/-3/-4] 污染数据
      const newCompleted = [...progress.completedLevels];
      if (currentLevel > 0) {
        if (!newCompleted.includes(currentLevel)) {
          newCompleted.push(currentLevel);
        }
        const newProgress = {
          currentLevel: Math.max(progress.currentLevel, currentLevel + 1),
          completedLevels: newCompleted,
        };
        setProgress(newProgress);
        saveProgress(newProgress);
        saveBestScore(currentLevel, winMoves);
        setBestScores(loadBestScores);
      }

      // 保存星级数据(周挑战不保存星级,避免写入 stars[-4])
      if (!isDailyMode && !isEndlessMode && !isTimedMode && !isWeeklyMode) {
        saveStars(currentLevel, stars);
        setLevelStars(loadStars);
      }

      // 检查成就
      const newlyUnlocked = AchievementManager.checkLevelAchievements(
        currentLevel, winMoves, usedHintThisLevel, minSteps
      );
      if (recoveredFromDeadlock) {
        newlyUnlocked.push(...AchievementManager.checkPersistentAchievement(true));
      }
      checkAchievements(newlyUnlocked);

      // 记录统计:检查是否使用撤销/提示等辅助通关判定
      StatsTracker.recordWin(currentLevel, winMoves, stars, isDailyMode, isEndlessMode, isTimedMode, playTimeSec, usedHintThisLevel || recoveredFromDeadlock, usedHintThisLevel);

      // 每日目标进度更新
      if (!isDailyMode && !isEndlessMode && !isTimedMode && !isWeeklyMode) {
        updateGoalProgress('complete_levels');
        updateGoalProgress('earn_stars', stars);
        if (!usedHintThisLevel) {
          updateGoalProgress('no_hint_clear');
        }
        // 连续通关连击+1
        const { newCombo, totalCombo } = onNormalWin();
        checkAchievements(AchievementManager.checkComboAchievements(newCombo));
        checkAchievements(AchievementManager.checkTotalComboAchievements(totalCombo));
        const goalProgress = getDailyGoalsProgress();
        checkAchievements(AchievementManager.checkDailyGoalAchievements(goalProgress.completed, goalProgress.total));
      }
      if (isDailyMode) {
        updateGoalProgress('daily_challenge');
      }

      // 非胜利成就:仅普通模式胜利才累计普通连胜
      // 修复:原条件未排除 isWeeklyMode,周挑战通关会误触发普通连胜/里程碑/探索者/色彩成就
      if (!isDailyMode && !isEndlessMode && !isTimedMode && !isWeeklyMode) {
        const currentStreak = StatsTracker.get().currentStreak;
        checkAchievements(AchievementManager.checkStreakAchievements(currentStreak));
        checkAchievements(AchievementManager.checkMilestoneAchievements(currentLevel));
        checkAchievements(AchievementManager.checkExplorerAchievements(newCompleted.length));
        // 色彩收藏家成就(根据关卡配置推断颜色数)
        const colorCount = currentLevel <= 3 ? 2 : currentLevel <= 6 ? 3 : currentLevel <= 12 ? 4 : currentLevel <= 20 ? 5 : currentLevel <= 30 ? 6 : currentLevel <= 50 ? 7 : currentLevel <= 70 ? 8 : currentLevel <= 90 ? 9 : 10;
        checkAchievements(AchievementManager.checkColorMasterAchievements(colorCount));
      }

      // 检查步数表成就
      const updatedStats = StatsTracker.get();
      checkAchievements(AchievementManager.checkTotalMovesAchievements(updatedStats.totalMoves));
      // 检查速度成就(仅普通模式、步数 > 0 且用时 > 0)
      if (!isDailyMode && !isEndlessMode && !isTimedMode && !isWeeklyMode && playTimeSec > 0) {
        checkAchievements(AchievementManager.checkSpeedAchievements(playTimeSec));
      }
      checkAchievements(AchievementManager.checkPerfectStarAchievements(updatedStats.perfectLevels));

      // 胜利时清除自动存档
      clearAutosave();

      // 每日挑战完成处理
      if (isDailyMode) {
        saveDailyRecord({ date: getTodayString(), completed: true, moves: winMoves });
        setDailyCompletedToday(true);
        addDailyLeaderboardEntry({
          date: getTodayString(),
          moves: winMoves,
          minSteps,
          stars,
          playTimeSec,
          timestamp: Date.now(),
        });
        checkAchievements(AchievementManager.checkDailyAchievements());
      }
      // 周挑战完成处理
      if (isWeeklyMode) {
        updateWeeklyAfterCompletion(winMoves, playTimeSec, stars);
        const weeklyStreak = getWeeklyStreak();
        checkAchievements(AchievementManager.checkWeeklyAchievements(weeklyStreak.currentStreak));
      }
      // 全能玩家成就检查:体验所有5种模式
      checkAchievements(AchievementManager.checkAllRoundAchievements(getPlayedModes()));
      // 无尽模式完成处理
      if (isEndlessMode) {
        const newScore = endlessScore + 1;
        updateEndlessScore(newScore);
        checkAchievements(AchievementManager.checkEndlessAchievements(newScore));
        // 无尽模式里程碑奖励：每过5关奖励1个提示道具
        if (newScore > 0 && newScore % 5 === 0) {
          addHints(1);
          setGoalClaimToast(`🎉 无尽模式 ${newScore} 关里程碑！奖励 +1 提示道具`);
          setTimeout(() => setGoalClaimToast(null), 3000);
        }
      }
      // 限时模式完成处理
      if (isTimedMode) {
        const newScore = timedScore + 1;
        // 仅更新最高分,timedScore 累加交给 handleNextLevelAction
        if (newScore > timedHighScore) {
          updateTimedScore(newScore);
        }
        checkAchievements(AchievementManager.checkTimedAchievements(newScore));
        // 限时模式里程碑奖励
        if (newScore > 0 && newScore % 5 === 0) {
          addHints(1);
          setGoalClaimToast(`🎉 限时模式 ${newScore} 关里程碑！奖励 +1 提示道具`);
          setTimeout(() => setGoalClaimToast(null), 3000);
        }
      }
    } catch (e) {
      console.error('handleWin error:', e);
    }
  }, [progress, currentLevel, usedHintThisLevel, recoveredFromDeadlock, modeState, callbacks]);

  return { handleWin };
}

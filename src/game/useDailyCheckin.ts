// 每日签到与每日目标管理 hook — 从 App.tsx 提取
// 集中管理签到状态、每日目标进度、提示道具、连击系统
// 设计原因：这些状态紧密关联（签到奖励提示道具、目标完成也发提示道具），统一管理避免状态分散

import { useState, useCallback } from 'react';
// SoundEngine 懒加载代理（首屏 hook 仅需 click/win/resume，改为懒加载降低首屏 bundle）
import { SoundEngineLazy as SoundEngine } from './soundEngineLazy';
import { DailyCheckin } from './dailyCheckin';
import { getHintItems, useHintItem, addHintItems, claimDailyHintBonus } from './hintItems';
import { getDailyGoals, claimGoalReward } from './dailyGoals';
import { getComboStreak, incrementComboStreak, resetComboStreak, checkComboCelebration, addTotalComboCount, getTotalComboCount, ComboCelebration } from './comboStreak';
import { StatsTracker } from './statsTracker';
import { AchievementManager } from './achievements';

export interface DailyCheckinState {
  checkinDone: boolean;
  checkinStreak: number;
  checkinTotal: number;
  showCheckinReward: string | null;
  hintItems: number;
  dailyGoals: ReturnType<typeof getDailyGoals>;
  goalClaimToast: string | null;
  comboStreak: number;
  comboCelebration: ComboCelebration | null;
}

/**
 * 每日签到与每日目标管理 hook
 */
export function useDailyCheckin(
  onAchievementCheck?: (achievements: any[]) => void,
) {
  const [checkinDone, setCheckinDone] = useState(DailyCheckin.hasCheckedToday());
  const [checkinStreak, setCheckinStreak] = useState(DailyCheckin.getCurrentStreak());
  const [checkinTotal, setCheckinTotal] = useState(DailyCheckin.getTotalDays());
  const [showCheckinReward, setShowCheckinReward] = useState<string | null>(null);
  const [hintItems, setHintItemsState] = useState(getHintItems());
  const [dailyGoals, setDailyGoals] = useState(getDailyGoals());
  const [goalClaimToast, setGoalClaimToast] = useState<string | null>(null);
  const [comboStreak, setComboStreak] = useState(getComboStreak());
  const [comboCelebration, setComboCelebration] = useState<ComboCelebration | null>(null);

  // 领取每日目标奖励
  const handleClaimGoal = useCallback((type: string) => {
    const reward = claimGoalReward(type as any);
    if (reward > 0) {
      addHintItems(reward);
      setHintItemsState(getHintItems());
      setDailyGoals(getDailyGoals());
      SoundEngine.win();
      const goal = dailyGoals.find(g => g.type === type);
      setGoalClaimToast(`领取 ${goal?.icon} ${goal?.description} 奖励 +${reward} 提示道具`);
      setTimeout(() => setGoalClaimToast(null), 3000);
    }
  }, [dailyGoals]);

  // 执行签到
  const handleCheckin = useCallback(() => {
    SoundEngine.resume();
    const result = DailyCheckin.checkin();
    if (result.success) {
      setCheckinDone(true);
      setCheckinStreak(result.newStreak);
      setCheckinTotal(result.totalDays);
      SoundEngine.win();
      if (result.rewardUnlocked && result.rewardUnlocked.includes('提示道具')) {
        const newTotal = addHintItems(1);
        setHintItemsState(newTotal);
      }
      if (result.rewardUnlocked) {
        setShowCheckinReward(result.rewardUnlocked);
      }
      // 检查签到成就
      if (onAchievementCheck) {
        onAchievementCheck(AchievementManager.checkCheckinAchievements(result.newStreak, result.totalDays));
      }
    }
  }, [onAchievementCheck]);

  // 首次登录领取每日提示道具奖励
  const claimDailyBonus = useCallback(() => {
    const bonus = claimDailyHintBonus();
    if (bonus.claimed) {
      setHintItemsState(bonus.total);
    }
  }, []);

  // 使用提示道具
  const consumeHint = useCallback(() => {
    const success = useHintItem();
    if (success) {
      setHintItemsState(getHintItems());
      SoundEngine.resume();
    }
    return success;
  }, []);

  // 添加提示道具并刷新状态
  const addHints = useCallback((amount: number) => {
    const newTotal = addHintItems(amount);
    setHintItemsState(newTotal);
    return newTotal;
  }, []);

  // 普通通关后连击+1
  const onNormalWin = useCallback(() => {
    const newCombo = incrementComboStreak();
    setComboStreak(newCombo);
    addTotalComboCount();
    const celebration = checkComboCelebration();
    if (celebration) {
      setComboCelebration(celebration);
      SoundEngine.win();
      setTimeout(() => setComboCelebration(null), 3000);
    }
    return { newCombo, totalCombo: getTotalComboCount() };
  }, []);

  // 重置连击（非通关返回首页时）
  const resetCombo = useCallback(() => {
    resetComboStreak();
    setComboStreak(0);
  }, []);

  // 断开连胜（退出未完成的关卡）
  const breakStreak = useCallback(() => {
    StatsTracker.breakStreak();
    resetCombo();
  }, [resetCombo]);

  return {
    // 状态
    checkinDone,
    checkinStreak,
    checkinTotal,
    showCheckinReward,
    hintItems,
    dailyGoals,
    goalClaimToast,
    comboStreak,
    comboCelebration,
    // 状态设置器
    setShowCheckinReward,
    setHintItemsState,
    setDailyGoals,
    setGoalClaimToast,
    setComboStreak,
    setComboCelebration,
    // 动作
    handleClaimGoal,
    handleCheckin,
    claimDailyBonus,
    consumeHint,
    addHints,
    onNormalWin,
    resetCombo,
    breakStreak,
  };
}

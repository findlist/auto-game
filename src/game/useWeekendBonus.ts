import { useState, useCallback } from 'react';
import { claimWeekendBonus, getWeekendBonusInfo } from './weekendBonus';
import { SoundEngine } from './soundEngine';

// 周末奖励管理 hook
// 从 App.tsx 提取：周末奖励状态与领取逻辑
// 设计原因：周末奖励是独立的周期性活动逻辑，与游戏核心流程解耦

export function useWeekendBonus() {
  // 周末奖励信息（是否可用、剩余次数等）
  const [weekendBonusInfo, setWeekendBonusInfo] = useState(getWeekendBonusInfo());

  // 领取周末奖励：调用 claimWeekendBonus 领取，成功后刷新状态
  const handleClaimWeekendBonus = useCallback(() => {
    const result = claimWeekendBonus();
    if (result !== null) {
      SoundEngine.win();
      setWeekendBonusInfo(getWeekendBonusInfo());
    }
  }, []);

  return {
    weekendBonusInfo,
    handleClaimWeekendBonus,
  };
}

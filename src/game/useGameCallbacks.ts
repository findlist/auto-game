import { useCallback } from 'react';
import { Achievement } from './achievements';
import { markTutorialSeen } from './homeStorage';

/**
 * 游戏回调函数 hook
 * 从 App.tsx 提取：死锁恢复、成就弹窗关闭、新手引导关闭三个简单回调
 * 虽然逻辑简单，但统一管理便于后续扩展
 */
export function useGameCallbacks(
  setRecoveredFromDeadlock: (value: boolean) => void,
  setNewAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>,
  setShowTutorial: (value: boolean) => void
) {
  // 死锁恢复：标记当前已从死锁状态恢复，GameBoard 据此显示恢复动画
  const handleDeadlockRecover = useCallback(() => {
    setRecoveredFromDeadlock(true);
  }, [setRecoveredFromDeadlock]);

  // 关闭当前成就弹窗：移除队列中第一个成就，若有后续成就则自动展示
  const dismissAchievement = useCallback(() => {
    setNewAchievements(prev => prev.slice(1));
  }, [setNewAchievements]);

  // 关闭新手引导：隐藏弹窗并标记已看过，避免重复展示
  const handleTutorialClose = useCallback(() => {
    setShowTutorial(false);
    markTutorialSeen();
  }, [setShowTutorial]);

  return { handleDeadlockRecover, dismissAchievement, handleTutorialClose };
}

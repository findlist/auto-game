import { useCallback } from 'react';
import { saveRecent, hasSeenTutorial, RecentPlay } from './homeStorage';

/**
 * 关卡选择与游戏启动 hook
 * 从 App.tsx 提取：选择关卡进入游戏、继续当前进度进入游戏
 * 统一管理 saveRecent + setRecentPlay 调用，消除重复代码
 */
export function useLevelSelect(
  setCurrentLevel: React.Dispatch<React.SetStateAction<number>>,
  setPage: (page: string) => void,
  setRecentPlay: (play: RecentPlay) => void,
  getCurrentLevel: () => number,
  setShowTutorial?: (show: boolean) => void
) {
  // 选择指定关卡并进入游戏
  const handleSelectLevel = useCallback((level: number) => {
    setCurrentLevel(level);
    setPage('game');
    const recent = { level, mode: 'normal' as const, timestamp: Date.now() };
    saveRecent(recent);
    setRecentPlay(recent);
  }, [setCurrentLevel, setPage, setRecentPlay]);

  // 继续当前进度进入游戏（首页"继续游戏"按钮）
  const handleStartGame = useCallback(() => {
    const level = getCurrentLevel();
    setCurrentLevel(level);
    setPage('game');
    const recent = { level, mode: 'normal' as const, timestamp: Date.now() };
    saveRecent(recent);
    setRecentPlay(recent);
    // 首次游玩展示新手引导
    if (setShowTutorial && !hasSeenTutorial()) {
      setShowTutorial(true);
    }
  }, [setCurrentLevel, setPage, setRecentPlay, getCurrentLevel, setShowTutorial]);

  return { handleSelectLevel, handleStartGame };
}

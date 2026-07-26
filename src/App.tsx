import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
// GameBoard 已移入 GamePageComponent
import { canPour } from './game/levelGenerator';
import { SoundEngine } from './game/soundEngine';
import { Tube } from './game/types';
import { AchievementManager, Achievement, EncyclopediaAchievementChecks } from './game/achievements';
import { getTodayString, saveDailyRecord } from './game/dailyChallenge';
import { addDailyLeaderboardEntry } from './game/dailyLeaderboard';
import { StatsTracker } from './game/statsTracker';
import { getHintItems } from './game/hintItems';
// 游戏模式管理 hook（从 App.tsx 提取模式状态与切换逻辑）
import { useGameModes } from './game/useGameModes';
// 每日签到与目标 hook（从 App.tsx 提取签到、目标、连击逻辑）
import { useDailyCheckin } from './game/useDailyCheckin';
// 回放视频导出 hook（从 App.tsx 提取视频生成逻辑）
import { useReplayVideo } from './game/useReplayVideo';
// replayShare 函数改为动态导入，降低首屏 bundle 体积（已在 useReplayShare hook 内部管理）
// weeklyChallenge 数据函数从轻量数据模块静态导入（不含关卡生成依赖）
import { getWeeklyStreak } from './game/weeklyChallengeData';
import type { CustomLevel } from './game/levelEditor';
import { STORAGE_KEYS } from './game/storageKeys';
// 自定关卡管理 hook（从 App.tsx 提取自定关卡的增删改查逻辑）
import { useCustomLevels } from './game/useCustomLevels';
// 公告系统 hook（从 App.tsx 提取公告状态管理与已读标记）
import { useAnnouncements } from './game/useAnnouncements';
// 回放分享与查看 hook（从 App.tsx 提取回放链接生成、战绩分享、URL 回放解析）
import { useReplayShare } from './game/useReplayShare';
import { getPlayedModes } from './game/playedModes';
import { claimWeekendBonus, getWeekendBonusInfo } from './game/weekendBonus';
import { canInstallPWA, isPWAInstallDismissed, dismissPWAInstall } from './game/pwaInstall';
import { loadRecent, saveRecent, RecentPlay, loadProgress, saveProgress, Progress, loadBestScores, saveBestScore, hasSeenTutorial, markTutorialSeen, loadStars, saveStars, loadAutosave, saveAutosave, clearAutosave, AutosaveData } from './game/homeStorage';
import { updateGoalProgress, getDailyGoalsProgress } from './game/dailyGoals';
// GamePageComponent 改为懒加载，仅在进入游戏页时加载，大幅降低首屏 bundle 体积
const GamePageComponent = lazy(() => import('./components/GamePageComponent').then(m => ({ default: m.GamePageComponent })));
import { HomeStatsBar } from './components/HomeStatsBar';
import { QuickNavSection } from './components/QuickNavSection';
import { LevelSelectSection } from './components/LevelSelectSection';
import { DailyContentSection } from './components/DailyContentSection';
import { HomeTopSection } from './components/HomeTopSection';
import { HomeDialogs } from './components/HomeDialogs';
import { HomeChrome } from './components/HomeChrome';
import { SmartRecommendSection } from './components/SmartRecommendSection';
import { HomeFooterSection } from './components/HomeFooterSection';
// comboStreak 相关逻辑已移入 useDailyCheckin hook
import { useEncyclopediaAchievements } from './game/useEncyclopediaAchievements';
// 懒加载非首屏页面组件,减小首屏 bundle 大小
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const StatsPage = lazy(() => import('./pages/StatsPage').then(m => ({ default: m.StatsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const LevelEditorPage = lazy(() => import('./pages/LevelEditorPage').then(m => ({ default: m.LevelEditorPage })));
const CustomLevelPlayer = lazy(() => import('./pages/LevelEditorPage').then(m => ({ default: m.CustomLevelPlayer })));
const ColorEncyclopediaPage = lazy(() => import('./pages/ColorEncyclopediaPage').then(m => ({ default: m.ColorEncyclopediaPage })));

// 页面加载占位组件
const PageLoading = () => (
  <div className="app page-loading-container">
    <div className="page-loading-inner">
      <div className="page-loading-emoji">🎨</div>
      <p className="page-loading-text">加载中...</p>
    </div>
  </div>
);

type Page = 'home' | 'game' | 'about' | 'privacy' | 'achievements' | 'settings' | 'stats' | 'editor' | 'editor-play' | 'encyclopedia';

// 限时模式配置
const TIMED_DURATION = 120; // 限时模式时长(秒)

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [currentLevel, setCurrentLevel] = useState(progress.currentLevel);
  const [hintPair, setHintPair] = useState<[number, number] | null>(null);
  const [bestScores, setBestScores] = useState<Record<number, number>>(loadBestScores);
  const [currentMoves, setMoves] = useState(0);
  const [showTutorial, setShowTutorial] = useState(!hasSeenTutorial());
  const [showShareToast, setShowShareToastInternal] = useState(false);
  // showShareToast 的回调版本，供 hook 内部使用（避免 hook 依赖 setState）
  const triggerShareToast = useCallback(() => {
    setShowShareToastInternal(true);
    setTimeout(() => setShowShareToastInternal(false), 2000);
  }, []);
  const [levelStars, setLevelStars] = useState<Record<number, number>>(loadStars);
  const [pageLevel, setPageLevel] = useState(0); // 关卡选择当前页
  const [recentPlay, setRecentPlay] = useState<RecentPlay | null>(loadRecent);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [autosaveData, setAutosaveData] = useState<AutosaveData | null>(null);
  const [showPWAInstall, setShowPWAInstall] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [levelSearchInput, setLevelSearchInput] = useState('');

  // 成就系统状态 — 提前定义以供 useDailyCheckin hook 使用
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [usedHintThisLevel, setUsedHintThisLevel] = useState(false);
  const [recoveredFromDeadlock, setRecoveredFromDeadlock] = useState(false);

  // 通用成就检查辅助函数 — 统一"检查→追加到 newAchievements"模式，消除重复代码
  const checkAchievements = useCallback((achievements: Achievement[]) => {
    if (achievements.length > 0) {
      setNewAchievements(prev => [...prev, ...achievements]);
    }
  }, []);

  // 检查累计游玩天数成就 — 在各游戏模式启动时统一调用
  const checkPlayDaysAchievements = useCallback(() => {
    checkAchievements(AchievementManager.checkPlayDaysAchievements());
  }, [checkAchievements]);

  // 每日签到与目标、连击系统 — 通过 useDailyCheckin hook 统一管理
  const {
    checkinDone, checkinStreak, checkinTotal, showCheckinReward,
    hintItems, dailyGoals, goalClaimToast, comboStreak, comboCelebration,
    setShowCheckinReward, setGoalClaimToast, setComboCelebration,
    handleClaimGoal, handleCheckin: doCheckin, claimDailyBonus, consumeHint, addHints,
    onNormalWin, resetCombo,
  } = useDailyCheckin(checkAchievements);
  // handleCheckin 别名（避免与可能的局部变量冲突）
  const handleCheckin = doCheckin;

  // 更新日志、公告状态
  const [showChangelog, setShowChangelog] = useState(false);
  // 已保存的色彩混合配方快速查看
  const [showSavedRecipes, setShowSavedRecipes] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<Array<{colors: string[]; result: string; rgb: string; date: string}>>([]);

  // 加载已保存的混合配方
  const loadSavedRecipes = useCallback(() => {
    try {
      const list = JSON.parse(localStorage.getItem('color_mixer_recipes') || '[]');
      setSavedRecipes(list);
    } catch (e) { setSavedRecipes([]); }
  }, []);

  // 打开配方查看弹窗
  const openSavedRecipes = useCallback(() => {
    loadSavedRecipes();
    setShowSavedRecipes(true);
    SoundEngine.click();
  }, [loadSavedRecipes]);
  // 公告系统 — 通过 useAnnouncements hook 统一管理
  const {
    announcements, showAnnouncements,
    handleDismissAnnouncement, handleCloseAnnouncements,
  } = useAnnouncements();

  // 自定关卡管理 — 通过 useCustomLevels hook 统一管理
  const {
    customLevels, playingCustomLevel, setPlayingCustomLevel,
    handlePlayCustomLevel, handleDeleteCustomLevel, handleSaveCustomLevel,
    handleImportLevel, handleCustomLevelWin,
  } = useCustomLevels();

  // 回放视频导出 — 通过 useReplayVideo hook 管理
  const {
    showReplayVideoModal, replayVideoUrl, replayThumbnail, generatingVideo,
    setShowReplayVideoModal, setReplayVideoUrl,
    handleExportReplayVideo: handleExportReplayVideoHook,
  } = useReplayVideo();

  // 首页可折叠区域状态
  const [progressCollapsed, setProgressCollapsed] = useState(false);
  const [levelSelectCollapsed, setLevelSelectCollapsed] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all'); // 关卡难度筛选

  // 内部提示功能:获取当前游戏状态
  const currentTubesRef = useRef<Tube[] | null>(null);

  // 初始化时检查是否有自动存档
  useEffect(() => {
    // 每次首次登录领取1个提示道具
    claimDailyBonus();
    const saved = loadAutosave();
    if (saved && saved.level && saved.moves > 0 && !saved.isWon) {
      setAutosaveData(saved);
      setShowResumeDialog(true);
    }

    // 新版本更新,显示更新日志
    const CHANGELOG_KEY = STORAGE_KEYS.CHANGELOG_VERSION;
    const currentVersion = '1.51.0';
    try {
      const lastVersion = localStorage.getItem(CHANGELOG_KEY);
      if (lastVersion !== currentVersion) {
        setShowChangelog(true);
        localStorage.setItem(CHANGELOG_KEY, currentVersion);
      }
    } catch (e) { /* 忽略 */ }

    // 加载周挑战展示信息（通过 hook 提供的方法）
    initWeeklyDisplay();
  }, []);

  // 延迟检测 PWA 可安装性,页面加载3秒后
  useEffect(() => {
    const timer = setTimeout(() => {
      if (canInstallPWA() && !isPWAInstallDismissed()) {
        setShowPWAInstall(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // 定期检查记录 PWA 可安装性
  useEffect(() => {
    const interval = setInterval(() => {
      if (canInstallPWA() && !isPWAInstallDismissed() && !showPWAInstall) {
        setShowPWAInstall(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [showPWAInstall]);

  // 色彩百科页成就回调 hook — 集中管理百科页成就检查逻辑，避免内联代码
  const encyclopediaHooks = useEncyclopediaAchievements(setNewAchievements);

  // 修复 P1:原代码在 render 阶段调用 setNewAchievements,违反 React 纯渲染原则
  // 可能导致 "Cannot update a component while rendering" 警告甚至无限重渲染
  // 改为在 useEffect 中根据 page 变化触发成就检查
  useEffect(() => {
    if (page === 'stats') {
      checkAchievements(AchievementManager.checkStatsViewerAchievements());
    } else if (page === 'encyclopedia') {
      checkAchievements(EncyclopediaAchievementChecks.checkEncyclopediaAchievements(progress.completedLevels.includes(100)));
    }
  }, [page, progress.completedLevels, checkAchievements]);

  // 自动保存当前游戏状态
  const autoSaveGame = useCallback((level: number, mode: string, moves: number, isWon: boolean, extra?: Record<string, number>) => {
    if (moves > 0 && !isWon) {
      saveAutosave({ level, mode, moves, isWon: false, ...extra } as AutosaveData);
    } else {
      clearAutosave();
    }
  }, []);

  // 游戏模式状态 — 通过 useGameModes hook 统一管理
  const {
    isDailyMode, isEndlessMode, isTimedMode, isWeeklyMode,
    endlessScore, endlessHighScore,
    timedScore, timedHighScore, dailyCompletedToday,
    weeklyCompleted, weeklyDisplay,
    setEndlessScore, setTimedScore,
    setDailyCompletedToday,
    startDailyMode, startEndlessMode, startTimedMode,
    startWeeklyMode, resetAllModes, restoreFromAutosave,
    initWeeklyDisplay, updateWeeklyAfterCompletion,
    updateEndlessScore, updateTimedScore,
  } = useGameModes(progress.currentLevel, checkPlayDaysAchievements);

  // 回放分享与查看 — 通过 useReplayShare hook 统一管理（依赖 endlessScore/timedScore，需在 useGameModes 之后调用）
  const {
    viewReplayData, showViewReplay, setShowViewReplay, setViewReplayData,
    handleReplayShare, handleShare, handleCloseViewReplay,
  } = useReplayShare(triggerShareToast, endlessScore, timedScore, TIMED_DURATION);

  // 成就解锁音效 — 监听 newAchievements 变化，根据稀有度播放差异化音效
  useEffect(() => {
    if (newAchievements.length > 0) {
      const achievement = newAchievements[0];
      SoundEngine.achievement(achievement.rarity);
    }
  }, [newAchievements]);

  // 周末奖励状态
  const [weekendBonusInfo, setWeekendBonusInfo] = useState(getWeekendBonusInfo());

  // 领取周末奖励
  const handleClaimWeekendBonus = useCallback(() => {
    const result = claimWeekendBonus();
    if (result !== null) {
      SoundEngine.win();
      setWeekendBonusInfo(getWeekendBonusInfo());
    }
  }, []);

  // 提示功能:从当前游戏状态找到一对可操作试管
  const handleHint = useCallback(() => {
    // 检查提示道具数量
    const currentItems = getHintItems();
    if (currentItems <= 0) {
      SoundEngine.error();
      return;
    }
    const success = consumeHint();
    if (!success) {
      SoundEngine.error();
      return;
    }
    setUsedHintThisLevel(true);
    StatsTracker.recordHint();
    const tubes = currentTubesRef.current;
    if (!tubes) return;

    // 优先找同色合并的管子
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
    // 再找可以空管
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
  }, []);

  const handleWin = useCallback(async (winMoves: number, minSteps: number, stars: number, playTimeSec: number) => {
   try {
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
      setBestScores(loadBestScores());
    }

    // 保存星级数据(周挑战不保存星级,避免写入 stars[-4])
    if (!isDailyMode && !isEndlessMode && !isTimedMode && !isWeeklyMode) {
      saveStars(currentLevel, stars);
      setLevelStars(loadStars());
    }

    // 检查成就
    const newlyUnlocked = AchievementManager.checkLevelAchievements(
      currentLevel, winMoves, usedHintThisLevel, minSteps
    );
    if (recoveredFromDeadlock) {
      newlyUnlocked.push(...AchievementManager.checkPersistentAchievement(true));
    }
    checkAchievements(newlyUnlocked);

    // 记录统计:检查是否使用撒销/提示等辅助通关判定
    StatsTracker.recordWin(currentLevel, winMoves, stars, isDailyMode, isEndlessMode, isTimedMode, playTimeSec, usedHintThisLevel || recoveredFromDeadlock, usedHintThisLevel);

    // 每日目标进度更新
    if (!isDailyMode && !isEndlessMode && !isTimedMode && !isWeeklyMode) {
      // 普通模式通关
      updateGoalProgress('complete_levels');
      updateGoalProgress('earn_stars', stars);
      if (!usedHintThisLevel) {
        updateGoalProgress('no_hint_clear');
      }
      // 连续通关连击+1（通过 useDailyCheckin hook 统一管理）
      const { newCombo, totalCombo } = onNormalWin();
      // 检查连击里程碑成就
      checkAchievements(AchievementManager.checkComboAchievements(newCombo));
      // 检查累计连击成就
      checkAchievements(AchievementManager.checkTotalComboAchievements(totalCombo));
      // 检查每日目标成就
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
      // 连通过关表成就
      checkAchievements(AchievementManager.checkMilestoneAchievements(currentLevel));
      // 关卡探索者成就
      checkAchievements(AchievementManager.checkExplorerAchievements(newCompleted.length));
      // 色彩收藏家成就(根据关卡配置推断颜色数)
      const colorCount = currentLevel <= 3 ? 2 : currentLevel <= 6 ? 3 : currentLevel <= 12 ? 4 : currentLevel <= 20 ? 5 : currentLevel <= 30 ? 6 : currentLevel <= 50 ? 7 : currentLevel <= 70 ? 8 : currentLevel <= 90 ? 9 : 10;
      checkAchievements(AchievementManager.checkColorMasterAchievements(colorCount));
    }

    // 检查步数表成就
    const updatedStats = StatsTracker.get();
    checkAchievements(AchievementManager.checkTotalMovesAchievements(updatedStats.totalMoves));
    // 检查速度成就(仅普通模式、步数 > 0 且用时 > 0)
    // 修复:原条件未排除 isWeeklyMode,周挑战会误触发速度成就
    if (!isDailyMode && !isEndlessMode && !isTimedMode && !isWeeklyMode && playTimeSec > 0) {
      checkAchievements(AchievementManager.checkSpeedAchievements(playTimeSec));
    }
    // 检查满星成就
    checkAchievements(AchievementManager.checkPerfectStarAchievements(updatedStats.perfectLevels));

    // 胜利时清除自动存档
    clearAutosave();

    // 每日挑战完成处理
    if (isDailyMode) {
      saveDailyRecord({ date: getTodayString(), completed: true, moves: winMoves });
      setDailyCompletedToday(true);
      // 添加到本地排行榜
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
      // 无尽模式里程碑奖励：每过5关奖励1个提示道具，增强留存动力
      if (newScore > 0 && newScore % 5 === 0) {
        addHints(1);
        // 显示里程碑奖励提示
        setGoalClaimToast(`🎉 无尽模式 ${newScore} 关里程碑！奖励 +1 提示道具`);
        setTimeout(() => setGoalClaimToast(null), 3000);
      }
    }
    // 限时模式完成处理
    if (isTimedMode) {
      const newScore = timedScore + 1;
      // 修复:原代码在此 setTimedScore(newScore),timedScore 是 GameBoard 的 prop 且在其 useEffect 依赖中,
      // timedScore 变化触发 GameBoard 重新生成关卡(setIsWon(false)),胜利弹窗 500ms 后消失
      // 现仅更新最高分,timedScore 累加交给用户点击"下一关"时的 handleNextLevelAction
      if (newScore > timedHighScore) {
        updateTimedScore(newScore);
      }
      checkAchievements(AchievementManager.checkTimedAchievements(newScore));
      // 限时模式里程碑奖励：每过5关奖励1个提示道具，与无尽模式保持一致的留存激励
      if (newScore > 0 && newScore % 5 === 0) {
        addHints(1);
        setGoalClaimToast(`🎉 限时模式 ${newScore} 关里程碑！奖励 +1 提示道具`);
        setTimeout(() => setGoalClaimToast(null), 3000);
      }
    }
   } catch (e) {
     // 动态导入或状态更新失败时，避免静默吞错导致游戏状态不一致
     console.error('handleWin error:', e);
   }
  }, [progress, currentLevel, usedHintThisLevel, recoveredFromDeadlock, isDailyMode, isEndlessMode, endlessScore, isTimedMode, timedScore, isWeeklyMode]);

  // 胜利时清除自动存档
  // 由handleWin 内部处理,不需要在游戏页面渲染时对 onWin 回调做额外处理


  // 注释: playTimeSec 不依赖步数变化,由回调参数获取

  const handleSelectLevel = (level: number) => {
    setCurrentLevel(level);
    setPage('game');
    saveRecent({ level, mode: 'normal', timestamp: Date.now() });
    setRecentPlay({ level, mode: 'normal', timestamp: Date.now() });
  };

  const handleStartGame = () => {
    setCurrentLevel(progress.currentLevel);
    setPage('game');
    saveRecent({ level: progress.currentLevel, mode: 'normal', timestamp: Date.now() });
    setRecentPlay({ level: progress.currentLevel, mode: 'normal', timestamp: Date.now() });
    if (!hasSeenTutorial()) {
      setShowTutorial(true);
    }
  };

  const handleNextLevel = () => {
    setCurrentLevel(l => l + 1);
    setHintPair(null);
    setUsedHintThisLevel(false);
    setRecoveredFromDeadlock(false);
  };

  // 返回上一关(仅普通模式可减小关卡1)
  const handlePrevLevel = useCallback(() => {
    if (isDailyMode || isEndlessMode || isTimedMode || isWeeklyMode) return;
    setCurrentLevel(l => Math.max(1, l - 1));
    setHintPair(null);
    setUsedHintThisLevel(false);
    setRecoveredFromDeadlock(false);
  }, [isDailyMode, isEndlessMode, isTimedMode, isWeeklyMode]);

  const handleGoHome = () => {
    setPage('home');
    setHintPair(null);
    resetAllModes();
    setUsedHintThisLevel(false);
    setRecoveredFromDeadlock(false);
    // 清除自动存档
    clearAutosave();
    // 返回首页时重置连击（非通关返回不算连续）
    if (currentMoves > 0 && !isDailyMode && !isEndlessMode && !isTimedMode && !isWeeklyMode) {
      resetCombo();
    }
  };

  // 确认的返回首页:防止误退出
  const handleGoHomeWithConfirm = () => {
    if (currentMoves > 0 && !isDailyMode && !isEndlessMode && !isTimedMode && !isWeeklyMode) {
      if (!confirm('当前关卡进度将丢失,确认返回首页?')) return;
      StatsTracker.breakStreak();
    }
    handleGoHome();
  };

  const handleWeeklyChallenge = () => {
    startWeeklyMode(setCurrentLevel);
    setPage('game');
    setUsedHintThisLevel(false);
    setRecoveredFromDeadlock(false);
  };
  const handleDailyChallenge = () => {
    startDailyMode(setCurrentLevel);
    setPage('game');
    setUsedHintThisLevel(false);
    setRecoveredFromDeadlock(false);
  };

  const handleEndlessMode = () => {
    startEndlessMode(setCurrentLevel);
    setPage('game');
    setUsedHintThisLevel(false);
    setRecoveredFromDeadlock(false);
  };

  const handleTimedMode = () => {
    startTimedMode(setCurrentLevel);
    setPage('game');
    setUsedHintThisLevel(false);
    setRecoveredFromDeadlock(false);
  };

  const handleDeadlockRecover = useCallback(() => {
    setRecoveredFromDeadlock(true);
  }, []);

  // 下一关:每日/周挑战返回首页,无尽模式累加关,限时模式过下一关,普通模式过下一关
  const handleNextLevelAction = useCallback(() => {
    if (isDailyMode || isWeeklyMode) {
      // 每日挑战和周挑战为单局模式,通关后返回首页
      // 修复:原代码缺少 isWeeklyMode 分支,周挑战通关后会走 else 调用 handleNextLevel,
      // 导致 currentLevel 从 -4 递增为 -3(限时模式标识),引发状态混乱
      handleGoHome();
    } else if (isEndlessMode) {
      // 无尽模式关数+1,生成下一关,难度递增
      // 依赖 endlessScore 变化触发 GameBoard 的 useEffect 重置(无需改 level)
      // 注意:原代码 setCurrentLevel(l => l - 1) 会把 -2 递减成 -3,误触发限时模式逻辑
      setEndlessScore(s => s + 1);
      setHintPair(null);
      setUsedHintThisLevel(false);
      setRecoveredFromDeadlock(false);
    } else if (isTimedMode) {
      // 限时模式过下一关,依赖 timedScore 变化触发重置
      setTimedScore(s => s + 1);
      setHintPair(null);
      setUsedHintThisLevel(false);
      setRecoveredFromDeadlock(false);
    } else {
      handleNextLevel();
    }
  }, [isDailyMode, isEndlessMode, isTimedMode, isWeeklyMode]);

  const dismissAchievement = useCallback(() => {
    setNewAchievements(prev => prev.slice(1));
  }, []);

  // handleShare 和 handleReplayShare 已移入 useReplayShare hook

  // 回放视频导出（通过 useReplayVideo hook 提供）
  const handleExportReplayVideo = handleExportReplayVideoHook;

  // 播放自定关卡：hook 管理状态，App 管理页面跳转
  const onPlayCustomLevel = useCallback((level: CustomLevel) => {
    handlePlayCustomLevel(level);
    setPage('editor-play');
  }, [handlePlayCustomLevel]);

  const handleTutorialClose = () => {
    setShowTutorial(false);
    markTutorialSeen();
  };

  // 渲染首页
  if (page === 'home') {
    return (
      <HomeChrome
        onNavigate={(p) => setPage(p as any)}
        onShowHelp={() => setShowHelpModal(true)}
        dialogs={
          <HomeDialogs
          showResumeDialog={showResumeDialog}
          autosaveData={autosaveData}
          onResume={() => {
            if (autosaveData) {
              restoreFromAutosave(autosaveData, setCurrentLevel);
              setPage('game');
              setShowResumeDialog(false);
            }
          }}
          onDiscardAutosave={() => {
            setShowResumeDialog(false);
            clearAutosave();
          }}
          onCloseResume={() => setShowResumeDialog(false)}
          showTutorial={showTutorial}
          onTutorialClose={handleTutorialClose}
          showShareToast={showShareToast}
          newAchievements={newAchievements}
          onDismissAchievement={dismissAchievement}
          comboCelebration={comboCelebration}
          onCloseComboCelebration={() => setComboCelebration(null)}
          showPWAInstall={showPWAInstall}
          onClosePWAInstall={() => {
            setShowPWAInstall(false);
            dismissPWAInstall();
          }}
          showHelpModal={showHelpModal}
          onCloseHelp={() => setShowHelpModal(false)}
          showCheckinReward={showCheckinReward}
          checkinStreak={checkinStreak}
          announcements={announcements}
          showAnnouncements={showAnnouncements}
          showSavedRecipes={showSavedRecipes}
          savedRecipes={savedRecipes}
          onCheckinRewardClose={() => setShowCheckinReward(null)}
          onAnnouncementDismiss={handleDismissAnnouncement}
          onAnnouncementClose={handleCloseAnnouncements}
          onSavedRecipesClose={() => setShowSavedRecipes(false)}
          onGoToMixer={() => setPage('encyclopedia')}
          showChangelog={showChangelog}
          onCloseChangelog={() => setShowChangelog(false)}
          showViewReplay={showViewReplay}
          viewReplayData={viewReplayData}
          onGoToReplayLevel={() => {
            if (viewReplayData) {
              if (viewReplayData.level > 0) {
                handleSelectLevel(viewReplayData.level);
              }
              setShowViewReplay(false);
              setViewReplayData(null);
              window.location.hash = '';
            }
          }}
          onCloseViewReplay={handleCloseViewReplay}
        />
        }
      >
          <HomeTopSection
            checkinDone={checkinDone}
            checkinStreak={checkinStreak}
            checkinTotal={checkinTotal}
            onCheckin={handleCheckin}
            hintItems={hintItems}
            dailyGoals={dailyGoals}
            goalClaimToast={goalClaimToast}
            onClaimGoal={handleClaimGoal}
            comboStreak={comboStreak}
            progress={progress}
            levelStars={levelStars}
            recentPlay={recentPlay}
            dailyCompletedToday={dailyCompletedToday}
            endlessHighScore={endlessHighScore}
            onStartGame={handleStartGame}
            onDailyChallenge={handleDailyChallenge}
            onEndlessMode={handleEndlessMode}
            onTimedMode={handleTimedMode}
            onSelectLevel={handleSelectLevel}
            weeklyDisplay={weeklyDisplay}
            weeklyCompleted={weeklyCompleted}
            onWeeklyChallenge={handleWeeklyChallenge}
            weekendBonusInfo={weekendBonusInfo}
            onClaimWeekendBonus={handleClaimWeekendBonus}
          />

          {/* 每日内容区块：贴士+色彩知识+问答入口（提取为独立组件） */}
          <DailyContentSection onNavigateToEncyclopedia={() => setPage('encyclopedia')} />

          {/* 智能推荐区块：每日挑战+推荐关卡+推荐游玩+智能关卡（提取为独立组件） */}
          <SmartRecommendSection
            completedLevels={progress.completedLevels}
            levelStars={levelStars}
            currentLevel={progress.currentLevel}
            checkinDone={checkinDone}
            dailyCompletedToday={dailyCompletedToday}
            onStartGame={handleStartGame}
            onEndlessMode={handleEndlessMode}
            onDailyChallenge={handleDailyChallenge}
            onNavigateToEncyclopedia={() => setPage('encyclopedia')}
            onSelectLevel={handleSelectLevel}
          />

          <HomeStatsBar
            completedCount={progress.completedLevels.length}
            totalStars={Object.values(levelStars).reduce((a, b) => a + b, 0)}
            endlessHighScore={endlessHighScore}
          />

          {/* 通关进度条 + 关卡选择（提取为独立组件） */}
          <LevelSelectSection
            progress={progress}
            levelStars={levelStars}
            bestScores={bestScores}
            pageLevel={pageLevel}
            setPageLevel={setPageLevel}
            levelSearchInput={levelSearchInput}
            setLevelSearchInput={setLevelSearchInput}
            difficultyFilter={difficultyFilter}
            setDifficultyFilter={setDifficultyFilter}
            onSelectLevel={handleSelectLevel}
            progressCollapsed={progressCollapsed}
            setProgressCollapsed={setProgressCollapsed}
            levelSelectCollapsed={levelSelectCollapsed}
            setLevelSelectCollapsed={setLevelSelectCollapsed}
          />

          {/* 首页底部内容区块：自定关卡+广告+捐赠+FAQ+配方+成就（提取为独立组件） */}
          <HomeFooterSection
            customLevels={customLevels}
            onPlayCustomLevel={onPlayCustomLevel}
            onNavigateToEditor={() => setPage('editor')}
            onNavigateToAchievements={() => setPage('achievements')}
            onOpenSavedRecipes={openSavedRecipes}
          />

          {/* 快捷功能导航区 - 提升功能发现率与 SEO 内链 */}
          <QuickNavSection
            onNavigate={(p) => setPage(p as any)}
            onDailyChallenge={handleDailyChallenge}
            onShowHelp={() => setShowHelpModal(true)}
          />
      </HomeChrome>
    );
  }
  if (page === 'game') {
    return (
      <Suspense fallback={<PageLoading />}>
      <GamePageComponent
        currentLevel={currentLevel}
        endlessScore={endlessScore}
        timedScore={timedScore}
        timedDuration={TIMED_DURATION}
        bestScores={bestScores}
        comboStreak={comboStreak}
        isDailyMode={isDailyMode}
        isEndlessMode={isEndlessMode}
        isTimedMode={isTimedMode}
        isWeeklyMode={isWeeklyMode}
        hintPair={hintPair}
        hintItems={hintItems}
        newAchievements={newAchievements}
        showHelpModal={showHelpModal}
        showShareToast={showShareToast}
        showReplayVideoModal={showReplayVideoModal}
        replayVideoUrl={replayVideoUrl}
        replayThumbnail={replayThumbnail}
        generatingVideo={generatingVideo}
        currentTubesRef={currentTubesRef}
        onWin={handleWin}
        onMove={(m: number) => setMoves(m)}
        onReset={() => setMoves(0)}
        clearHint={() => setHintPair(null)}
        onNextLevel={handleNextLevelAction}
        onPrevLevel={handlePrevLevel}
        onGoHome={handleGoHome}
        onGoHomeWithConfirm={handleGoHomeWithConfirm}
        onShare={handleShare}
        onReplayShare={handleReplayShare}
        onExportVideo={handleExportReplayVideo}
        onHint={handleHint}
        onDeadlockRecover={handleDeadlockRecover}
        onAutoSave={autoSaveGame}
        setShowHelpModal={setShowHelpModal}
        dismissAchievement={dismissAchievement}
        setShowReplayVideoModal={setShowReplayVideoModal}
        setReplayVideoUrl={setReplayVideoUrl}
      />
      </Suspense>
    );
  }

  // 关于页
  if (page === 'about') {
    return <Suspense fallback={<PageLoading />}><AboutPage onBack={() => setPage('home')} /></Suspense>;
  }

  // 成就页
  if (page === 'achievements') {
    return <Suspense fallback={<PageLoading />}><AchievementsPage onBack={() => setPage('home')} /></Suspense>;
  }

  // 统计页
  if (page === 'stats') {
    // 成就检查已移至 useEffect(避免 render 阶段 setState)
    return <Suspense fallback={<PageLoading />}><StatsPage onBack={() => setPage('home')} timedHighScore={timedHighScore} /></Suspense>;
  }

  // 设置页
  if (page === 'settings') {
    return <Suspense fallback={<PageLoading />}><SettingsPage onBack={() => setPage('home')} /></Suspense>;
  }

  // 关卡编辑器页
  if (page === 'editor') {
    return <Suspense fallback={<PageLoading />}><LevelEditorPage
      onBack={() => setPage('home')}
      customLevels={customLevels}
      onPlay={onPlayCustomLevel}
      onDelete={handleDeleteCustomLevel}
      onSave={handleSaveCustomLevel}
      onImport={handleImportLevel}
    /></Suspense>;
  }

  // 自定关卡游玩页
  if (page === 'editor-play' && playingCustomLevel) {
    return (
      <div className="app">
        <header className="game-header">
          <button className="btn-back" onClick={() => { setPage('editor'); setPlayingCustomLevel(null); }}>← 返回</button>
          <h1 className="game-title">🎮 {playingCustomLevel.name}</h1>
          <div className="header-spacer" />
        </header>
        <main className="game-main">
          <Suspense fallback={<PageLoading />}>
          <CustomLevelPlayer
            level={playingCustomLevel}
            onWin={async (moves: number) => {
              // 更新自定关卡的通关状态（通过 useCustomLevels hook 管理）
              await handleCustomLevelWin(playingCustomLevel, moves);
            }}
            onShare={(code: string) => {
              // 剥离端口,避免经反向代理时泄漏内部端口
              const host = window.location.host.split(':')[0];
              const shareUrl = `${window.location.protocol}//${host}${window.location.pathname}#level=${code}`;
              const text = `🏆《色彩排序》编辑器创建了关卡「${playingCustomLevel.name}」,来挑战吧!\n关卡码:${code}\n或直接打开链接:${shareUrl}`;
              if (navigator.share) {
                navigator.share({ title: '色彩排序自定关卡', text });
              } else {
                navigator.clipboard.writeText(text).then(() => {
                  triggerShareToast();
                });
              }
            }}
            onGoHome={() => { setPage('editor'); setPlayingCustomLevel(null); }}
          />
          </Suspense>
        </main>
        {showShareToast && (
          <div className="share-toast">📋 关卡码信息已复制到剪贴板!</div>
        )}
      </div>
    );
  }

  // 隐私政策页
  if (page === 'privacy') {
    return <Suspense fallback={<PageLoading />}><PrivacyPage onBack={() => setPage('home')} /></Suspense>;
  }

  // 色彩百科页 — 使用 useEncyclopediaAchievements hook 统一管理成就回调
  if (page === 'encyclopedia') {
    return <Suspense fallback={<PageLoading />}><ColorEncyclopediaPage onBack={() => setPage('home')} onTestComplete={encyclopediaHooks.onTestComplete} onMixerUse={encyclopediaHooks.onMixerUse} onSequenceComplete={encyclopediaHooks.onSequenceComplete} onPairMatchComplete={encyclopediaHooks.onPairMatchComplete} onReactionComplete={encyclopediaHooks.onReactionComplete} onQuizComplete={encyclopediaHooks.onQuizComplete} onSearch={encyclopediaHooks.onSearch} onQuizShare={encyclopediaHooks.onQuizShare} onColorView={encyclopediaHooks.onColorView} onGamePlayed={encyclopediaHooks.onGamePlayed} /></Suspense>;
  }
}

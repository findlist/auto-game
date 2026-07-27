import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
// SoundEngine 懒加载代理（App.tsx 中仅少量音效调用，改为懒加载降低首屏 bundle）
import { SoundEngineLazy as SoundEngine } from './game/soundEngineLazy';
import { Tube } from './game/types';
import { AchievementManager, Achievement, EncyclopediaAchievementChecks } from './game/achievements';
// 提示道具相关导入已移入 useHint hook
// getHintItems 不再在 App.tsx 直接使用
// 游戏模式管理 hook（从 App.tsx 提取模式状态与切换逻辑）
import { useGameModes } from './game/useGameModes';
// 每日签到与目标 hook（从 App.tsx 提取签到、目标、连击逻辑）
import { useDailyCheckin } from './game/useDailyCheckin';
// 回放视频导出 hook（从 App.tsx 提取视频生成逻辑）
import { useReplayVideo } from './game/useReplayVideo';
// replayShare 函数改为动态导入，降低首屏 bundle 体积（已在 useReplayShare hook 内部管理）
import type { CustomLevel } from './game/levelEditor';
import { STORAGE_KEYS } from './game/storageKeys';
// 自定关卡管理 hook（从 App.tsx 提取自定关卡的增删改查逻辑）
import { useCustomLevels } from './game/useCustomLevels';
// 公告系统 hook（从 App.tsx 提取公告状态管理与已读标记）
import { useAnnouncements } from './game/useAnnouncements';
// 回放分享与查看 hook（从 App.tsx 提取回放链接生成、战绩分享、URL 回放解析）
import { useReplayShare } from './game/useReplayShare';
// 色彩混合配方管理 hook（从 App.tsx 提取配方加载与查看弹窗逻辑）
import { useSavedRecipes } from './game/useSavedRecipes';
// 提示功能 hook（从 App.tsx 提取提示道具检查、消耗、查找可操作试管逻辑）
import { useHint } from './game/useHint';
// 周末奖励管理 hook（从 App.tsx 提取周末奖励状态与领取逻辑）
import { useWeekendBonus } from './game/useWeekendBonus';
// 通关胜利处理 hook（从 App.tsx 提取：通关进度更新、星级保存、成就检查、统计记录、各模式完成处理）
import { useGameWin } from './game/useGameWin';
// 游戏导航 hook — 从 App.tsx 提取返回首页、下一关、上一关等导航逻辑
import { useGameNavigation } from './game/useGameNavigation';
// 自动存档 hook — 从 App.tsx 提取存档保存与清除逻辑
import { useAutosave } from './game/useAutosave';
import { canInstallPWA, isPWAInstallDismissed, dismissPWAInstall } from './game/pwaInstall';
import { loadRecent, saveRecent, RecentPlay, loadProgress, Progress, loadBestScores, hasSeenTutorial, markTutorialSeen, loadStars, loadAutosave, clearAutosave, AutosaveData } from './game/homeStorage';
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

  // 更新日志状态
  const [showChangelog, setShowChangelog] = useState(false);
  // 色彩混合配方管理 — 通过 useSavedRecipes hook 统一管理
  const {
    savedRecipes, showSavedRecipes,
    openSavedRecipes, closeSavedRecipes,
  } = useSavedRecipes();
  // 公告系统 — 通过 useAnnouncements hook 统一管理
  const {
    announcements, showAnnouncements,
    handleDismissAnnouncement, handleCloseAnnouncements,
    handleSkipAllAnnouncements,
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

  // 首页可折叠区域状态 — 从 localStorage 恢复用户折叠偏好，避免每次刷新都展开
  const [progressCollapsed, setProgressCollapsed] = useState(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.UI_PREFS) || '{}');
      return prefs.progressCollapsed ?? false;
    } catch { return false; }
  });
  const [levelSelectCollapsed, setLevelSelectCollapsed] = useState(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.UI_PREFS) || '{}');
      return prefs.levelSelectCollapsed ?? false;
    } catch { return false; }
  });
  const [difficultyFilter, setDifficultyFilter] = useState<string>(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.UI_PREFS) || '{}');
      return prefs.difficultyFilter ?? 'all';
    } catch { return 'all'; }
  });

  // 折叠状态与筛选偏好变化时持久化到 localStorage
  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.UI_PREFS) || '{}');
      prefs.progressCollapsed = progressCollapsed;
      prefs.levelSelectCollapsed = levelSelectCollapsed;
      prefs.difficultyFilter = difficultyFilter;
      localStorage.setItem(STORAGE_KEYS.UI_PREFS, JSON.stringify(prefs));
    } catch { /* 忽略 localStorage 异常 */ }
  }, [progressCollapsed, levelSelectCollapsed, difficultyFilter]);

  // 提示功能 — 通过 useHint hook 统一管理提示道具检查、消耗、查找可操作试管
  // currentTubesRef 由 GameBoard 与 useHint 共享，用于读取当前试管状态
  const currentTubesRef = useRef<Tube[] | null>(null);

  // 提示功能 hook（依赖 consumeHint 与 setUsedHintThisLevel，需在其定义之后调用）
  const { hintPair, setHintPair, clearHint, handleHint } = useHint(
    currentTubesRef, consumeHint, setUsedHintThisLevel
  );

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
    const currentVersion = '1.54.0';
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

  // 自动保存 — 通过 useAutosave hook 统一管理
  const { autoSaveGame } = useAutosave();

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

  // 周末奖励 — 通过 useWeekendBonus hook 统一管理
  const {
    weekendBonusInfo,
    handleClaimWeekendBonus,
  } = useWeekendBonus();

  // 通关胜利处理 — 通过 useGameWin hook 统一管理
  // 包含：通关进度更新、星级保存、成就检查、统计记录、各模式完成处理
  const { handleWin } = useGameWin(
    progress, currentLevel, usedHintThisLevel, recoveredFromDeadlock,
    {
      isDailyMode, isEndlessMode, isTimedMode, isWeeklyMode,
      endlessScore, timedScore, timedHighScore,
    },
    {
      setProgress, setBestScores, setLevelStars,
      setDailyCompletedToday, updateEndlessScore, updateTimedScore,
      updateWeeklyAfterCompletion, checkAchievements, onNormalWin, addHints, setGoalClaimToast,
    }
  );
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

  // 导航逻辑 — 通过 useGameNavigation hook 统一管理
  // 包含：返回首页、确认返回、下一关、上一关、模式感知的下一关动作
  const {
    handleGoHome,
    handleGoHomeWithConfirm,
    handlePrevLevel,
    handleNextLevelAction,
  } = useGameNavigation({
    isDailyMode, isEndlessMode, isTimedMode, isWeeklyMode,
    setPage, setHintPair, setUsedHintThisLevel, setRecoveredFromDeadlock,
    setCurrentLevel, setEndlessScore, setTimedScore,
    resetAllModes, resetCombo, currentMoves,
  });

  // 统一模式启动函数 — 4种模式启动逻辑结构一致，合并消除重复代码
  const startGameMode = useCallback((startFn: (setCurrentLevel: React.Dispatch<React.SetStateAction<number>>) => void) => {
    startFn(setCurrentLevel);
    setPage('game');
    setUsedHintThisLevel(false);
    setRecoveredFromDeadlock(false);
  }, []);

  const handleWeeklyChallenge = useCallback(() => startGameMode(startWeeklyMode), [startGameMode, startWeeklyMode]);
  const handleDailyChallenge = useCallback(() => startGameMode(startDailyMode), [startGameMode, startDailyMode]);
  const handleEndlessMode = useCallback(() => startGameMode(startEndlessMode), [startGameMode, startEndlessMode]);
  const handleTimedMode = useCallback(() => startGameMode(startTimedMode), [startGameMode, startTimedMode]);

  const handleDeadlockRecover = useCallback(() => {
    setRecoveredFromDeadlock(true);
  }, []);

  // handleNextLevelAction 已移入 useGameNavigation hook

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
          onAnnouncementSkipAll={handleSkipAllAnnouncements}
          onSavedRecipesClose={closeSavedRecipes}
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
        clearHint={clearHint}
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

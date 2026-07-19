import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
// GameBoard 已移入 GamePageComponent
import { canPour } from './game/levelGenerator';
import { SoundEngine } from './game/soundEngine';
import { Tube } from './game/types';
import { AchievementManager, Achievement } from './game/achievements';
import { hasCompletedDailyToday, getTodayString, saveDailyRecord } from './game/dailyChallenge';
import { addDailyLeaderboardEntry, getTodayLeaderboard } from './game/dailyLeaderboard';
import { getEndlessHighScore, saveEndlessScore } from './game/levelGenerator';
import { StatsTracker } from './game/statsTracker';
import { DailyCheckin } from './game/dailyCheckin';
import { getHintItems, useHintItem, addHintItems, claimDailyHintBonus, MAX_HINT_ITEMS } from './game/hintItems';
import type { ReplayData } from './game/replayShare';
// replayShare 函数改为动态导入，降低首屏 bundle 体积
const replayShareModule = () => import('./game/replayShare');
import { getAdaptiveRecommendation } from './game/adaptiveDifficulty';
import { getDailyRecommend } from './game/dailyRecommend';
// weeklyChallenge 数据函数从轻量数据模块静态导入（不含关卡生成依赖）
import { getWeeklyInfo, getWeeklyRecord, getWeeklyStreak, saveWeeklyRecord } from './game/weeklyChallengeData';
import { getUnreadAnnouncements, markAnnouncementRead, Announcement, getTodayTip, getAllDailyTips, getTodayColorKnowledge, getTodayColorQuiz, getDailyQuizHistory, getQuizStreak } from './game/announcements';
import type { CustomLevel } from './game/levelEditor';
// levelEditor 函数改为动态导入，降低首屏 bundle 体积（仅在用户操作自定关卡时加载）
const levelEditorModule = () => import('./game/levelEditor');
// replayVideo 改为动态导入，降低首屏 bundle 体积（仅在用户导出回放视频时加载）
const replayVideoModule = () => import('./game/replayVideo');
import { STORAGE_KEYS } from './game/storageKeys';
import { recordPlayedMode, getPlayedModes } from './game/playedModes';
import { claimWeekendBonus, getWeekendBonusInfo } from './game/weekendBonus';
import { GameSettings } from './game/settings';
import { canInstallPWA, triggerPWAInstall, isPWAInstallDismissed, dismissPWAInstall } from './game/pwaInstall';
import { loadRecent, saveRecent, RecentPlay, loadProgress, saveProgress, Progress, loadBestScores, saveBestScore, hasSeenTutorial, markTutorialSeen, loadStars, saveStars, loadAutosave, saveAutosave, clearAutosave, loadTimedHighScore, saveTimedHighScore, AutosaveData } from './game/homeStorage';
import { getDailyGoals, updateGoalProgress, claimGoalReward, getDailyGoalsProgress } from './game/dailyGoals';
import { DailyGoalsCard } from './components/DailyGoalsCard';
import { TodaySummaryCard } from './components/TodaySummaryCard';
import { GamePageComponent } from './components/GamePageComponent';
import { getComboStreak, incrementComboStreak, resetComboStreak, checkComboCelebration, addTotalComboCount, getTotalComboCount, ComboCelebration } from './game/comboStreak';
// 懒加载非首屏页面组件,减小首屏 bundle 大小
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const StatsPage = lazy(() => import('./pages/StatsPage').then(m => ({ default: m.StatsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const LevelEditorPage = lazy(() => import('./pages/LevelEditorPage').then(m => ({ default: m.LevelEditorPage })));
// 懒加载更新日志和FAQ组件,降低首屏 bundle 体积
const ChangelogModal = lazy(() => import('./components/ChangelogModal'));
const FaqList = lazy(() => import('./components/FaqList'));
// 首页弹窗（签到奖励、公告、配方查看）懒加载，降低首屏 bundle 体积
const HomeModals = lazy(() => import('./components/HomeModals'));
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
const LEVELS_PER_PAGE = 20; // 关卡选择每页显示数量

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [currentLevel, setCurrentLevel] = useState(progress.currentLevel);
  const [hintPair, setHintPair] = useState<[number, number] | null>(null);
  const [bestScores, setBestScores] = useState<Record<number, number>>(loadBestScores);
  const [currentMoves, setMoves] = useState(0);
  const [showTutorial, setShowTutorial] = useState(!hasSeenTutorial());
  const [showShareToast, setShowShareToast] = useState(false);
  const [levelStars, setLevelStars] = useState<Record<number, number>>(loadStars);
  const [pageLevel, setPageLevel] = useState(0); // 关卡选择当前页
  const [recentPlay, setRecentPlay] = useState<RecentPlay | null>(loadRecent);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [autosaveData, setAutosaveData] = useState<AutosaveData | null>(null);
  const [showPWAInstall, setShowPWAInstall] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [levelSearchInput, setLevelSearchInput] = useState('');

  // 每日签到状态
  const [checkinDone, setCheckinDone] = useState(DailyCheckin.hasCheckedToday());
  const [checkinStreak, setCheckinStreak] = useState(DailyCheckin.getCurrentStreak());
  const [checkinTotal, setCheckinTotal] = useState(DailyCheckin.getTotalDays());
  const [showCheckinReward, setShowCheckinReward] = useState<string | null>(null);
  const [hintItems, setHintItemsState] = useState(getHintItems());

  // 每日目标状态
  const [dailyGoals, setDailyGoals] = useState(getDailyGoals());
  const [goalClaimToast, setGoalClaimToast] = useState<string | null>(null);

  // 连击计数器状态
  const [comboStreak, setComboStreak] = useState(getComboStreak());
  // 连击里程碑庆祝弹窗
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
  // 回放查看状态(从 URL 哈希打开)
  const [viewReplayData, setViewReplayData] = useState<ReplayData | null>(null);
  const [showViewReplay, setShowViewReplay] = useState(false);

  // 公告系统状态
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncements, setShowAnnouncements] = useState(false);

  // 自定关卡状态
  const [customLevels, setCustomLevels] = useState<CustomLevel[]>(() => {
    // 懒初始化：避免首屏直接加载 levelEditor 模块
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_LEVELS);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [playingCustomLevel, setPlayingCustomLevel] = useState<CustomLevel | null>(null);

  // 回放视频导出状态
  const [showReplayVideoModal, setShowReplayVideoModal] = useState(false);
  const [replayVideoUrl, setReplayVideoUrl] = useState('');
  const [replayThumbnail, setReplayThumbnail] = useState('');
  const [generatingVideo, setGeneratingVideo] = useState(false);

  // 首页可折叠区域状态
  const [progressCollapsed, setProgressCollapsed] = useState(false);
  const [levelSelectCollapsed, setLevelSelectCollapsed] = useState(false);
  const [faqCollapsed, setFaqCollapsed] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all'); // 关卡难度筛选
  // 每日贴士手动浏览:支持点击切换上一篇/下一篇
  const ALL_TIPS = getAllDailyTips();
  const [tipIndex, setTipIndex] = useState(() => {
    const todayTip = getTodayTip();
    return ALL_TIPS.findIndex(t => t.title === todayTip.title);
  });

  // 内部提示功能:获取当前游戏状态
  const currentTubesRef = useRef<Tube[] | null>(null);

  // 初始化时检查是否有自动存档
  useEffect(() => {
    // 每次首次登录领取1个提示道具
    const bonus = claimDailyHintBonus();
    if (bonus.claimed) {
      setHintItemsState(bonus.total);
    }
    const saved = loadAutosave();
    if (saved && saved.level && saved.moves > 0 && !saved.isWon) {
      setAutosaveData(saved);
      setShowResumeDialog(true);
    }

    // 新版本更新,显示更新日志
    const CHANGELOG_KEY = STORAGE_KEYS.CHANGELOG_VERSION;
    const currentVersion = '1.41.0';
    try {
      const lastVersion = localStorage.getItem(CHANGELOG_KEY);
      if (lastVersion !== currentVersion) {
        setShowChangelog(true);
        localStorage.setItem(CHANGELOG_KEY, currentVersion);
      }
    } catch (e) { /* 忽略 */ }

    // 检查 URL 是否携带回放数据（动态导入避免首屏加载 replayShare 模块）
    replayShareModule().then(({ parseReplayFromUrl }) => {
      const replayData = parseReplayFromUrl();
      if (replayData) {
        setViewReplayData(replayData);
        setShowViewReplay(true);
      }
    });

    // 加载周挑战展示信息（静态导入，轻量数据模块）
    {
      const info = getWeeklyInfo();
      const record = getWeeklyRecord();
      const streak = getWeeklyStreak();
      setWeeklyDisplay({
        week: info.week,
        recordMoves: record?.moves,
        recordStars: record?.stars,
        streak: streak.currentStreak,
      });
    }

    // 加载未读公告
    const unread = getUnreadAnnouncements();
    if (unread.length > 0) {
      setAnnouncements(unread);
      setShowAnnouncements(true);
    }
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

  // 修复 P1:原代码在 render 阶段调用 setNewAchievements,违反 React 纯渲染原则
  // 可能导致 "Cannot update a component while rendering" 警告甚至无限重渲染
  // 改为在 useEffect 中根据 page 变化触发成就检查
  useEffect(() => {
    if (page === 'stats') {
      const statsAchievements = AchievementManager.checkStatsViewerAchievements();
      if (statsAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...statsAchievements]);
      }
    } else if (page === 'encyclopedia') {
      const encyclopediaAchievements = AchievementManager.checkEncyclopediaAchievements(progress.completedLevels.includes(100));
      if (encyclopediaAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...encyclopediaAchievements]);
      }
    }
  }, [page, progress.completedLevels]);

  // 自动保存当前游戏状态
  const autoSaveGame = useCallback((level: number, mode: string, moves: number, isWon: boolean, extra?: Record<string, number>) => {
    if (moves > 0 && !isWon) {
      saveAutosave({ level, mode, moves, isWon: false, ...extra } as AutosaveData);
    } else {
      clearAutosave();
    }
  }, []);

  // 每日挑战状态
  const [isDailyMode, setIsDailyMode] = useState(false);
  const [isEndlessMode, setIsEndlessMode] = useState(false);
  const [isTimedMode, setIsTimedMode] = useState(false);
  const [isWeeklyMode, setIsWeeklyMode] = useState(false);
  const [weeklyCompleted, setWeeklyCompleted] = useState<boolean>(() => {
    // 懒初始化：直接读 localStorage 避免首屏加载 weeklyChallenge 模块
    try {
      const raw = localStorage.getItem('color-sort-weekly-record');
      if (!raw) return false;
      const record = JSON.parse(raw);
      // 计算 ISO 周数
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
  // 周挑战展示信息（异步加载，避免首屏加载 weeklyChallenge 模块）
  const [weeklyDisplay, setWeeklyDisplay] = useState<{ week: number; recordMoves?: number; recordStars?: number; streak: number } | null>(null);
  const [timedScore, setTimedScore] = useState(0);
  const [timedHighScore, setTimedHighScore] = useState(() => loadTimedHighScore());
  const [endlessScore, setEndlessScore] = useState(0);
  const [endlessHighScore, setEndlessHighScore] = useState(getEndlessHighScore());
  const [dailyCompletedToday, setDailyCompletedToday] = useState(hasCompletedDailyToday());

  // 成就系统
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [usedHintThisLevel, setUsedHintThisLevel] = useState(false);
  const [recoveredFromDeadlock, setRecoveredFromDeadlock] = useState(false);

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
    const success = useHintItem();
    if (!success) {
      SoundEngine.error();
      return;
    }
    setHintItemsState(getHintItems());
    SoundEngine.resume();
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
    if (newlyUnlocked.length > 0) {
      setNewAchievements(prev => [...prev, ...newlyUnlocked]);
    }

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
      // 连续通关连击+1
      const newCombo = incrementComboStreak();
      setComboStreak(newCombo);
      // 累计连击总数（用于成就判定）
      addTotalComboCount();
      // 检查是否触发连击里程碑庆祝弹窗
      const celebration = checkComboCelebration();
      if (celebration) {
        setComboCelebration(celebration);
        SoundEngine.win();
        // 3秒后自动关闭
        setTimeout(() => setComboCelebration(null), 3000);
      }
      // 检查连击里程碑成就
      const comboAchievements = AchievementManager.checkComboAchievements(newCombo);
      if (comboAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...comboAchievements]);
      }
      // 检查累计连击成就
      const totalComboAchievements = AchievementManager.checkTotalComboAchievements(getTotalComboCount());
      if (totalComboAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...totalComboAchievements]);
      }
      // 检查每日目标成就
      const goalProgress = getDailyGoalsProgress();
      const goalAchievements = AchievementManager.checkDailyGoalAchievements(goalProgress.completed, goalProgress.total);
      if (goalAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...goalAchievements]);
      }
    }
    if (isDailyMode) {
      updateGoalProgress('daily_challenge');
    }

    // 非胜利成就:仅普通模式胜利才累计普通连胜
    // 修复:原条件未排除 isWeeklyMode,周挑战通关会误触发普通连胜/里程碑/探索者/色彩成就
    if (!isDailyMode && !isEndlessMode && !isTimedMode && !isWeeklyMode) {
      const currentStreak = StatsTracker.get().currentStreak;
      const streakAchievements = AchievementManager.checkStreakAchievements(currentStreak);
      if (streakAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...streakAchievements]);
      }
      // 连通过关表成就
      const milestoneAchievements = AchievementManager.checkMilestoneAchievements(currentLevel);
      if (milestoneAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...milestoneAchievements]);
      }
      // 关卡探索者成就
      const explorerAchievements = AchievementManager.checkExplorerAchievements(newCompleted.length);
      if (explorerAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...explorerAchievements]);
      }
      // 色彩收藏家成就(根据关卡配置推断颜色数)
      const colorCount = currentLevel <= 3 ? 2 : currentLevel <= 6 ? 3 : currentLevel <= 12 ? 4 : currentLevel <= 20 ? 5 : currentLevel <= 30 ? 6 : currentLevel <= 50 ? 7 : currentLevel <= 70 ? 8 : currentLevel <= 90 ? 9 : 10;
      const colorAchievements = AchievementManager.checkColorMasterAchievements(colorCount);
      if (colorAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...colorAchievements]);
      }
    }

    // 检查步数表成就
    const updatedStats = StatsTracker.get();
    const moveAchievements = AchievementManager.checkTotalMovesAchievements(updatedStats.totalMoves);
    if (moveAchievements.length > 0) {
      setNewAchievements(prev => [...prev, ...moveAchievements]);
    }
    // 检查速度成就(仅普通模式、步数 > 0 且用时 > 0)
    // 修复:原条件未排除 isWeeklyMode,周挑战会误触发速度成就
    if (!isDailyMode && !isEndlessMode && !isTimedMode && !isWeeklyMode && playTimeSec > 0) {
      const speedAchievements = AchievementManager.checkSpeedAchievements(playTimeSec);
      if (speedAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...speedAchievements]);
      }
    }
    // 检查满星成就
    const perfectAchievements = AchievementManager.checkPerfectStarAchievements(updatedStats.perfectLevels);
    if (perfectAchievements.length > 0) {
      setNewAchievements(prev => [...prev, ...perfectAchievements]);
    }

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
      const dailyAchievements = AchievementManager.checkDailyAchievements();
      if (dailyAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...dailyAchievements]);
      }
    }
    // 周挑战完成处理
    if (isWeeklyMode) {
      saveWeeklyRecord(winMoves, playTimeSec, stars);
      setWeeklyCompleted(true);
      const weeklyStreak = getWeeklyStreak();
      // 更新首页周挑战展示信息
      const wInfo = getWeeklyInfo();
      setWeeklyDisplay({ week: wInfo.week, recordMoves: winMoves, recordStars: stars, streak: weeklyStreak.currentStreak });
      const weeklyAchievements = AchievementManager.checkWeeklyAchievements(weeklyStreak.currentStreak);
      if (weeklyAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...weeklyAchievements]);
      }
    }
    // 全能玩家成就检查:体验所有5种模式
    const allRoundAchievements = AchievementManager.checkAllRoundAchievements(getPlayedModes());
    if (allRoundAchievements.length > 0) {
      setNewAchievements(prev => [...prev, ...allRoundAchievements]);
    }
    // 无尽模式完成处理
    if (isEndlessMode) {
      const newScore = endlessScore + 1;
      saveEndlessScore(newScore);
      setEndlessHighScore(getEndlessHighScore());
      const endlessAchievements = AchievementManager.checkEndlessAchievements(newScore);
      if (endlessAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...endlessAchievements]);
      }
      // 无尽模式里程碑奖励：每过5关奖励1个提示道具，增强留存动力
      if (newScore > 0 && newScore % 5 === 0) {
        const bonus = addHintItems(1);
        setHintItemsState(bonus);
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
      saveTimedHighScore(newScore);
      if (newScore > timedHighScore) {
        setTimedHighScore(newScore);
      }
      const timedAchievements = AchievementManager.checkTimedAchievements(newScore);
      if (timedAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...timedAchievements]);
      }
      // 限时模式里程碑奖励：每过5关奖励1个提示道具，与无尽模式保持一致的留存激励
      if (newScore > 0 && newScore % 5 === 0) {
        const bonus = addHintItems(1);
        setHintItemsState(bonus);
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
    SoundEngine.resume();
    saveRecent({ level, mode: 'normal', timestamp: Date.now() });
    setRecentPlay({ level, mode: 'normal', timestamp: Date.now() });
  };

  const handleStartGame = () => {
    setCurrentLevel(progress.currentLevel);
    setPage('game');
    SoundEngine.resume();
    saveRecent({ level: progress.currentLevel, mode: 'normal', timestamp: Date.now() });
    setRecentPlay({ level: progress.currentLevel, mode: 'normal', timestamp: Date.now() });
    recordPlayedMode('normal');
    // 检查累计游玩天数成就 — 每次开始游戏时记录当日游玩
    const playDaysAchievements = AchievementManager.checkPlayDaysAchievements();
    if (playDaysAchievements.length > 0) {
      setNewAchievements(prev => [...prev, ...playDaysAchievements]);
    }
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
    setIsDailyMode(false);
    setIsEndlessMode(false);
    setIsTimedMode(false);
    setIsWeeklyMode(false);
    setUsedHintThisLevel(false);
    setRecoveredFromDeadlock(false);
    // 清除自动存档
    clearAutosave();
    // 返回首页时重置连击（非通关返回不算连续）
    if (currentMoves > 0 && !isDailyMode && !isEndlessMode && !isTimedMode && !isWeeklyMode) {
      resetComboStreak();
      setComboStreak(0);
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
    setIsWeeklyMode(true);
    setIsDailyMode(false);
    setIsEndlessMode(false);
    setIsTimedMode(false);
    setCurrentLevel(-4); // -4 表示周挑战
    setPage('game');
    SoundEngine.resume();
    setUsedHintThisLevel(false);
    setRecoveredFromDeadlock(false);
    recordPlayedMode('weekly');
  };
  const handleDailyChallenge = () => {
    setIsDailyMode(true);
    setIsEndlessMode(false);
    setCurrentLevel(-1); // -1 表示每日挑战
    setPage('game');
    SoundEngine.resume();
    setUsedHintThisLevel(false);
    setRecoveredFromDeadlock(false);
    recordPlayedMode('daily');
    // 检查累计游玩天数成就
    const playDaysAchievements = AchievementManager.checkPlayDaysAchievements();
    if (playDaysAchievements.length > 0) {
      setNewAchievements(prev => [...prev, ...playDaysAchievements]);
    }
  };

  const handleEndlessMode = () => {
    setIsEndlessMode(true);
    setIsDailyMode(false);
    setIsTimedMode(false);
    setEndlessScore(0);
    setCurrentLevel(-2); // -2 表示无尽模式
    setPage('game');
    SoundEngine.resume();
    setUsedHintThisLevel(false);
    setRecoveredFromDeadlock(false);
    recordPlayedMode('endless');
    // 检查累计游玩天数成就
    const playDaysAchievements = AchievementManager.checkPlayDaysAchievements();
    if (playDaysAchievements.length > 0) {
      setNewAchievements(prev => [...prev, ...playDaysAchievements]);
    }
  };

  const handleTimedMode = () => {
    setIsTimedMode(true);
    setIsEndlessMode(false);
    setIsDailyMode(false);
    setTimedScore(0);
    setCurrentLevel(-3); // -3 表示限时模式
    setPage('game');
    SoundEngine.resume();
    setUsedHintThisLevel(false);
    setRecoveredFromDeadlock(false);
    recordPlayedMode('timed');
    // 检查累计游玩天数成就
    const playDaysAchievements = AchievementManager.checkPlayDaysAchievements();
    if (playDaysAchievements.length > 0) {
      setNewAchievements(prev => [...prev, ...playDaysAchievements]);
    }
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

  const handleShare = useCallback(async (moves: number, level: number) => {
    const text = level === -1
      ? `🎉《色彩排序》每日挑战只用${moves}步完成,来挑战这个关卡吧!👏`
      : level === -2
      ? `🎉《色彩排序》无尽模式连过${endlessScore + 1}关,来挑战吧!🔥🔥`
      : level === -3
      ? `🎉《色彩排序》限时模式${TIMED_DURATION}秒连过${timedScore + 1}关,来挑战吧!🔥🔥`
      : level === -4
      ? `🎉《色彩排序》本周周挑战只用${moves}步完成,来挑战吧!🏆`
      : `🎉《色彩排序》第${level}关只用${moves}步完成,来挑战吧!👏`
    try {
      if (navigator.share) {
        await navigator.share({ title: '色彩排序', text });
      } else {
        await navigator.clipboard.writeText(text);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      }
    } catch (e) {
      // 用户取消或分享失败,尝试备用方案
      try {
        await navigator.clipboard.writeText(text);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      } catch (e2) { /* 忽略 */ }
    }
  }, [endlessScore, timedScore]);

  // 回放分享:生成回放链接和导出视频的处理
  const handleReplayShare = useCallback(async (moveHistory: Array<{ from: number; to: number }>, level: number, stars: number, stepsUsed: number) => {
    const { generateReplayUrl, formatReplayShareText } = await replayShareModule();
    const replayData: ReplayData = { level, moves: moveHistory, starRating: stars, stepsUsed };
    // 修复 P0:encodeReplay 在 from/to 越界(>=36)时会抛错,需捕获降级,避免 UI 崩溃
    let url = '';
    let text = '';
    try {
      url = generateReplayUrl(replayData);
      text = formatReplayShareText(replayData) + `\n${url}`;
    } catch (e) {
      // 编码失败(步骤索引越界),仅使用文案分享
      text = formatReplayShareText(replayData);
    }
    try {
      if (navigator.share) {
        await navigator.share({ title: '色彩排序回放', text, url });
      } else {
        await navigator.clipboard.writeText(text);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      }
    } catch (e) {
      try {
        await navigator.clipboard.writeText(text);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      } catch (e2) { /* 忽略 */ }
    }
  }, []);

  // 回放视频导出
  const handleExportReplayVideo = useCallback(async (moveHistory: Array<{ from: number; to: number }>, levelData: { tubes: Tube[]; tubeCapacity: number }, level: number, stars: number, stepsUsed: number) => {
    setGeneratingVideo(true);
    setShowReplayVideoModal(true);
    try {
      // 动态导入回放视频模块，避免首屏加载此大模块
      const { generateReplayVideo, generateReplayThumbnail } = await replayVideoModule();
      // 先生成缩略图
      const thumb = generateReplayThumbnail({
        tubes: levelData.tubes,

        moves: moveHistory,
        level,
        stars,
        stepsUsed,
      });
      setReplayThumbnail(thumb);

      // 生成视频
      const url = await generateReplayVideo({
        tubes: levelData.tubes,

        moves: moveHistory,
        level,
        stars,
        stepsUsed,
      });
      setReplayVideoUrl(url);
    } catch (e) {
      // 视频失败时使用缩略图
      const { generateReplayThumbnail } = await replayVideoModule();
      const thumb = generateReplayThumbnail({
        tubes: levelData.tubes,

        moves: moveHistory,
        level,
        stars,
        stepsUsed,
      });
      setReplayThumbnail(thumb);
    }
    setGeneratingVideo(false);
  }, []);

  // 关闭公告
  const handleDismissAnnouncement = useCallback((id: string) => {
    markAnnouncementRead(id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    if (announcements.length <= 1) {
      setShowAnnouncements(false);
    }
  }, [announcements.length]);

  // 播放自定关卡
  const handlePlayCustomLevel = useCallback((level: CustomLevel) => {
    setPlayingCustomLevel(level);
    setPage('editor-play');
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

  // 导入关卡码
  const handleImportLevel = useCallback(async (code: string) => {
    const { importLevelCode, saveCustomLevel, getCustomLevels } = await levelEditorModule();
    const level = importLevelCode(code);
    if (level) {
      saveCustomLevel(level);
      setCustomLevels(getCustomLevels());
      return true;
    }
    return false;
  }, []);

  const handleTutorialClose = () => {
    setShowTutorial(false);
    markTutorialSeen();
  };

  // 每日签到
  const handleCheckin = () => {
    SoundEngine.resume();
    const result = DailyCheckin.checkin();
    if (result.success) {
      setCheckinDone(true);
      setCheckinStreak(result.newStreak);
      setCheckinTotal(result.totalDays);
      SoundEngine.win();
      // 签到奖励中含提示道具时实际发放效果
      if (result.rewardUnlocked && result.rewardUnlocked.includes('提示道具')) {
        const newTotal = addHintItems(1);
        setHintItemsState(newTotal);
      }
      if (result.rewardUnlocked) {
        setShowCheckinReward(result.rewardUnlocked);
      }
      // 检查签到成就
      const checkinAchievements = AchievementManager.checkCheckinAchievements(result.newStreak, result.totalDays);
      if (checkinAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...checkinAchievements]);
      }
    }
  };

  // 渲染首页
  if (page === 'home') {
    return (
      <div className="app">
        <a href="#main-content" className="sr-only">跳转到主要内容</a>
        <header className="home-header">
          <div className="header-controls">
            <button className="sound-toggle-btn" onClick={() => {
              const newSound = GameSettings.toggleSound();
              if (newSound) SoundEngine.click();
              // 关闭音效时同时停止背景音乐
              if (!newSound) SoundEngine.stopBGM();
            }} aria-label={GameSettings.getSound() ? '关闭音效' : '开启音效'} title={GameSettings.getSound() ? '关闭音效' : '开启音效'}>
              {GameSettings.getSound() ? '🔊' : '🔇'}
            </button>
            {/* BGM快捷切换 - 独立于音效开关，方便玩家随时切换背景音乐 */}
            <button className="sound-toggle-btn bgm-toggle-btn" onClick={() => {
              const newBgm = GameSettings.toggleBGM();
              if (newBgm) {
                SoundEngine.resume();
                SoundEngine.startBGM();
              } else {
                SoundEngine.stopBGM();
              }
            }} aria-label={GameSettings.getBGM() ? '关闭背景音乐' : '开启背景音乐'} title={GameSettings.getBGM() ? '关闭背景音乐' : '开启背景音乐'}>
              {GameSettings.getBGM() ? '🎵' : '🎵̸'}
            </button>
          </div>
          <div className="logo">🎨</div>
          <h1 className="title">色彩排序</h1>
          <p className="subtitle">经典好玩的颜色游戏</p>
          <p className="tagline">动动手指排列颜色吧!</p>
        </header>

        <main className="home-main" id="main-content">
          <div className="mode-entry">
          {/* 签到 + 提示道具 合并行 */}
          <div className="status-bar">
            <div className={`checkin-card checkin-card-compact ${checkinDone ? 'checkin-done' : ''}`}>
              <div className="checkin-info">
                <span className="checkin-icon">📅</span>
                <div className="checkin-text">
                  <span className="checkin-title">{checkinDone ? '已签到' : '签到'}</span>
                  <span className="checkin-streak">🔥{checkinStreak}天</span>
                </div>
              </div>
              {checkinDone ? (
                <span className="checkin-checked">✅</span>
              ) : (
                <button className="checkin-btn" onClick={handleCheckin}>签到</button>
              )}
            </div>
            <div className="hint-items-card hint-items-card-compact">
              <span className="hint-items-icon">💡</span>
              <div className="hint-items-info">
                <span className="hint-items-text">提示 <strong>{hintItems}</strong>/{MAX_HINT_ITEMS}</span>
                <span className="hint-items-tip">签到可领</span>
              </div>
            </div>
          </div>
          {/* 下一个签到奖励提示 */}
          {(() => {
            const next = DailyCheckin.getNextMilestone();
            if (!next) return null;
            return (
              <div className="checkin-milestone-hint">
                <span>{next.icon} 再签 {next.remaining} 天可得: {next.reward} · 累计{checkinTotal}天</span>
              </div>
            );
          })()}

          {/* 忽略 */}
          {recentPlay && progress.completedLevels.length > 0 && (
            <div className="recent-play-card" onClick={() => {
              if (recentPlay.mode === 'daily') handleDailyChallenge();
              else if (recentPlay.mode === 'endless') handleEndlessMode();
              else if (recentPlay.mode === 'timed') handleTimedMode();
              else handleSelectLevel(recentPlay.level);
            }}>
              <span className="recent-icon">▶️</span>
              <span className="recent-text">
                <span className="recent-label">继续上次</span>
                <span className="recent-level">
                  {recentPlay.mode === 'daily' ? '每日挑战' : recentPlay.mode === 'endless' ? '无尽模式' : recentPlay.mode === 'timed' ? '限时挑战' : `第 ${recentPlay.level} 关`}
                  <span className="recent-mode-tag">{
                    recentPlay.mode === 'daily' ? '📅' : recentPlay.mode === 'endless' ? '∞' : recentPlay.mode === 'timed' ? '⏱' : '🎯'
                  }</span>
                </span>
              </span>
              <span className="recent-arrow">→</span>
            </div>
          )}

          {/* 快速重玩上一关：让玩家可快速重玩最近通关的关卡，提升重玩率 */}
          {progress.completedLevels.length > 0 && (() => {
            const lastCompleted = progress.completedLevels[progress.completedLevels.length - 1];
            return (
              <div className="replay-last-card" onClick={() => { SoundEngine.click(); handleSelectLevel(lastCompleted); }} role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); SoundEngine.click(); handleSelectLevel(lastCompleted); } }}>
                <span className="replay-last-icon">🔄</span>
                <div className="replay-last-info">
                  <span className="replay-last-label">重玩上一关</span>
                  <span className="replay-last-detail">第 {lastCompleted} 关 · {levelStars[lastCompleted] ? '⭐'.repeat(levelStars[lastCompleted]) : '未评星'}</span>
                </div>
                <span className="replay-last-arrow">→</span>
              </div>
            );
          })()}

          {/* 今日概览卡片：展示当日游玩数据，提升首页信息密度 */}
          <TodaySummaryCard comboStreak={comboStreak} />

          {/* 每日目标卡片：增强日活留存，完成小目标领取提示道具奖励 */}
          <DailyGoalsCard goals={dailyGoals} onClaim={handleClaimGoal} claimToast={goalClaimToast} />

          {/* 游戏模式 2×2 网格 */}
          <div className="mode-grid">
            <button className="btn btn-primary mode-grid-btn" onClick={handleStartGame}>
              <span className="mode-grid-icon">🎯</span>
              <span className="mode-grid-label">{progress.currentLevel > 1 ? `继续游戏` : "开始游戏"}</span>
              <span className="mode-grid-sub">{progress.currentLevel > 1 ? `第${progress.currentLevel}关` : '100关闯关'}</span>
            </button>
            <button
              className={`btn mode-grid-btn ${dailyCompletedToday ? 'btn-daily-done' : 'btn-daily'}`}
              onClick={handleDailyChallenge}
            >
              <span className="mode-grid-icon">📅</span>
              <span className="mode-grid-label">{dailyCompletedToday ? "已完成" : "每日挑战"}</span>
              <span className="mode-grid-sub">{dailyCompletedToday && getTodayLeaderboard()[0] ? `最佳${getTodayLeaderboard()[0].moves}步` : '每天一题'}</span>
            </button>
            <button
              className="btn btn-endless mode-grid-btn"
              onClick={handleEndlessMode}
            >
              <span className="mode-grid-icon">∞</span>
              <span className="mode-grid-label">无尽模式</span>
              <span className="mode-grid-sub">每5关奖提示道具</span>
            </button>
            <button
              className="btn btn-timed mode-grid-btn"
              onClick={handleTimedMode}
            >
              <span className="mode-grid-icon">⏱</span>
              <span className="mode-grid-label">限时挑战</span>
              <span className="mode-grid-sub">120秒极限·每5关奖道具</span>
            </button>
          </div>

          {/* 周挑战入口 */}
          {weeklyDisplay && (() => {
            return (
              <div className={`weekly-challenge-banner ${weeklyCompleted ? 'weekly-done' : ''}`} onClick={() => { if (!weeklyCompleted) handleWeeklyChallenge(); }} role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!weeklyCompleted) handleWeeklyChallenge(); } }}>
                <div className="weekly-banner-icon">🏆</div>
                <div className="weekly-banner-content">
                  <span className="weekly-banner-title">{weeklyCompleted ? '本周挑战已完成' : `第${weeklyDisplay.week}周挑战`}</span>
                  <span className="weekly-banner-sub">
                    {weeklyCompleted && weeklyDisplay.recordMoves ? `✅ ${weeklyDisplay.recordMoves}步 · ${'⭐'.repeat(weeklyDisplay.recordStars || 0)}` : '高难度关卡,等你来战!'}
                    {weeklyDisplay.streak > 0 ? ` · 🔥${weeklyDisplay.streak}周连续` : ''}
                  </span>
                </div>
                {!weeklyCompleted && <span className="weekly-banner-arrow">→</span>}
              </div>
            );
          })()}

          {/* 周末奖励横幅 */}
          {weekendBonusInfo.isWeekend && (
            <div
              className={`weekend-bonus-banner ${weekendBonusInfo.claimed ? 'weekend-claimed' : ''}`}
              onClick={() => { if (!weekendBonusInfo.claimed) handleClaimWeekendBonus(); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!weekendBonusInfo.claimed) handleClaimWeekendBonus(); } }}
            >
              <div className="weekend-banner-icon">🎁</div>
              <div className="weekend-banner-content">
                <span className="weekend-banner-title">{weekendBonusInfo.claimed ? '周末奖励已领取' : '周末免费提示道具'}</span>
                <span className="weekend-banner-sub">
                  {weekendBonusInfo.claimed ? '明天再来吧~' : '点击领取 1 个提示道具'}
                  {weekendBonusInfo.totalClaimed > 0 ? ` · 累计领取${weekendBonusInfo.totalClaimed}次` : ''}
                </span>
              </div>
              {!weekendBonusInfo.claimed && <span className="weekend-banner-arrow">→</span>}
            </div>
          )}

          {progress.currentLevel > 1 && (
            <button className="btn btn-secondary" onClick={() => handleSelectLevel(1)}>
              🔄 从头开始
            </button>
          )}
          </div>

          {/* 每日策略小贴士 - 支持手动切换浏览 */}
          {(() => {
            const tip = ALL_TIPS[tipIndex] || ALL_TIPS[0];
            return (
              <div className="daily-tip-card">
                <span className="daily-tip-icon">{tip.icon}</span>
                <div className="daily-tip-content">
                  <span className="daily-tip-label">💡 小贴士 {tipIndex + 1}/{ALL_TIPS.length}</span>
                  <span className="daily-tip-title">{tip.title}</span>
                  <span className="daily-tip-text">{tip.content}</span>
                </div>
                <div className="daily-tip-nav">
                  <button className="daily-tip-nav-btn" onClick={() => { SoundEngine.click(); setTipIndex(i => (i - 1 + ALL_TIPS.length) % ALL_TIPS.length); }} aria-label="上一条">←</button>
                  <button className="daily-tip-nav-btn" onClick={() => { SoundEngine.click(); setTipIndex(i => (i + 1) % ALL_TIPS.length); }} aria-label="下一条">→</button>
                </div>
              </div>
            );
          })()}

          {/* 每日色彩知识 */}
          {(() => {
            const knowledge = getTodayColorKnowledge();
            return (
              <div className="daily-color-knowledge-card" onClick={() => setPage('encyclopedia')} role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPage('encyclopedia'); } }}>
                <span className="daily-color-knowledge-emoji">{knowledge.emoji}</span>
                <div className="daily-color-knowledge-content">
                  <span className="daily-color-knowledge-label">🎨 每日色彩知识</span>
                  <span className="daily-color-knowledge-title">{knowledge.name}</span>
                  <span className="daily-color-knowledge-text">{knowledge.text}</span>
                </div>
                <span className="daily-color-knowledge-arrow">→</span>
              </div>
            );
          })()}

          {/* 每日色彩问答入口卡片 */}
          {(() => {
            const quiz = getTodayColorQuiz();
            const history = getDailyQuizHistory();
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const answeredToday = history.some(h => h.dayIndex === quiz.dayIndex && h.date === todayStr);
            const correctCount = history.filter(h => h.correct).length;
            const quizStreak = getQuizStreak();
            // 连续答题里程碑提示
            const nextMilestone = quizStreak < 3 ? 3 : quizStreak < 7 ? 7 : quizStreak < 14 ? 14 : quizStreak < 30 ? 30 : quizStreak < 50 ? 50 : null;
            const milestoneEmoji = quizStreak >= 30 ? '🏆' : quizStreak >= 14 ? '💎' : quizStreak >= 7 ? '🔥' : quizStreak >= 3 ? '⭐' : '';
            return (
              <div className={`daily-quiz-entry-card ${!answeredToday ? 'quiz-unanswered' : ''}`} onClick={() => setPage('encyclopedia')} role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPage('encyclopedia'); } }}>
                <span className="daily-quiz-entry-icon">{answeredToday ? '✅' : '📝'}</span>
                <div className="daily-quiz-entry-content">
                  <span className="daily-quiz-entry-label">📚 每日色彩问答 {quizStreak > 0 && <span className="quiz-streak-badge">{milestoneEmoji} 连续{quizStreak}天</span>}</span>
                  <span className="daily-quiz-entry-title">{answeredToday ? '今日已答题' : quiz.question}</span>
                  <span className="daily-quiz-entry-sub">{answeredToday ? `累计正确 ${correctCount}/${history.length} 题${nextMilestone ? ` · 再答${nextMilestone - quizStreak}天解锁新徽章` : ''}` : '点击进入答题,每天一题涨知识!'}</span>
                </div>
                <span className="daily-quiz-entry-arrow">→</span>
              </div>
            );
          })()}

          {/* 每日挑战醒目入口 - 未完成时展示 */}
          {!dailyCompletedToday && (
            <div className="daily-challenge-banner" onClick={handleDailyChallenge} role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDailyChallenge(); } }}>
              <div className="daily-banner-icon">📅</div>
              <div className="daily-banner-content">
                <span className="daily-banner-title">今日挑战未完成</span>
                <span className="daily-banner-sub">每天一题,等你来解!</span>
              </div>
              <span className="daily-banner-arrow">→</span>
            </div>
          )}

          {/* 每日推荐关卡 - 基于日期种子推荐重玩 */}
          {(() => {
            const dailyRec = getDailyRecommend(progress.completedLevels, levelStars, progress.currentLevel);
            if (!dailyRec) return null;
            return (
              <div className="daily-recommend-card" onClick={() => handleSelectLevel(dailyRec.level)} role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectLevel(dailyRec.level); } }}>
                <span className="daily-rec-icon">{dailyRec.icon}</span>
                <div className="daily-rec-info">
                  <span className="daily-rec-label">📌 今日推荐</span>
                  <span className="daily-rec-detail">第 {dailyRec.level} 关 · {dailyRec.reason}</span>
                </div>
                <span className="daily-rec-arrow">→</span>
              </div>
            );
          })()}

          {/* 智能推荐游玩模式 - 基于历史游玩模式和时间推荐不同玩法 */}
          {(() => {
            // 基于已玩游戏模式和当前状态推荐游玩内容
            const hour = new Date().getHours();
            const stats = StatsTracker.get();
            let recommendGame = { icon: '🎨', label: '今日推荐游玩', title: '色彩百科', desc: '探索色彩知识,玩迷你游戏', target: 'encyclopedia' as Page };
            // 根据时段和游玩历史智能推荐
            if (hour >= 6 && hour < 12) {
              // 早上:推荐每日问答或签到
              if (!checkinDone) {
                recommendGame = { icon: '📅', label: '今日推荐游玩', title: '每日签到', desc: '签到领取提示道具奖励', target: 'home' as Page };
              } else {
                recommendGame = { icon: '📚', label: '今日推荐游玩', title: '每日色彩问答', desc: '每天一题,涨色彩知识', target: 'encyclopedia' as Page };
              }
            } else if (hour >= 12 && hour < 18) {
              // 下午:推荐闯关或无尽模式
              if (stats.totalWins < 5) {
                recommendGame = { icon: '🎯', label: '今日推荐游玩', title: '经典闯关', desc: '挑战100关色彩排序', target: 'game' as Page };
              } else {
                recommendGame = { icon: '∞', label: '今日推荐游玩', title: '无尽模式', desc: '难度无限递增,挑战极限', target: 'home' as Page };
              }
            } else if (hour >= 18 && hour < 23) {
              // 晚上:推荐百科小游戏或每日挑战
              if (!dailyCompletedToday) {
                recommendGame = { icon: '📅', label: '今日推荐游玩', title: '每日挑战', desc: '今天还没做每日挑战哦', target: 'home' as Page };
              } else {
                recommendGame = { icon: '🧠', label: '今日推荐游玩', title: '色彩记忆配对', desc: '翻开卡片找到相同颜色', target: 'encyclopedia' as Page };
              }
            } else {
              // 深夜:推荐序列记忆或辨识测试
              recommendGame = { icon: '🎵', label: '今日推荐游玩', title: '色彩序列记忆', desc: '安静时段适合锻炼记忆力', target: 'encyclopedia' as Page };
            }
            // 如果推荐目标不是当前页面,则显示卡片
            if (recommendGame.target === 'home' && recommendGame.title === '每日签到' && checkinDone) return null;
            if (recommendGame.target === 'home' && recommendGame.title === '每日挑战' && dailyCompletedToday) return null;
            return (
              <div className="smart-recommend-card" onClick={() => {
                if (recommendGame.target === 'game') handleStartGame();
                else if (recommendGame.target === 'encyclopedia') setPage('encyclopedia');
                else if (recommendGame.title === '无尽模式') handleEndlessMode();
                else if (recommendGame.title === '每日挑战') handleDailyChallenge();
              }} role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (recommendGame.target === 'game') handleStartGame(); else if (recommendGame.target === 'encyclopedia') setPage('encyclopedia'); else if (recommendGame.title === '无尽模式') handleEndlessMode(); else if (recommendGame.title === '每日挑战') handleDailyChallenge(); } }}>
                <span className="smart-rec-icon">{recommendGame.icon}</span>
                <div className="smart-rec-info">
                  <span className="smart-rec-label">{recommendGame.label}</span>
                  <span className="smart-rec-title">{recommendGame.title}</span>
                  <span className="smart-rec-desc">{recommendGame.desc}</span>
                </div>
                <span className="smart-rec-arrow">→</span>
              </div>
            );
          })()}

          {/* 智能推荐关卡 */}
          {(() => {
            const recommend = getAdaptiveRecommendation(progress.completedLevels, levelStars, progress.currentLevel);
            if (!recommend) return null;
            return (
              <div className="recommend-card" onClick={() => handleSelectLevel(recommend.level)}>
                <span className="recommend-icon">{recommend.icon}</span>
                <div className="recommend-info">
                  <span className="recommend-label">推荐关卡</span>
                  <span className="recommend-detail">第 {recommend.level} 关 · {recommend.reason}</span>
                </div>
                <span className="recommend-arrow">→</span>
              </div>
            );
          })()}

          <div className="home-stats">
            <div className="stat-item">
              <span className="stat-value">{progress.completedLevels.length}</span>
              <span className="stat-label">已过关卡</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{Object.values(levelStars).reduce((a, b) => a + b, 0)}</span>
              <span className="stat-label">总星数</span>
            </div>
            <div className="stat-item">
              <span className={`stat-value${StatsTracker.get().currentStreak > 0 ? ' stat-value-streak-hot' : ''}`}>🔥{StatsTracker.get().currentStreak}</span>
              <span className="stat-label">连胜</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{endlessHighScore}</span>
              <span className="stat-label">无尽记录</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{StatsTracker.formatTime(StatsTracker.get().totalPlayTime)}</span>
              <span className="stat-label">游戏时长</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{StatsTracker.get().totalWins > 0 ? (StatsTracker.get().totalStars / StatsTracker.get().totalWins).toFixed(1) : '0'}</span>
              <span className="stat-label">平均星级</span>
            </div>
          </div>

          {/* 通关进度条 */}
          <div className="collapsible-section">
            <div className="collapse-header" onClick={() => setProgressCollapsed(!progressCollapsed)} role="button" tabIndex={0} aria-expanded={!progressCollapsed} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setProgressCollapsed(!progressCollapsed); } }}>
              <h3>📊 通关进度</h3>
              <span className={`collapse-toggle ${progressCollapsed ? 'collapsed' : ''}`}>▼</span>
            </div>
            <div className={`collapse-content ${progressCollapsed ? 'collapsed' : ''}`}>
          <div className="progress-bar-section">
            <div className="progress-bar-header">
              <span>通关进度</span>
              <span className="progress-percent">{Math.round(progress.completedLevels.length / 100 * 100)}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress.completedLevels.length)}%` }} />
            </div>
            {/* 难度分段进度 */}
            <div className="difficulty-progress">
              {(() => {
                const ranges = [
                  { name: '入门', min: 1, max: 20, color: '#4CAF50' },
                  { name: '中级', min: 21, max: 40, color: '#2196F3' },
                  { name: '高级', min: 41, max: 60, color: '#FF9800' },
                  { name: '专家', min: 61, max: 80, color: '#f44336' },
                  { name: '大师', min: 81, max: 100, color: '#9C27B0' },
                ];
                return ranges.map(r => {
                  const completed = r.min === r.max
                    ? (progress.completedLevels.includes(r.min) ? 1 : 0)
                    : progress.completedLevels.filter(l => l >= r.min && l <= r.max).length;
                  const total = r.max - r.min + 1;
                  const pct = Math.round(completed / total * 100);
                  return (
                    <div key={r.name} className="diff-progress-item">
                      <span className="diff-progress-label" style={{ color: r.color }}>{r.name}</span>
                      <div className="diff-progress-track">
                        <div className="diff-progress-fill" style={{ width: `${pct}%`, background: r.color }} />
                      </div>
                      <span className="diff-progress-count">{completed}/{total}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
            </div>
          </div>

          {/* 关卡选择 */}
          <div className="collapsible-section">
            <div className="collapse-header" onClick={() => setLevelSelectCollapsed(!levelSelectCollapsed)} role="button" tabIndex={0} aria-expanded={!levelSelectCollapsed} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLevelSelectCollapsed(!levelSelectCollapsed); } }}>
              <h3>🎮 选择关卡</h3>
              <span className={`collapse-toggle ${levelSelectCollapsed ? 'collapsed' : ''}`}>▼</span>
            </div>
            <div className={`collapse-content ${levelSelectCollapsed ? 'collapsed' : ''}`}>
          <div className="level-select">
            <div className="level-select-header">
              <h3>选择关卡</h3>
              <div className="level-search-box">
                <input
                  type="number"
                  className="level-search-input"
                  placeholder="输入关卡号"
                  min="1"
                  max="100"
                  value={levelSearchInput}
                  onChange={(e) => setLevelSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const lvl = parseInt(levelSearchInput, 10);
                      if (lvl >= 1 && lvl <= 100) {
                        setPageLevel(Math.floor((lvl - 1) / LEVELS_PER_PAGE));
                        handleSelectLevel(lvl);
                      }
                    }
                  }}
                />
                <button
                  className="level-search-btn"
                  onClick={() => {
                    const lvl = parseInt(levelSearchInput, 10);
                    if (lvl >= 1 && lvl <= 100) {
                      setPageLevel(Math.floor((lvl - 1) / LEVELS_PER_PAGE));
                      handleSelectLevel(lvl);
                    }
                  }}
                  disabled={!levelSearchInput}
                >跳转</button>
              </div>
              <div className="level-pages">
                <button
                  className="page-btn"
                  onClick={() => setPageLevel(p => Math.max(0, p - 1))}
                  disabled={pageLevel === 0}
                >◀</button>
                <span className="page-info">第 {pageLevel + 1}/{Math.max(1, Math.ceil(Math.max(20, progress.currentLevel + 5) / LEVELS_PER_PAGE))} 页</span>
                <button
                  className="page-btn"
                  onClick={() => setPageLevel(p => p + 1)}
                  disabled={(pageLevel + 1) * LEVELS_PER_PAGE >= Math.max(20, progress.currentLevel + 5)}
                >▶</button>
              </div>
            </div>
            <div className="difficulty-filter" aria-label="难度筛选">
              <button className={`diff-filter-btn ${difficultyFilter === 'all' ? 'active' : ''}`} onClick={() => setDifficultyFilter('all')}>全部</button>
              <button className={`diff-filter-btn diff-easy ${difficultyFilter === 'easy' ? 'active' : ''}`} onClick={() => setDifficultyFilter('easy')}>入门</button>
              <button className={`diff-filter-btn diff-normal ${difficultyFilter === 'normal' ? 'active' : ''}`} onClick={() => setDifficultyFilter('normal')}>普通</button>
              <button className={`diff-filter-btn diff-medium ${difficultyFilter === 'medium' ? 'active' : ''}`} onClick={() => setDifficultyFilter('medium')}>中等</button>
              <button className={`diff-filter-btn diff-hard ${difficultyFilter === 'hard' ? 'active' : ''}`} onClick={() => setDifficultyFilter('hard')}>困难</button>
              <button className={`diff-filter-btn diff-expert ${difficultyFilter === 'expert' ? 'active' : ''}`} onClick={() => setDifficultyFilter('expert')}>专家</button>
              <button className={`diff-filter-btn diff-master ${difficultyFilter === 'master' ? 'active' : ''}`} onClick={() => setDifficultyFilter('master')}>大师</button>
            </div>
            <div className="level-grid">
              {Array.from({ length: Math.max(20, progress.currentLevel + 5) }, (_, i) => i + 1)
                .filter(lvl => {
                  if (difficultyFilter === 'all') return true;
                  let diffClass = 'diff-easy';
                  if (lvl > 90) diffClass = 'diff-master';
                  else if (lvl > 50) diffClass = 'diff-expert';
                  else if (lvl > 30) diffClass = 'diff-hard';
                  else if (lvl > 20) diffClass = 'diff-medium';
                  else if (lvl > 6) diffClass = 'diff-normal';
                  return diffClass === `diff-${difficultyFilter}`;
                })
                .slice(pageLevel * LEVELS_PER_PAGE, (pageLevel + 1) * LEVELS_PER_PAGE)
                .map(lvl => {
                  const stars = levelStars[lvl] || 0;
                  const best = bestScores[lvl];
                  // 难度颜色匹配
                  let diffClass = 'diff-easy';
                  if (lvl > 50) diffClass = 'diff-expert';
                  else if (lvl > 30) diffClass = 'diff-hard';
                  else if (lvl > 20) diffClass = 'diff-medium';
                  else if (lvl > 12) diffClass = 'diff-normal';
                  else if (lvl > 6) diffClass = 'diff-normal';
                  // 91-100 大师
                  if (lvl > 90) diffClass = 'diff-master';
                  return (
                    <button
                      key={lvl}
                      className={`level-btn ${diffClass} ${progress.completedLevels.includes(lvl) ? 'completed' : ''} ${lvl === progress.currentLevel ? 'current' : ''}`}
                      onClick={() => handleSelectLevel(lvl)}
                      aria-label={`第${lvl}关${progress.completedLevels.includes(lvl) ? `,已完成,最佳${best || '?'}步,${stars}星!` : ''}`}
                      title={progress.completedLevels.includes(lvl) ? `第${lvl}关 | 最佳: ${best || '?'}步 | ${'⭐'.repeat(stars) || '未评级'}` : `第${lvl}关`}
                    >
                      <span className="level-diff-dot" data-diff={diffClass} />
                      {progress.completedLevels.includes(lvl) ? `${'⭐'.repeat(Math.min(stars, 3)) || '✓'}` : ''} {lvl}
                    </button>
                  );
                })}
            </div>
          </div>
            </div>
          </div>

          {/* 自定关卡快速入口 */}
          {customLevels.length > 0 && (
            <div className="custom-levels-section">
              <h3 className="custom-levels-title">💻 我的关卡</h3>
              <div className="custom-levels-list">
                {customLevels.slice(0, 3).map(lv => (
                  <div key={lv.id} className="custom-level-card" onClick={() => handlePlayCustomLevel(lv)}>
                    <span className="custom-level-icon">🎮</span>
                    <div className="custom-level-info">
                      <span className="custom-level-name">{lv.name}</span>
                      <span className="custom-level-meta">{lv.difficulty} · {lv.tubes.length}管 · {lv.completed ? '✅ 已通关' : '未通关'}</span>
                    </div>
                    <span className="custom-level-arrow">→</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary btn-small" onClick={() => setPage('editor')}>查看全部 →</button>
            </div>
          )}

          {/* 广告位预留 - 首页底部 */}
          <div className="ad-slot ad-home">
            <span className="ad-label">广告位</span>
          </div>

          {/* 忽略 */}
          <div className="donate-section">
            <p>喜欢这个游戏?</p>
            <a href="#" className="donate-link" onClick={(e) => e.preventDefault()}>
              👍 支持开发者
            </a>
          </div>

          {/* 常见问题 */}
          <div className="collapsible-section">
            <div className="collapse-header" onClick={() => setFaqCollapsed(!faqCollapsed)} role="button" tabIndex={0} aria-expanded={!faqCollapsed} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFaqCollapsed(!faqCollapsed); } }}>
              <h3>❓ 常见问题</h3>
              <span className={`collapse-toggle ${faqCollapsed ? 'collapsed' : ''}`}>▼</span>
            </div>
            <div className={`collapse-content ${faqCollapsed ? 'collapsed' : ''}`}>
              <Suspense fallback={<div style={{padding:'20px',textAlign:'center',color:'#999'}}>加载中...</div>}>
                <FaqList />
              </Suspense>
            </div>
          </div>

          {/* 已保存混合配方快速查看入口 - 方便用户从首页直接查看配色收藏 */}
          {(() => {
            let recipeCount = 0;
            try { recipeCount = JSON.parse(localStorage.getItem('color_mixer_recipes') || '[]').length; } catch (e) { /* 忽略 */ }
            return recipeCount > 0 ? (
              <div className="saved-recipes-entry" onClick={openSavedRecipes} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSavedRecipes(); } }}>
                <span className="saved-recipes-icon">📋</span>
                <div className="saved-recipes-info">
                  <span className="saved-recipes-title">我的混合配方</span>
                  <span className="saved-recipes-count">已保存 {recipeCount} 个配色配方</span>
                </div>
                <span className="saved-recipes-arrow">→</span>
              </div>
            ) : null;
          })()}

          {/* 今日成就快捷入口 — 展示成就进度与最近解锁，提升成就发现率 */}
          {(() => {
            const allAchievements = AchievementManager.getAll();
            const unlockedCount = allAchievements.filter(a => a.unlocked).length;
            const totalCount = allAchievements.length;
            const pct = totalCount > 0 ? Math.round(unlockedCount / totalCount * 100) : 0;
            // 找最近解锁的成就
            const unlockedSorted = allAchievements
              .filter(a => a.unlocked && a.unlockedAt)
              .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0));
            const recent = unlockedSorted[0];
            // 找下一个未解锁成就
            const nextTarget = allAchievements.find(a => !a.unlocked);
            return (
              <div className="today-achievement-card" onClick={() => setPage('achievements')} role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPage('achievements'); } }}>
                <div className="today-ach-header">
                  <span className="today-ach-icon">🏆</span>
                  <div className="today-ach-info">
                    <span className="today-ach-label">今日成就</span>
                    <span className="today-ach-progress">{unlockedCount}/{totalCount} 已解锁 · {pct}%</span>
                  </div>
                </div>
                <div className="today-ach-bar">
                  <div className="today-ach-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="today-ach-detail">
                  {recent ? (
                    <span className="today-ach-recent">最近解锁: {recent.icon} {recent.name}</span>
                  ) : (
                    <span className="today-ach-recent">开始游戏解锁你的第一个成就!</span>
                  )}
                  {nextTarget && (
                    <span className="today-ach-next">下一个目标: {nextTarget.icon} {nextTarget.name}</span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 快捷功能导航区 - 提升功能发现率与 SEO 内链 */}
          <div className="quick-nav-section">
            <h3>🧭 探索更多</h3>
            <div className="quick-nav-grid">
              <button className="quick-nav-card" onClick={() => setPage('encyclopedia')}>
                <span className="quick-nav-icon">🎨</span>
                <span className="quick-nav-label">色彩百科</span>
                <span className="quick-nav-desc">颜色知识·问答·小游戏</span>
              </button>
              <button className="quick-nav-card" onClick={() => setPage('achievements')}>
                <span className="quick-nav-icon">🏆</span>
                <span className="quick-nav-label">成就大厅</span>
                <span className="quick-nav-desc">73个成就等你解锁</span>
              </button>
              <button className="quick-nav-card" onClick={() => setPage('stats')}>
                <span className="quick-nav-icon">📊</span>
                <span className="quick-nav-label">游戏统计</span>
                <span className="quick-nav-desc">游玩数据与进度分析</span>
              </button>
              <button className="quick-nav-card" onClick={() => setPage('editor')}>
                <span className="quick-nav-icon">🔧</span>
                <span className="quick-nav-label">关卡编辑器</span>
                <span className="quick-nav-desc">创建·分享·导入关卡</span>
              </button>
              <button className="quick-nav-card" onClick={() => handleDailyChallenge()}>
                <span className="quick-nav-icon">📅</span>
                <span className="quick-nav-label">每日挑战</span>
                <span className="quick-nav-desc">每天一题等你来解</span>
              </button>
              <button className="quick-nav-card" onClick={() => setShowHelpModal(true)}>
                <span className="quick-nav-icon">📖</span>
                <span className="quick-nav-label">玩法教程</span>
                <span className="quick-nav-desc">新手必看快速上手</span>
              </button>
            </div>
          </div>
        </main>

        <footer className="home-footer">
          <button className="footer-link" onClick={() => setPage('about')}>关于</button>
          <span className="footer-divider">|</span>
          <button className="footer-link" onClick={() => setShowHelpModal(true)}>📖 玩法</button>
          <span className="footer-divider">|</span>
          <button className="footer-link" onClick={() => setPage('achievements')}>🏆 成就</button>
          <span className="footer-divider">|</span>
          <button className="footer-link" onClick={() => setPage('stats')}>📊 统计</button>
          <span className="footer-divider">|</span>
          <button className="footer-link" onClick={() => setPage('editor')}>🔧 编辑器</button>
          <span className="footer-divider">|</span>
          <button className="footer-link" onClick={() => setPage('settings')}>⚙️ 设置</button>
          <span className="footer-divider">|</span>
          <button className="footer-link" onClick={() => setPage('encyclopedia')}>🎨 色彩百科</button>
          <span className="footer-divider">|</span>
          <button className="footer-link" onClick={() => setPage('privacy')}>隐私政策</button>
        </footer>

        {/* 浮动快捷导航按钮 */}
        <div className="fab-nav">
          <button className="fab-nav-btn" onClick={() => { setPage('achievements'); SoundEngine.click(); }} aria-label="成就" title="成就">🏆</button>
          <button className="fab-nav-btn" onClick={() => { setPage('stats'); SoundEngine.click(); }} aria-label="统计" title="统计">📊</button>
          <button className="fab-nav-btn" onClick={() => { setPage('settings'); SoundEngine.click(); }} aria-label="设置" title="设置">⚙️</button>
        </div>

        {/* 自动存档恢复对话框 */}
        {showResumeDialog && autosaveData && (
          <div className="tutorial-overlay" onClick={() => setShowResumeDialog(false)}>
            <div className="tutorial-card" onClick={(e) => e.stopPropagation()}>
              <div className="tutorial-emoji">💾</div>
              <h2>发现未完成的游戏</h2>
              <p className="modal-body-text">
                {autosaveData.mode === 'endless'
                  ? `无尽模式第 ${(autosaveData.endlessScore ?? 0) + 1} 关已走 ${autosaveData.moves} 步`
                  : autosaveData.mode === 'timed'
                  ? `限时挑战已走 ${autosaveData.moves} 步`
                  : autosaveData.mode === 'daily'
                  ? `每日挑战已走 ${autosaveData.moves} 步`
                  : autosaveData.mode === 'weekly'
                  ? `周挑战已走 ${autosaveData.moves} 步`
                  : `第 ${autosaveData.level} 关已走 ${autosaveData.moves} 步`}
              </p>
              <div className="modal-actions">
                <button className="btn btn-primary btn-large" onClick={() => {
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
                  setPage('game');
                  setShowResumeDialog(false);
                  SoundEngine.resume();
                }}>▶ 继续游戏</button>
                <button className="btn btn-secondary" onClick={() => {
                  setShowResumeDialog(false);
                  clearAutosave();
                }}>放弃存档</button>
              </div>
            </div>
          </div>
        )}

        {/* 忽略 */}
        {showTutorial && (
          <div className="tutorial-overlay" onClick={handleTutorialClose}>
            <div className="tutorial-card" onClick={(e) => e.stopPropagation()}>
              <div className="tutorial-emoji">🎨</div>
              <h2>欢迎来到色彩排序!</h2>
              <div className="tutorial-steps">
                <div className="tutorial-step">
                  <span className="step-icon">1️⃣</span>
                  <span>点击一个有颜色的试管选中它</span>
                </div>
                <div className="tutorial-step">
                  <span className="step-icon">2️⃣</span>
                  <span>再点击一个试管,颜色会倒过去</span>
                </div>
                <div className="tutorial-step">
                  <span className="step-icon">3️⃣</span>
                  <span>只能倒入空管或顶部颜色相同的试管</span>
                </div>
                <div className="tutorial-step">
                  <span className="step-icon">4️⃣</span>
                  <span>把每种颜色归到一个试管就赢了!</span>
                </div>
              </div>
              <button className="btn btn-primary btn-large" onClick={handleTutorialClose}>
                知道了,开始玩!
              </button>
            </div>
          </div>
        )}

        {/* 分享成功提示 */}
        {showShareToast && (
          <div className="share-toast">📋 战绩已复制到剪贴板!</div>
        )}

        {/* 成就解锁通知 — 根据稀有度显示不同边框颜色和标签 */}
        {newAchievements.length > 0 && (() => {
          const ach = newAchievements[0];
          const rarityLabels: Record<string, { label: string; color: string }> = {
            common: { label: '', color: '#4CAF50' },
            rare: { label: '⭐ 稀有', color: '#2196F3' },
            epic: { label: '⭐⭐ 史诗', color: '#9C27B0' },
            legendary: { label: '⭐⭐⭐ 传说', color: '#FF9800' },
          };
          const rarity = rarityLabels[ach.rarity || 'common'] || rarityLabels.common;
          return (
            <div className="achievement-notification" onClick={dismissAchievement}>
              <div className="achievement-notif-card" style={{ borderColor: rarity.color }}>
                <div className="achievement-notif-icon">{ach.icon}</div>
                <div className="achievement-notif-text">
                  <div className="achievement-notif-title">🏆 成就解锁!</div>
                  <div className="achievement-notif-name">{ach.name}</div>
                  <div className="achievement-notif-desc">{ach.description}</div>
                  {rarity.label && <div className="achievement-notif-rarity" style={{ color: rarity.color }}>{rarity.label}</div>}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 连击里程碑庆祝弹窗 */}
        {comboCelebration && (
          <div className="combo-celebration-overlay" onClick={() => setComboCelebration(null)}>
            <div className="combo-celebration-card" style={{ borderColor: comboCelebration.color }}>
              <div className="combo-celebration-emoji" style={{ animation: 'comboPop 0.6s ease-out' }}>{comboCelebration.emoji}</div>
              <div className="combo-celebration-title" style={{ color: comboCelebration.color }}>{comboCelebration.title}</div>
              <div className="combo-celebration-desc">{comboCelebration.desc}</div>
              <button className="btn btn-primary" onClick={() => setComboCelebration(null)}>继续</button>
            </div>
          </div>
        )}

        {/* PWA 安装提示弹窗 */}
        {showPWAInstall && (
          <div className="pwa-install-banner">
            <div className="pwa-install-content">
              <span className="pwa-install-icon">📱</span>
              <div className="pwa-install-text">
                <div className="pwa-install-title">安装到桌面</div>
                <div className="pwa-install-desc">离线也能玩,更流畅</div>
              </div>
              <button className="pwa-install-btn" onClick={async () => {
                const ok = await triggerPWAInstall();
                setShowPWAInstall(false);
                if (!ok) dismissPWAInstall();
              }}>安装</button>
              <button className="pwa-install-close" onClick={() => {
                setShowPWAInstall(false);
                dismissPWAInstall();
              }}>✕</button>
            </div>
          </div>
        )}

        {/* 首页玩法弹窗 */}
        {showHelpModal && (
          <div className="help-modal-overlay" onClick={() => setShowHelpModal(false)}>
            <div className="help-modal-card" onClick={(e) => e.stopPropagation()}>
              <h2>📖 玩法说明</h2>
              <div className="help-modal-step">
                <span className="step-icon">1️⃣</span>
                <span>点击一个有颜色的试管选中它</span>
              </div>
              <div className="help-modal-step">
                <span className="step-icon">2️⃣</span>
                <span>再点击一个试管,颜色会倒过去</span>
              </div>
              <div className="help-modal-step">
                <span className="step-icon">3️⃣</span>
                <span>只能倒入空管或顶部颜色相同的试管</span>
              </div>
              <div className="help-modal-step">
                <span className="step-icon">4️⃣</span>
                <span>把每种颜色归到一个试管就赢了!</span>
              </div>
              <div className="help-modal-step">
                <span className="step-icon">⭐</span>
                <span>关卡越后星级越高,追求三星通关!</span>
              </div>
              <button className="btn btn-primary help-modal-close" onClick={() => setShowHelpModal(false)}>
                知道了
              </button>
            </div>
          </div>
        )}

        {/* 首页弹窗集合（签到奖励、公告、配方查看）— 懒加载以降低首屏 bundle */}
        {(showCheckinReward || (showAnnouncements && announcements.length > 0) || showSavedRecipes) && (
          <Suspense fallback={null}>
            <HomeModals
              checkinReward={showCheckinReward}
              checkinStreak={checkinStreak}
              announcements={announcements}
              savedRecipes={savedRecipes}
              showCheckinReward={!!showCheckinReward}
              showAnnouncements={showAnnouncements}
              showSavedRecipes={showSavedRecipes}
              onCheckinRewardClose={() => setShowCheckinReward(null)}
              onAnnouncementDismiss={handleDismissAnnouncement}
              onAnnouncementClose={() => setShowAnnouncements(false)}
              onSavedRecipesClose={() => setShowSavedRecipes(false)}
              onGoToMixer={() => setPage('encyclopedia')}
            />
          </Suspense>
        )}

        {/* 更新日志弹窗 - 懒加载以降低首屏 bundle */}
        {showChangelog && (
          <Suspense fallback={<div className="tutorial-overlay"><div className="tutorial-card"><p style={{padding:'40px',textAlign:'center'}}>加载中...</p></div></div>}>
            <ChangelogModal onClose={() => setShowChangelog(false)} />
          </Suspense>
        )}

        {/* 回放查看弹窗(从分享链接打开) */}
        {showViewReplay && viewReplayData && (
          <div className="tutorial-overlay" onClick={() => { setShowViewReplay(false); setViewReplayData(null); window.location.hash = ''; }}>
            <div className="tutorial-card" onClick={(e) => e.stopPropagation()}>
              <div className="tutorial-emoji">🎥</div>
              <h2>查看回放</h2>
              <p className="replay-info-text">
                {viewReplayData.level === -1 ? "每日挑战" : viewReplayData.level === -2 ? "无尽模式" : viewReplayData.level === -3 ? "限时模式" : `第 ${viewReplayData.level} 关`}
                {' 步数 '}{viewReplayData.stepsUsed} 步 · {'⭐'.repeat(viewReplayData.starRating)}
              </p>
              <p className="replay-actions-hint">点击下方按钮在游戏中查看完整回放</p>
              <div className="replay-view-actions">
                <button className="btn btn-primary" onClick={() => {
                  // 跳转到对应关卡,自动加载回放
                  if (viewReplayData.level > 0) {
                    handleSelectLevel(viewReplayData.level);
                  }
                  setShowViewReplay(false);
                  setViewReplayData(null);
                  window.location.hash = '';
                }}>🎯 前往关卡</button>
                <button className="btn btn-secondary" onClick={() => { setShowViewReplay(false); setViewReplayData(null); window.location.hash = ''; }}>关闭</button>
              </div>
              <p className="replay-detail-moves">
                操作序列:{viewReplayData.moves.map(m => `${m.from + 1}→${m.to + 1}`).join(', ')}
              </p>
            </div>
          </div>
        )}

      </div>
    );
  }
  if (page === 'game') {
    return (
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
      onPlay={handlePlayCustomLevel}
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
              // 更新自定关卡的通关状态
              const { saveCustomLevel, getCustomLevels } = await levelEditorModule();
              const updated = { ...playingCustomLevel, completed: true, bestMoves: playingCustomLevel.bestMoves ? Math.min(playingCustomLevel.bestMoves, moves) : moves };
              saveCustomLevel(updated);
              setCustomLevels(getCustomLevels());
              setPlayingCustomLevel(updated);
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
                  setShowShareToast(true);
                  setTimeout(() => setShowShareToast(false), 2000);
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

  // 色彩百科页
  if (page === 'encyclopedia') {
    // 色彩学家成就检查已移至 useEffect(避免 render 阶段 setState)
    return <Suspense fallback={<PageLoading />}><ColorEncyclopediaPage onBack={() => setPage('home')} onTestComplete={(score: number) => {
      const testAchievements = AchievementManager.checkColorPerceptionAchievements(score);
      if (testAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...testAchievements]);
      }
    }} onMixerUse={(useCount: number) => {
      const mixerAchievements = AchievementManager.checkColorMixerAchievements(useCount);
      if (mixerAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...mixerAchievements]);
      }
    }} onSequenceComplete={(level: number) => {
      const seqAchievements = AchievementManager.checkSequenceMemoryAchievements(level);
      if (seqAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...seqAchievements]);
      }
    }} onPairMatchComplete={(moves: number) => {
      // 配对完成时检查成就(统一检查所有难度)
      const pairAchievements = AchievementManager.checkPairMatchAchievements('hard', moves);
      if (pairAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...pairAchievements]);
      }
    }} onReactionComplete={(score: number) => {
      const reactionAchievements = AchievementManager.checkReactionTestAchievements(score, 8);
      if (reactionAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...reactionAchievements]);
      }
    }} onQuizComplete={(totalCompleted: number) => {
      // 传入连续答题天数,用于检查连续答题里程碑成就
      const quizAchievements = AchievementManager.checkDailyQuizAchievements(totalCompleted, getQuizStreak());
      if (quizAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...quizAchievements]);
      }
      // 检查答题高手成就
      const history = getDailyQuizHistory();
      const correctCount = history.filter(h => h.correct).length;
      const expertAchievements = AchievementManager.checkQuizExpertAchievement(correctCount);
      if (expertAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...expertAchievements]);
      }
    }} onSearch={() => {
      const searchAchievements = AchievementManager.checkKnowledgeExplorerAchievement();
      if (searchAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...searchAchievements]);
      }
    }} onQuizShare={() => {
      const shareAchievements = AchievementManager.checkQuizSharerAchievement();
      if (shareAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...shareAchievements]);
      }
    }} onColorView={(viewedCount: number) => {
      const explorerAchievements = AchievementManager.checkEncyclopediaExplorerAchievement(viewedCount);
      if (explorerAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...explorerAchievements]);
      }
    }} onGamePlayed={(gameId: string) => {
      // 记录已玩的游戏,检查全能玩家成就
      try {
        const data = localStorage.getItem('encyclopedia_played_games');
        const played: string[] = data ? JSON.parse(data) : [];
        if (!played.includes(gameId)) {
          played.push(gameId);
          localStorage.setItem('encyclopedia_played_games', JSON.stringify(played));
        }
        const allGamesAchievements = AchievementManager.checkAllEncyclopediaGamesAchievement(played);
        if (allGamesAchievements.length > 0) {
          setNewAchievements(prev => [...prev, ...allGamesAchievements]);
        }
      } catch (e) { /* 忽略 */ }
    }} /></Suspense>;
  }
}

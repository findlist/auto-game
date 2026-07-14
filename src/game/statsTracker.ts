// 游戏统计追踪器
// 记录玩家的全局游戏数据，用于统计页面展示

import { STORAGE_KEYS } from './storageKeys';

const STATS_KEY = STORAGE_KEYS.STATS;

export interface GameRecord {
  level: number;
  moves: number;
  stars: number;
  playTimeSec: number;
  mode: 'normal' | 'daily' | 'endless' | 'timed';
  timestamp: number;
}

export interface GameStats {
  totalMoves: number;       // 总步数
  totalWins: number;        // 总通关次数
  totalPlayTime: number;    // 总游戏时间（秒）
  totalStars: number;       // 总获得星数
  bestTimedScore: number;   // 限时模式最高分
  bestEndlessScore: number; // 无尽模式最高分
  dailyCompletions: number; // 每日挑战完成次数
  perfectLevels: number;    // 满星通关数
  hintsUsed: number;        // 使用提示次数
  undosUsed: number;        // 使用撤销次数
  currentStreak: number;    // 当前连胜数
  bestStreak: number;       // 最佳连胜数
  levelStats: Record<number, LevelStat>; // 各关卡统计
  recentRecords: GameRecord[]; // 最近通关记录（保留最近50条）
}

interface LevelStat {
  bestMoves: number;
  stars: number;
  playCount: number;
}

const DEFAULT_STATS: GameStats = {
  totalMoves: 0,
  totalWins: 0,
  totalPlayTime: 0,
  totalStars: 0,
  bestTimedScore: 0,
  bestEndlessScore: 0,
  dailyCompletions: 0,
  perfectLevels: 0,
  hintsUsed: 0,
  undosUsed: 0,
  currentStreak: 0,
  bestStreak: 0,
  levelStats: {},
  recentRecords: [],
};

function loadStats(): GameStats {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (data) return { ...DEFAULT_STATS, ...JSON.parse(data) };
  } catch (e) { /* 忽略 */ }
  return { ...DEFAULT_STATS };
}

function saveStats(stats: GameStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) { /* 忽略 */ }
}

export const StatsTracker = {
  get(): GameStats {
    return loadStats();
  },

  // 记录一次通关（usedUndo/usedHint 参数用于判断是否中断连胜）
  recordWin(level: number, moves: number, stars: number, isDaily: boolean, isEndless: boolean, isTimed: boolean, playTimeSec: number, usedUndo?: boolean, usedHint?: boolean) {
    const stats = loadStats();
    stats.totalMoves += moves;
    stats.totalWins += 1;
    stats.totalPlayTime += playTimeSec;
    stats.totalStars += stars;
    
    if (stars === 3) stats.perfectLevels += 1;
    if (isDaily) stats.dailyCompletions += 1;

    // 连胜系统：未使用撤销和提示时连胜+1
    const cleanWin = !usedUndo && !usedHint;
    if (cleanWin) {
      stats.currentStreak += 1;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
    } else {
      stats.currentStreak = 0;
    }

    // 关卡统计（仅普通模式）
    if (!isDaily && !isEndless && !isTimed) {
      const existing = stats.levelStats[level];
      if (!existing || moves < existing.bestMoves) {
        stats.levelStats[level] = {
          bestMoves: moves,
          stars: Math.max(stars, existing?.stars || 0),
          playCount: (existing?.playCount || 0) + 1,
        };
      } else {
        existing.playCount = (existing.playCount || 0) + 1;
        existing.stars = Math.max(stars, existing.stars);
      }
    }

    // 模式最高分由 updateBestScore 单独负责（传入实际 score）
    // 修复：原代码 Math.max(stats.bestXxxScore, 1) 永远把最高分设为 max(当前值, 1)，
    // 即使通关也没有用实际 score 更新，导致最高分永远最多为 1
    // 现在移除这段错误逻辑，由调用方在通关时调用 updateBestScore

    // 记录最近通关记录（保留最近50条）
    const mode: GameRecord['mode'] = isDaily ? 'daily' : isEndless ? 'endless' : isTimed ? 'timed' : 'normal';
    stats.recentRecords.push({
      level,
      moves,
      stars,
      playTimeSec,
      mode,
      timestamp: Date.now(),
    });
    if (stats.recentRecords.length > 50) {
      stats.recentRecords = stats.recentRecords.slice(-50);
    }

    saveStats(stats);
  },

  // 记录使用提示
  recordHint() {
    const stats = loadStats();
    stats.hintsUsed += 1;
    saveStats(stats);
  },

  // 记录使用撤销
  recordUndo() {
    const stats = loadStats();
    stats.undosUsed += 1;
    saveStats(stats);
  },

  // 更新限时/无尽最高分
  updateBestScore(type: 'timed' | 'endless', score: number) {
    const stats = loadStats();
    if (type === 'timed') {
      stats.bestTimedScore = Math.max(stats.bestTimedScore, score);
    } else {
      stats.bestEndlessScore = Math.max(stats.bestEndlessScore, score);
    }
    saveStats(stats);
  },

  // 格式化时间
  formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds}秒`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    if (min < 60) return `${min}分${sec}秒`;
    const hr = Math.floor(min / 60);
    const remainMin = min % 60;
    return `${hr}小时${remainMin}分`;
  },

  // 中断连胜（放弃存档、重新开始等操作时调用）
  breakStreak() {
    const stats = loadStats();
    stats.currentStreak = 0;
    saveStats(stats);
  },

  // 重置统计
  reset() {
    localStorage.removeItem(STATS_KEY);
  },
};

// 首页与游戏进度相关的 localStorage 读写工具函数
// 从 App.tsx 提取，统一管理进度数据的存取逻辑
import { STORAGE_KEYS } from './storageKeys';

const STORAGE_KEY = STORAGE_KEYS.PROGRESS;
const BEST_SCORES_KEY = STORAGE_KEYS.BEST_SCORES;
const TUTORIAL_KEY = STORAGE_KEYS.TUTORIAL;
const STARS_KEY = STORAGE_KEYS.STARS;
const AUTOSAVE_KEY = STORAGE_KEYS.AUTOSAVE;
const RECENT_KEY = STORAGE_KEYS.RECENT;
const TIMED_KEY = STORAGE_KEYS.TIMED;

/** 最近一次游玩记录 */
export interface RecentPlay {
  level: number;
  mode: 'normal' | 'daily' | 'endless' | 'timed';
  timestamp: number;
}

/** 关卡进度数据 */
export interface Progress {
  currentLevel: number;
  completedLevels: number[];
}

// ---- 最近游玩记录 ----

/** 读取最近游玩记录 */
export function loadRecent(): RecentPlay | null {
  try {
    const data = localStorage.getItem(RECENT_KEY);
    if (data) return JSON.parse(data);
  } catch (e) { /* 忽略 */ }
  return null;
}

/** 保存最近游玩记录 */
export function saveRecent(rec: RecentPlay) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(rec));
  } catch (e) { /* 忽略 */ }
}

// ---- 关卡进度 ----

/** 读取关卡进度 */
export function loadProgress(): Progress {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) { /* 忽略 */ }
  return { currentLevel: 1, completedLevels: [] };
}

/** 保存关卡进度 */
export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) { /* 忽略 */ }
}

// ---- 最佳成绩 ----

/** 读取所有关卡的最佳成绩（最少步数） */
export function loadBestScores(): Record<number, number> {
  try {
    const data = localStorage.getItem(BEST_SCORES_KEY);
    if (data) return JSON.parse(data);
  } catch (e) { /* 忽略 */ }
  return {};
}

/** 保存某关最佳成绩，仅当步数更少时更新 */
export function saveBestScore(level: number, moves: number) {
  try {
    const scores = loadBestScores();
    if (!scores[level] || moves < scores[level]) {
      scores[level] = moves;
      localStorage.setItem(BEST_SCORES_KEY, JSON.stringify(scores));
    }
  } catch (e) { /* 忽略 */ }
}

// ---- 新手教程 ----

/** 是否已完成新手教程 */
export function hasSeenTutorial(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_KEY) === '1';
  } catch (e) { return false; }
}

/** 标记新手教程已完成 */
export function markTutorialSeen() {
  try {
    localStorage.setItem(TUTORIAL_KEY, '1');
  } catch (e) { /* 忽略 */ }
}

// ---- 星级数据 ----

/** 读取所有关卡的星级数据 */
export function loadStars(): Record<number, number> {
  try {
    const data = localStorage.getItem(STARS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) { /* 忽略 */ }
  return {};
}

/** 保存某关星级，仅当新星级更高时更新 */
export function saveStars(level: number, stars: number) {
  try {
    const all = loadStars();
    if (!all[level] || stars > all[level]) {
      all[level] = stars;
      localStorage.setItem(STARS_KEY, JSON.stringify(all));
    }
  } catch (e) { /* 忽略 */ }
}

// ---- 自动存档 ----

/** 自动存档数据结构 */
export interface AutosaveData {
  level: number;
  mode: string;
  moves: number;
  isWon: boolean;
  endlessScore?: number;
  timedScore?: number;
  timestamp?: number;
}

/** 读取自动存档 */
export function loadAutosave(): AutosaveData | null {
  try {
    const data = localStorage.getItem(AUTOSAVE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) { /* 忽略 */ }
  return null;
}

/** 保存或清除自动存档 */
export function saveAutosave(data: AutosaveData | null) {
  try {
    if (data && data.moves > 0 && !data.isWon) {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ ...data, timestamp: Date.now() }));
    } else {
      localStorage.removeItem(AUTOSAVE_KEY);
    }
  } catch (e) { /* 忽略 */ }
}

/** 清除自动存档 */
export function clearAutosave() {
  try { localStorage.removeItem(AUTOSAVE_KEY); } catch (e) { /* 忽略 */ }
}

// ---- 限时模式最高分 ----

/** 读取限时模式最高分 */
export function loadTimedHighScore(): number {
  try { return parseInt(localStorage.getItem(TIMED_KEY) || '0', 10); } catch (e) { return 0; }
}

/** 保存限时模式最高分 */
export function saveTimedHighScore(score: number) {
  try {
    const current = loadTimedHighScore();
    if (score > current) {
      localStorage.setItem(TIMED_KEY, String(score));
    }
  } catch (e) { /* 忽略 */ }
}

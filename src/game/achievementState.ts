// 成就状态管理 — 从 achievements.ts 提取的核心状态操作
// 供 achievements.ts 和各成就检查子模块共享
// 设计原因：拆分 check 方法后，子模块需要访问 loadState/saveState

import { STORAGE_KEYS } from './storageKeys';

const ACHIEVEMENT_KEY = STORAGE_KEYS.ACHIEVEMENTS;

// 成就状态（含连续不使用提示计数）
export interface AchievementState {
  unlocked: Record<string, number>; // id -> 解锁时间戳
  consecutiveNoHint: number; // 连续不使用提示通关数
  dailyStreak: number; // 每日挑战连续天数
  lastDailyDate: string | null; // 上次完成每日挑战的日期
  playDays: number; // 累计游玩天数（不同自然日）
  lastPlayDate: string | null; // 上次游玩日期，用于判断是否为新的一天
}

// 本地日期字符串（与 dailyChallenge.ts 的 getTodayString 保持一致）
// 修复：原代码用 toISOString().slice(0,10) 取 UTC 日期，
// 与每日挑战的本地日期判断不一致，导致连胜计数在跨日时失效
export function getLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadState(): AchievementState {
  try {
    const data = localStorage.getItem(ACHIEVEMENT_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // 修复 P1：JSON.parse("null")/数字/字符串均不抛错，但后续 state.unlocked 会抛 TypeError
      // 此处校验返回结构，非对象或缺少 unlocked 字段则回退到默认值
      if (parsed && typeof parsed === 'object' && parsed.unlocked && typeof parsed.unlocked === 'object') {
        return {
          unlocked: parsed.unlocked,
          consecutiveNoHint: typeof parsed.consecutiveNoHint === 'number' ? parsed.consecutiveNoHint : 0,
          dailyStreak: typeof parsed.dailyStreak === 'number' ? parsed.dailyStreak : 0,
          lastDailyDate: typeof parsed.lastDailyDate === 'string' ? parsed.lastDailyDate : null,
          playDays: typeof parsed.playDays === 'number' ? parsed.playDays : 0,
          lastPlayDate: typeof parsed.lastPlayDate === 'string' ? parsed.lastPlayDate : null,
        };
      }
    }
  } catch (e) { /* 忽略 */ }
  return { unlocked: {}, consecutiveNoHint: 0, dailyStreak: 0, lastDailyDate: null, playDays: 0, lastPlayDate: null };
}

export function saveState(state: AchievementState) {
  try {
    localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(state));
  } catch (e) { /* 忽略 */ }
}

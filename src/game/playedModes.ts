// 已游玩模式追踪
// 记录玩家体验过的所有游戏模式，用于"全能玩家"成就判定

import { STORAGE_KEYS } from './storageKeys';

const MODES_KEY = STORAGE_KEYS.PLAYED_MODES;

// 所有游戏模式标识
export const ALL_MODES = ['normal', 'daily', 'endless', 'timed', 'weekly'] as const;

// 获取已游玩模式列表
export function getPlayedModes(): string[] {
  try {
    const data = localStorage.getItem(MODES_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // 修复 P1：JSON.parse('"hello"') 返回字符串，后续 .includes/.push 行为错误或抛错
      // 此处校验返回数组，非数组则回退到空数组
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) { /* 忽略 */ }
  return [];
}

// 记录游玩过的模式
export function recordPlayedMode(mode: string): void {
  try {
    const modes = getPlayedModes();
    if (!modes.includes(mode)) {
      modes.push(mode);
      localStorage.setItem(MODES_KEY, JSON.stringify(modes));
    }
  } catch (e) { /* 忽略 */ }
}

// 检查是否体验了所有模式
export function hasPlayedAllModes(): boolean {
  const modes = getPlayedModes();
  return ALL_MODES.every(m => modes.includes(m));
}

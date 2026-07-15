// 关卡编辑器模块
// 玩家可自创关卡并分享

import { Tube, ColorLayer, COLOR_KEYS } from './types';
import { STORAGE_KEYS } from './storageKeys';

// 自定义关卡存储键
const CUSTOM_LEVELS_KEY = STORAGE_KEYS.CUSTOM_LEVELS;

// 自定义关卡数据结构
export interface CustomLevel {
  id: string; // 唯一ID（时间戳 + 随机数）
  name: string; // 关卡名称
  tubes: Tube[];
  tubeCapacity: number;
  difficulty: string; // 自定义难度标记
  createdAt: number; // 创建时间
  bestMoves?: number; // 最佳步数
  completed?: boolean; // 是否已完成
}

// 预设编辑器颜色（10种）
export const EDITOR_COLORS = COLOR_KEYS;

// 生成空试管
export function createEmptyTube(id: number, capacity: number = 4): Tube {
  return { id, layers: [], capacity };
}

// 生成带颜色的试管（编辑器用）
export function createTubeWithLayers(id: number, colors: string[], capacity: number = 4): Tube {
  const layers: ColorLayer[] = colors.map(color => ({ color }));
  return { id, layers, capacity };
}

// 保存自定义关卡
export function saveCustomLevel(level: CustomLevel): void {
  try {
    const levels = getCustomLevels();
    // 检查是否已存在（按id更新）
    const idx = levels.findIndex(l => l.id === level.id);
    if (idx >= 0) {
      levels[idx] = level;
    } else {
      levels.push(level);
    }
    localStorage.setItem(CUSTOM_LEVELS_KEY, JSON.stringify(levels));
  } catch (e) { /* 忽略 */ }
}

// 获取所有自定义关卡
export function getCustomLevels(): CustomLevel[] {
  try {
    const data = localStorage.getItem(CUSTOM_LEVELS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // 修复 P1：JSON.parse("null")/对象均不抛错，后续 findIndex/push 会抛 TypeError
      // 此处校验返回数组，非数组则回退到空数组
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) { /* 忽略 */ }
  return [];
}

// 删除自定义关卡
export function deleteCustomLevel(id: string): void {
  try {
    const levels = getCustomLevels().filter(l => l.id !== id);
    localStorage.setItem(CUSTOM_LEVELS_KEY, JSON.stringify(levels));
  } catch (e) { /* 忽略 */ }
}

// 生成关卡分享码（Base64编码JSON）
export function exportLevelCode(level: CustomLevel): string {
  const compact = {
    n: level.name,
    t: level.tubes.map(t => ({
      c: t.capacity,
      l: t.layers.map(l => l.color),
    })),
    d: level.difficulty,
  };
  try {
    return btoa(encodeURIComponent(JSON.stringify(compact)));
  } catch (e) {
    return '';
  }
}

// 从分享码导入关卡
export function importLevelCode(code: string): CustomLevel | null {
  try {
    const compact = JSON.parse(decodeURIComponent(atob(code)));
    // 修复 P1：原代码未校验 compact 结构和字段类型，损坏的分享码可能导入无解关卡
    // 此处校验基本结构和字段类型，避免后续游戏逻辑行为异常
    if (!compact || typeof compact !== 'object' || !Array.isArray(compact.t)) return null;
    const tubes: Tube[] = compact.t.map((t: { c?: unknown; l?: unknown }, i: number) => {
      // 校验 capacity 为正整数，layers 为字符串数组
      const capacity = Number(t.c);
      if (!Number.isFinite(capacity) || capacity <= 0) throw new Error('容量非法');
      const layers = Array.isArray(t.l) ? t.l.map((color: string) => ({ color })) : [];
      return { id: i, capacity, layers };
    });
    // 至少需要 2 个试管才可游玩
    if (tubes.length < 2) return null;
    return {
      id: `imported-${Date.now()}`,
      name: typeof compact.n === 'string' ? compact.n : '导入关卡',
      tubes,
      tubeCapacity: tubes[0]?.capacity || 4,
      difficulty: typeof compact.d === 'string' ? compact.d : '自定义',
      createdAt: Date.now(),
    };
  } catch (e) {
    return null;
  }
}

// 验证关卡合法性
export function validateLevel(tubes: Tube[]): { valid: boolean; reason: string } {
  // 检查是否有至少2个试管
  if (tubes.length < 2) {
    return { valid: false, reason: '至少需要2个试管' };
  }

  // 检查是否有至少1个空管
  const hasEmpty = tubes.some(t => t.layers.length === 0);
  if (!hasEmpty) {
    return { valid: false, reason: '至少需要1个空试管' };
  }

  // 统计每种颜色的层数
  const colorCounts = new Map<string, number>();
  tubes.forEach(t => {
    t.layers.forEach(l => {
      colorCounts.set(l.color, (colorCounts.get(l.color) || 0) + 1);
    });
  });

  // 每种颜色的层数必须能整除某个试管的容量（可填满整数个试管）
  // 修复：原代码 t.capacity === count 仅匹配单管容量，颜色层数为容量整数倍时误判无效
  for (const [color, count] of colorCounts) {
    const validCapacity = tubes.some(t => t.capacity > 0 && count % t.capacity === 0);
    if (!validCapacity) {
      return { valid: false, reason: `颜色 ${color} 有 ${count} 层，无法整除填满任何试管` };
    }
  }

  // 检查是否已经全部完成（全是单色满管 + 空管）
  const allDone = tubes.every(t => {
    if (t.layers.length === 0) return true;
    if (t.layers.length !== t.capacity) return false;
    const firstColor = t.layers[0].color;
    return t.layers.every(l => l.color === firstColor);
  });
  if (allDone) {
    return { valid: false, reason: '关卡已经完成了，请打乱颜色' };
  }

  return { valid: true, reason: '关卡有效' };
}

// 生成唯一ID
export function generateLevelId(): string {
  return `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

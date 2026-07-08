// 回放分享系统
// 将操作序列编码为紧凑字符串，生成可分享的回放链接
// 格式: level|moves|encodedActions
// 编码: from-to 对用 Base36 压缩，每步用单个字符对表示

export interface ReplayData {
  level: number;
  moves: Array<{ from: number; to: number }>;
  starRating: number;
  stepsUsed: number;
}

/**
 * 将操作序列编码为紧凑字符串
 * 格式: L{level}M{moves}S{stars}D{data}
 * data部分: 每步 from-to 用 Base36 编码，from*36+to
 */
export function encodeReplay(data: ReplayData): string {
  const { level, moves, starRating, stepsUsed } = data;
  // 编码操作序列：from*36+to -> Base36 字符
  const encodedMoves = moves.map(m => (m.from * 36 + m.to).toString(36)).join('');
  return `L${level}M${stepsUsed}S${starRating}D${encodedMoves}`;
}

/**
 * 解码回放字符串
 */
export function decodeReplay(encoded: string): ReplayData | null {
  try {
    const levelMatch = encoded.match(/^L(-?\d+)M(\d+)S(\d+)D(.+)$/);
    if (!levelMatch) return null;
    const level = parseInt(levelMatch[1], 10);
    const stepsUsed = parseInt(levelMatch[2], 10);
    const starRating = parseInt(levelMatch[3], 10);
    const dataStr = levelMatch[4];
    const moves: Array<{ from: number; to: number }> = [];
    for (let i = 0; i < dataStr.length; i++) {
      const val = parseInt(dataStr[i], 36);
      moves.push({ from: Math.floor(val / 36), to: val % 36 });
    }
    return { level, moves, starRating, stepsUsed };
  } catch (e) {
    return null;
  }
}

/**
 * 生成回放分享链接（使用 URL hash）
 */
export function generateReplayUrl(data: ReplayData): string {
  const encoded = encodeReplay(data);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#replay=${encoded}`;
}

/**
 * 从当前 URL 解析回放数据
 */
export function parseReplayFromUrl(): ReplayData | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#replay=')) return null;
  const encoded = hash.slice('#replay='.length);
  return decodeReplay(encoded);
}

/**
 * 格式化回放分享文案
 */
export function formatReplayShareText(data: ReplayData): string {
  const { level, starRating, stepsUsed } = data;
  const stars = '⭐'.repeat(starRating);
  if (level === -1) {
    return `🎨 我的每日挑战通关回放！${stars} ${stepsUsed}步完成，来看看我的操作吧！`;
  } else if (level === -2) {
    return `🎨 无尽模式通关回放！${stars} ${stepsUsed}步完成，来挑战无尽模式吧！`;
  } else if (level === -3) {
    return `🎨 限时模式通关回放！${stars} ${stepsUsed}步完成，来比比谁更快！`;
  }
  return `🎨 色彩排序第${level}关通关回放！${stars} ${stepsUsed}步完成，来看看我的操作吧！`;
}

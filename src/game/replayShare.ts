// 回放分享系统
// 将操作序列编码为紧凑字符串，生成可分享的回放链接
// 格式: L{level}M{steps}S{stars}D{data}
// 编码: 每步固定 2 字符，from 和 to 各 1 个 Base36 字符（支持 0-35 号试管）

export interface ReplayData {
  level: number;
  moves: Array<{ from: number; to: number }>;
  starRating: number;
  stepsUsed: number;
}

/**
 * 将操作序列编码为紧凑字符串
 * 每步用 2 个 Base36 字符：第 1 个是 from，第 2 个是 to
 * 修复：原代码 from*36+to 编码会在 from>=1 时产生 2 字符，与逐字符解码不匹配
 */
export function encodeReplay(data: ReplayData): string {
  const { level, moves, starRating, stepsUsed } = data;
  // 修复 P0：from/to >= 36 时 toString(36) 产生多字符（如 36→"10"），
  // 与解码端固定每步 2 字符的假设不符，导致后续所有步骤错位、回放数据损坏
  // 编码前校验范围，越界则抛错，由调用方决定降级策略，避免静默损坏
  for (const m of moves) {
    if (m.from < 0 || m.from > 35 || m.to < 0 || m.to > 35) {
      throw new Error(`回放步骤越界：from=${m.from}, to=${m.to}，超出 0-35 编码范围`);
    }
  }
  const encodedMoves = moves.map(m => m.from.toString(36) + m.to.toString(36)).join('');
  return `L${level}M${stepsUsed}S${starRating}D${encodedMoves}`;
}

/**
 * 解码回放字符串
 * 每步读取 2 个字符：第 1 个是 from，第 2 个是 to
 */
export function decodeReplay(encoded: string): ReplayData | null {
  try {
    // 修复：D 后允许 0 个字符（空步数回放），原 (.+) 要求至少 1 字符导致 0 步通关无法解码
    const levelMatch = encoded.match(/^L(-?\d+)M(\d+)S(\d+)D(.*)$/);
    if (!levelMatch) return null;
    const level = parseInt(levelMatch[1], 10);
    const stepsUsed = parseInt(levelMatch[2], 10);
    const starRating = parseInt(levelMatch[3], 10);
    const dataStr = levelMatch[4];
    const moves: Array<{ from: number; to: number }> = [];
    // 每步 2 字符，防止奇数长度截断
    for (let i = 0; i + 1 < dataStr.length; i += 2) {
      const from = parseInt(dataStr[i], 36);
      const to = parseInt(dataStr[i + 1], 36);
      if (isNaN(from) || isNaN(to)) return null;
      moves.push({ from, to });
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
  // 剥离端口，避免经反向代理时泄漏内部端口（如 :8080）
  const host = window.location.host.split(':')[0];
  const baseUrl = `${window.location.protocol}//${host}${window.location.pathname}`;
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

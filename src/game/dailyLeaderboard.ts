// 每日挑战本地排行榜
// 记录每次每日挑战的通关成绩，按步数排序

const LEADERBOARD_KEY = 'color-sort-daily-leaderboard';
const MAX_ENTRIES = 30; // 最多保留30条记录

export interface DailyLeaderboardEntry {
  date: string;       // YYYY-MM-DD
  moves: number;      // 使用步数
  minSteps: number;   // 最优步数
  stars: number;      // 星级
  playTimeSec: number; // 用时（秒）
  timestamp: number;  // 记录时间戳
}

/**
 * 获取所有每日挑战排行记录
 */
export function getDailyLeaderboard(): DailyLeaderboardEntry[] {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    if (data) {
      const entries = JSON.parse(data) as DailyLeaderboardEntry[];
      // 按步数升序排序（步数少的排前面）
      return entries.sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date); // 日期新的排前面
        return a.moves - b.moves; // 同日期步数少的排前面
      });
    }
  } catch (e) { /* 忽略 */ }
  return [];
}

/**
 * 获取今日排行
 */
export function getTodayLeaderboard(): DailyLeaderboardEntry[] {
  const today = getTodayString();
  return getDailyLeaderboard().filter(e => e.date === today);
}

/**
 * 获取某日最佳成绩
 */
export function getBestForDate(date: string): DailyLeaderboardEntry | null {
  const entries = getDailyLeaderboard().filter(e => e.date === date);
  if (entries.length === 0) return null;
  return entries.reduce((best, cur) => cur.moves < best.moves ? cur : best);
}

/**
 * 获取今日最佳成绩
 */
export function getTodayBest(): DailyLeaderboardEntry | null {
  return getBestForDate(getTodayString());
}

/**
 * 添加一条排行记录
 */
export function addDailyLeaderboardEntry(entry: DailyLeaderboardEntry): void {
  try {
    const entries = getDailyLeaderboard();
    entries.push(entry);
    // 只保留最近 MAX_ENTRIES 条
    if (entries.length > MAX_ENTRIES) {
      // 按日期排序，保留最近的记录
      entries.sort((a, b) => b.timestamp - a.timestamp);
      entries.splice(MAX_ENTRIES);
    }
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (e) { /* 忽略 */ }
}

/**
 * 获取历史统计
 */
export function getDailyStats(): {
  totalDays: number;       // 完成不同天数
  totalCompletions: number; // 总完成次数
  bestMoves: number | null; // 历史最少步数
  avgMoves: number;         // 平均步数
  perfectDays: number;      // 满星天数
} {
  const entries = getDailyLeaderboard();
  if (entries.length === 0) {
    return { totalDays: 0, totalCompletions: 0, bestMoves: null, avgMoves: 0, perfectDays: 0 };
  }
  const uniqueDates = new Set(entries.map(e => e.date));
  const totalMoves = entries.reduce((sum, e) => sum + e.moves, 0);
  const bestMoves = Math.min(...entries.map(e => e.moves));
  const perfectDays = new Set(entries.filter(e => e.stars === 3).map(e => e.date)).size;
  return {
    totalDays: uniqueDates.size,
    totalCompletions: entries.length,
    bestMoves,
    avgMoves: Math.round(totalMoves / entries.length),
    perfectDays,
  };
}

/**
 * 清空排行榜
 */
export function clearDailyLeaderboard(): void {
  localStorage.removeItem(LEADERBOARD_KEY);
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

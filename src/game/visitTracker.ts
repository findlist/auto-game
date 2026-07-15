// 站点访问统计模块
// 基于 localStorage 的轻量级访问追踪，无需后端服务
// 记录访问次数、会话时长、首次访问、回访等基础数据

import { STORAGE_KEYS } from './storageKeys';

const VISIT_KEY = STORAGE_KEYS.VISITS;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分钟无操作视为会话结束

export interface VisitData {
  totalVisits: number;       // 总访问次数
  firstVisit: number;        // 首次访问时间戳
  lastVisit: number;         // 最近访问时间戳
  totalSessions: number;     // 总会话数
  totalSessionDuration: number; // 总会话时长（秒）
  lastSessionStart: number;  // 上次会话开始时间
  dailyVisits: Record<string, number>; // 按日期记录访问次数 YYYY-MM-DD
  returnVisits: number;     // 回访次数（非首次访问）
}

const DEFAULT_DATA: VisitData = {
  totalVisits: 0,
  firstVisit: 0,
  lastVisit: 0,
  totalSessions: 0,
  totalSessionDuration: 0,
  lastSessionStart: 0,
  dailyVisits: {},
  returnVisits: 0,
};

/** 获取今日日期字符串 */
function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 加载访问数据 */
function loadVisitData(): VisitData {
  try {
    const raw = localStorage.getItem(VISIT_KEY);
    if (raw) return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch (e) { /* 忽略 */ }
  return { ...DEFAULT_DATA };
}

/** 保存访问数据 */
function saveVisitData(data: VisitData): void {
  try {
    localStorage.setItem(VISIT_KEY, JSON.stringify(data));
  } catch (e) { /* 忽略 */ }
}

/** 记录一次访问，自动判断是否为新会话 */
export function trackVisit(): { isNewSession: boolean; isFirstVisit: boolean; visitData: VisitData } {
  const data = loadVisitData();
  const now = Date.now();
  const today = getToday();

  // 判断是否为新会话（距离上次访问超过30分钟）
  const isNewSession = (now - data.lastVisit) > SESSION_TIMEOUT || data.lastVisit === 0;
  const isFirstVisit = data.totalVisits === 0;

  // 更新访问数据
  data.totalVisits += 1;
  if (data.firstVisit === 0) {
    data.firstVisit = now;
  } else {
    data.returnVisits += 1;
  }
  data.lastVisit = now;

  // 按日期记录
  if (!data.dailyVisits[today]) {
    data.dailyVisits[today] = 1;
  } else {
    data.dailyVisits[today] += 1;
  }

  // 会话统计
  if (isNewSession) {
    data.totalSessions += 1;
    data.lastSessionStart = now;
  }

  saveVisitData(data);

  return { isNewSession, isFirstVisit, visitData: data };
}

/** 记录会话时长（页面关闭或切后台时调用） */
export function recordSessionDuration(): void {
  try {
    // 使用 loadVisitData 合并默认值，避免旧数据缺少字段导致 NaN
    const data = loadVisitData();
    if (data.lastSessionStart > 0) {
      const duration = Math.floor((Date.now() - data.lastSessionStart) / 1000);
      if (duration > 0 && duration < 24 * 3600) {
        // 合理范围内才记录（过滤异常值）
        data.totalSessionDuration = (data.totalSessionDuration || 0) + duration;
        // 修复：累加后重置 lastSessionStart，避免重复调用时从会话开始重复累加
        data.lastSessionStart = Date.now();
        saveVisitData(data);
      }
    }
  } catch (e) { /* 忽略 */ }
}

/** 获取访问统计摘要 */
export function getVisitSummary(): VisitData {
  return loadVisitData();
}

/** 获取最近N天访问趋势 */
export function getRecentVisitTrend(days: number = 7): Array<{ date: string; visits: number }> {
  const data = loadVisitData();
  const trend: Array<{ date: string; visits: number }> = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    trend.push({
      date: dateStr,
      visits: data.dailyVisits[dateStr] || 0,
    });
  }
  return trend;
}

/** 获取平均会话时长（秒） */
export function getAvgSessionDuration(): number {
  const data = loadVisitData();
  if (data.totalSessions === 0) return 0;
  return Math.floor(data.totalSessionDuration / data.totalSessions);
}

/** 获取回访率 */
export function getReturnRate(): number {
  const data = loadVisitData();
  if (data.totalVisits === 0) return 0;
  return Math.round((data.returnVisits / data.totalVisits) * 100);
}

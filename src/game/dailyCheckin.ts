// 每日签到系统
// 记录签到天数，连续签到奖励，增强日活留存

import { STORAGE_KEYS } from './storageKeys';

const CHECKIN_KEY = STORAGE_KEYS.CHECKIN;

export interface CheckinRecord {
  lastCheckinDate: string | null;     // 上次签到日期 YYYY-MM-DD
  totalCheckins: number;               // 累计签到天数
  currentStreak: number;               // 连续签到天数
  bestStreak: number;                  // 最佳连续签到
  rewards: string[];                   // 已领取的奖励里程碑
  history: string[];                   // 签到历史日期列表
}

const DEFAULT_RECORD: CheckinRecord = {
  lastCheckinDate: null,
  totalCheckins: 0,
  currentStreak: 0,
  bestStreak: 0,
  rewards: [],
  history: [],
};

// 签到奖励里程碑
export const CHECKIN_REWARDS = [
  { days: 3, reward: '💡 提示道具 +1', icon: '🎁' },
  { days: 7, reward: '🎨 解锁隐藏主题预览', icon: '🌈' },
  { days: 14, reward: '⭐ 额外成就点数', icon: '🏆' },
  { days: 30, reward: '👑 签到大师称号', icon: '👑' },
];

function loadRecord(): CheckinRecord {
  try {
    const data = localStorage.getItem(CHECKIN_KEY);
    if (data) return { ...DEFAULT_RECORD, ...JSON.parse(data) };
  } catch (e) { /* 忽略 */ }
  return { ...DEFAULT_RECORD };
}

function saveRecord(record: CheckinRecord) {
  try {
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(record));
  } catch (e) { /* 忽略 */ }
}

// 获取今天的日期字符串
function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// 获取昨天的日期字符串
function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const DailyCheckin = {
  // 获取签到记录
  get(): CheckinRecord {
    return loadRecord();
  },

  // 今天是否已签到
  hasCheckedToday(): boolean {
    const record = loadRecord();
    return record.lastCheckinDate === getToday();
  },

  // 执行签到
  checkin(): { success: boolean; newStreak: number; totalDays: number; rewardUnlocked?: string; isMilestone: boolean } {
    const record = loadRecord();
    const today = getToday();
    
    // 已签到
    if (record.lastCheckinDate === today) {
      return { success: false, newStreak: record.currentStreak, totalDays: record.totalCheckins, isMilestone: false };
    }

    // 判断是否连续
    const yesterday = getYesterday();
    // 修复 P1：currentStreak 可能因数据损坏为 undefined/字符串，+= 1 会得到 NaN 或字符串拼接
    // 此处校验为有限数字，否则视为断签重新从 1 开始
    if (!Number.isFinite(record.currentStreak)) record.currentStreak = 0;
    if (record.lastCheckinDate === yesterday) {
      record.currentStreak += 1;
    } else {
      record.currentStreak = 1;
    }

    record.totalCheckins += 1;
    record.lastCheckinDate = today;
    record.history.push(today);
    // 保留最近90天历史
    if (record.history.length > 90) {
      record.history = record.history.slice(-90);
    }
    
    if (record.currentStreak > record.bestStreak) {
      record.bestStreak = record.currentStreak;
    }

    // 检查里程碑奖励
    let rewardUnlocked: string | undefined;
    let isMilestone = false;
    for (const reward of CHECKIN_REWARDS) {
      if (record.currentStreak === reward.days && !record.rewards.includes(String(reward.days))) {
        record.rewards.push(String(reward.days));
        rewardUnlocked = reward.reward;
        isMilestone = true;
        break;
      }
    }

    saveRecord(record);
    return { success: true, newStreak: record.currentStreak, totalDays: record.totalCheckins, rewardUnlocked, isMilestone };
  },

  // 获取连续签到天数
  getCurrentStreak(): number {
    return loadRecord().currentStreak;
  },

  // 获取累计签到天数
  getTotalDays(): number {
    return loadRecord().totalCheckins;
  },

  // 获取下一个里程碑
  getNextMilestone(): { days: number; reward: string; icon: string; remaining: number } | null {
    const record = loadRecord();
    for (const reward of CHECKIN_REWARDS) {
      if (record.currentStreak < reward.days) {
        return { days: reward.days, reward: reward.reward, icon: reward.icon, remaining: reward.days - record.currentStreak };
      }
    }
    return null; // 全部领取完毕
  },

  // 重置（用于设置页重置进度时同步调用）
  reset() {
    localStorage.removeItem(CHECKIN_KEY);
  },
};

// 周末奖励系统
// 周六周日每天额外领取1个提示道具，增强周末回访动力
// 每个周末（周六+周日）最多领取1次，避免重复

import { STORAGE_KEYS } from './storageKeys';
import { addHintItems } from './hintItems';

const WEEKEND_BONUS_KEY = STORAGE_KEYS.WEEKEND_BONUS;

interface WeekendBonusRecord {
  lastClaimedDate: string; // 最后领取日期 YYYY-MM-DD
  totalClaimed: number;    // 累计领取次数
}

// 获取本地日期字符串
function getLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 判断今天是否是周末（周六=6, 周日=0）
export function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

// 获取周末奖励记录
function loadRecord(): WeekendBonusRecord {
  try {
    const data = localStorage.getItem(WEEKEND_BONUS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // 修复 P1：JSON.parse("null") 返回 null 不抛错，但后续 record.lastClaimedDate 会抛 TypeError
      // 此处校验返回结构，非对象则回退到默认值
      if (parsed && typeof parsed === 'object') {
        return {
          lastClaimedDate: typeof parsed.lastClaimedDate === 'string' ? parsed.lastClaimedDate : '',
          totalClaimed: typeof parsed.totalClaimed === 'number' ? parsed.totalClaimed : 0,
        };
      }
    }
  } catch (e) { /* 忽略 */ }
  return { lastClaimedDate: '', totalClaimed: 0 };
}

// 今天是否已领取周末奖励
export function hasClaimedWeekendBonus(): boolean {
  const record = loadRecord();
  return record.lastClaimedDate === getLocalDateString(new Date());
}

// 尝试领取周末奖励
// 返回 null 表示不可领取或已领取，返回数字表示领取后的总道具数
export function claimWeekendBonus(): number | null {
  if (!isWeekend()) return null;
  if (hasClaimedWeekendBonus()) return null;

  const record = loadRecord();
  record.lastClaimedDate = getLocalDateString(new Date());
  record.totalClaimed = (record.totalClaimed || 0) + 1;

  try {
    localStorage.setItem(WEEKEND_BONUS_KEY, JSON.stringify(record));
  } catch (e) {
    // 写入失败则不发放道具，避免刷新后重复领取
    return null;
  }

  // 发放提示道具
  const newTotal = addHintItems(1);
  return newTotal;
}

// 获取周末奖励信息（用于UI展示）
export function getWeekendBonusInfo(): {
  isWeekend: boolean;
  claimed: boolean;
  totalClaimed: number;
} {
  const record = loadRecord();
  return {
    isWeekend: isWeekend(),
    claimed: hasClaimedWeekendBonus(),
    totalClaimed: record.totalClaimed || 0,
  };
}

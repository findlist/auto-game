// 提示道具系统
// 签到奖励获得的提示道具，用于游戏中获取提示
// 初始3次，签到奖励可增加，每日首次登录赠送1次（最多累积10次）

const HINT_ITEMS_KEY = 'color-sort-hint-items';
const MAX_HINT_ITEMS = 10;
const DAILY_BONUS_KEY = 'color-sort-hint-daily-bonus';

/** 获取当前提示道具数量 */
export function getHintItems(): number {
  try {
    const data = localStorage.getItem(HINT_ITEMS_KEY);
    return data ? parseInt(data, 10) || 0 : 3; // 初始3次
  } catch {
    return 3;
  }
}

/** 设置提示道具数量 */
export function setHintItems(count: number): number {
  const clamped = Math.max(0, Math.min(MAX_HINT_ITEMS, count));
  try {
    localStorage.setItem(HINT_ITEMS_KEY, String(clamped));
  } catch { /* 忽略 */ }
  return clamped;
}

/** 消耗一次提示道具，返回是否成功 */
export function useHintItem(): boolean {
  const current = getHintItems();
  if (current <= 0) return false;
  setHintItems(current - 1);
  return true;
}

/** 增加提示道具（签到奖励等） */
export function addHintItems(count: number): number {
  return setHintItems(getHintItems() + count);
}

/** 检查并领取每日赠送的1次提示道具 */
export function claimDailyHintBonus(): { claimed: boolean; total: number } {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  try {
    const lastBonus = localStorage.getItem(DAILY_BONUS_KEY);
    if (lastBonus === todayStr) {
      return { claimed: false, total: getHintItems() };
    }
    // 领取每日赠送
    const newTotal = addHintItems(1);
    localStorage.setItem(DAILY_BONUS_KEY, todayStr);
    return { claimed: true, total: newTotal };
  } catch {
    return { claimed: false, total: getHintItems() };
  }
}

/** 重置提示道具（设置页重置进度时同步调用） */
export function resetHintItems(): void {
  try {
    localStorage.removeItem(HINT_ITEMS_KEY);
    localStorage.removeItem(DAILY_BONUS_KEY);
  } catch { /* 忽略 */ }
}

export { MAX_HINT_ITEMS };

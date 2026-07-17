// 连续通关连击计数器
// 记录玩家连续无重置通关次数，增强成就感
// 通关时 +1，重置/返回首页时清零（不因撤销而清零）

const COMBO_KEY = 'color-sort-combo-streak';

/** 获取当前连击数 */
export function getComboStreak(): number {
  try {
    return parseInt(localStorage.getItem(COMBO_KEY) || '0', 10);
  } catch (e) { return 0; }
}

/** 连击 +1（通关时调用），返回更新后的连击数 */
export function incrementComboStreak(): number {
  const current = getComboStreak() + 1;
  try {
    localStorage.setItem(COMBO_KEY, String(current));
  } catch (e) { /* 忽略 */ }
  return current;
}

/** 重置连击（重置进度、切换模式时调用） */
export function resetComboStreak(): void {
  try {
    localStorage.setItem(COMBO_KEY, '0');
  } catch (e) { /* 忽略 */ }
}

/** 获取连击里程碑文案 */
export function getComboMilestone(combo: number): string | null {
  if (combo >= 20) return '🔥 20连击！传奇！';
  if (combo >= 15) return '🔥 15连击！超神！';
  if (combo >= 10) return '🔥 10连击！太强了！';
  if (combo >= 7) return '⚡ 7连击！手感火热！';
  if (combo >= 5) return '⚡ 5连击！状态绝佳！';
  if (combo >= 3) return '✨ 3连击！渐入佳境！';
  return null;
}

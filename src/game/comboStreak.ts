// 连续通关连击计数器
// 记录玩家连续无重置通关次数，增强成就感
// 通关时 +1，重置/返回首页时清零（不因撤销而清零）

const COMBO_KEY = 'color-sort-combo-streak';
// 记录已触发庆祝的连击数，避免同一连击数重复弹窗
const COMBO_CELEBRATED_KEY = 'color-sort-combo-celebrated';

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
    localStorage.removeItem(COMBO_CELEBRATED_KEY);
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

/** 里程碑配置：连击数 → 庆祝文案和图标 */
export interface ComboCelebration {
  combo: number;
  emoji: string;
  title: string;
  desc: string;
  color: string;
}

/** 连击里程碑庆祝配置表 */
const COMBO_MILESTONES: ComboCelebration[] = [
  { combo: 3, emoji: '✨', title: '3连击！', desc: '渐入佳境，继续保持！', color: '#4CAF50' },
  { combo: 5, emoji: '⚡', title: '5连击！', desc: '状态绝佳，势如破竹！', color: '#FF9800' },
  { combo: 7, emoji: '⚡', title: '7连击！', desc: '手感火热，锐不可当！', color: '#FF5722' },
  { combo: 10, emoji: '🔥', title: '10连击！', desc: '太强了！十连霸主！', color: '#f44336' },
  { combo: 15, emoji: '🔥', title: '15连击！', desc: '超神发挥，无人能挡！', color: '#E91E63' },
  { combo: 20, emoji: '🔥', title: '20连击！', desc: '传奇连击！色彩排序之王！', color: '#9C27B0' },
];

/**
 * 检查当前连击数是否应触发庆祝弹窗
 * 返回庆祝配置，同一连击数只触发一次
 */
export function checkComboCelebration(): ComboCelebration | null {
  const combo = getComboStreak();
  // 找到当前连击数对应的里程碑
  const milestone = COMBO_MILESTONES.find(m => m.combo === combo);
  if (!milestone) return null;

  // 检查是否已庆祝过该里程碑
  try {
    const celebrated: number[] = JSON.parse(localStorage.getItem(COMBO_CELEBRATED_KEY) || '[]');
    if (celebrated.includes(combo)) return null;
    // 记录已庆祝
    celebrated.push(combo);
    localStorage.setItem(COMBO_CELEBRATED_KEY, JSON.stringify(celebrated));
  } catch (e) { /* 忽略 */ }

  return milestone;
}

/** 获取连击累计总数（用于成就判定） */
export function getTotalComboCount(): number {
  try {
    return parseInt(localStorage.getItem('color-sort-total-combo') || '0', 10);
  } catch (e) { return 0; }
}

/** 累加连击总数（每次通关时调用） */
export function addTotalComboCount(): number {
  const total = getTotalComboCount() + 1;
  try {
    localStorage.setItem('color-sort-total-combo', String(total));
  } catch (e) { /* 忽略 */ }
  return total;
}

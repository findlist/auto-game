// 关卡提示配置：集中管理各关卡的新手引导提示
// 提取为独立模块，便于维护和扩展，避免 GameBoard 组件过大

export interface LevelTip {
  emoji: string;
  text: string;
  className: string;
  duration: number; // 毫秒
}

// 第2-20关渐进式提示：从基础操作到高阶策略
export const LEVEL_TIPS: Record<number, LevelTip> = {
  2:  { emoji: '💡', text: '点击试管选择，再点目标试管倒水', className: 'level2-tip', duration: 3500 },
  3:  { emoji: '🎯', text: '优先把一种颜色全部倒进一根试管', className: 'level3-tip', duration: 4000 },
  4:  { emoji: '🌈', text: '颜色变多了！先从最上面的颜色开始整理', className: 'level4-tip', duration: 4000 },
  5:  { emoji: '🤔', text: '倒水前先想好顺序，避免堵住出口', className: 'level5-tip', duration: 4000 },
  6:  { emoji: '📦', text: '空试管是中转站，先把混合色倒出来整理', className: 'level6-tip', duration: 4000 },
  7:  { emoji: '🔄', text: '试着从最后一步倒推，想想哪根试管最后填满', className: 'level7-tip', duration: 4000 },
  8:  { emoji: '🏗️', text: '试管多了空间更大，优先清空一根试管留作缓冲', className: 'level8-tip', duration: 4000 },
  9:  { emoji: '🎯', text: '颜色变多了！先选定一种颜色专注归位，逐个击破', className: 'level9-tip', duration: 4000 },
  10: { emoji: '🏅', text: '前10关毕业冲刺！综合运用空管缓冲、逆向倒推、分组归位', className: 'level10-tip', duration: 4000 },
  11: { emoji: '🧩', text: '难度升级了！先观察全局再动手，谋定而后动', className: 'level11-tip', duration: 4000 },
  12: { emoji: '💡', text: '试着把同色液体想象成注册拼图，先归位边角再填充中间', className: 'level12-tip', duration: 4000 },
  13: { emoji: '⚡', text: '高效移动是关键！尽量让每次倒水都减少混乱度', className: 'level13-tip', duration: 4500 },
  14: { emoji: '🔧', text: '尝试先固定一种颜色作为锚点，围绕它展开排序', className: 'level14-tip', duration: 4500 },
  15: { emoji: '🧠', text: '高难度关卡！分步拆解：先理清3-4色的局部，再扩展到全局', className: 'level15-tip', duration: 5000 },
  // 第16-20关：高阶策略提示，帮助玩家应对复杂局面
  16: { emoji: '🎯', text: '多色并行处理！尝试同时推进2-3种颜色的归位', className: 'level16-tip', duration: 5000 },
  17: { emoji: '🔄', text: '逆向思维：从最终状态倒推，规划每一步的归位顺序', className: 'level17-tip', duration: 5000 },
  18: { emoji: '💎', text: '追求三星！对比最优步数，减少无效倒水', className: 'level18-tip', duration: 5000 },
  19: { emoji: '⚡', text: '快速决策！在10秒内规划好下一步，训练直觉', className: 'level19-tip', duration: 5000 },
  20: { emoji: '🏆', text: '高难度挑战！综合运用所有技巧，享受解谜乐趣', className: 'level20-tip', duration: 5000 },
};

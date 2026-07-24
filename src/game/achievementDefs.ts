// 成就定义数据 — 从 achievements.ts 拆分，便于独立维护和扩展
// 包含成就稀有度映射表和成就定义列表

import type { AchievementRarity } from './achievements';

// 成就稀有度映射表 — 根据成就解锁难度分为四档
// common: 初期即可解锁的引导型成就
// rare: 需要一定技巧或坚持的中等难度成就
// epic: 需要长期坚持或高超技巧的高难度成就
// legendary: 极少数玩家可达成的终极成就
export const ACHIEVEMENT_RARITY: Record<string, AchievementRarity> = {
  // common — 引导型，初期自然解锁
  first_win: 'common',
  daily_first: 'common',
  checkin_first: 'common',
  all_round: 'common',
  stats_viewer: 'common',
  encyclopedia_visitor: 'common',
  quiz_first: 'common',
  daily_goal_first: 'common',
  pair_speed_easy: 'common',
  color_mixer_10: 'common',
  knowledge_explorer: 'common',
  quiz_sharer: 'common',

  // rare — 中等难度，需要技巧或短期坚持
  level_10: 'rare',
  level_25: 'rare',
  no_hint_5: 'rare',
  speed_run: 'rare',
  streak_3: 'rare',
  endless_5: 'rare',
  timed_5: 'rare',
  checkin_7: 'rare',
  play_days_7: 'rare',
  total_100_moves: 'rare',
  speed_30s: 'rare',
  perfect_10: 'rare',
  explorer_20: 'rare',
  color_master_5: 'rare',
  color_perception_8: 'rare',
  sequence_memory_5: 'rare',
  pair_match_master: 'rare',
  reaction_sharp: 'rare',
  pair_speed_hard: 'rare',
  quiz_streak_7: 'rare',
  encyclopedia_explorer: 'rare',
  quiz_expert: 'rare',
  color_master_8: 'rare',
  combo_5: 'rare',
  total_combo_50: 'rare',
  weekly_first: 'rare',
  all_encyclopedia_games: 'rare',

  // epic — 高难度，需要长期坚持或高超技巧
  level_50: 'epic',
  level_75: 'epic',
  efficient: 'epic',
  streak_5: 'epic',
  endless_15: 'epic',
  timed_10: 'epic',
  daily_streak_7: 'epic',
  checkin_30: 'epic',
  play_days_30: 'epic',
  total_5000_moves: 'epic',
  speed_15s: 'epic',
  perfect_30: 'epic',
  explorer_50: 'epic',
  sequence_memory_10: 'epic',
  reaction_perfect: 'epic',
  quiz_streak_30: 'epic',
  combo_10: 'epic',
  total_combo_100: 'epic',
  weekly_streak_4: 'epic',
  daily_goal_all: 'epic',
  persistent: 'epic',
  color_master_all: 'epic',

  // legendary — 终极成就，极少数玩家可达成
  level_100: 'legendary',
  streak_10: 'legendary',
  endless_30: 'legendary',
  timed_20: 'legendary',
  checkin_100: 'legendary',
  play_days_100: 'legendary',
  weekly_streak_12: 'legendary',
  quiz_consecutive_30: 'legendary',
  quiz_consecutive_100: 'legendary',
  combo_20: 'legendary',
  total_combo_200: 'legendary',
  daily_goal_7days: 'legendary',
};

// 成就定义列表 — 每个成就包含 id/名称/描述/图标
export const ACHIEVEMENT_DEFS = [
  {
    id: 'first_win',
    name: '初出茅庐',
    description: '完成第一关',
    icon: '🎯',
  },
  {
    id: 'level_10',
    name: '小试牛刀',
    description: '通过第 10 关',
    icon: '🏅',
  },
  {
    id: 'level_25',
    name: '渐入佳境',
    description: '通过第 25 关',
    icon: '🥈',
  },
  {
    id: 'level_50',
    name: '色彩大师',
    description: '通过第 50 关',
    icon: '🥇',
  },
  {
    id: 'no_hint_5',
    name: '独立思考',
    description: '连续 5 关不使用提示',
    icon: '🧠',
  },
  {
    id: 'speed_run',
    name: '闪电手',
    description: '10 步以内完成任意关卡',
    icon: '⚡',
  },
  {
    id: 'efficient',
    name: '效率专家',
    description: '用最少步数完成关卡（达到理论最优）',
    icon: '💎',
  },
  {
    id: 'daily_first',
    name: '每日挑战者',
    description: '完成首次每日挑战',
    icon: '📅',
  },
  {
    id: 'daily_streak_7',
    name: '坚持不懈',
    description: '连续 7 天完成每日挑战',
    icon: '🔥',
  },
  {
    id: 'persistent',
    name: '永不言弃',
    description: '在死局后撤销并最终通关',
    icon: '💪',
  },
  {
    id: 'streak_3',
    name: '三连奏',
    description: '连续 3 关不使用提示和撤销通关',
    icon: '🔥',
  },
  {
    id: 'streak_5',
    name: '五连捷',
    description: '连续 5 关不使用提示和撤销通关',
    icon: '🔥',
  },
  {
    id: 'streak_10',
    name: '十连霸',
    description: '连续 10 关不使用提示和撤销通关',
    icon: '👑',
  },
  {
    id: 'endless_5',
    name: '无尽探索者',
    description: '无尽模式连续通过 5 关',
    icon: '🌌',
  },
  {
    id: 'endless_15',
    name: '无尽征服者',
    description: '无尽模式连续通过 15 关',
    icon: '🚀',
  },
  {
    id: 'endless_30',
    name: '无尽传奇',
    description: '无尽模式连续通过 30 关',
    icon: '👑',
  },
  {
    id: 'timed_5',
    name: '速度之星',
    description: '限时模式单局通过 5 关',
    icon: '⏱️',
  },
  {
    id: 'timed_10',
    name: '风驰电掣',
    description: '限时模式单局通过 10 关',
    icon: '🌪️',
  },
  {
    id: 'timed_20',
    name: '超越极限',
    description: '限时模式单局通过 20 关',
    icon: '💥',
  },
  // 签到成就
  {
    id: 'checkin_first',
    name: '初次签到',
    description: '完成首次每日签到',
    icon: '📝',
  },
  {
    id: 'checkin_7',
    name: '坚持签到',
    description: '连续签到 7 天',
    icon: '🗓️',
  },
  {
    id: 'checkin_30',
    name: '签到达人',
    description: '累计签到 30 天',
    icon: '🎖️',
  },
  {
    id: 'checkin_100',
    name: '签到传说',
    description: '累计签到 100 天',
    icon: '👑',
  },
  // 累计游玩天数里程碑成就 — 激励玩家长期回访，增强留存
  {
    id: 'play_days_7',
    name: '一周常客',
    description: '累计游玩 7 天',
    icon: '📅',
  },
  {
    id: 'play_days_30',
    name: '月度忠实玩家',
    description: '累计游玩 30 天',
    icon: '🗓️',
  },
  {
    id: 'play_days_100',
    name: '百日传奇',
    description: '累计游玩 100 天',
    icon: '🏆',
  },
  // 步数与效率成就
  {
    id: 'total_100_moves',
    name: '步数大师',
    description: '累计操作达到 1000 步',
    icon: '👣',
  },
  {
    id: 'total_5000_moves',
    name: '千步行者',
    description: '累计操作达到 5000 步',
    icon: '🚶',
  },
  // 速度成就
  {
    id: 'speed_30s',
    name: '速度狂人',
    description: '30 秒内完成任意关卡',
    icon: '🏃',
  },
  {
    id: 'speed_15s',
    name: '极速通关',
    description: '15 秒内完成任意关卡',
    icon: '⚡',
  },
  // 满星成就
  {
    id: 'perfect_10',
    name: '满星达人',
    description: '获得 10 个三星评价',
    icon: '🌟',
  },
  {
    id: 'perfect_30',
    name: '满星大师',
    description: '获得 30 个三星评价',
    icon: '✨',
  },
  // 通关里程碑
  {
    id: 'level_75',
    name: '色彩专家',
    description: '通过第 75 关',
    icon: '🏆',
  },
  {
    id: 'level_100',
    name: '色彩王者',
    description: '通过第 100 关',
    icon: '👑',
  },
  // 周挑战成就
  {
    id: 'weekly_first',
    name: '周挑战者',
    description: '完成首次周挑战',
    icon: '🏆',
  },
  {
    id: 'weekly_streak_4',
    name: '月度坚持',
    description: '连续 4 周完成周挑战',
    icon: '🏅',
  },
  {
    id: 'weekly_streak_12',
    name: '季度挑战王',
    description: '连续 12 周完成周挑战',
    icon: '👑',
  },
  // 关卡探索者成就
  {
    id: 'explorer_20',
    name: '探索新手',
    description: '通关 20 个不同关卡',
    icon: '🗺️',
  },
  {
    id: 'explorer_50',
    name: '探索达人',
    description: '通关 50 个不同关卡',
    icon: '🧭',
  },
  // 色彩收藏家成就
  {
    id: 'color_master_5',
    name: '色彩收藏家',
    description: '在单关中整理 5 种以上颜色',
    icon: '🌈',
  },
  {
    id: 'color_master_8',
    name: '色彩指挥家',
    description: '在单关中整理 8 种以上颜色',
    icon: '🎨',
  },
  // 全模式体验成就
  {
    id: 'all_round',
    name: '全能玩家',
    description: '体验所有游戏模式（闯关/每日/无尽/限时/周挑战）',
    icon: '🎮',
  },
  // 色彩知识成就
  {
    id: 'encyclopedia_visitor',
    name: '色彩学家',
    description: '访问色彩百科页面',
    icon: '📚',
  },
  {
    id: 'color_master_all',
    name: '色彩百科全书',
    description: '通关100关并访问色彩百科',
    icon: '📖',
  },
  // 色彩辨识与混合成就
  {
    id: 'color_perception_8',
    name: '色彩辨识者',
    description: '色彩辨识测试得分8分以上',
    icon: '👁️',
  },
  {
    id: 'color_mixer_10',
    name: '混合大师',
    description: '使用颜色混合器10次',
    icon: '🎭',
  },
  // 色彩序列记忆成就
  {
    id: 'sequence_memory_5',
    name: '序列记忆者',
    description: '色彩序列记忆到达第5关',
    icon: '🎵',
  },
  {
    id: 'sequence_memory_10',
    name: '记忆大师',
    description: '色彩序列记忆到达第10关',
    icon: '🧠',
  },
  // 色彩配对成就
  {
    id: 'pair_match_master',
    name: '配对达人',
    description: '困难模式配对完成',
    icon: '🃏',
  },
  // 色彩反应力测试成就
  {
    id: 'reaction_perfect',
    name: '反应大师',
    description: '色彩反应力测试全部正确',
    icon: '⚡',
  },
  {
    id: 'reaction_sharp',
    name: '反应敏捷',
    description: '色彩反应力测试正确6个以上',
    icon: '🎯',
  },
  // 配对计时模式成就
  {
    id: 'pair_speed_easy',
    name: '闪电配对',
    description: '计时模式简单难度完成配对',
    icon: '⏱️',
  },
  {
    id: 'pair_speed_hard',
    name: '极速配对',
    description: '计时模式困难难度完成配对',
    icon: '🚀',
  },
  // 统计成就
  {
    id: 'stats_viewer',
    name: '数据控',
    description: '查看游戏统计页面',
    icon: '📊',
  },
  // 每日问答成就
  {
    id: 'quiz_first',
    name: '色彩学徒',
    description: '完成首次每日色彩问答',
    icon: '📝',
  },
  {
    id: 'quiz_streak_7',
    name: '好学不倦',
    description: '累计完成7次每日色彩问答',
    icon: '📚',
  },
  {
    id: 'quiz_streak_30',
    name: '色彩学者',
    description: '累计完成30次每日色彩问答',
    icon: '🎓',
  },
  {
    id: 'quiz_consecutive_30',
    name: '色彩智者',
    description: '连续30天完成每日色彩问答',
    icon: '🧙',
  },
  {
    id: 'quiz_consecutive_100',
    name: '色彩圣贤',
    description: '连续100天完成每日色彩问答',
    icon: '🌟',
  },
  {
    id: 'knowledge_explorer',
    name: '知识探索者',
    description: '在色彩百科中使用搜索功能',
    icon: '🔍',
  },
  {
    id: 'quiz_sharer',
    name: '知识传播者',
    description: '分享每日色彩问答结果',
    icon: '📤',
  },
  {
    id: 'encyclopedia_explorer',
    name: '百科探索者',
    description: '在色彩百科中浏览5种以上颜色详解',
    icon: '📖',
  },
  {
    id: 'quiz_expert',
    name: '答题高手',
    description: '每日问答累计正确10题',
    icon: '🎓',
  },
  {
    id: 'all_encyclopedia_games',
    name: '全能玩家',
    description: '体验色彩百科中所有小游戏',
    icon: '🏅',
  },
  // 连击里程碑成就 — 激励玩家保持连续通关
  {
    id: 'combo_5',
    name: '连击新手',
    description: '单次连续通关达到 5 连击',
    icon: '⚡',
  },
  {
    id: 'combo_10',
    name: '连击高手',
    description: '单次连续通关达到 10 连击',
    icon: '🔥',
  },
  {
    id: 'combo_20',
    name: '连击传奇',
    description: '单次连续通关达到 20 连击',
    icon: '👑',
  },
  // 累计连击成就 — 长期目标感
  {
    id: 'total_combo_50',
    name: '连击累计者',
    description: '累计连击通关 50 次',
    icon: '💪',
  },
  {
    id: 'total_combo_100',
    name: '连击百次达成',
    description: '累计连击通关 100 次',
    icon: '💯',
  },
  {
    id: 'total_combo_200',
    name: '连击大师',
    description: '累计连击通关 200 次',
    icon: '🏆',
  },
  // 每日目标成就 — 引导玩家参与每日目标系统
  {
    id: 'daily_goal_first',
    name: '目标达成',
    description: '完成首个每日目标',
    icon: '🎯',
  },
  {
    id: 'daily_goal_all',
    name: '全线飘绿',
    description: '单日完成所有每日目标',
    icon: '🌟',
  },
  {
    id: 'daily_goal_7days',
    name: '目标坚持者',
    description: '连续 7 天完成所有每日目标',
    icon: '📅',
  },
];

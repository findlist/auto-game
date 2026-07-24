// 游戏内错题与低分记录存储模块
// 从 announcements.ts 拆分，负责色彩辨识/反应力/配对游戏的错题与低分记录管理
// 设计原因：错题存储功能独立于公告系统，拆分后减小首屏加载的 announcements 模块体积

/**
 * 色彩辨识测试错题存储
 * 记录辨识测试中答错的题目，支持回顾练习
 */
const PERCEPTION_WRONG_KEY = 'color_perception_wrong_answers';

export interface PerceptionWrongAnswer {
  targetColor: string;   // 正确颜色名称
  targetHex: string;     // 正确颜色色值
  userColor: string;     // 用户选择的颜色名称
  userHex: string;       // 用户选择的颜色色值
  options: string[];     // 本轮所有选项颜色名称
  date: string;          // 错题日期
  timestamp: number;     // 时间戳
}

/**
 * 保存色彩辨识测试错题
 */
export function savePerceptionWrongAnswer(record: PerceptionWrongAnswer): void {
  try {
    const list = getPerceptionWrongAnswers();
    list.unshift(record);
    // 最多保留 50 条错题记录
    if (list.length > 50) list.length = 50;
    localStorage.setItem(PERCEPTION_WRONG_KEY, JSON.stringify(list));
  } catch (e) { /* 忽略 */ }
}

/**
 * 获取色彩辨识测试错题列表
 */
export function getPerceptionWrongAnswers(): PerceptionWrongAnswer[] {
  try {
    const raw = localStorage.getItem(PERCEPTION_WRONG_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PerceptionWrongAnswer[];
  } catch (e) { return []; }
}

/**
 * 清除色彩辨识测试错题记录
 */
export function clearPerceptionWrongAnswers(): void {
  try {
    localStorage.removeItem(PERCEPTION_WRONG_KEY);
  } catch (e) { /* 忽略 */ }
}

/**
 * 反应力测试错题存储
 * 记录反应力测试中答错的题目，支持回顾练习
 */
const REACTION_WRONG_KEY = 'color_reaction_wrong_answers';

export interface ReactionWrongAnswer {
  targetName: string;    // 正确颜色名称
  targetHex: string;     // 正确颜色色值
  userName: string;      // 用户选择的颜色名称
  userHex: string;       // 用户选择的颜色色值
  round: number;         // 第几轮
  totalRounds: number;   // 总轮数
  date: string;          // 错题日期
  timestamp: number;     // 时间戳
}

/**
 * 保存反应力测试错题
 */
export function saveReactionWrongAnswer(record: ReactionWrongAnswer): void {
  try {
    const list = getReactionWrongAnswers();
    list.unshift(record);
    // 最多保留 50 条错题记录
    if (list.length > 50) list.length = 50;
    localStorage.setItem(REACTION_WRONG_KEY, JSON.stringify(list));
  } catch (e) { /* 忽略 */ }
}

/**
 * 获取反应力测试错题列表
 */
export function getReactionWrongAnswers(): ReactionWrongAnswer[] {
  try {
    const raw = localStorage.getItem(REACTION_WRONG_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReactionWrongAnswer[];
  } catch (e) { return []; }
}

/**
 * 清除反应力测试错题记录
 */
export function clearReactionWrongAnswers(): void {
  try {
    localStorage.removeItem(REACTION_WRONG_KEY);
  } catch (e) { /* 忽略 */ }
}

/**
 * 配对游戏低分记录存储
 * 记录配对游戏中步数过多的对局，支持回顾改进
 */
const PAIR_LOW_SCORE_KEY = 'color_pair_low_scores';

export interface PairLowScoreRecord {
  difficulty: string;      // 难度标签
  pairs: number;           // 配对数
  moves: number;           // 使用步数
  parMoves: number;        // 理论最少步数（等于配对数）
  efficiency: number;      // 效率百分比（parMoves/moves*100）
  timedMode: boolean;      // 是否计时模式
  timeUsed: number;        // 使用时间（秒）
  date: string;            // 日期
  timestamp: number;       // 时间戳
}

/**
 * 保存配对游戏低分记录
 */
export function savePairLowScore(record: PairLowScoreRecord): void {
  try {
    const list = getPairLowScores();
    list.unshift(record);
    // 最多保留 30 条记录
    if (list.length > 30) list.length = 30;
    localStorage.setItem(PAIR_LOW_SCORE_KEY, JSON.stringify(list));
  } catch (e) { /* 忽略 */ }
}

/**
 * 获取配对游戏低分记录列表
 */
export function getPairLowScores(): PairLowScoreRecord[] {
  try {
    const raw = localStorage.getItem(PAIR_LOW_SCORE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PairLowScoreRecord[];
  } catch (e) { return []; }
}

/**
 * 清除配对游戏低分记录
 */
export function clearPairLowScores(): void {
  try {
    localStorage.removeItem(PAIR_LOW_SCORE_KEY);
  } catch (e) { /* 忽略 */ }
}

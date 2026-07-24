// 游戏内公告系统
// 管理游戏公告、活动通知，支持本地标记已读
// 每日贴士库已拆分至 dailyTipsData.ts，色彩知识库已拆分至 colorKnowledgeData.ts，色彩问答题库已拆分至 colorQuizData.ts

import { DAILY_TIPS } from './dailyTipsData';
import { COLOR_KNOWLEDGE_DAILY } from './colorKnowledgeData';

const ANNOUNCEMENTS_KEY = 'color-sort-announcements-read';
const DAILY_TIP_DATE_KEY = 'color-sort-daily-tip-date';
const DAILY_TIP_INDEX_KEY = 'color-sort-daily-tip-index';

export interface Announcement {
  id: string;
  type: 'info' | 'event' | 'update' | 'tip';
  title: string;
  content: string;
  icon: string;
  createdAt: number;
  dismissible?: boolean;
}

// 获取当前有效公告列表
export function getActiveAnnouncements(): Announcement[] {
  const now = Date.now();
  const all: Announcement[] = [
    {
      id: 'welcome_v112',
      type: 'info',
      title: '欢迎使用色彩排序',
      content: '100关闯关模式、每日挑战、无尽模式、限时挑战，总有一种适合你！',
      icon: '🎨',
      createdAt: now,
      dismissible: true,
    },
    {
      id: 'tip_stars',
      type: 'tip',
      title: '追求三星通关',
      content: '步数越少星级越高！对比最优步数，挑战自己的最佳记录。',
      icon: '⭐',
      createdAt: now,
      dismissible: true,
    },
    {
      id: 'tip_checkin',
      type: 'tip',
      title: '每日签到领道具',
      content: '每天签到可获得提示道具，连续签到还有额外奖励！',
      icon: '📅',
      createdAt: now,
      dismissible: true,
    },
    {
      id: 'feature_editor',
      type: 'update',
      title: '新增关卡编辑器',
      content: '现在你可以自创关卡并分享给好友！前往设置页试试吧。',
      icon: '🛠️',
      createdAt: now,
      dismissible: true,
    },
  ];
  return all;
}

// 每日策略小贴士库已拆分至 dailyTipsData.ts（30条轮播）

/**
 * 获取今日每日策略小贴士（按日期轮播，30天循环）
 */
export function getTodayTip(): { title: string; content: string; icon: string } {
  // 使用本地日期，与 dailyChallenge/dailyCheckin 等模块保持一致
  // 修复：原代码用 toISOString() 取 UTC 日期，导致贴士在本地午夜-UTC 午夜间显示"昨天"的
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  let tipIndex = 0;
  try {
    const lastDate = localStorage.getItem(DAILY_TIP_DATE_KEY);
    const lastIndex = localStorage.getItem(DAILY_TIP_INDEX_KEY);
    if (lastDate === today && lastIndex !== null) {
      tipIndex = parseInt(lastIndex, 10);
    } else {
      // 按日期计算索引（30天循环）
      const dayEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
      tipIndex = dayEpoch % DAILY_TIPS.length;
      localStorage.setItem(DAILY_TIP_DATE_KEY, today);
      localStorage.setItem(DAILY_TIP_INDEX_KEY, tipIndex.toString());
    }
    // 边界保护：防止 localStorage 数据损坏导致 tipIndex 越界
    if (isNaN(tipIndex) || tipIndex < 0 || tipIndex >= DAILY_TIPS.length) {
      tipIndex = 0;
    }
  } catch (e) { /* 忽略 */ }
  return DAILY_TIPS[tipIndex];
}

/**
 * 获取每日小贴士列表（用于设置页展示所有贴士）
 */
export function getAllDailyTips(): Array<{ title: string; content: string; icon: string }> {
  return DAILY_TIPS;
}

// 获取已读公告ID列表
function getReadIds(): Set<string> {
  try {
    const data = localStorage.getItem(ANNOUNCEMENTS_KEY);
    if (data) {
      // 修复 P0：JSON.parse 结果可能是字符串/数字/对象，new Set(字符串) 会按字符拆分
      // 导致已读状态完全错乱，必须校验为数组后再构造 Set
      const parsed = JSON.parse(data);
      return new Set(Array.isArray(parsed) ? parsed : []);
    }
  } catch (e) { /* 忽略 */ }
  return new Set();
}

// 标记公告为已读
export function markAnnouncementRead(id: string): void {
  try {
    const readIds = getReadIds();
    readIds.add(id);
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify([...readIds]));
  } catch (e) { /* 忽略 */ }
}

// 获取未读公告
export function getUnreadAnnouncements(): Announcement[] {
  const readIds = getReadIds();
  return getActiveAnnouncements().filter(a => !readIds.has(a.id));
}

// 获取所有公告（含已读状态）
export function getAllAnnouncementsWithStatus(): Array<Announcement & { isRead: boolean }> {
  const readIds = getReadIds();
  return getActiveAnnouncements().map(a => ({ ...a, isRead: readIds.has(a.id) }));
}

// 每日色彩知识库已拆分至 colorKnowledgeData.ts（10条轮播）

/**
 * 获取今日色彩知识（按日期循环）
 */
export function getTodayColorKnowledge(): { emoji: string; name: string; text: string } {
  const dayEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const index = dayEpoch % COLOR_KNOWLEDGE_DAILY.length;
  return COLOR_KNOWLEDGE_DAILY[index];
}

// 色彩问答题库已拆分至独立文件 colorQuizData.ts，便于维护和扩展
import { DAILY_COLOR_QUIZ } from './colorQuizData';

/**
 * 获取今日色彩问答（按日期循环，50天一轮）
 */
export function getTodayColorQuiz(): { question: string; options: string[]; answer: number; explanation: string; dayIndex: number; difficulty: 'easy' | 'medium' | 'hard' } {
  const dayEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const index = dayEpoch % DAILY_COLOR_QUIZ.length;
  return { ...DAILY_COLOR_QUIZ[index], dayIndex: index };
}

/**
 * 获取每日色彩问答历史记录
 * 兼容旧数据：difficulty 字段可能不存在（旧记录默认为 'easy'）
 */
export function getDailyQuizHistory(): Array<{ dayIndex: number; correct: boolean; date: string; difficulty?: 'easy' | 'medium' | 'hard' }> {
  try {
    const data = localStorage.getItem('daily_quiz_history');
    if (data) {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) { /* 忽略 */ }
  return [];
}

/**
 * 保存每日色彩问答结果（含难度等级）
 */
export function saveDailyQuizResult(dayIndex: number, correct: boolean, difficulty?: 'easy' | 'medium' | 'hard'): void {
  try {
    const history = getDailyQuizHistory();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (!history.find(h => h.dayIndex === dayIndex && h.date === todayStr)) {
      history.push({ dayIndex, correct, date: todayStr, difficulty });
      if (history.length > 90) history.shift();
      localStorage.setItem('daily_quiz_history', JSON.stringify(history));
    }
  } catch (e) { /* 忽略 */ }
}

/**
 * 获取每日问答难度分级统计
 * 返回各难度的答题数和正确数
 */
export function getQuizDifficultyStats(): { 
  easy: { total: number; correct: number };
  medium: { total: number; correct: number };
  hard: { total: number; correct: number };
} {
  const history = getDailyQuizHistory();
  const stats = {
    easy: { total: 0, correct: 0 },
    medium: { total: 0, correct: 0 },
    hard: { total: 0, correct: 0 },
  };
  for (const h of history) {
    // 旧记录无 difficulty 字段，根据 dayIndex 查题库获取难度
    const diff = h.difficulty || DAILY_COLOR_QUIZ[h.dayIndex]?.difficulty || 'easy';
    if (diff === 'easy') { stats.easy.total++; if (h.correct) stats.easy.correct++; }
    else if (diff === 'medium') { stats.medium.total++; if (h.correct) stats.medium.correct++; }
    else if (diff === 'hard') { stats.hard.total++; if (h.correct) stats.hard.correct++; }
  }
  return stats;
}

/**
 * 获取每日问答连续答题天数
 * 基于历史记录计算连续天数（今天或昨天必须有答题记录）
 */
export function getQuizStreak(): number {
  try {
    const history = getDailyQuizHistory();
    if (history.length === 0) return 0;
    // 按日期排序（降序）
    const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    // 今天或昨天必须有答题记录才算连续
    if (sorted[0].date !== todayStr && sorted[0].date !== yesterdayStr) return 0;
    // 计算连续天数
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].date);
      const curr = new Date(sorted[i].date);
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  } catch (e) { return 0; }
}

/**
 * 获取每日问答错题列表
 * 从历史记录中筛选答错的题目，关联题库返回完整信息
 */
export function getQuizWrongAnswers(): Array<{
  dayIndex: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  date: string;
  userAnswer: number;
}> {
  try {
    const history = getDailyQuizHistory();
    const wrongRecords = history.filter(h => !h.correct);
    // 关联题库获取完整题目信息
    return wrongRecords.map(h => {
      const quiz = DAILY_COLOR_QUIZ[h.dayIndex];
      if (!quiz) return null;
      // 尝试从 localStorage 获取用户选择的答案
      const userAnswerKey = `quiz_user_answer_${h.dayIndex}_${h.date}`;
      const userAnswer = parseInt(localStorage.getItem(userAnswerKey) || '0', 10);
      return {
        dayIndex: h.dayIndex,
        question: quiz.question,
        options: quiz.options,
        correctAnswer: quiz.answer,
        explanation: quiz.explanation,
        difficulty: quiz.difficulty,
        date: h.date,
        userAnswer: isNaN(userAnswer) ? -1 : userAnswer,
      };
    }).filter(Boolean) as Array<{
      dayIndex: number;
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
      difficulty: 'easy' | 'medium' | 'hard';
      date: string;
      userAnswer: number;
    }>;
  } catch (e) { return []; }
}

export function saveQuizUserAnswer(dayIndex: number, date: string, userAnswer: number): void {
  try {
    const key = `quiz_user_answer_${dayIndex}_${date}`;
    localStorage.setItem(key, String(userAnswer));
    // 只保留最近90天的用户答案记录
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith('quiz_user_answer_'));
    if (allKeys.length > 90) {
      // 按时间清理旧记录
      const sorted = allKeys.sort();
      const toRemove = sorted.slice(0, allKeys.length - 90);
      toRemove.forEach(k => localStorage.removeItem(k));
    }
  } catch (e) { /* 忽略 */ }
}

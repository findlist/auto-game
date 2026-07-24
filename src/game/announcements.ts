// 游戏内公告系统
// 管理游戏公告、活动通知、每日策略小贴士，支持本地标记已读
// 色彩问答题库已拆分至 colorQuizData.ts

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

// 每日策略小贴士库（30条轮播）
const DAILY_TIPS: Array<{ title: string; content: string; icon: string }> = [
  { title: '保持空试管', content: '尽量保留至少一个空试管作为缓冲，灵活性大增！', icon: '🧪' },
  { title: '从少到多', content: '优先处理颜色种类少的试管，减少干扰因素。', icon: '🎯' },
  { title: '逆向思维', content: '先想好最终状态，再倒推每一步该怎么走。', icon: '🧠' },
  { title: '分层策略', content: '底部颜色优先归位，避免反复移动上层颜色。', icon: '📊' },
  { title: '少即是多', content: '每步倾倒尽量多转移颜色，减少总步数。', icon: '✨' },
  { title: '观察顶色', content: '倒之前看清两个试管顶部颜色是否一致，避免无效操作。', icon: '👀' },
  { title: '计划路线', content: '连续2-3步先想好，别走一步看一步。', icon: '🗺️' },
  { title: '避免死局', content: '感觉快卡住时及时撤销，换个思路重来。', icon: '🚫' },
  { title: '连击效应', content: '连续同色合并会触发连击音效，高效操作很爽！', icon: '🎵' },
  { title: '每日挑战', content: '每天一关种子固定，和所有玩家比拼步数！', icon: '📅' },
  { title: '星级目标', content: '三星通关需要达到或超过最优步数，挑战自我极限。', icon: '⭐' },
  { title: '无尽模式', content: '无尽模式难度递增，适合长时间休闲游玩。', icon: '∞' },
  { title: '限时挑战', content: '限时模式考验速度和判断力，紧张刺激！', icon: '⏱️' },
  { title: '关卡编辑器', content: '自创关卡分享给好友，比比谁的设计的关卡更精妙！', icon: '🛠️' },
  { title: '签到攒道具', content: '每天签到领提示道具，连续签到奖励更多！', icon: '🎁' },
  { title: '回放复盘', content: '通关后查看回放，分析每步的优劣，下次更高效。', icon: '🎬' },
  { title: '颜色记忆', content: '记住每种颜色在哪些试管中，规划更清晰。', icon: '🌈' },
  { title: '从底向上', content: '试管底部颜色最难移动，优先把它归位。', icon: '⬆️' },
  { title: '善用撤销', content: '撤销不是失败，是策略调整的工具！', icon: '↩️' },
  { title: '模式切换', content: '卡在某一关时，试试每日挑战或无尽模式换个心情。', icon: '🔄' },
  { title: '满管优先', content: '接近满的单一颜色试管，优先完成它！', icon: '✅' },
  { title: '隔离颜色', content: '把独特的颜色单独放到一个试管，减少干扰。', icon: '🧩' },
  { title: '步数意识', content: '时刻关注步数和最优步数的差距，有意识优化。', icon: '📊' },
  { title: '分享战绩', content: '通关后生成战绩图分享到朋友圈，秀出你的成绩！', icon: '📤' },
  { title: '新手引导', content: '点击游戏中的"❓ 帮助"按钮随时查看玩法和快捷键。', icon: '📖' },
  { title: '移动端技巧', content: '长按试管0.5秒可撤销，不用费力点撤销按钮。', icon: '📱' },
  { title: '成就系统', content: '59个成就等你解锁，查看统计页了解进度！', icon: '🏆' },
  { title: '排行榜', content: '每日挑战完成后自动记录到本地排行榜，刷新看看排名！', icon: '🥇' },
  { title: 'PWA安装', content: '可以将本站添加到手机主屏，像APP一样打开游玩！', icon: '📲' },
  { title: '数据安全', content: '你的所有数据都存在本地，不会上传到任何服务器。', icon: '🔒' },
  { title: '挑战自我', content: '高星关卡需要策略和耐心，别急着一口气通关！', icon: '🎮' },
];

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

// 每日色彩知识库
const COLOR_KNOWLEDGE_DAILY: Array<{ emoji: string; name: string; text: string }> = [
  { emoji: '🔴', name: '红色', text: '红色是可见光谱中波长最长的颜色，代表热情与活力。' },
  { emoji: '🔵', name: '蓝色', text: '蓝色是天空和海洋的颜色，代表平静与信任。' },
  { emoji: '🟡', name: '黄色', text: '黄色是最亮的颜色，代表阳光与快乐。' },
  { emoji: '🟢', name: '绿色', text: '绿色位于可见光谱中央，人眼最敏感的颜色。' },
  { emoji: '🟣', name: '紫色', text: '紫色波长最短，历史上象征高贵与神秘。' },
  { emoji: '🟠', name: '橙色', text: '橙色结合红色的热情和黄色的快乐，代表温暖。' },
  { emoji: '🌸', name: '粉色', text: '粉色是红色与白色的混合，代表温柔与浪漫。' },
  { emoji: '🔷', name: '青色', text: '青色介于蓝色和绿色之间，代表清新与科技。' },
  { emoji: '🟤', name: '棕色', text: '棕色代表大地与稳重，是咖啡和巧克力的颜色。' },
  { emoji: '⚫', name: '灰色', text: '灰色是黑色和白色的混合，代表中性与平衡。' },
];

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

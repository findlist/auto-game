// 游戏内公告系统
// 管理游戏公告、活动通知、每日策略小贴士，支持本地标记已读

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
    if (data) return new Set(JSON.parse(data));
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

// 每日色彩问答库（50天循环，每天一题）
// 每题包含问题、4个选项、正确答案索引、解析和难度等级
const DAILY_COLOR_QUIZ: Array<{ question: string; options: string[]; answer: number; explanation: string; difficulty: 'easy' | 'medium' | 'hard' }> = [
  { question: '可见光谱中波长最长的颜色是？', options: ['蓝色', '红色', '绿色', '紫色'], answer: 1, explanation: '红色波长620-750nm，是可见光中波长最长、能量最低的颜色。', difficulty: 'easy' },
  { question: '光的三原色是哪三种？', options: ['红黄蓝', '红绿蓝', '青品黄', '橙绿紫'], answer: 1, explanation: '光的三原色是红(Red)、绿(Green)、蓝(Blue)，即RGB。', difficulty: 'easy' },
  { question: '全球最受欢迎的颜色是？', options: ['红色', '绿色', '蓝色', '紫色'], answer: 2, explanation: '全球调查约40%的人最喜欢蓝色，蓝色是最受欢迎的颜色。', difficulty: 'easy' },
  { question: '天空呈现蓝色的原因是？', options: ['海水反射', '瑞利散射', '大气过滤', '太阳光本身偏蓝'], answer: 1, explanation: '太阳光穿过大气层时，短波长的蓝光被空气分子散射更多，称为瑞利散射。', difficulty: 'easy' },
  { question: '古代紫色象征高贵的原因是？', options: ['紫色最鲜艳', '皇帝喜欢紫色', '紫色染料极其稀有', '紫色波长最短'], answer: 2, explanation: '古代紫色染料提取自海螺，极其稀有昂贵，只有皇室能使用。', difficulty: 'easy' },
  { question: '能刺激食欲的颜色是？', options: ['蓝色', '红色和橙色', '绿色', '紫色'], answer: 1, explanation: '红色和橙色能刺激食欲，所以餐厅常用暖色调装修。', difficulty: 'easy' },
  { question: '以下哪种颜色能降低血压？', options: ['红色', '蓝色', '黄色', '橙色'], answer: 1, explanation: '蓝色能降低血压、减缓呼吸，有镇静效果。', difficulty: 'easy' },
  { question: '颜料的三原色是？', options: ['红黄蓝', '红绿蓝', '青、品红、黄', '橙绿紫'], answer: 2, explanation: '颜料三原色是青(Cyan)、品红(Magenta)、黄(Yellow)，即CMY。', difficulty: 'easy' },
  { question: '人眼最敏感的颜色是？', options: ['红色', '蓝色', '绿色', '黄色'], answer: 2, explanation: '绿色位于可见光谱中央，人眼对绿色最敏感，所以看绿色能缓解疲劳。', difficulty: 'easy' },
  { question: '植物叶子是绿色的原因是？', options: ['叶绿素吸收绿光', '叶绿素反射绿光', '叶片本身是绿色', '大气过滤'], answer: 1, explanation: '叶绿素吸收红光和蓝光进行光合作用，反射绿光所以叶子看起来是绿色。', difficulty: 'easy' },
  { question: '日落时天空偏红的原因是？', options: ['红光更多', '蓝光被散射殆尽', '太阳变红', '大气变厚'], answer: 1, explanation: '日落时光线穿过更厚的大气层，蓝光被散射殆尽，只剩穿透力强的红光。', difficulty: 'easy' },
  { question: '消防车使用红色的原因是？', options: ['传统习惯', '红色波长长穿透力强', '红色最醒目', '红色代表紧急'], answer: 1, explanation: '红色波长最长，穿透力强，远距离容易被注意到。但研究发现黄绿色更醒目。', difficulty: 'easy' },
  { question: '以下哪种颜色代表后退感？', options: ['红色', '橙色', '蓝色', '黄色'], answer: 2, explanation: '冷色（蓝、绿、青）给人后退感，暖色（红、橙、黄）给人前进感。', difficulty: 'easy' },
  { question: '粉色曾用于监狱减少暴力的原因是？', options: ['粉色美观', '粉色有镇定效果', '粉色降低攻击性', 'B和C都对'], answer: 3, explanation: '粉红色（贝克-米勒粉）有镇定效果，能降低攻击性，曾用于监狱。', difficulty: 'easy' },
  { question: '巧克力棕色的来源是？', options: ['可可豆天然色', '烘烤美拉德反应', '添加色素', '发酵过程'], answer: 1, explanation: '巧克力的棕色来自可可豆烘烤时的美拉德反应。', difficulty: 'easy' },
  { question: '冰川呈现蓝色的原因是？', options: ['冰本身是蓝色', '冰晶吸收红光反射蓝光', '天空反射', '水中矿物质'], answer: 1, explanation: '冰川冰晶吸收了红光，反射蓝光，所以呈现蓝色。', difficulty: 'easy' },
  { question: '火焰温度最高时呈现什么颜色？', options: ['红色', '黄色', '橙色', '蓝色'], answer: 3, explanation: '火焰颜色由温度决定：红色约1000°C，蓝色约3000°C以上，蓝色温度最高。', difficulty: 'easy' },
  { question: '鹦鹉彩色羽毛的颜色来源是？', options: ['色素', '食物', '结构色', '环境'], answer: 2, explanation: '鹦鹉的彩色羽毛是微观结构对光的干涉产生的结构色，不是色素。', difficulty: 'easy' },
  { question: '热带鱼鲜艳色彩的主要作用是？', options: ['美观', '求偶和警告', '伪装', '调节体温'], answer: 1, explanation: '热带鱼鲜艳的色彩用于求偶和警告天敌，颜色越鲜艳往往越难吃或有毒。', difficulty: 'easy' },
  { question: '色弱玩家在以下哪种对比上通常正常？', options: ['色相对比', '明度对比', '饱和度对比', '波长对比'], answer: 1, explanation: '色弱玩家在色相对比上较弱，但明度和饱和度对比通常正常。', difficulty: 'easy' },
  { question: '以下哪种颜色在浅色背景下辨识度较低？', options: ['红色', '黄色', '蓝色', '紫色'], answer: 1, explanation: '黄色在浅色背景下对比度低，辨识度较差，需要注意观察。', difficulty: 'easy' },
  { question: '红色和橙色在游戏中容易混淆，建议？', options: ['放慢节奏', '开启色弱模式', '避免同时出现', '使用提示'], answer: 0, explanation: '红色和橙色在快速操作时容易混淆，建议放慢节奏仔细辨认。', difficulty: 'easy' },
  { question: '以下哪种颜色波长最短？', options: ['红色', '绿色', '紫色', '黄色'], answer: 2, explanation: '紫色波长380-450nm，是可见光中波长最短的颜色。', difficulty: 'easy' },
  { question: '色相环上与蓝色相邻的颜色是？', options: ['红色和橙色', '绿色和青色', '黄色和绿色', '紫色和红色'], answer: 1, explanation: '色相环上蓝色与绿色和青色相邻，称为相邻色，搭配和谐。', difficulty: 'easy' },
  { question: '口红的胭脂红提取自什么？', options: ['玫瑰花', '胭脂虫', '化学合成', '红色果实'], answer: 1, explanation: '胭脂红提取自仙人掌上的胭脂虫，是天然且安全的色素。', difficulty: 'easy' },
  { question: '以下哪种颜色能提高注意力？', options: ['蓝色', '黄色', '绿色', '紫色'], answer: 1, explanation: '黄色能刺激大脑活动，提高注意力和记忆力，所以便利用黄色。', difficulty: 'easy' },
  { question: '海水呈现蓝色的原因是？', options: ['天空反射', '海水吸收红光反射蓝光', '水中矿物质', '蓝色生物'], answer: 1, explanation: '海水吸收红光和黄光，反射蓝光，所以海洋呈现蓝色。', difficulty: 'easy' },
  { question: '变色龙变色的原理是？', options: ['色素变化', '调整皮肤纳米晶体间距', '情绪控制', '环境反射'], answer: 1, explanation: '变色龙通过调整皮肤中纳米晶体的间距来改变反射光的波长。', difficulty: 'easy' },
  { question: '红色花主要吸引哪种传粉者？', options: ['蜜蜂', '蝴蝶', '鸟类', '蝙蝠'], answer: 2, explanation: '红色花主要吸引鸟类，因为鸟类对红色敏感，而蜜蜂看不到红色。', difficulty: 'easy' },
  { question: '花青素让植物呈现什么颜色范围？', options: ['只有红色', '只有蓝色', '红紫蓝色', '只有紫色'], answer: 2, explanation: '花青素让植物呈现红、紫、蓝色，酸碱度不同颜色不同。', difficulty: 'easy' },
  { question: '孔雀羽毛呈现彩色的原因是？', options: ['色素', '结构色', '食物', '环境'], answer: 1, explanation: '孔雀羽毛的彩色来自微观结构对光的干涉，属于结构色，不会褪色。', difficulty: 'easy' },
  { question: '以下哪种颜色最适合卧室墙壁？', options: ['鲜红色', '亮黄色', '淡蓝色', '橙色'], answer: 2, explanation: '淡蓝色有镇静效果，能降低血压和减缓呼吸，适合卧室。', difficulty: 'easy' },
  { question: '交通信号灯选择绿色的原因是？', options: ['绿色最醒目', '绿色波长穿透力强', '人眼对绿色最敏感', '绿色代表安全'], answer: 2, explanation: '人眼对绿色最敏感，在远距离也能清晰识别，所以通行信号用绿色。', difficulty: 'easy' },
  { question: '彩虹中最外圈的颜色是？', options: ['红色', '紫色', '蓝色', '绿色'], answer: 0, explanation: '彩虹从内到外依次是紫、蓝、青、绿、黄、橙、红，红色在最外圈。', difficulty: 'easy' },
  { question: '以下哪种动物看不到颜色？', options: ['人类', '猫', '老鹰', '猴子'], answer: 1, explanation: '猫是二色视觉动物，基本看不到红色和绿色，主要看到蓝色和黄色。', difficulty: 'easy' },
  { question: '黄金呈现金色的原因是？', options: ['表面涂层', '金属电子对光的吸收和反射', '掺入铜', '光学幻觉'], answer: 1, explanation: '黄金的电子结构吸收蓝光，反射红光和黄光，所以呈现金色。', difficulty: 'easy' },
  { question: '深色衣服比浅色衣服更吸热的原因是？', options: ['深色面料厚', '深色吸收所有可见光', '深色反射红外线', '深色面料材质不同'], answer: 1, explanation: '深色吸收所有波长的可见光，将光能转化为热能，所以更吸热。', difficulty: 'easy' },
  { question: '彩色铅笔的颜料主要来源是？', options: ['天然色素', '化学合成颜料', '植物提取', '矿物粉末'], answer: 1, explanation: '现代彩色铅笔主要使用化学合成颜料，色彩鲜艳且稳定性好。', difficulty: 'easy' },
  { question: '以下哪种颜色在暗色背景下最醒目？', options: ['深蓝', '黑色', '黄色', '棕色'], answer: 2, explanation: '黄色在暗色背景下对比度最高，所以施工标志常用黄黑配色。', difficulty: 'easy' },
  { question: '紫外线在人眼中是什么颜色？', options: ['看不见', '紫色', '淡蓝色', '白色'], answer: 0, explanation: '紫外线波长低于380nm，超出人眼可见范围，完全看不见。', difficulty: 'easy' },
  { question: '蜂鸟能看到的颜色比人类多吗？', options: ['不能', '一样多', '能，多看到紫外光', '只看到黑白'], answer: 2, explanation: '蜂鸟能看到人类看不到的紫外光，帮助它们找到有花蜜的花朵。', difficulty: 'easy' },
  { question: '为什么血液是红色的？', options: ['含铁的血红蛋白', '红色色素', '血管颜色', '氧气染色'], answer: 0, explanation: '血液中的血红蛋白含铁元素，与氧结合后呈现红色。动脉血含氧高更红。', difficulty: 'easy' },
  { question: '以下哪种颜色组合对比最强？', options: ['红橙', '蓝绿', '红绿', '黄橙'], answer: 2, explanation: '红绿是色相环上的对比色（互补色），视觉对比效果最强。', difficulty: 'easy' },
  { question: '莫奈画作中常见的睡莲是什么颜色系？', options: ['纯红色系', '蓝绿紫色系', '纯黄色系', '黑白色系'], answer: 1, explanation: '莫奈的睡莲以蓝、绿、紫色为主，展现水面的光影变化和色彩层次。', difficulty: 'easy' },
  { question: '电影绿幕使用绿色的原因是？', options: ['绿色最便宜', '人眼对绿色敏感便于抠图', '绿色与肤色对比最大', '传统习惯'], answer: 2, explanation: '绿色与人类肤色色调差异最大，便于后期抠像时分离背景。', difficulty: 'easy' },
  { question: '以下哪种颜色让人感觉时间过得更快？', options: ['蓝色', '红色', '绿色', '白色'], answer: 1, explanation: '红色让人兴奋加速心跳，主观感觉时间过得更快；蓝色则相反。', difficulty: 'easy' },
  { question: '咖啡杯颜色影响味觉吗？', options: ['不影响', '白色杯让咖啡感觉更苦', '红色杯让咖啡感觉更甜', 'B和C都对'], answer: 1, explanation: '研究发现白色杯子让咖啡显得更苦更浓烈，因为白色对比增强了棕色。', difficulty: 'easy' },
  { question: '医院常用蓝色的原因是？', options: ['蓝色便宜', '蓝色有镇静和信任感', '蓝色耐脏', '传统习惯'], answer: 1, explanation: '蓝色降低血压减缓呼吸，给人信任和专业感，所以医疗环境常用蓝色。', difficulty: 'easy' },
];

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

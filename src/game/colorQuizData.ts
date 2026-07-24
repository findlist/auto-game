// 每日色彩问答题库（50题，按日期循环使用）
// 独立数据文件，便于维护和扩展题目，减小 announcements.ts 模块体积

export interface ColorQuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// 50道色彩知识问答题，覆盖物理、生物、心理、文化、艺术等领域
export const DAILY_COLOR_QUIZ: ColorQuizQuestion[] = [
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

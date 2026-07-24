// 每日策略小贴士数据库（30条轮播）
// 独立数据文件，便于后续扩展和维护贴士内容

export interface DailyTip {
  title: string;
  content: string;
  icon: string;
}

// 每日策略小贴士库（30条轮播）
export const DAILY_TIPS: DailyTip[] = [
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

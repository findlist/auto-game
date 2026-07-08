const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
if (appTsx.charCodeAt(0) === 0xFEFF) appTsx = appTsx.slice(1);

// Comprehensive replacement map: line number -> [old pattern, new text]
// Based on dist JS analysis and code context
const fixes = [
  // Line 22-34: Comments
  [22, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 限时模式配置'],
  [23, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 限时模式倒计时（秒）'],
  [25, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 关卡选择每页显示数量'],
  [27, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 本地存储键'],
  [34, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 最近游玩记录'],
  [43, '// PWA \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+ beforeinstallprompt \uFFFD+', '// PWA 安装提示：监听 beforeinstallprompt 事件'],
  [65, '// PWA \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// PWA 安装引导状态键'],
  
  // All catch blocks: /* 忽略 */
  // These will be handled by a global replacement
  
  // Line 171
  [171, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 关卡选择当前页'],
  [179, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 每日签到状态'],
  [186, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 版本更新日志状态'],
  [188, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+ URL \uFFFD+\uFFFD+', '// 回放查看状态：从 URL 解析回放'],
  [192, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 公告系统状态'],
  [196, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 自定义关卡状态'],
  [200, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 回放视频弹窗状态'],
  [206, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 帮助提示功能：获取当前游戏状态'],
  [209, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 检查游戏时是否有自动存档'],
  [211, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 每日首次登录赠送1个提示道具'],
  [225, '/* \uFFFD+ */', '/* 忽略 */'],
  [227, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 检测新版本，显示更新日志'],
  [236, '/* \uFFFD+ */', '/* 忽略 */'],
  [238, '// \uFFFD+ URL \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 检查 URL 是否携带回放数据'],
  [245, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 加载未完成'],
  [253, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD PWA \uFFFD+\uFFFD+\uFFFD+\uFFFD\uFFFD+\uFFFD+\uFFFD 3 \uFFFD+', '// 延迟检查 PWA 可安装性（页面加载3秒后）'],
  [263, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+ PWA \uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 检查已有记录的 PWA 可安装性'],
  [273, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 自动保存当前游戏状态'],
  [279, '/* \uFFFD+ */', '/* 忽略 */'],
  [281, '/* \uFFFD+ */', '/* 忽略 */'],
  [285, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 每日挑战状态'],
  [297, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 成就系统'],
  [302, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 提示功能：从当前游戏状态找一对可操作的试管'],
  [304, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 检查提示道具'],
  [322, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 检查是否有同色可合并'],
  [338, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 找到可用空试管'],
  [365, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 检查是否记录统计'],
  [371, '// \uFFFD+\uFFFD+\uFFFD+', '// 撤销'],
  [382, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 记录统计：检查是否使用撤销/提示等影响成就判断'],
  [385, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 检查连胜成就：仅普通模式连胜才累计连胜'],
  [392, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 仅普通模式计步成就'],
  [399, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 检查步数计步成就'],
  [405, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+ > 0 \uFFFD+ > 0\uFFFD+', '// 检查速度成就：仅普通模式（步数 > 0 且 时间 > 0）'],
  [412, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 满星成就'],
  [418, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 胜利时清除自动存档'],
  [419, '/* \uFFFD+ */', '/* 忽略 */'],
  [421, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 每日挑战可通关'],
  [430, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 无尽模式可通关'],
  [440, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 限时模式可通关'],
  [444, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 保存最高分'],
  [451, '/* \uFFFD+ */', '/* 忽略 */'],
  [459, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 胜利时清除自动存档'],
  [460, '// \uFFFD handleWin \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD onWin \uFFFD+\uFFFD+\uFFFD+', '// handleWin 的延迟处理：当从游戏页渲染时，调用 onWin 回调寻找并'],
  [463, '// \uFFFD+ playTimeSec \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 注意: playTimeSec 的变化会触发计时器的更新回调中进行'],
  [491, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD 1\uFFFD+', '// 进入下一关：若普通模式且小于关卡1）'],
  [508, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 清除自动存档'],
  [509, '/* \uFFFD+ */', '/* 忽略 */'],
  [512, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 确认的返回首页，防止误退出'],
  [515, "'\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+'", "'当前关卡进度将丢失，确定返回首页吗？'"],
  [523, '// -1 \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// -1 表示每日挑战'],
  [535, '// -2 \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// -2 表示无尽模式'],
  [547, '// -3 \uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// -3 表示限时模式'],
  [558, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 下一关：每日挑战返回首页、无尽模式累计后进入限时模式返回首页，普通模式进入下一关'],
  [563, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 无尽模式：分数+1，然后进入下一关，难度递增'],
  [565, '// \uFFFD+ -2\uFFFD+ useEffect \uFFFD+\uFFFD+', '// 保持 -2，触发 useEffect 重新'],
  [570, '// \uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+', '// 限时模式：直接进入下一关'],
  [571, '// \uFFFD+ -3\uFFFD+ useEffect \uFFFD+\uFFFD+', '// 保持 -3，触发 useEffect 重新'],
];

// This approach is way too manual for 521 lines. Let me try a different strategy.
// I'll write the ENTIRE App.tsx from scratch, using:
// 1. The code structure from the corrupted file (logic is intact)
// 2. Chinese text from dist JS
// 3. Context-based reconstruction of comments

// Actually, the most efficient approach given the constraints:
// Use a regex-based global replacement for common patterns,
// then handle the rest manually.

// Global patterns that can be fixed:
const globalReplacements = [
  // All "/* 忽略 */" catch blocks
  [/\/\* \uFFFD+ \*\//g, '/* 忽略 */'],
  
  // Specific string literals
  [/'\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+\uFFFD+'/g, "'当前关卡进度将丢失，确定返回首页吗？'"],
];

let result = appTsx;
for (const [pattern, replacement] of globalReplacements) {
  result = result.replace(pattern, replacement);
}

// Count remaining
const remaining = (result.match(/\uFFFD/g) || []).length;
console.log(`After global replacements: ${remaining} U+FFFD remaining (was 5073)`);

// Write intermediate result
fs.writeFileSync('src/App.tsx.global', result, 'utf8');
console.log('Written to src/App.tsx.global');

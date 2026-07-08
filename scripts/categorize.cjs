const fs = require('fs');

// Read dist JS
const distJs = fs.readFileSync('dist/assets/index-DsOvDV00.js', 'utf8');

// Read App.tsx (fixed version from v2)
let appTsx = fs.readFileSync('src/App.tsx.fixed', 'utf8');

// Extract ALL Chinese strings from dist JS (not just string literals)
const allChineseInDist = new Set();
const re = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/g;
let m;
while ((m = re.exec(distJs)) !== null) {
  allChineseInDist.add(m[0]);
}

// Also read other source files for Chinese context
const otherFiles = [
  'src/components/GameBoard.tsx',
  'src/game/achievements.ts',
  'src/game/statsTracker.ts',
  'src/game/dailyCheckin.ts',
  'src/game/dailyChallenge.ts',
  'src/game/hintItems.ts',
  'src/game/adaptiveDifficulty.ts',
  'src/game/replayShare.ts',
  'src/game/announcements.ts',
  'src/game/levelEditor.ts',
  'src/game/replayVideo.ts',
  'src/game/shareImage.ts',
  'src/game/settings.ts',
  'src/game/themeManager.ts',
];

const allChineseInSource = new Set();
for (const file of otherFiles) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const re2 = /[\u4e00-\u9fff]+/g;
    let m2;
    while ((m2 = re2.exec(content)) !== null) {
      allChineseInSource.add(m2[0]);
    }
  } catch (e) {}
}

// Now, let's categorize the U+FFFD sequences in App.tsx:
// 1. In string literals (between quotes) - these should be in dist
// 2. In comments (after //) - these need manual reconstruction
// 3. In template literals (between backticks) - some in dist

const lines = appTsx.split('\n');
let inString = false;
let inComment = false;
let inTemplate = false;

const stats = {
  inStringLiteral: 0,
  inComment: 0,
  inTemplate: 0,
  other: 0
};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.includes('\uFFFD')) continue;
  
  // Simple heuristic: check if the U+FFFD is after // (comment)
  const fffdIdx = line.indexOf('\uFFFD');
  const beforeFffd = line.slice(0, fffdIdx);
  
  if (beforeFffd.includes('//')) {
    stats.inComment++;
  } else if (beforeFffd.includes('`') && !beforeFffd.endsWith('\\`')) {
    stats.inTemplate++;
  } else if ((beforeFffd.match(/'/g) || []).length % 2 === 1) {
    stats.inStringLiteral++;
  } else if ((beforeFffd.match(/"/g) || []).length % 2 === 1) {
    stats.inStringLiteral++;
  } else {
    stats.other++;
  }
}

console.log('U+FFFD distribution by context:');
console.log(`  In string literals: ${stats.inStringLiteral}`);
console.log(`  In comments: ${stats.inComment}`);
console.log(`  In template literals: ${stats.inTemplate}`);
console.log(`  Other: ${stats.other}`);
console.log(`  Total: ${stats.inStringLiteral + stats.inComment + stats.inTemplate + stats.other}`);

// Now let's focus on fixing string literals first (these can be found in dist JS)
// Then fix comments (these need context-based reconstruction)

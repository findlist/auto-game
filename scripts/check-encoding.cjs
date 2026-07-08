const fs = require('fs');
const files = [
  'src/App.tsx',
  'src/components/GameBoard.tsx',
  'src/components/TubeView.tsx',
  'src/game/types.ts',
  'src/game/levelGenerator.ts',
  'src/game/soundEngine.ts',
  'src/game/achievements.ts',
  'src/game/statsTracker.ts',
  'src/game/settings.ts',
  'src/game/dailyCheckin.ts',
  'src/game/dailyChallenge.ts',
  'src/game/hintItems.ts',
  'src/game/adaptiveDifficulty.ts',
  'src/game/replayShare.ts',
  'src/game/solver.ts',
  'src/game/themeManager.ts',
  'src/game/announcements.ts',
  'src/game/levelEditor.ts',
  'src/game/replayVideo.ts',
  'src/game/shareImage.ts',
  'src/game/seededRandom.ts',
  'src/components/ParticleEffect.tsx',
  'src/index.css',
  'src/main.tsx',
];

for (const file of files) {
  try {
    let c = fs.readFileSync(file, 'utf8');
    if (c.charCodeAt(0) === 0xFEFF) c = c.slice(1);
    const fffdCount = (c.match(/\uFFFD/g) || []).length;
    const totalChars = c.length;
    const hasBOM = c !== fs.readFileSync(file, 'utf8');
    console.log(`${file}: ${fffdCount} U+FFFD chars / ${totalChars} total${hasBOM ? ' (has BOM)' : ''}`);
  } catch (e) {
    console.log(`${file}: NOT FOUND`);
  }
}

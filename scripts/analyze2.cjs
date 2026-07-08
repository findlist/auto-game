const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.slice(1);
const lines = c.split('\n');

// Extract all keys from difficultyColors object (lines 1349-1351)
const allKeys = [];
for (let i = 1348; i <= 1350; i++) {
  const line = lines[i];
  const re = /'([^']+)'\s*:/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    // Get each character's code point
    const key = m[1];
    const codePoints = [];
    for (let j = 0; j < key.length; j++) {
      codePoints.push(key.codePointAt(j).toString(16));
    }
    allKeys.push({ line: i + 1, key, codePoints: codePoints.join(' ') });
  }
}

console.log('=== All difficultyColors keys ===');
allKeys.forEach(({ line, key, codePoints }) => {
  console.log(`Line ${line}: key codePoints = ${codePoints}`);
});

// Find duplicates
console.log('\n=== Duplicates ===');
const seen = {};
allKeys.forEach(({ line, key, codePoints }) => {
  if (seen[codePoints]) {
    console.log(`Line ${line} duplicates Line ${seen[codePoints]}: codePoints=${codePoints}`);
  } else {
    seen[codePoints] = line;
  }
});

// Also check getDifficultyLabel return values
console.log('\n=== getDifficultyLabel returns ===');
for (let i = 1335; i <= 1347; i++) {
  const line = lines[i];
  if (line.includes('return ')) {
    const m = line.match(/return\s+'([^']+)'/);
    if (m) {
      const key = m[1];
      const codePoints = [];
      for (let j = 0; j < key.length; j++) {
        codePoints.push(key.codePointAt(j).toString(16));
      }
      console.log(`Line ${i + 1}: return ${JSON.stringify(key)} codePoints=${codePoints.join(' ')}`);
    }
  }
}

// Find the GameBoard component's props - look for onReplayShare, onWin etc
console.log('\n=== GameBoard props (search around line 2560-2600) ===');
for (let i = 2555; i < 2600; i++) {
  if (lines[i] && (lines[i].includes('function GameBoard') || lines[i].includes('=> {') && i > 2555 && i < 2570)) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
  }
}

// Look for the GameBoard component definition more broadly
console.log('\n=== Search for GameBoard definition ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('GameBoard') && (lines[i].includes('function') || lines[i].includes('const') && lines[i].includes('='))) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
  }
}

// Check what props GameBoard receives that might include moveHistory
console.log('\n=== Props destructuring near GameBoard ===');
for (let i = 2550; i < 2600; i++) {
  console.log(`Line ${i + 1}: ${lines[i]}`);
}

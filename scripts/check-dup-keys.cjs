const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.slice(1);
const lines = c.split('\n');

// Check difficultyColors object for duplicate keys
console.log('=== Checking difficultyColors (lines 1348-1352) ===');
const allKeys = [];
for (let i = 1347; i <= 1351; i++) {
  const line = lines[i];
  const re = /['"]([^'"]+)['"]\s*:/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    allKeys.push({ line: i + 1, key: m[1] });
  }
}
const seen = {};
allKeys.forEach(({ line, key }) => {
  const k = Buffer.from(key).toString('hex');
  if (seen[k]) {
    console.log(`DUPLICATE: Line ${line} key ${JSON.stringify(key)} (hex: ${k}) duplicates Line ${seen[k]}`);
  } else {
    seen[k] = line;
    console.log(`Line ${line}: key = ${JSON.stringify(key)} (hex: ${k})`);
  }
});

// Check line 2628 for setMoveHistory
console.log('\n=== Checking setMoveHistory usage ===');
// Find where history/moveHistory state is declared
for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(/\bmoveHistory\b/) && (lines[i].includes('useState') || lines[i].includes('useRef'))) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
  }
  if (lines[i].includes('setMoveHistory') && lines[i].includes('useState')) {
    console.log(`Line ${i + 1}: FOUND setMoveHistory useState: ${lines[i].trim()}`);
  }
}
// Also check GameBoard component props
console.log('\n=== GameBoard component definition ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(/function\s+GameBoard/) || (lines[i].includes('const GameBoard') && lines[i].includes('='))) {
    for (let j = i; j < Math.min(i + 20, lines.length); j++) {
      console.log(`Line ${j + 1}: ${lines[j]}`);
    }
    break;
  }
}

const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.slice(1);
const lines = c.split('\n');

// Find all useState declarations
console.log('=== useState declarations ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(/useState\s*<.*>\s*\(/) || lines[i].match(/useState\s*\(/)) {
    const match = lines[i].match(/const\s+\[(\w+),\s*(\w+)\]\s*=\s*useState/);
    if (match) {
      console.log(`Line ${i + 1}: ${match[1]} / ${match[2]}`);
    }
  }
}

// Find setMoveHistory usage
console.log('\n=== setMoveHistory usage ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('setMoveHistory')) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
  }
}

// Find GameBoard function  
console.log('\n=== GameBoard function ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(/function\s+GameBoard/) || lines[i].match(/const\s+GameBoard\s*=/)) {
    for (let j = i; j < Math.min(i + 30, lines.length); j++) {
      console.log(`Line ${j + 1}: ${lines[j]}`);
    }
    break;
  }
}

// Find the pour handler area (around line 2600-2650)
console.log('\n=== Pour handler area (2600-2645) ===');
for (let i = 2599; i < Math.min(2645, lines.length); i++) {
  console.log(`Line ${i + 1}: ${lines[i]}`);
}

// Check the difficultyColors object properly
console.log('\n=== difficultyColors full (1348-1352) ===');
for (let i = 1347; i < 1352; i++) {
  const buf = Buffer.from(lines[i], 'utf8');
  console.log(`Line ${i + 1} (${buf.length} bytes): ${lines[i]}`);
}

const fs = require('fs');
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
if (appTsx.charCodeAt(0) === 0xFEFF) appTsx = appTsx.slice(1);

// Print structure overview - function/component boundaries
const lines = appTsx.split('\n');
let inFunction = '';
let funcStart = 0;
const functions = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Track function/component definitions
  const funcMatch = line.match(/^(export\s+)?(function|const)\s+(\w+)/);
  if (funcMatch) {
    if (inFunction) {
      functions.push({ name: inFunction, start: funcStart, end: i, lines: i - funcStart });
    }
    inFunction = funcMatch[3];
    funcStart = i + 1;
  }
  
  // Track top-level closing braces
  if (line === '}' && inFunction && i > funcStart + 5) {
    // Check if this is a top-level close
    const indent = lines[i-1].match(/^\s*/)[0].length;
    if (indent === 0) {
      functions.push({ name: inFunction, start: funcStart, end: i + 1, lines: i - funcStart + 1 });
      inFunction = '';
    }
  }
}

// Also check for major sections within the main App component
console.log('=== Major functions/components ===');
for (const f of functions) {
  const fffdCount = lines.slice(f.start - 1, f.end).filter(l => l.includes('\uFFFD')).length;
  console.log(`${f.name}: lines ${f.start}-${f.end} (${f.lines} lines, ${fffdCount} lines with U+FFFD)`);
}

// Count lines with U+FFFD by section
console.log('\n=== U+FFFD distribution by line ranges ===');
const ranges = [
  [1, 100], [101, 200], [201, 300], [301, 500], [501, 700], [701, 900],
  [901, 1100], [1101, 1300], [1301, 1500], [1501, 1700], [1701, 1900],
  [1901, 2100], [2101, 2300], [2301, 2500], [2501, 2757]
];
for (const [start, end] of ranges) {
  const rangeLines = lines.slice(start - 1, end);
  const fffdLines = rangeLines.filter(l => l.includes('\uFFFD')).length;
  const fffdCount = rangeLines.reduce((sum, l) => sum + (l.match(/\uFFFD/g) || []).length, 0);
  console.log(`L${start}-${end}: ${fffdLines} lines with U+FFFD, ${fffdCount} total U+FFFD chars`);
}

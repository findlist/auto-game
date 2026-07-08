const fs = require('fs');

// Read dist JS
const distJs = fs.readFileSync('dist/assets/index-DsOvDV00.js', 'utf8');
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
if (appTsx.charCodeAt(0) === 0xFEFF) appTsx = appTsx.slice(1);

// Extract ALL Chinese text from dist JS, preserving order
// Include string literals, JSX text, and template literal parts
const allChinese = [];
const re = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef][\u4e00-\u9fff\u3000-\u303f\uff00-\uffef\w\s!?,.:;()'""—–-]*/g;
let m;
while ((m = re.exec(distJs)) !== null) {
  allChinese.push({ text: m[0], index: m.index });
}

// Now, read App.tsx and extract all U+FFFD sequences with their positions
const fffdSeqs = [];
const fffdRe = /\uFFFD+/g;
while ((m = fffdRe.exec(appTsx)) !== null) {
  // Get surrounding context
  const before = appTsx.slice(Math.max(0, m.index - 40), m.index);
  const after = appTsx.slice(m.index + m[0].length, m.index + m[0].length + 40);
  fffdSeqs.push({
    text: m[0],
    index: m.index,
    before: before,
    after: after,
    length: m[0].length
  });
}

console.log(`Chinese strings in dist: ${allChinese.length}`);
console.log(`U+FFFD sequences in App.tsx: ${fffdSeqs.length}`);

// Try a position-based matching approach:
// The order of Chinese strings in the source code should roughly match
// their order in the dist JS (since both follow the code execution order).
// But this won't work for conditionals and JSX.

// Better approach: Let's print ALL U+FFFD sequences with their context,
// so we can manually create the fix table.

// Group by line number
const lines = appTsx.split('\n');
const byLine = {};
for (const f of fffdSeqs) {
  // Find line number
  let lineNum = 1;
  let pos = 0;
  for (let i = 0; i < lines.length; i++) {
    if (pos + lines[i].length + 1 > f.index) {
      lineNum = i + 1;
      break;
    }
    pos += lines[i].length + 1;
  }
  
  if (!byLine[lineNum]) byLine[lineNum] = [];
  byLine[lineNum].push(f);
}

// Print all lines with U+FFFD and their context
const sortedLines = Object.keys(byLine).map(Number).sort((a, b) => a - b);
console.log(`\nTotal lines with U+FFFD: ${sortedLines.length}`);

// Print first 200 lines with U+FFFD
let count = 0;
for (const lineNum of sortedLines) {
  if (count >= 200) break;
  const line = lines[lineNum - 1];
  const seqs = byLine[lineNum];
  console.log(`\nL${lineNum} (${seqs.length} seqs): ${line.slice(0, 120)}`);
  count++;
}

// Write ALL U+FFFD sequences with context to a file for analysis
const output = [];
for (const lineNum of sortedLines) {
  const line = lines[lineNum - 1];
  const seqs = byLine[lineNum];
  output.push(`L${lineNum}: ${line}`);
  for (const s of seqs) {
    output.push(`  FFFD(${s.length}): before=[${s.before.slice(-20)}] after=[${s.after.slice(0, 20)}]`);
  }
}
fs.writeFileSync('scripts/fffd-analysis.txt', output.join('\n'), 'utf8');
console.log(`\nFull analysis written to scripts/fffd-analysis.txt`);

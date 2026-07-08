const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
const lines = css.split('\n');

// Find lines with U+FFFD and print exact hex
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('\uFFFD')) {
    const line = lines[i];
    // Find the U+FFFD sequence
    const match = line.match(/\uFFFD+/);
    if (match) {
      const fffdStr = match[0];
      const hex = [];
      for (let j = 0; j < fffdStr.length; j++) {
        hex.push(fffdStr.charCodeAt(j).toString(16));
      }
      console.log(`L${i+1}: FFFD sequence length=${fffdStr.length}, hex=${hex.join(' ')}`);
      console.log(`  Line: ${line.trim().slice(0, 100)}`);
      
      // Check surrounding context
      const before = lines.slice(Math.max(0, i - 3), i).join(' ');
      const after = lines.slice(i + 1, Math.min(lines.length, i + 3)).join(' ');
      console.log(`  Before: ${before.slice(-80)}`);
      console.log(`  After: ${after.slice(0, 80)}`);
    }
  }
}

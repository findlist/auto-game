const fs = require('fs');

// Read index.css
let css = fs.readFileSync('src/index.css', 'utf8');

// Count U+FFFD
const fffdCount = (css.match(/\uFFFD/g) || []).length;
console.log(`index.css: ${fffdCount} U+FFFD chars`);

// Find all U+FFFD sequences with context
const lines = css.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('\uFFFD')) {
    console.log(`L${i + 1}: ${lines[i].trim().slice(0, 100)}`);
  }
}

const fs = require('fs');
// Read the dist JS file which has correct Chinese
const distJs = fs.readFileSync('dist/assets/index-DsOvDV00.js', 'utf8');

// Extract Chinese strings from the dist JS
const chineseStrings = new Set();
const re = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]{2,}/g;
let m;
while ((m = re.exec(distJs)) !== null) {
  chineseStrings.add(m[0]);
}

// Sort by length descending
const sorted = Array.from(chineseStrings).sort((a, b) => b.length - a.length);
console.log(`Found ${sorted.length} unique Chinese strings in dist JS`);
console.log('\nFirst 100 (longest):');
sorted.slice(0, 100).forEach((s, i) => {
  console.log(`${i + 1}: ${s}`);
});

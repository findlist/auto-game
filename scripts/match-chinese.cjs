const fs = require('fs');

// Read dist JS (has correct Chinese)
const distJs = fs.readFileSync('dist/assets/index-DsOvDV00.js', 'utf8');

// Read App.tsx (has corrupted Chinese)  
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
if (appTsx.charCodeAt(0) === 0xFEFF) appTsx = appTsx.slice(1);

// Strategy: Find all Chinese string literals in dist JS
// and their surrounding code context, then match to App.tsx

// Extract Chinese strings with context from dist JS
const chineseContexts = [];
const re = /([^\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]{0,30})([\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]{2,})([^\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]{0,10})/g;
let m;
while ((m = re.exec(distJs)) !== null) {
  chineseContexts.push({
    before: m[1].slice(-15),
    chinese: m[2],
    after: m[3].slice(0, 10)
  });
}

console.log(`Found ${chineseContexts.length} Chinese contexts in dist JS`);

// Now, in App.tsx, find sequences of U+FFFD characters (corrupted Chinese)
// and their surrounding context
const fffdContexts = [];
const fffdRe = /([^\uFFFD]{0,30})(\uFFFD{2,})([^\uFFFD]{0,10})/g;
while ((m = fffdRe.exec(appTsx)) !== null) {
  fffdContexts.push({
    before: m[1].slice(-15),
    fffd: m[2],
    fffdLen: m[2].length,
    after: m[3].slice(0, 10),
    index: m.index + m[1].length - m[1].slice(-15).length
  });
}
console.log(`Found ${fffdContexts.length} U+FFFD sequences in App.tsx`);

// Try to match by context (before/after non-Chinese code)
// This is a heuristic approach
let matchCount = 0;
const unmatched = [];
for (const fc of fffdContexts) {
  let bestMatch = null;
  let bestScore = 0;
  for (const cc of chineseContexts) {
    let score = 0;
    // Compare before context (last few chars)
    if (fc.before.length > 3 && cc.before.length > 3) {
      const fb = fc.before.slice(-5);
      const cb = cc.before.slice(-5);
      if (fb === cb) score += 2;
      else if (fc.before.endsWith(cc.before.slice(-3))) score += 1;
    }
    // Compare after context
    if (fc.after.length > 0 && cc.after.length > 0) {
      if (fc.after[0] === cc.after[0]) score += 2;
      if (fc.after.slice(0,3) === cc.after.slice(0,3)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = cc;
    }
  }
  if (bestScore >= 3) {
    matchCount++;
  } else {
    unmatched.push({ ...fc, bestMatch, bestScore });
  }
}

console.log(`Matched: ${matchCount}/${fffdContexts.length}`);
console.log(`Unmatched: ${unmatched.length}`);
console.log('\nFirst 20 unmatched:');
unmatched.slice(0, 20).forEach((u, i) => {
  console.log(`${i + 1}: before="${u.before}" fffdLen=${u.fffdLen} after="${u.after}" bestMatch="${u.bestMatch ? u.bestMatch.chinese : 'none'}" score=${u.bestScore}`);
});

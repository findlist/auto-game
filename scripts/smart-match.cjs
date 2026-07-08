const fs = require('fs');

// Read dist JS (has correct Chinese)
const distJs = fs.readFileSync('dist/assets/index-DsOvDV00.js', 'utf8');

// Read App.tsx 
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
if (appTsx.charCodeAt(0) === 0xFEFF) appTsx = appTsx.slice(1);

// Extract all Chinese string literals from dist JS with surrounding code context
// In minified JS, strings are in quotes. Let's extract longer strings with context.
const distStrings = [];
// Match string literals containing Chinese
const strRe = /(["'`])([^"'`]*[\u4e00-\u9fff][^"'`]*)\1/g;
let m;
while ((m = strRe.exec(distJs)) !== null) {
  // Get surrounding context (30 chars before and after)
  const start = Math.max(0, m.index - 40);
  const end = Math.min(distJs.length, m.index + m[0].length + 40);
  const before = distJs.slice(start, m.index);
  const after = distJs.slice(m.index + m[0].length, end);
  distStrings.push({
    string: m[2],
    quote: m[1],
    before: before,
    after: after,
    fullMatch: m[0]
  });
}

// Now read App.tsx line by line and find lines with U+FFFD
const lines = appTsx.split('\n');
const fixes = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.includes('\uFFFD')) continue;
  
  // Find all U+FFFD sequences in this line
  const fffdRe = /\uFFFD+/g;
  let fm;
  while ((fm = fffdRe.exec(line)) !== null) {
    const fffdStr = fm[0];
    const fffdStart = fm.index;
    
    // Get context from the line
    const lineBefore = line.slice(Math.max(0, fffdStart - 30), fffdStart);
    const lineAfter = line.slice(fffdStart + fffdStr.length, fffdStart + fffdStr.length + 30);
    
    // Try to find a matching dist string by context
    let bestMatch = null;
    let bestScore = 0;
    
    for (const ds of distStrings) {
      // Check if the before/after context matches
      let score = 0;
      
      // Match by unique code fragments before the string
      // Extract meaningful code tokens from lineBefore
      const beforeTokens = lineBefore.match(/[\w$.[\](){}=,;:!?+\-*/<>&|]+/g) || [];
      const distBeforeTokens = ds.before.match(/[\w$.[\](){}=,;:!?+\-*/<>&|]+/g) || [];
      
      // Check if last few tokens match
      const lb = beforeTokens.slice(-3).join('');
      const db = distBeforeTokens.slice(-3).join('');
      if (lb && db && lb === db) score += 3;
      else if (lb && db && lb.slice(-8) === db.slice(-8)) score += 2;
      
      // Match after context
      const afterTokens = lineAfter.match(/[\w$.[\](){}=,;:!?+\-*/<>&|]+/g) || [];
      const distAfterTokens = ds.after.match(/[\w$.[\](){}=,;:!?+\-*/<>&|]+/g) || [];
      const la = afterTokens.slice(0, 3).join('');
      const da = distAfterTokens.slice(0, 3).join('');
      if (la && da && la === da) score += 3;
      else if (la && da && la.slice(0, 8) === da.slice(0, 8)) score += 2;
      
      // Check if the Chinese string length roughly matches the U+FFFD count
      // (1 Chinese char = 1 U+FFFD typically)
      if (Math.abs(ds.string.length - fffdStr.length) <= 2) score += 1;
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = ds;
      }
    }
    
    if (bestMatch && bestScore >= 4) {
      fixes.push({
        line: i + 1,
        fffdStr: fffdStr,
        replacement: bestMatch.string,
        score: bestScore,
        context: lineBefore.slice(-20) + '[' + fffdStr + ']' + lineAfter.slice(0, 20)
      });
    }
  }
}

console.log(`Total fixes needed: ${fixes.length}`);
console.log(`High confidence (score >= 5): ${fixes.filter(f => f.score >= 5).length}`);
console.log(`Medium confidence (score = 4): ${fixes.filter(f => f.score === 4).length}`);

// Print first 50 fixes
console.log('\nFirst 50 fixes:');
fixes.slice(0, 50).forEach(f => {
  console.log(`L${f.line} (score=${f.score}): ${f.context} → "${f.replacement}"`);
});

// Print unmatched U+FFFD sequences count
const totalFffd = (appTsx.match(/\uFFFD+/g) || []).length;
console.log(`\nTotal U+FFFD sequences: ${totalFffd}, matched: ${fixes.length}, unmatched: ${totalFffd - fixes.length}`);

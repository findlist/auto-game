const fs = require('fs');

// Read App.tsx as raw buffer to understand the corruption pattern
const buf = fs.readFileSync('src/App.tsx');
// Skip BOM (first 3 bytes)
const content = buf.slice(3).toString('utf8');

// Count total U+FFFD characters
const fffdCount = (content.match(/\uFFFD/g) || []).length;
console.log(`Total U+FFFD characters: ${fffdCount}`);

// The corruption pattern: original UTF-8 Chinese characters (3 bytes each) 
// were replaced by U+FFFD (3 bytes: EF BF BD) during an encoding mishap.
// Each Chinese character became some number of U+FFFD.
// Typical: 1 Chinese char (3 UTF-8 bytes) -> 1 U+FFFD (3 bytes EF BF BD)
// But sometimes multiple chars got merged.

// Let's look at the pattern more carefully
// Count unique U+FFFD sequence lengths
const fffdSequences = content.match(/\uFFFD+/g) || [];
const lenCounts = {};
fffdSequences.forEach(s => {
  const len = s.length;
  lenCounts[len] = (lenCounts[len] || 0) + 1;
});
console.log('\nU+FFFD sequence length distribution:');
Object.keys(lenCounts).sort((a,b) => parseInt(a)-parseInt(b)).forEach(len => {
  console.log(`  Length ${len}: ${lenCounts[len]} occurrences`);
});

// Total unique Chinese characters needed
console.log(`\nTotal U+FFFD sequences: ${fffdSequences.length}`);

// Let's try a different approach: read the dist JS and extract ALL Chinese text
// Then build a mapping from code context to Chinese text

// Read dist JS
const distJs = fs.readFileSync('dist/assets/index-DsOvDV00.js', 'utf8');

// Extract ALL Chinese character sequences from dist
const distChinese = [];
const re = /[\u4e00-\u9fff]+/g;
let m;
while ((m = re.exec(distJs)) !== null) {
  distChinese.push(m[0]);
}
console.log(`\nTotal Chinese strings in dist: ${distChinese.length}`);
console.log(`Unique Chinese strings: ${new Set(distChinese).size}`);

// Now let's try a COMPLETELY different approach:
// The dist JS is minified. But the Chinese strings are preserved as string literals.
// Let's extract them with their string delimiters
const stringLiterals = [];
const strRe = /["'`]([^"'`]*[\u4e00-\u9fff][^"'`]*)["'`]/g;
while ((m = strRe.exec(distJs)) !== null) {
  stringLiterals.push({
    full: m[0],
    content: m[1],
    index: m.index
  });
}
console.log(`\nString literals with Chinese in dist: ${stringLiterals.length}`);

// Print all unique Chinese string literals
const uniqueStrings = [...new Set(stringLiterals.map(s => s.content))].sort((a,b) => b.length - a.length);
console.log(`Unique Chinese string literals: ${uniqueStrings.length}`);
console.log('\nAll unique Chinese strings (sorted by length):');
uniqueStrings.forEach((s, i) => {
  console.log(`${i + 1}: ${s}`);
});

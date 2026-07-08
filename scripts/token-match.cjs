const fs = require('fs');

// Strategy: Use the dist JS (which has correct Chinese) to create a mapping.
// The dist JS is minified, but the string literals are preserved.
// We'll extract all unique Chinese strings from dist, then manually map them
// to their locations in App.tsx using surrounding code structure.

// But actually, a much better approach:
// The App.tsx file has CORRUPTED Chinese (U+FFFD), but the CODE STRUCTURE is intact.
// The dist JS has CORRECT Chinese, but is minified.
// 
// Key insight: We can use the non-Chinese parts of App.tsx as a "key" to 
// find the corresponding location in dist JS, extract the Chinese from there,
// and fix App.tsx.

// Better approach: Read App.tsx line by line. For each line with U+FFFD,
// extract the non-FFFD code tokens and use them to search the dist JS.
// The tokens around the U+FFFD should appear in the dist JS near the correct Chinese.

const distJs = fs.readFileSync('dist/assets/index-DsOvDV00.js', 'utf8');
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
if (appTsx.charCodeAt(0) === 0xFEFF) appTsx = appTsx.slice(1);

// Split App.tsx into lines
const lines = appTsx.split('\n');

// For each line with U+FFFD, extract code context and search in dist
let totalFixed = 0;
const results = [];

for (let lineNum = 0; lineNum < lines.length; lineNum++) {
  const line = lines[lineNum];
  if (!line.includes('\uFFFD')) continue;
  
  // Extract all U+FFFD sequences and their surrounding code context
  // We'll try to find the ENTIRE line's Chinese content from dist
  
  // Strategy: Extract unique code tokens from the line (non-FFFD, non-trivial)
  // Use them to find the location in dist JS
  // Then extract Chinese from that location
  
  // Remove U+FFFD sequences and get the "skeleton" of the line
  const skeleton = line.replace(/\uFFFD+/g, '___CHINESE___');
  
  // Extract meaningful tokens from skeleton (variable names, function calls, etc.)
  const tokens = skeleton.match(/[a-zA-Z_$][a-zA-Z0-9_$]*|=>|return|const|let|var|function|if|else|for|while/g) || [];
  
  // Find unique tokens that might help locate this in dist JS
  const uniqueTokens = tokens.filter(t => t.length > 3 && !['return', 'const', 'function', 'else', 'true', 'false', 'null', 'undefined', 'state', 'props'].includes(t));
  
  if (uniqueTokens.length === 0) continue;
  
  // Search for the first unique token in dist JS
  let distPos = -1;
  for (const token of uniqueTokens) {
    const pos = distJs.indexOf(token);
    if (pos !== -1) {
      distPos = pos;
      break;
    }
  }
  
  if (distPos === -1) continue;
  
  // Look for Chinese text near this position in dist JS
  // Search within a window of 500 chars
  const window = distJs.slice(Math.max(0, distPos - 200), distPos + 500);
  const chineseMatches = window.match(/[\u4e00-\u9fff]{1,}/g) || [];
  
  if (chineseMatches.length > 0) {
    results.push({
      line: lineNum + 1,
      chineseFound: chineseMatches,
      uniqueTokens: uniqueTokens.slice(0, 3),
      linePreview: line.slice(0, 80)
    });
  }
}

console.log(`Lines with U+FFFD that found Chinese in dist: ${results.length}`);
console.log(`\nFirst 30 results:`);
results.slice(0, 30).forEach(r => {
  console.log(`L${r.line} [${r.uniqueTokens.join(',')}]: Chinese=${r.chineseFound.slice(0, 5).join(' | ')}`);
  console.log(`  Preview: ${r.linePreview}`);
  console.log();
});

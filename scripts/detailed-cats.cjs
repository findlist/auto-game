const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
if (appTsx.charCodeAt(0) === 0xFEFF) appTsx = appTsx.slice(1);

const lines = appTsx.split('\n');

// More detailed categorization
let inJSX = false;
let inMultiLineComment = false;
const categories = {
  singleQuote: [],   // '中文'
  doubleQuote: [],   // "中文"
  templateLit: [],   // `中文${}中文`
  lineComment: [],   // // 中文
  blockComment: [],  // /* 中文 */
  jsxText: [],       // <div>中文</div>
  jsxAttr: [],       // className="中文" or title="中文"
  other: []
};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.includes('\uFFFD')) continue;
  
  const fffdIdx = line.indexOf('\uFFFD');
  const beforeFffd = line.slice(0, fffdIdx);
  const afterFffd = line.slice(fffdIdx + line.match(/\uFFFD+/)[0].length, fffdIdx + line.match(/\uFFFD+/)[0].length + 20);
  
  // Check context
  if (beforeFffd.match(/\/\*\s*$/)) {
    categories.blockComment.push({ line: i + 1, content: line.trim().slice(0, 80) });
  } else if (beforeFffd.match(/\/\/\s*$/)) {
    categories.lineComment.push({ line: i + 1, content: line.trim().slice(0, 80) });
  } else if (beforeFffd.match(/['"][^'"]*$/)) {
    // Inside a string literal
    const singleQ = (beforeFffd.match(/'/g) || []).length;
    const doubleQ = (beforeFffd.match(/"/g) || []).length;
    if (singleQ % 2 === 1) categories.singleQuote.push({ line: i + 1, content: line.trim().slice(0, 80) });
    else if (doubleQ % 2 === 1) categories.doubleQuote.push({ line: i + 1, content: line.trim().slice(0, 80) });
    else categories.other.push({ line: i + 1, content: line.trim().slice(0, 80) });
  } else if (beforeFffd.match(/`[^`]*$/)) {
    categories.templateLit.push({ line: i + 1, content: line.trim().slice(0, 80) });
  } else if (beforeFffd.match(/>[^<]*$/)) {
    categories.jsxText.push({ line: i + 1, content: line.trim().slice(0, 80) });
  } else if (beforeFffd.match(/\w+="[^"]*$/)) {
    categories.jsxAttr.push({ line: i + 1, content: line.trim().slice(0, 80) });
  } else {
    categories.other.push({ line: i + 1, content: line.trim().slice(0, 100) });
  }
}

for (const [cat, items] of Object.entries(categories)) {
  console.log(`\n=== ${cat} (${items.length}) ===`);
  items.slice(0, 15).forEach(item => {
    console.log(`  L${item.line}: ${item.content}`);
  });
  if (items.length > 15) console.log(`  ... and ${items.length - 15} more`);
}

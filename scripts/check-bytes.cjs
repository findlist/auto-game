const fs = require('fs');

// Read both files
const distJs = fs.readFileSync('dist/assets/index-DsOvDV00.js', 'utf8');
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
if (appTsx.charCodeAt(0) === 0xFEFF) appTsx = appTsx.slice(1);

// Strategy: The dist JS has correct Chinese. But the source code structure is different.
// We need to look at what the correct content should be based on the dist JS.
// However, the mapping between source positions and dist positions is not straightforward.

// Better approach: Read the App.tsx as raw bytes, find sequences of U+FFFD,
// and try to figure out what they should be from context.

// Actually, the best approach: the file was UTF-8 but got corrupted.
// The U+FFFD characters suggest the original bytes were read with wrong encoding.
// Let's check if the bytes might be GBK/GB2312 encoded Chinese.

// Read raw bytes
const buf = fs.readFileSync('src/App.tsx');
// Skip BOM
const content = buf.slice(3);

// Find a known Chinese string location - let's look for the pattern
// Line 1338 should have '入门' but it's corrupted
// Let's find the byte offset for line 1338
const lines = [];
let start = 0;
for (let i = 0; i < content.length; i++) {
  if (content[i] === 0x0A) {
    lines.push(content.slice(start, i));
    start = i + 1;
  }
}
lines.push(content.slice(start));

console.log('Line 1338 raw bytes (hex):');
const line1338 = lines[1337]; // 0-indexed
const hex = [];
for (let i = 0; i < line1338.length; i++) {
  hex.push(line1338[i].toString(16).padStart(2, '0'));
}
console.log(hex.join(' '));

console.log('\nLine 1339 raw bytes (hex):');
const line1339 = lines[1338];
const hex2 = [];
for (let i = 0; i < line1339.length; i++) {
  hex2.push(line1339[i].toString(16).padStart(2, '0'));
}
console.log(hex2.join(' '));

// Check if the bytes are UTF-8 encoded Chinese that got mangled
// U+FFFD in UTF-8 is EF BF BD
// If original was GBK, bytes would be different
// Let's check the first few U+FFFD sequences

console.log('\n=== Looking for EF BF BD sequences in raw bytes ===');
let count = 0;
for (let i = 0; i < content.length && count < 20; i++) {
  if (content[i] === 0xEF && content[i+1] === 0xBF && content[i+2] === 0xBD) {
    // Check surrounding bytes
    const before = content.slice(Math.max(0, i-4), i);
    const after = content.slice(i+3, i+7);
    const beforeHex = Array.from(before).map(b => b.toString(16).padStart(2, '0')).join(' ');
    const afterHex = Array.from(after).map(b => b.toString(16).padStart(2, '0')).join(' ');
    console.log(`Offset ${i}: before=[${beforeHex}] FFFD after=[${afterHex}]`);
    count++;
  }
}

// Try reading the file as GBK to see if it makes sense
console.log('\n=== Trying to decode line 1338 as GBK ===');
const iconv = (() => {
  try { return require('iconv-lite'); } catch(e) { return null; }
})();

if (!iconv) {
  console.log('iconv-lite not available, trying manual GBK decode...');
  // Manual GBK decode for the line
  // GBK uses 2 bytes per character, first byte 0x81-0xFE, second byte 0x40-0xFE
  const gbkLine = lines[1337];
  let result = '';
  for (let i = 0; i < gbkLine.length; i++) {
    const b = gbkLine[i];
    if (b >= 0x81 && b <= 0xFE && i + 1 < gbkLine.length) {
      const b2 = gbkLine[i + 1];
      // Try to decode as GBK
      // This is a simplified check - real GBK decode needs a lookup table
      result += `[GBK:${b.toString(16)}${b2.toString(16)}]`;
      i++;
    } else {
      result += String.fromCharCode(b);
    }
  }
  console.log('GBK attempt:', result);
} else {
  const gbkText = iconv.decode(lines[1337], 'gbk');
  console.log('GBK decoded:', gbkText);
}

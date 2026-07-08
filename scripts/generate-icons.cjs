// 生成色彩排序游戏的 PNG 图标文件
// 使用纯 Node.js 生成 PNG（无需外部依赖）
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// PNG 签名
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

// 创建 PNG IHDR chunk
function createIHDR(width, height) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);
  data.writeUInt32BE(height, 4);
  data.writeUInt8(8, 8);  // bit depth
  data.writeUInt8(6, 9);  // color type: RGBA
  data.writeUInt8(0, 10); // compression
  data.writeUInt8(0, 11); // filter
  data.writeUInt8(0, 12); // interlace
  return createChunk('IHDR', data);
}

// 创建 PNG chunk
function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 计算
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xEDB88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return crc ^ 0xFFFFFFFF;
}

// 生成图标像素数据
function generateIconPixels(size) {
  const pixels = Buffer.alloc(size * size * 4);
  
  // 背景渐变（从左上到右下）
  const bgStart = { r: 0x66, g: 0x7e, b: 0xea };
  const bgEnd = { r: 0x76, g: 0x4b, b: 0xa2 };
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const t = (x + y) / (size * 2);
      pixels[idx] = Math.round(bgStart.r + (bgEnd.r - bgStart.r) * t);
      pixels[idx + 1] = Math.round(bgStart.g + (bgEnd.g - bgStart.g) * t);
      pixels[idx + 2] = Math.round(bgStart.b + (bgEnd.b - bgStart.b) * t);
      pixels[idx + 3] = 255; // 不透明
    }
  }
  
  // 绘制试管图标（简化版）
  const tubeWidth = Math.round(size * 0.12);
  const tubeHeight = Math.round(size * 0.5);
  const tubeX = Math.round((size - tubeWidth) / 2);
  const tubeY = Math.round(size * 0.25);
  
  // 颜色层
  const colors = [
    { r: 0xFF, g: 0x6B, b: 0x6B }, // 红
    { r: 0x4E, g: 0xCD, b: 0xC4 }, // 青
    { r: 0xFF, g: 0xE6, b: 0x6D }, // 黄
  ];
  
  const layerHeight = Math.round(tubeHeight * 0.3);
  
  for (let y = tubeY; y < tubeY + tubeHeight; y++) {
    for (let x = tubeX; x < tubeX + tubeWidth; x++) {
      if (x < 0 || x >= size || y < 0 || y >= size) continue;
      const idx = (y * size + x) * 4;
      const relY = y - tubeY;
      
      // 试管边框
      if (x === tubeX || x === tubeX + tubeWidth - 1 || y === tubeY + tubeHeight - 1) {
        pixels[idx] = 255;
        pixels[idx + 1] = 255;
        pixels[idx + 2] = 255;
        pixels[idx + 3] = 180;
        continue;
      }
      
      // 颜色层填充
      const layerIdx = Math.floor((tubeHeight - relY) / layerHeight);
      if (layerIdx >= 0 && layerIdx < colors.length) {
        const c = colors[layerIdx];
        pixels[idx] = c.r;
        pixels[idx + 1] = c.g;
        pixels[idx + 2] = c.b;
        pixels[idx + 3] = 230;
      }
    }
  }
  
  // 添加圆角遮罩（四角透明）
  const cornerRadius = Math.round(size * 0.08);
  for (let y = 0; y < cornerRadius; y++) {
    for (let x = 0; x < cornerRadius; x++) {
      const dx = cornerRadius - x;
      const dy = cornerRadius - y;
      if (dx * dx + dy * dy > cornerRadius * cornerRadius) {
        const idx = (y * size + x) * 4;
        pixels[idx + 3] = 0;
        // 其他三个角
        const idx2 = (y * size + (size - 1 - x)) * 4;
        pixels[idx2 + 3] = 0;
        const idx3 = ((size - 1 - y) * size + x) * 4;
        pixels[idx3 + 3] = 0;
        const idx4 = ((size - 1 - y) * size + (size - 1 - x)) * 4;
        pixels[idx4 + 3] = 0;
      }
    }
  }
  
  return pixels;
}

// 生成 PNG 文件
function generatePNG(size, outputPath) {
  const pixels = generateIconPixels(size);
  
  // 添加每行前的 filter byte (0 = None)
  const rawData = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    rawData[y * (size * 4 + 1)] = 0; // filter: None
    pixels.copy(rawData, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  
  const compressed = zlib.deflateSync(rawData);
  
  const png = Buffer.concat([
    PNG_SIGNATURE,
    createIHDR(size, size),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0))
  ]);
  
  fs.writeFileSync(outputPath, png);
  console.log(`生成: ${outputPath} (${png.length} bytes)`);
}

// 生成 OG 图像 (1200x630)
function generateOGImage(outputPath) {
  const width = 1200;
  const height = 630;
  const pixels = Buffer.alloc(width * height * 4);
  
  // 背景渐变
  const bgStart = { r: 0x66, g: 0x7e, b: 0xea };
  const bgEnd = { r: 0x76, g: 0x4b, b: 0xa2 };
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const t = (x + y) / (width + height);
      pixels[idx] = Math.round(bgStart.r + (bgEnd.r - bgStart.r) * t);
      pixels[idx + 1] = Math.round(bgStart.g + (bgEnd.g - bgStart.g) * t);
      pixels[idx + 2] = Math.round(bgStart.b + (bgEnd.b - bgStart.b) * t);
      pixels[idx + 3] = 255;
    }
  }
  
  // 绘制装饰试管（左侧）
  drawTube(pixels, width, height, 150, 180, 60, 200, [
    { r: 0xFF, g: 0x6B, b: 0x6B },
    { r: 0x4E, g: 0xCD, b: 0xC4 },
    { r: 0xFF, g: 0xE6, b: 0x6D },
  ]);
  
  // 绘制装饰试管（右侧）
  drawTube(pixels, width, height, 990, 180, 60, 200, [
    { r: 0x95, g: 0xE1, b: 0xA3 },
    { r: 0xC5, g: 0x89, b: 0xE8 },
    { r: 0xFF, g: 0xA0, b: 0x7A },
  ]);
  
  // 绘制标题文字区域（白色半透明区域模拟）
  // 由于纯像素操作绘制文字复杂，这里用白色矩形模拟文字区域
  // 实际文字由 SVG 版本提供，PNG 作为降级方案
  
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 4 + 1)] = 0;
    pixels.copy(rawData, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  
  const compressed = zlib.deflateSync(rawData);
  const png = Buffer.concat([
    PNG_SIGNATURE,
    createIHDR(width, height),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0))
  ]);
  
  fs.writeFileSync(outputPath, png);
  console.log(`生成: ${outputPath} (${png.length} bytes)`);
}

function drawTube(pixels, imgWidth, imgHeight, x, y, w, h, colors) {
  const layerH = Math.round(h / (colors.length + 1));
  
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (px < 0 || px >= imgWidth || py < 0 || py >= imgHeight) continue;
      const idx = (py * imgWidth + px) * 4;
      
      // 边框
      if (dx === 0 || dx === w - 1 || dy === h - 1) {
        pixels[idx] = 255;
        pixels[idx + 1] = 255;
        pixels[idx + 2] = 255;
        pixels[idx + 3] = 100;
        continue;
      }
      
      // 颜色层
      const fromBottom = h - dy;
      const layerIdx = Math.floor(fromBottom / layerH) - 1;
      if (layerIdx >= 0 && layerIdx < colors.length) {
        const c = colors[layerIdx];
        pixels[idx] = c.r;
        pixels[idx + 1] = c.g;
        pixels[idx + 2] = c.b;
        pixels[idx + 3] = 220;
      }
    }
  }
}

const publicDir = path.join(__dirname, '..', 'public');

// 生成各尺寸图标
generatePNG(192, path.join(publicDir, 'icon-192.png'));
generatePNG(512, path.join(publicDir, 'icon-512.png'));

// 生成 OG 图像
generateOGImage(path.join(publicDir, 'og-image.png'));

console.log('所有图标生成完成！');

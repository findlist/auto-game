// 分享战绩图生成器
// 使用 Canvas 生成可分享的战绩图片，提升社交传播效果

interface ShareImageData {
  level: number;
  moves: number;
  minSteps: number;
  stars: number;
  difficulty: string;
  mode: 'normal' | 'daily' | 'endless' | 'timed';
  endlessScore?: number;
  timedScore?: number;
}

/**
 * 生成战绩分享图片并返回 Data URL
 */
export function generateShareImage(data: ShareImageData): string {
  const canvas = document.createElement('canvas');
  const W = 600;
  const H = 400;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 背景渐变
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#667eea');
  bgGrad.addColorStop(1, '#764ba2');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 装饰圆点
  ctx.globalAlpha = 0.1;
  const dotColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1A3', '#C589E8'];
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 10 + Math.random() * 30;
    ctx.fillStyle = dotColors[i % dotColors.length];
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 标题
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎨 色彩排序', W / 2, 50);

  // 副标题 - 模式信息
  ctx.font = '16px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.globalAlpha = 0.9;
  let subtitle = '';
  if (data.mode === 'daily') {
    subtitle = '每日挑战';
  } else if (data.mode === 'endless') {
    subtitle = `无尽模式 · 连过 ${data.endlessScore ?? 0} 关`;
  } else if (data.mode === 'timed') {
    subtitle = `限时挑战 · 连过 ${data.timedScore ?? 0} 关`;
  } else {
    subtitle = `第 ${data.level} 关 · ${data.difficulty}`;
  }
  ctx.fillText(subtitle, W / 2, 78);
  ctx.globalAlpha = 1;

  // 星级区域
  const starY = 140;
  const starSize = 50;
  const starGap = 16;
  const totalStarWidth = starSize * 3 + starGap * 2;
  const starStartX = (W - totalStarWidth) / 2;

  for (let i = 0; i < 3; i++) {
    const x = starStartX + i * (starSize + starGap);
    drawStar(ctx, x, starY, starSize, i < data.stars);
  }

  // 步数信息
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(`${data.moves} 步`, W / 2, 250);

  // 最优步数对比
  if (data.minSteps > 0) {
    ctx.font = '14px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.globalAlpha = 0.7;
    ctx.fillText(`最优 ${data.minSteps} 步`, W / 2, 275);
    ctx.globalAlpha = 1;
  }

  // 装饰试管图标
  drawMiniTube(ctx, 80, 300, '#FF6B6B');
  drawMiniTube(ctx, 130, 300, '#4ECDC4');
  drawMiniTube(ctx, W - 130, 300, '#FFE66D');
  drawMiniTube(ctx, W - 80, 300, '#95E1A3');

  // 底部引导
  ctx.fillStyle = '#fff';
  ctx.font = '14px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.globalAlpha = 0.6;
  ctx.fillText('来挑战我吧！扫码或搜索「色彩排序」', W / 2, 370);
  ctx.globalAlpha = 1;

  return canvas.toDataURL('image/png');
}

/**
 * 绘制星星
 */
function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, filled: boolean) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const spikes = 5;
  const outerRadius = size / 2;
  const innerRadius = outerRadius * 0.4;

  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * i) / spikes - Math.PI / 2;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();

  if (filled) {
    // 填充星星 - 带渐变
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerRadius);
    grad.addColorStop(0, '#FFD700');
    grad.addColorStop(1, '#FFA500');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#FF8C00';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/**
 * 绘制迷你试管装饰
 */
function drawMiniTube(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  const w = 24;
  const h = 50;
  // 试管外框
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.quadraticCurveTo(x, y + h + 6, x + w / 2, y + h + 6);
  ctx.quadraticCurveTo(x + w, y + h + 6, x + w, y + h);
  ctx.lineTo(x + w, y);
  ctx.stroke();

  // 液体
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.8;
  const liquidH = h * 0.7;
  ctx.fillRect(x + 2, y + h - liquidH, w - 4, liquidH - 2);
  // 底部圆角
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h, w / 2 - 2, 0, Math.PI);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/**
 * 将 Data URL 转为 Blob 用于分享
 */
export function dataURLToBlob(dataURL: string): Blob | null {
  try {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    return null;
  }
}

// 回放动画导出模块
// 使用 Canvas 逐帧渲染回放过程，导出为 WebM 视频（比 GIF 更小更快）

import { Tube, COLORS } from './types';
import { pour, cloneTubes } from './levelGenerator';

interface RenderOptions {
  tubes: Tube[];
  moves: Array<{ from: number; to: number }>;
  level: number;
  stars: number;
  stepsUsed: number;
}

// 单帧渲染配置
const FRAME_WIDTH = 640;
const FRAME_HEIGHT = 480;
const TUBE_WIDTH = 40;
const TUBE_HEIGHT = 120;
const TUBE_GAP = 12;
const FRAME_INTERVAL = 500; // 每步500ms

// 绘制单根试管
function drawTube(ctx: CanvasRenderingContext2D, tube: Tube, x: number, y: number, highlight: boolean) {
  const w = TUBE_WIDTH;
  const h = TUBE_HEIGHT;

  // 试管背景
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.strokeStyle = highlight ? '#FFD700' : 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = highlight ? 3 : 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();

  // 颜色层
  const layerHeight = h / tube.capacity;
  tube.layers.forEach((layer, i) => {
    const layerY = y + h - (i + 1) * layerHeight;
    ctx.fillStyle = COLORS[layer.color] || layer.color;
    ctx.beginPath();
    ctx.roundRect(x + 2, layerY + 1, w - 4, layerHeight - 1, 3);
    ctx.fill();
  });
}

// 绘制标题信息
function drawHeader(ctx: CanvasRenderingContext2D, level: number, step: number, totalSteps: number, stars: number) {
  // 背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, FRAME_WIDTH, 50);

  // 标题
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  const title = level > 0 ? `第 ${level} 关` : level === -1 ? '每日挑战' : level === -2 ? '无尽模式' : '限时模式';
  ctx.fillText(`🎨 ${title}`, 15, 30);

  // 步数
  ctx.textAlign = 'center';
  ctx.font = '14px sans-serif';
  ctx.fillText(`${step} / ${totalSteps} 步`, FRAME_WIDTH / 2, 30);

  // 星级
  ctx.textAlign = 'right';
  ctx.font = '16px sans-serif';
  // 修复 P1：stars 越界（>3 或 <0）时 repeat(负数) 会抛 RangeError 导致渲染崩溃
  const safeStars = Math.max(0, Math.min(3, Math.floor(Number(stars) || 0)));
  const starText = '⭐'.repeat(safeStars) + '☆'.repeat(3 - safeStars);
  ctx.fillText(starText, FRAME_WIDTH - 15, 30);
}

// 渲染单帧到 Canvas
function renderFrame(
  canvas: HTMLCanvasElement,
  tubes: Tube[],
  level: number,
  currentStep: number,
  totalSteps: number,
  stars: number,
  highlightFrom: number | null,
  highlightTo: number | null,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 渐变背景
  const grad = ctx.createLinearGradient(0, 0, 0, FRAME_HEIGHT);
  grad.addColorStop(0, '#667eea');
  grad.addColorStop(1, '#764ba2');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);

  // 绘制标题
  drawHeader(ctx, level, currentStep, totalSteps, stars);

  // 计算试管布局
  const totalTubes = tubes.length;
  const totalWidth = totalTubes * (TUBE_WIDTH + TUBE_GAP) - TUBE_GAP;
  const startX = (FRAME_WIDTH - totalWidth) / 2;
  const tubeY = (FRAME_HEIGHT - TUBE_HEIGHT) / 2 + 20;

  // 绘制试管
  tubes.forEach((tube, i) => {
    const x = startX + i * (TUBE_WIDTH + TUBE_GAP);
    const highlight = i === highlightFrom || i === highlightTo;
    drawTube(ctx, tube, x, tubeY, highlight);

    // 试管编号
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${i + 1}`, x + TUBE_WIDTH / 2, tubeY + TUBE_HEIGHT + 18);
  });

  // 底部水印
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('色彩排序 Color Sort Puzzle', FRAME_WIDTH / 2, FRAME_HEIGHT - 10);
}

// 生成回放视频（WebM 格式）
export async function generateReplayVideo(options: RenderOptions): Promise<string> {
  const { tubes: initialTubes, moves, level, stars, stepsUsed } = options;
  const canvas = document.createElement('canvas');
  canvas.width = FRAME_WIDTH;
  canvas.height = FRAME_HEIGHT;

  // 渲染初始状态
  renderFrame(canvas, initialTubes, level, 0, stepsUsed, stars, null, null);

  // 使用 MediaRecorder + Canvas captureStream
  const stream = canvas.captureStream(0); // 0 = 手动控制帧
  const mimeType = 'video/webm;codecs=vp9';
  
  // 检查浏览器是否支持
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    // 降级：导出为 WebP 动画序列的 dataURL 列表
    return generateReplayAsImages(options);
  }

  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2000000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise<string>((resolve, reject) => {
    recorder.onstop = () => {
      // 修复 P0：录制正常结束时也必须释放 stream tracks，避免 CanvasCaptureMediaStreamTrack
      // 持续占用 canvas 和 GPU 资源（onerror 和 catch 路径已释放，唯独正常路径遗漏）
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      resolve(url);
    };
    // 修复：原代码无 onerror 处理，录制出错时 Promise 永远挂起，UI 卡死
    recorder.onerror = () => {
      // 修复 P1：onerror 触发时必须释放 MediaRecorder 和 stream 资源，避免内存泄漏
      try { recorder.stop(); } catch { /* ignore */ }
      stream.getTracks().forEach(t => t.stop());
      reject(new Error('视频录制失败'));
    };

    recorder.start();

    let currentStep = 0;
    let currentTubes = cloneTubes(initialTubes);
    const track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack;

    // 绘制初始帧
    renderFrame(canvas, currentTubes, level, 0, stepsUsed, stars, null, null);
    track.requestFrame();

    const playNext = () => {
      if (currentStep >= moves.length) {
        // 结束帧（展示最终状态 + 庆祝）
        renderFrame(canvas, currentTubes, level, stepsUsed, stepsUsed, stars, null, null);
        track.requestFrame();
        setTimeout(() => {
          recorder.stop();
        }, 500);
        return;
      }

      // 修复 P0：pour 抛错会导致递归 setTimeout 链中断，recorder.stop() 永不执行，Promise 永久挂起
      // 此处用 try/catch 兜底，任何异常都结束录制并 reject，避免 UI 卡死
      try {
        const move = moves[currentStep];
        // 防御：move.from/move.to 越界时 currentTubes[idx] 为 undefined，pour 内部会抛 TypeError
        if (!move || !currentTubes[move.from] || !currentTubes[move.to]) {
          throw new Error('回放步骤索引越界');
        }
        const { from, to } = pour(currentTubes[move.from], currentTubes[move.to]);
        currentTubes = cloneTubes(currentTubes);
        currentTubes[move.from] = from;
        currentTubes[move.to] = to;
        currentStep++;

        renderFrame(canvas, currentTubes, level, currentStep, stepsUsed, stars, move.from, move.to);
        track.requestFrame();

        setTimeout(playNext, FRAME_INTERVAL);
      } catch (err) {
        // 出错时必须停止录制并释放资源，否则 Promise 永久挂起导致 UI 卡死
        try { recorder.stop(); } catch { /* ignore */ }
        stream.getTracks().forEach(t => t.stop());
        reject(err instanceof Error ? err : new Error('回放生成失败'));
      }
    };

    // 延迟开始
    setTimeout(playNext, 300);
  });
}

// 降级方案：生成关键帧图片序列（返回第一帧和最后帧的合成图）
function generateReplayAsImages(options: RenderOptions): string {
  const { tubes: initialTubes, level, stars, stepsUsed, moves } = options;
  const canvas = document.createElement('canvas');
  canvas.width = FRAME_WIDTH;
  canvas.height = FRAME_HEIGHT;

  // 渲染最终状态
  let currentTubes = cloneTubes(initialTubes);
  // 修复 P1：pour 抛错时整个 generateReplayVideo 会 reject，但调用方可能未 catch
  // 此处 try/catch 兜底，出错时至少返回初始帧，避免未处理 rejection
  try {
    moves.forEach(move => {
      if (!move || !currentTubes[move.from] || !currentTubes[move.to]) {
        throw new Error('回放步骤索引越界');
      }
      const { from, to } = pour(currentTubes[move.from], currentTubes[move.to]);
      currentTubes[move.from] = from;
      currentTubes[move.to] = to;
    });
  } catch { /* 索引越界则保留初始状态渲染 */ }

  renderFrame(canvas, currentTubes, level, stepsUsed, stepsUsed, stars, null, null);
  return canvas.toDataURL('image/png');
}

// 生成回放缩略图（用于分享预览）
export function generateReplayThumbnail(options: RenderOptions): string {
  const { tubes, level, stars, stepsUsed } = options;
  const canvas = document.createElement('canvas');
  canvas.width = FRAME_WIDTH;
  canvas.height = FRAME_HEIGHT;
  
  // 渲染初始状态
  renderFrame(canvas, tubes, level, 0, stepsUsed, stars, null, null);
  return canvas.toDataURL('image/png');
}

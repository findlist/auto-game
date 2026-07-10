// Web Audio API 音效合成引擎
// 不依赖任何音频文件，纯代码合成

import { GameSettings } from './settings';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// ===== 背景音乐系统 =====
let bgmInterval: number | null = null;
let bgmActive = false;
let bgmNoteIndex = 0;
let bgmSegmentIndex = 0;

// 多段旋律循环（C大调，轻柔风格）
const BGM_SEGMENTS = [
  // 第一段：明亮开篇
  [
    { freq: 523.25, dur: 0.4 }, // C5
    { freq: 587.33, dur: 0.4 }, // D5
    { freq: 659.25, dur: 0.4 }, // E5
    { freq: 523.25, dur: 0.4 }, // C5
    { freq: 659.25, dur: 0.6 }, // E5
    { freq: 587.33, dur: 0.4 }, // D5
    { freq: 523.25, dur: 0.4 }, // C5
    { freq: 0, dur: 0.3 },      // 休止
    { freq: 440.00, dur: 0.4 }, // A4
    { freq: 523.25, dur: 0.4 }, // C5
    { freq: 587.33, dur: 0.6 }, // D5
    { freq: 523.25, dur: 0.4 }, // C5
    { freq: 440.00, dur: 0.4 }, // A4
    { freq: 393.00, dur: 0.8 }, // G4
    { freq: 0, dur: 0.3 },      // 休止
  ],
  // 第二段：柔和过渡
  [
    { freq: 393.00, dur: 0.4 }, // G4
    { freq: 440.00, dur: 0.4 }, // A4
    { freq: 493.88, dur: 0.4 }, // B4
    { freq: 523.25, dur: 0.6 }, // C5
    { freq: 493.88, dur: 0.4 }, // B4
    { freq: 440.00, dur: 0.4 }, // A4
    { freq: 393.00, dur: 0.8 }, // G4
    { freq: 0, dur: 0.3 },      // 休止
    { freq: 349.23, dur: 0.4 }, // F4
    { freq: 393.00, dur: 0.4 }, // G4
    { freq: 440.00, dur: 0.4 }, // A4
    { freq: 393.00, dur: 0.6 }, // G4
    { freq: 349.23, dur: 0.4 }, // F4
    { freq: 329.63, dur: 0.8 }, // E4
    { freq: 0, dur: 0.3 },      // 休止
  ],
  // 第三段：轻快变奏
  [
    { freq: 659.25, dur: 0.3 }, // E5
    { freq: 587.33, dur: 0.3 }, // D5
    { freq: 523.25, dur: 0.3 }, // C5
    { freq: 587.33, dur: 0.3 }, // D5
    { freq: 659.25, dur: 0.3 }, // E5
    { freq: 659.25, dur: 0.3 }, // E5
    { freq: 659.25, dur: 0.6 }, // E5
    { freq: 0, dur: 0.2 },      // 休止
    { freq: 587.33, dur: 0.3 }, // D5
    { freq: 659.25, dur: 0.3 }, // E5
    { freq: 783.99, dur: 0.4 }, // G5
    { freq: 659.25, dur: 0.3 }, // E5
    { freq: 587.33, dur: 0.3 }, // D5
    { freq: 523.25, dur: 0.8 }, // C5
    { freq: 0, dur: 0.3 },      // 休止
  ],
  // 第四段：舒缓结尾
  [
    { freq: 523.25, dur: 0.5 }, // C5
    { freq: 659.25, dur: 0.5 }, // E5
    { freq: 783.99, dur: 0.5 }, // G5
    { freq: 659.25, dur: 0.4 }, // E5
    { freq: 523.25, dur: 0.4 }, // C5
    { freq: 587.33, dur: 0.4 }, // D5
    { freq: 523.25, dur: 0.8 }, // C5
    { freq: 0, dur: 0.4 },      // 休止
    { freq: 440.00, dur: 0.5 }, // A4
    { freq: 523.25, dur: 0.5 }, // C5
    { freq: 659.25, dur: 0.6 }, // E5
    { freq: 523.25, dur: 0.4 }, // C5
    { freq: 440.00, dur: 0.4 }, // A4
    { freq: 393.00, dur: 1.0 }, // G4
    { freq: 0, dur: 0.5 },      // 休止
  ],
];

function playBgmNote() {
  if (!bgmActive) return;
  const segment = BGM_SEGMENTS[bgmSegmentIndex % BGM_SEGMENTS.length];
  const note = segment[bgmNoteIndex % segment.length];
  bgmNoteIndex++;
  
  // 当前段播完，切换到下一段
  if (bgmNoteIndex >= segment.length) {
    bgmNoteIndex = 0;
    bgmSegmentIndex++;
  }
  
  if (note.freq > 0) {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + note.dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + note.dur);
      // 修复内存泄漏：播放结束后断开音频节点，否则节点会一直留在音频图中
      osc.onended = () => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
    } catch (e) { /* 忽略 */ }
  }
  
  // 安排下一个音符
  bgmInterval = window.setTimeout(playBgmNote, note.dur * 1000);
}

// 播放简单音调
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  if (!GameSettings.getSound()) return;
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
    // 修复内存泄漏：播放结束后断开节点
    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  } catch (e) {
    // 音频播放失败不阻塞游戏
  }
}

// 音效集合
export const SoundEngine = {
  // 选中试管
  select() {
    playTone(523.25, 0.1, 'sine', 0.2); // C5
  },

  // 倾倒成功
  pour() {
    playTone(659.25, 0.08, 'sine', 0.25); // E5
    setTimeout(() => playTone(783.99, 0.08, 'sine', 0.2), 60); // G5
  },

  // 倾倒失败
  error() {
    playTone(196.00, 0.15, 'square', 0.15); // G3 - 低沉
  },

  // 撤销操作
  undo() {
    playTone(440.00, 0.08, 'triangle', 0.2); // A4 - 柔和回退感
    setTimeout(() => playTone(349.23, 0.08, 'triangle', 0.15), 50); // F4
  },

  // 重置操作
  reset() {
    playTone(300.00, 0.06, 'sawtooth', 0.12);
    setTimeout(() => playTone(200.00, 0.08, 'sawtooth', 0.1), 40);
  },

  // 死局提示
  deadlock() {
    playTone(150.00, 0.2, 'square', 0.15);
    setTimeout(() => playTone(120.00, 0.2, 'square', 0.12), 150);
  },

  // 胜利
  win() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine', 0.3), i * 100);
    });
  },

  // 按钮点击
  click() {
    playTone(800, 0.05, 'sine', 0.15);
  },

  // 关卡完成星星音效
  star() {
    playTone(1318.51, 0.15, 'sine', 0.25); // E6
  },

  // 限时模式时间到
  timeUp() {
    playTone(200.00, 0.3, 'square', 0.2);
    setTimeout(() => playTone(150.00, 0.4, 'square', 0.15), 200);
    setTimeout(() => playTone(100.00, 0.5, 'sine', 0.1), 400);
  },

  // 限时模式倒计时滴答声
  tick() {
    playTone(1000, 0.05, 'square', 0.08);
  },

  // 接近完成提示音（剩余 1 组颜色即将归位）
  nearComplete() {
    playTone(880.00, 0.1, 'sine', 0.15); // A5
    setTimeout(() => playTone(1108.73, 0.12, 'sine', 0.18), 80); // C#6
  },

  // 连击音效（连续高效倾倒）
  combo(comboCount: number) {
    // 根据连击次数递增音高
    const baseFreq = 523.25; // C5
    const freq = baseFreq * Math.pow(1.122, Math.min(comboCount - 1, 12)); // 每次升一个半音
    playTone(freq, 0.1, 'triangle', 0.2);
    if (comboCount >= 3) {
      setTimeout(() => playTone(freq * 1.5, 0.08, 'triangle', 0.15), 50);
    }
  },

  // 恢复音频上下文（需要用户交互后调用）
  resume() {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (e) {
      // 忽略
    }
  },

  // ===== 背景音乐控制 =====

  // 开始播放背景音乐
  startBGM() {
    if (bgmActive) return;
    // 修复：原代码检查 getSound()（音效开关），应检查 getBGM()（背景音乐开关）
    if (!GameSettings.getBGM()) return;
    // 修复：非用户交互场景下 AudioContext 可能 suspended，需先 resume 否则 BGM 静默失败
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { /* 忽略 */ }
    bgmActive = true;
    bgmNoteIndex = 0;
    bgmSegmentIndex = 0;
    playBgmNote();
  },

  // 停止背景音乐
  stopBGM() {
    bgmActive = false;
    if (bgmInterval !== null) {
      clearTimeout(bgmInterval);
      bgmInterval = null;
    }
  },

  // 背景音乐是否正在播放
  isBGMPlaying(): boolean {
    return bgmActive;
  },

  // 切换背景音乐开关
  toggleBGM(): boolean {
    if (bgmActive) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  },
};

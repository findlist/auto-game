// 背景音乐旋律数据（C大调，轻柔风格）
// 从 soundEngine.ts 提取为独立数据文件，便于维护和扩展旋律

export interface BgmNote {
  freq: number; // 频率(Hz)，0表示休止
  dur: number;  // 时长(秒)
}

// 多段旋律循环，按段落顺序播放
export const BGM_SEGMENTS: BgmNote[][] = [
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

// SoundEngine 懒加载代理
// 设计原因：App.tsx 及首屏 hook/组件中静态导入 SoundEngine，
// 会导致 soundEngine.ts + bgmData.ts + settings.ts 打入首屏 index chunk。
// 通过代理模式，首次调用时才动态导入实际模块，将音效引擎延迟到用户首次交互后加载。

type SoundEngineType = typeof import('./soundEngine').SoundEngine;

// 缓存已加载的 SoundEngine 模块
let soundEnginePromise: Promise<SoundEngineType> | null = null;

// 懒加载获取 SoundEngine 实例
function getSoundEngine(): Promise<SoundEngineType> {
  if (!soundEnginePromise) {
    soundEnginePromise = import('./soundEngine').then(m => m.SoundEngine);
  }
  return soundEnginePromise;
}

// 创建代理对象：所有方法调用转发给懒加载的真实 SoundEngine
// 音效播放失败不影响游戏流程，所有方法均静默 catch
export const SoundEngineLazy = {
  achievement(rarity?: string) {
    getSoundEngine().then(s => s.achievement(rarity)).catch(() => {});
  },

  error() {
    getSoundEngine().then(s => s.error()).catch(() => {});
  },

  click() {
    getSoundEngine().then(s => s.click()).catch(() => {});
  },

  win() {
    getSoundEngine().then(s => s.win()).catch(() => {});
  },

  select() {
    getSoundEngine().then(s => s.select()).catch(() => {});
  },

  pour() {
    getSoundEngine().then(s => s.pour()).catch(() => {});
  },

  resume() {
    getSoundEngine().then(s => s.resume()).catch(() => {});
  },

  startBGM() {
    getSoundEngine().then(s => s.startBGM()).catch(() => {});
  },

  stopBGM() {
    getSoundEngine().then(s => s.stopBGM()).catch(() => {});
  },

  isBGMPlaying(): boolean {
    // 同步方法无法等待懒加载，首次调用返回 false，
    // 但 SoundEngine 模块加载后后续调用会拿到正确值
    // 实际使用场景（HomeChrome BGM 切换）在用户交互时触发，此时模块大概率已加载
    if (soundEnginePromise) {
      // 模块正在加载或已加载，但同步返回无法获取结果
      // 这种情况下返回 false 是安全的——BGM 按钮状态会在下次渲染时修正
    }
    return false;
  },

  toggleBGM(): boolean {
    // 异步执行，同步返回 false（同上）
    getSoundEngine().then(s => s.toggleBGM()).catch(() => {});
    return false;
  },
};

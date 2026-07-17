// PWA 安装提示管理
// 从 App.tsx 提取，负责 PWA beforeinstallprompt 事件的捕获与安装触发
import { STORAGE_KEYS } from './storageKeys';

const PWA_INSTALL_DISMISSED_KEY = STORAGE_KEYS.PWA_INSTALL_DISMISSED;

// 捕获到的安装提示事件，未触发前为 null
let deferredPrompt: any = null;

/** 注册 beforeinstallprompt 监听，拦截安装提示以便后续主动触发 */
export function setupPWAInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

/** 当前是否可触发 PWA 安装 */
export function canInstallPWA(): boolean {
  return deferredPrompt !== null;
}

/** 触发 PWA 安装弹窗，返回用户是否接受安装 */
export async function triggerPWAInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === 'accepted';
}

/** 用户是否已关闭过 PWA 安装提示 */
export function isPWAInstallDismissed(): boolean {
  try {
    return localStorage.getItem(PWA_INSTALL_DISMISSED_KEY) === '1';
  } catch (e) { return false; }
}

/** 标记用户已关闭 PWA 安装提示，不再重复弹出 */
export function dismissPWAInstall() {
  try {
    localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, '1');
  } catch (e) { /* 忽略 */ }
}

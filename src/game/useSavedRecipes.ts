import { useState, useCallback } from 'react';
import { SoundEngine } from './soundEngine';

// 色彩混合配方管理 hook
// 从 App.tsx 提取：配方的加载、查看弹窗状态管理
// 设计原因：配方逻辑与首页其他系统独立，单独提取可降低 App.tsx 复杂度

export interface SavedRecipe {
  colors: string[];
  result: string;
  rgb: string;
  date: string;
}

export function useSavedRecipes() {
  // 已保存的混合配方列表
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  // 配方查看弹窗显示状态
  const [showSavedRecipes, setShowSavedRecipes] = useState(false);

  // 从 localStorage 加载已保存的混合配方
  const loadSavedRecipes = useCallback(() => {
    try {
      const list = JSON.parse(localStorage.getItem('color_mixer_recipes') || '[]');
      setSavedRecipes(list);
    } catch (e) {
      setSavedRecipes([]);
    }
  }, []);

  // 打开配方查看弹窗：先加载最新数据，再显示弹窗
  const openSavedRecipes = useCallback(() => {
    loadSavedRecipes();
    setShowSavedRecipes(true);
    SoundEngine.click();
  }, [loadSavedRecipes]);

  // 关闭配方查看弹窗
  const closeSavedRecipes = useCallback(() => {
    setShowSavedRecipes(false);
  }, []);

  return {
    savedRecipes,
    showSavedRecipes,
    openSavedRecipes,
    closeSavedRecipes,
  };
}

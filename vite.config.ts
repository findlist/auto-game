import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = dirname(fileURLToPath(import.meta.url))
// package.json 作为版本号唯一数据源：同时供 define 注入客户端 + injectSwVersion 注入 sw.js
const pkgPath = resolve(__dirname, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

// 构建后插件：把 package.json 的 version 自动注入到 dist/sw.js 的 CACHE_VERSION
// 根因：之前手改 sw.js 版本号后每次 build 都被覆盖，导致浏览器 SW 永远吃旧缓存
// 现在版本号随代码版本自动递增，发版即清缓存，杜绝此类问题
const injectSwVersion = () => ({
  name: 'inject-sw-version',
  // closeBundle 在所有 chunk 写入 dist 后触发，是替换 sw.js 的最佳时机
  closeBundle() {
    const swPath = resolve(__dirname, 'dist/sw.js')
    try {
      let sw = readFileSync(swPath, 'utf-8')
      const replaced = sw.replace(
        /color-sort-v__VERSION__/,
        `color-sort-v${pkg.version}`
      )
      if (replaced === sw) {
        console.warn('[inject-sw-version] 未找到占位符 color-sort-v__VERSION__，请检查 sw.js')
        return
      }
      writeFileSync(swPath, replaced)
      console.log(`[inject-sw-version] ✓ dist/sw.js CACHE_VERSION 已更新为 color-sort-v${pkg.version}`)
    } catch (err) {
      // 注入失败不阻断构建，但给出明确错误便于排查
      console.error('[inject-sw-version] 注入失败：', err)
    }
  },
})

export default defineConfig({
  // 把 package.json version 注入为客户端全局常量，App.tsx 更新日志判断与 sw.js 共享同一数据源
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react(), injectSwVersion()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 300,
  },
})

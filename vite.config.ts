import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 构建后插件：把 package.json 的 version 自动注入到 dist/sw.js 的 CACHE_VERSION
// 根因：之前手改 sw.js 版本号后每次 build 都被覆盖，导致浏览器 SW 永远吃旧缓存
// 现在版本号随代码版本自动递增，发版即清缓存，杜绝此类问题
const __dirname = dirname(fileURLToPath(import.meta.url))
const injectSwVersion = () => ({
  name: 'inject-sw-version',
  // closeBundle 在所有 chunk 写入 dist 后触发，是替换 sw.js 的最佳时机
  closeBundle() {
    const pkgPath = resolve(__dirname, 'package.json')
    const swPath = resolve(__dirname, 'dist/sw.js')
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      const version = pkg.version
      if (!version) {
        console.warn('[inject-sw-version] package.json 缺少 version 字段，跳过注入')
        return
      }
      let sw = readFileSync(swPath, 'utf-8')
      const replaced = sw.replace(
        /color-sort-v__VERSION__/,
        `color-sort-v${version}`
      )
      if (replaced === sw) {
        console.warn('[inject-sw-version] 未找到占位符 color-sort-v__VERSION__，请检查 sw.js')
        return
      }
      writeFileSync(swPath, replaced)
      console.log(`[inject-sw-version] ✓ dist/sw.js CACHE_VERSION 已更新为 color-sort-v${version}`)
    } catch (err) {
      // 注入失败不阻断构建，但给出明确错误便于排查
      console.error('[inject-sw-version] 注入失败：', err)
    }
  },
})

export default defineConfig({
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

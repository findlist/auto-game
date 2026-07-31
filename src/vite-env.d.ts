/// <reference types="vite/client" />

// vite.config.ts 通过 define 把 package.json 的 version 注入为构建期常量
// App.tsx 的更新日志判断与 sw.js 的 CACHE_VERSION 共享同一数据源，避免版本号脱节
declare const __APP_VERSION__: string;

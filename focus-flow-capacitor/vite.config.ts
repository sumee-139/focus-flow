/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 30000, // 30秒に設定（デフォルト5秒から延長）
    // Playwrightテストファイルを除外（名前空間衝突防止）
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      'tests/**/*', // Playwrightテストディレクトリを除外
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
    ],
    // パス正規化の問題を回避
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
})

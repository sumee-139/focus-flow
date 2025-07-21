import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright設定 - Focus-Flow レイアウト回帰テスト
 * スクリーンショット比較とビジュアル回帰検出に最適化
 */
export default defineConfig({
  // テストディレクトリ
  testDir: './tests',
  
  // 並列実行設定（スクリーンショットの一貫性のため制限）
  fullyParallel: false,
  workers: 1, // スクリーンショット比較の安定性確保
  
  // 失敗時の挙動
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  
  // タイムアウト設定
  timeout: 30000,
  expect: {
    // スクリーンショット比較のタイムアウト
    timeout: 10000,
    
    // ビジュアル比較の閾値設定（厳格に）
    toHaveScreenshot: {
      // ピクセルレベルでの差異許容値（0.2% = 非常に厳格）
      threshold: 0.2,
      // アニメーション無効化
      animations: 'disabled',
      // 全ページキャプチャ
      fullPage: true,
      // 品質設定
      mode: 'enabled' as const,
    },
    
    // 要素スクリーンショットの設定
    toMatchScreenshot: {
      threshold: 0.2,
      animations: 'disabled',
    },
  },
  
  // レポート設定
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never' // 自動でブラウザを開かない
    }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    // CI環境では詳細ログ、ローカルでは簡潔に
    process.env.CI ? ['github'] : ['line']
  ],
  
  // 出力ディレクトリ
  outputDir: 'test-results/',
  
  // グローバル設定
  use: {
    // ベースURL（開発サーバー）
    baseURL: 'http://localhost:5174',
    
    // ブラウザ設定
    headless: true, // CIでも確実に動作
    
    // スクリーンショット設定
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    
    // ビデオ記録（デバッグ用）
    video: 'retain-on-failure',
    
    // トレース記録（デバッグ用）
    trace: 'retain-on-failure',
    
    // ビューポート（テスト内で個別設定するため null）
    viewport: null,
    
    // ロケール設定
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    
    // アクセシビリティ
    colorScheme: 'light',
    reducedMotion: 'reduce', // アニメーション最小化
    
    // ネットワーク設定
    ignoreHTTPSErrors: true,
  },

  // ブラウザプロジェクト設定
  projects: [
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        // デスクトップレイアウト用の設定
        viewport: { width: 1200, height: 800 },
      },
      testMatch: /.*\.spec\.ts/,
    },
    
    {
      name: 'chromium-tablet',
      use: { 
        ...devices['Desktop Chrome'],
        // タブレットレイアウト用の設定
        viewport: { width: 900, height: 600 },
      },
      testMatch: /.*visual-regression\.spec\.ts/,
    },
    
    {
      name: 'chromium-mobile',
      use: { 
        ...devices['Desktop Chrome'],
        // モバイルレイアウト用の設定
        viewport: { width: 375, height: 667 },
      },
      testMatch: /.*visual-regression\.spec\.ts/,
    },
    
    // WebKit（Safari）での検証（オプション）
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    //   testMatch: /.*regression\.spec\.ts/,
    // },
  ],

  // 開発サーバー設定
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2分でタイムアウト
    stdout: 'pipe',
    stderr: 'pipe',
  },
  
  // テストファイルパターン
  testMatch: [
    'tests/**/*.spec.ts',
    'tests/**/*.test.ts',
  ],
  
  // 無視するファイル
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
  ],
});
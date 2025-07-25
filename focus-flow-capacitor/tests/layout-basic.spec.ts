/**
 * Playwright 基本レイアウトテスト with スクリーンショット
 * 目的: レイアウトバグの視覚的検出とベースライン作成
 * 対象: 30%-45%-25% CSS Grid & レスポンシブレイアウト
 */

import { test, expect } from '@playwright/test';

// テスト用ビューポート設定
const VIEWPORTS = {
  mobile: { width: 375, height: 667, name: 'mobile' },      // iPhone SE
  tablet: { width: 900, height: 600, name: 'tablet' },      // iPad横
  desktop: { width: 1200, height: 800, name: 'desktop' },   // 標準デスクトップ
} as const;

test.beforeEach(async ({ page }) => {
  // アニメーション無効化（スクリーンショット一貫性確保）
  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    `;
    document.head.appendChild(style);
  });

  // 開発サーバーへアクセス
  await page.goto('http://localhost:5174');
  
  // アプリロード完了待機
  await page.waitForSelector('[data-testid="task-form"]', { timeout: 10000 });
  await page.waitForSelector('[data-testid="daily-memo"]', { timeout: 5000 });
  await page.waitForLoadState('networkidle');
});

test.describe('📸 ベースラインスクリーンショット', () => {
  // 各ビューポートでのベースライン作成
  for (const [_key, viewport] of Object.entries(VIEWPORTS)) {
    test(`should capture ${viewport.name} layout baseline`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500); // レイアウト安定化
      
      // 全画面スクリーンショット
      await expect(page).toHaveScreenshot(`baseline-${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
});

test.describe('🔍 主要エリアの個別キャプチャ', () => {
  test('should capture main layout areas', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.waitForTimeout(300);
    
    // Tasks Sidebar
    const tasksSection = page.locator('[data-testid="tasks-section"]');
    if (await tasksSection.isVisible()) {
      await expect(tasksSection).toHaveScreenshot('tasks-section-desktop.png');
    }
    
    // Memo Area
    const memoArea = page.locator('[data-testid="memo-area-45"]');
    if (await memoArea.isVisible()) {
      await expect(memoArea).toHaveScreenshot('memo-area-desktop.png');
    }
    
    // Tab Area (デスクトップのみ表示)
    const tabArea = page.locator('[data-testid="tab-area-25"]');
    if (await tabArea.isVisible()) {
      await expect(tabArea).toHaveScreenshot('tab-area-desktop.png');
    }
  });
});

test.describe('🎯 インタラクション時のキャプチャ', () => {
  test('should capture task creation flow', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    
    // 1. 初期状態
    await expect(page).toHaveScreenshot('task-creation-01-initial.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    // 2. フォーム入力
    await page.fill('[data-testid="task-title-input"]', 'レイアウトテスト');
    await expect(page).toHaveScreenshot('task-creation-02-input.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    // 3. タスク追加後
    await page.click('[data-testid="add-task-button"]');
    await page.waitForTimeout(500); // DOM更新待機
    await expect(page).toHaveScreenshot('task-creation-03-added.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should capture task interactions', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    
    // タスク作成
    await page.fill('[data-testid="task-title-input"]', 'インタラクションテスト');
    await page.click('[data-testid="add-task-button"]');
    await page.waitForTimeout(300);
    
    // 最初のタスクアイテムを取得
    const firstTask = page.locator('[data-testid^="task-item-"]').first();
    
    // タスク操作前
    await expect(firstTask).toHaveScreenshot('task-item-normal.png');
    
    // 完了操作
    await firstTask.locator('[data-testid="complete-task-button"]').click();
    await page.waitForTimeout(200);
    await expect(firstTask).toHaveScreenshot('task-item-completed.png');
  });
});

test.describe('🚨 レイアウト異常検出', () => {
  test('should detect overflow issues with long content', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    
    // 長いタイトルのタスクを作成
    const longTitle = 'これは非常に長いタスクタイトルでレイアウトのオーバーフロー問題やはみ出しを検出するためのテストケースです。UI崩れがないか確認します。';
    
    await page.fill('[data-testid="task-title-input"]', longTitle);
    await page.click('[data-testid="add-task-button"]');
    await page.waitForTimeout(500);
    
    // オーバーフロー検出用スクリーンショット
    await expect(page).toHaveScreenshot('overflow-test-long-title.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    // JavaScript によるオーバーフロー検証
    const hasOverflow = await page.evaluate(() => {
      const container = document.querySelector('[data-testid="main-layout-grid"]') as HTMLElement;
      if (!container) return false;
      
      return container.scrollWidth > container.clientWidth || 
             container.scrollHeight > container.clientHeight;
    });
    
    // オーバーフローがある場合は警告スクリーンショット
    if (hasOverflow) {
      console.log('⚠️ Overflow detected in layout!');
      await expect(page).toHaveScreenshot('OVERFLOW-DETECTED.png', {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });
});

test.describe('📱 レスポンシブ変化のキャプチャ', () => {
  test('should capture responsive layout transitions', async ({ page }) => {
    // デスクトップ → タブレット → モバイルの変化を記録
    const transitions = [
      { width: 1200, height: 800, name: 'step1-desktop' },
      { width: 1000, height: 700, name: 'step2-tablet-boundary' },
      { width: 900, height: 600, name: 'step3-tablet' },
      { width: 768, height: 600, name: 'step4-mobile-boundary' },
      { width: 375, height: 667, name: 'step5-mobile' },
    ];
    
    for (const step of transitions) {
      await page.setViewportSize({ width: step.width, height: step.height });
      await page.waitForTimeout(300); // レイアウト安定化
      
      await expect(page).toHaveScreenshot(`responsive-${step.name}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });
});
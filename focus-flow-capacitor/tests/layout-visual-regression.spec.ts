/**
 * Playwright ビジュアル回帰テスト with スクリーンショット
 * 目的: 数値だけでは検出できない視覚的レイアウトバグの発見
 * 戦略: スクリーンショット比較 + 視覚的異常の自動検出
 * 対象: はみ出し、色異常、重なり、アライメント等
 */

import { test, expect } from '@playwright/test';

// テスト用の重要ブレークポイント
const BREAKPOINTS = {
  mobile: { width: 375, height: 667, name: 'mobile' },      // iPhone SE
  tablet: { width: 900, height: 600, name: 'tablet' },      // iPad横
  desktop: { width: 1200, height: 800, name: 'desktop' },   // 標準デスクトップ
  wide: { width: 1600, height: 1000, name: 'wide' },        // ワイドモニター
} as const;

// スクリーンショット設定
const SCREENSHOT_CONFIG = {
  // 全画面キャプチャ
  fullPage: true,
  // アニメーションを無効化（一貫性確保）
  animations: 'disabled' as const,
  // 高品質設定
  quality: 90,
  // タイムアウト
  timeout: 10000,
} as const;

test.beforeEach(async ({ page }) => {
  // アニメーション無効化でスクリーンショットの一貫性確保
  await page.addInitScript(() => {
    // CSS animations/transitions無効化
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `;
    document.head.appendChild(style);
  });

  // 開発サーバーへアクセス
  await page.goto('http://localhost:5174');
  
  // アプリが完全にロードされるまで待機
  await page.waitForSelector('[data-testid="task-form"]', { timeout: 10000 });
  await page.waitForSelector('[data-testid="daily-memo"]', { timeout: 5000 });
  
  // フォント読み込み完了待機
  await page.waitForLoadState('networkidle');
});

test.describe('📸 基本レイアウトスクリーンショット', () => {
  // 各ブレークポイントでのベースラインスクリーンショット
  for (const [key, viewport] of Object.entries(BREAKPOINTS)) {
    test(`should capture ${viewport.name} layout baseline`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // レイアウト安定化待機
      await page.waitForTimeout(500);
      
      // ベースラインスクリーンショット
      await expect(page).toHaveScreenshot(`baseline-${viewport.name}.png`, SCREENSHOT_CONFIG);
    });
  }
});

test.describe('🔍 特定エリアの詳細スクリーンショット', () => {
  test('should capture tasks sidebar in all breakpoints', async ({ page }) => {
    for (const [key, viewport] of Object.entries(BREAKPOINTS)) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(300);
      
      const tasksArea = page.locator('[data-testid="tasks-sidebar"]');
      if (await tasksArea.isVisible()) {
        await expect(tasksArea).toHaveScreenshot(`tasks-sidebar-${viewport.name}.png`);
      }
    }
  });

  test('should capture memo area in all breakpoints', async ({ page }) => {
    for (const [key, viewport] of Object.entries(BREAKPOINTS)) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(300);
      
      const memoArea = page.locator('[data-testid="memo-area"]');
      if (await memoArea.isVisible()) {
        await expect(memoArea).toHaveScreenshot(`memo-area-${viewport.name}.png`);
      }
    }
  });

  test('should capture tab area when visible', async ({ page }) => {
    // デスクトップサイズでのみTab Area表示
    await page.setViewportSize(BREAKPOINTS.desktop);
    await page.waitForTimeout(300);
    
    const tabArea = page.locator('[data-testid="tab-area"]');
    if (await tabArea.isVisible()) {
      await expect(tabArea).toHaveScreenshot('tab-area-desktop.png');
    }
  });
});

test.describe('🎯 インタラクション時のビジュアル変化', () => {
  test('should capture task creation flow', async ({ page }) => {
    await page.setViewportSize(BREAKPOINTS.desktop);
    
    // 1. 初期状態
    await expect(page).toHaveScreenshot('task-creation-01-initial.png', SCREENSHOT_CONFIG);
    
    // 2. フォーム入力中
    await page.fill('[data-testid="task-title-input"]', 'テストタスク');
    await page.fill('[data-testid="task-description-input"]', 'テスト用の説明文');
    await expect(page).toHaveScreenshot('task-creation-02-filled.png', SCREENSHOT_CONFIG);
    
    // 3. タスク追加後
    await page.click('[data-testid="add-task-button"]');
    await page.waitForTimeout(500); // DOM更新待機
    await expect(page).toHaveScreenshot('task-creation-03-added.png', SCREENSHOT_CONFIG);
  });

  test('should capture task item interactions', async ({ page }) => {
    await page.setViewportSize(BREAKPOINTS.desktop);
    
    // まずタスクを作成
    await page.fill('[data-testid="task-title-input"]', 'インタラクションテスト');
    await page.click('[data-testid="add-task-button"]');
    await page.waitForTimeout(300);
    
    const taskItem = page.locator('[data-testid^="task-item-"]').first();
    
    // 1. 通常状態
    await expect(taskItem).toHaveScreenshot('task-item-01-normal.png');
    
    // 2. ホバー状態（デスクトップのみ）
    await taskItem.hover();
    await expect(taskItem).toHaveScreenshot('task-item-02-hover.png');
    
    // 3. 完了状態
    await taskItem.locator('[data-testid="complete-task-button"]').click();
    await page.waitForTimeout(200);
    await expect(taskItem).toHaveScreenshot('task-item-03-completed.png');
  });

  test('should capture confirm dialog appearance', async ({ page }) => {
    await page.setViewportSize(BREAKPOINTS.desktop);
    
    // タスク作成
    await page.fill('[data-testid="task-title-input"]', '削除テスト');
    await page.click('[data-testid="add-task-button"]');
    await page.waitForTimeout(300);
    
    // 削除ボタンクリック
    await page.locator('[data-testid^="task-item-"]').first().locator('[data-testid="delete-task-button"]').click();
    
    // ConfirmDialog表示確認とスクリーンショット
    await page.waitForSelector('[data-testid="confirm-dialog"]');
    await expect(page).toHaveScreenshot('confirm-dialog-visible.png', SCREENSHOT_CONFIG);
  });
});

test.describe('🚨 レイアウト異常検出', () => {
  test('should detect visual overflow issues', async ({ page }) => {
    await page.setViewportSize(BREAKPOINTS.desktop);
    
    // 長いタイトルのタスクを複数作成してオーバーフロー検証
    const longTasks = [
      'これは非常に長いタスクタイトルでレイアウトのオーバーフロー問題を検出するためのテストです',
      'Another very long task title to test layout overflow detection in the task management interface',
      '日本語と英語が混在した非常に長いタスク title that might cause layout issues in the UI components'
    ];
    
    for (const title of longTasks) {
      await page.fill('[data-testid="task-title-input"]', title);
      await page.click('[data-testid="add-task-button"]');
      await page.waitForTimeout(200);
    }
    
    await expect(page).toHaveScreenshot('overflow-test-long-titles.png', SCREENSHOT_CONFIG);
    
    // オーバーフロー検出
    const hasOverflow = await page.evaluate(() => {
      const container = document.querySelector('.main-container') as HTMLElement;
      if (!container) return false;
      
      return container.scrollWidth > container.clientWidth || 
             container.scrollHeight > container.clientHeight;
    });
    
    // オーバーフローがある場合は詳細スクリーンショット
    if (hasOverflow) {
      await expect(page).toHaveScreenshot('OVERFLOW-DETECTED.png', SCREENSHOT_CONFIG);
    }
  });

  test('should detect color and styling anomalies', async ({ page }) => {
    await page.setViewportSize(BREAKPOINTS.desktop);
    
    // スタイル異常を検出するためのCSS分析
    const styleIssues = await page.evaluate(() => {
      const issues: string[] = [];
      
      // 全要素のスタイルをチェック
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach((el) => {
        const styles = window.getComputedStyle(el);
        
        // 異常な色値検出
        if (styles.color === 'rgb(255, 0, 255)' || styles.backgroundColor === 'rgb(255, 0, 255)') {
          issues.push(`Magenta color detected: ${el.tagName}.${el.className}`);
        }
        
        // 巨大なz-index検出
        if (parseInt(styles.zIndex) > 9999) {
          issues.push(`Excessive z-index: ${el.tagName}.${el.className} = ${styles.zIndex}`);
        }
        
        // 負のマージン検出
        if (parseFloat(styles.marginLeft) < -100 || parseFloat(styles.marginTop) < -100) {
          issues.push(`Negative margin: ${el.tagName}.${el.className}`);
        }
      });
      
      return issues;
    });
    
    // スタイル異常がある場合は記録
    if (styleIssues.length > 0) {
      console.log('Style anomalies detected:', styleIssues);
      await expect(page).toHaveScreenshot('STYLE-ANOMALIES-DETECTED.png', SCREENSHOT_CONFIG);
    }
    
    // 通常のスクリーンショット
    await expect(page).toHaveScreenshot('style-check-normal.png', SCREENSHOT_CONFIG);
  });
});

test.describe('📱 レスポンシブ変化の連続キャプチャ', () => {
  test('should capture responsive transition sequence', async ({ page }) => {
    // デスクトップ → タブレット → モバイルの変化を連続キャプチャ
    const transitionSizes = [
      { width: 1200, height: 800, name: 'desktop-start' },
      { width: 1000, height: 700, name: 'desktop-to-tablet-boundary' },
      { width: 900, height: 600, name: 'tablet' },
      { width: 768, height: 600, name: 'tablet-to-mobile-boundary' },
      { width: 375, height: 667, name: 'mobile-end' },
    ];
    
    for (const size of transitionSizes) {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.waitForTimeout(300); // レイアウト安定化
      
      await expect(page).toHaveScreenshot(`responsive-transition-${size.name}.png`, SCREENSHOT_CONFIG);
    }
  });
});

test.describe('🔄 回帰比較テスト', () => {
  test('should maintain consistent visual appearance', async ({ page }) => {
    // タスクを作成して一貫した状態を作る
    const testTasks = [
      'デザインテスト',
      'レイアウト確認',
      '完了済みタスク'
    ];
    
    for (const [index, title] of testTasks.entries()) {
      await page.fill('[data-testid="task-title-input"]', title);
      await page.click('[data-testid="add-task-button"]');
      await page.waitForTimeout(200);
      
      // 最後のタスクを完了状態にする
      if (index === testTasks.length - 1) {
        await page.locator('[data-testid^="task-item-"]').last().locator('[data-testid="complete-task-button"]').click();
        await page.waitForTimeout(200);
      }
    }
    
    // 各ブレークポイントでの最終的な見た目を記録
    for (const [key, viewport] of Object.entries(BREAKPOINTS)) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(400);
      
      await expect(page).toHaveScreenshot(`regression-final-${viewport.name}.png`, SCREENSHOT_CONFIG);
    }
  });
});
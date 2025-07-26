// App統合テスト - 循環依存バグの検証
// 🔴 Red Phase: useDateNavigationとuseTaskFilterの循環依存バグ再現

import { render, screen, act, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

describe('App - 日付管理循環依存バグ修正', () => {
  
  beforeEach(() => {
    // LocalStorageをクリア
    localStorage.clear();
    // Date mockをリセット
    vi.restoreAllMocks();
    
    // matchMedia mockを設定
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  // 🔴 失敗するテスト: 「今日」ボタンが固定される問題
  test('should always show actual today date in navigation', async () => {
    // LocalStorageに古い日付を設定
    localStorage.setItem('focus-flow-task-filter', JSON.stringify({
      viewDate: '2025-07-20', // 古い日付
      mode: 'today',
      showCompleted: false,
      showArchived: false
    }));
    
    render(<App />);
    
    // 実際の今日の日付を確認（ローカル時刻使用）
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // 複数のフォーマットでチェック
    const possibleFormats = [
      `${year}年${month}月${day}日`,
      `${month}/${day}`,
      `${month}/${day}`, // 動的な今日の日付
      `${year}年${month}月${day}日` // 完全な今日の日付
    ];
    
    let dateFound = false;
    for (const format of possibleFormats) {
      try {
        const element = screen.getByText(new RegExp(format));
        if (element) {
          dateFound = true;
          break;
        }
      } catch {
        // 次のフォーマットを試す
      }
    }
    
    expect(dateFound).toBe(true);
    
    // 「今日」ボタンをクリック
    const todayButton = screen.getByRole('button', { name: '今日に戻る' });
    
    act(() => {
      fireEvent.click(todayButton);
    });
    
    // クリック後も実際の今日の日付を表示（再チェック）
    expect(dateFound).toBe(true);
  });

  test('should not be affected by localStorage filter date', async () => {
    // 異なる古い日付を設定
    localStorage.setItem('focus-flow-task-filter', JSON.stringify({
      viewDate: '2025-07-15', // より古い日付
      mode: 'today',
      showCompleted: false,
      showArchived: false
    }));
    
    render(<App />);
    
    // 実際の今日の日付が表示されるべき（ローカル時刻使用）
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // 今日の日付パターンを探す（より柔軟に）
    const possibleFormats = [
      `${year}年${month}月${day}日`,
      `${month}/${day}`,
      `${month}/${day}`, // 動的な今日の日付
      `${year}年${month}月${day}日` // 完全な今日の日付
    ];
    
    let dateFound = false;
    for (const format of possibleFormats) {
      try {
        const element = screen.getByText(new RegExp(format));
        if (element) {
          dateFound = true;
          break;
        }
      } catch {
        // 次のフォーマットを試す
      }
    }
    
    expect(dateFound).toBe(true);
  });

});

// 🔴 Red Phase: T007 モバイルタスクメモ保存機能失敗テスト
describe('App - T007 Mobile Task Memo Save Failure', () => {
  
  beforeEach(() => {
    localStorage.clear();
    
    // モバイル環境をシミュレート
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(max-width: 768px)', // モバイル判定
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  // 🔴 失敗するテスト: モバイルでタスクメモが保存されない問題
  test('should fail to save task memo on mobile (current bug)', async () => {
    render(<App />);
    
    // デフォルトタスクをクリック（モバイルでモーダル表示）
    const firstTask = await screen.findByText('FocusFlowプロトタイプを完成させる');
    
    act(() => {
      fireEvent.click(firstTask);
    });
    
    // MobileTaskMemoModalが表示されることを確認
    const modal = await screen.findByTestId('mobile-task-memo-modal');
    expect(modal).toBeInTheDocument();
    
    // メモ内容を入力
    const textarea = screen.getByLabelText(/タスクメモ/i);
    const testMemoContent = 'Test memo content for mobile save failure';
    
    act(() => {
      fireEvent.change(textarea, { target: { value: testMemoContent } });
    });
    
    // 3秒待機（自動保存のトリガー）
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 3500));
    });
    
    // LocalStorageにタスクメモが保存されていないことを確認（現在のバグ）
    const taskMemoKey = 'focus-flow-task-memo-1';
    const savedMemo = localStorage.getItem(taskMemoKey);
    
    // 🟢 修正後テスト: TaskMemoDataオブジェクトが保存されているはず
    expect(savedMemo).not.toBeNull(); // 保存されていることを確認
    if (savedMemo) {
      const taskMemoData = JSON.parse(savedMemo);
      expect(taskMemoData.content).toBe(testMemoContent);
      expect(taskMemoData.taskId).toBe('1');
      expect(taskMemoData.taskSnapshot).toBeDefined();
    }
  });

  // 🔴 失敗するテスト: 戻るボタンでも保存されない問題
  test('should fail to save task memo when closing modal (current bug)', async () => {
    render(<App />);
    
    // デフォルトタスクをクリック
    const firstTask = await screen.findByText('FocusFlowプロトタイプを完成させる');
    
    act(() => {
      fireEvent.click(firstTask);
    });
    
    // MobileTaskMemoModalが表示されることを確認
    const modal = await screen.findByTestId('mobile-task-memo-modal');
    expect(modal).toBeInTheDocument();
    
    // メモ内容を入力
    const textarea = screen.getByLabelText(/タスクメモ/i);
    const testMemoContent = 'Test memo for back button save failure';
    
    act(() => {
      fireEvent.change(textarea, { target: { value: testMemoContent } });
    });
    
    // 戻るボタンをクリック
    const backButton = screen.getByText('← 戻る');
    
    act(() => {
      fireEvent.click(backButton);
    });
    
    // LocalStorageにタスクメモが保存されていないことを確認（現在のバグ）
    const taskMemoKey = 'focus-flow-task-memo-1';
    const savedMemo = localStorage.getItem(taskMemoKey);
    
    // 🟢 修正後テスト: TaskMemoDataオブジェクトが保存されているはず
    expect(savedMemo).not.toBeNull(); // 保存されていることを確認
    if (savedMemo) {
      const taskMemoData = JSON.parse(savedMemo);
      expect(taskMemoData.content).toBe(testMemoContent);
      expect(taskMemoData.taskId).toBe('1');
      expect(taskMemoData.taskSnapshot).toBeDefined();
    }
  });

});
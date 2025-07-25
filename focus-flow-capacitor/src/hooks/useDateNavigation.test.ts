// useDateNavigation カスタムフックのテスト - Phase 2.2a
// 🔴 Red Phase: Today-First UXのための日付ナビゲーションフック

import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useDateNavigation } from './useDateNavigation';
import { jstTime } from '../utils/jstTime';

describe('useDateNavigation - Today-First UX 日付ナビゲーションフック', () => {
  
  test('should initialize and navigate', () => {
    const { result } = renderHook(() => useDateNavigation({ initialDate: '2025-07-21' }));
    
    // 初期状態確認
    expect(result.current.currentDate).toBe('2025-07-21');
    
    // 前日に移動
    act(() => {
      result.current.goToPreviousDay();
    });
    
    expect(result.current.currentDate).toBe('2025-07-20');
    
    // 次の日に移動
    act(() => {
      result.current.goToNextDay();
    });
    
    expect(result.current.currentDate).toBe('2025-07-21');
    
    // 特定の日に移動
    act(() => {
      result.current.goToDate('2025-08-01');
    });
    
    expect(result.current.currentDate).toBe('2025-08-01');
    
    // 複数日移動
    act(() => {
      result.current.moveByDays(-7);
    });
    
    expect(result.current.currentDate).toBe('2025-07-25');
  });

  test('should provide date display formats', () => {
    const { result } = renderHook(() => useDateNavigation({ initialDate: '2025-07-21' }));
    
    // フォーマット確認
    expect(result.current.displayText.short).toBe('7/21(月)');
    expect(result.current.displayText.long).toBe('2025年7月21日(月)');
    
    // 状態確認
    expect(typeof result.current.displayText.relative).toBe('string');
    expect(typeof result.current.weekStart).toBe('string');
    expect(typeof result.current.monthStart).toBe('string');
  });

  test('should handle callbacks', () => {
    const onChangeMock = vi.fn();
    const { result } = renderHook(() => 
      useDateNavigation({ 
        initialDate: '2025-07-21',
        onChange: onChangeMock 
      })
    );
    
    act(() => {
      result.current.goToDate('2025-08-01');
    });
    
    expect(onChangeMock).toHaveBeenCalledWith('2025-08-01');
  });

  // 🔴 T006: JST時差バグ修正テスト - UTC/JST時差問題解決
  test('should always return actual today date regardless of localStorage', () => {
    // LocalStorageに古い日付を故意に設定
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify({
      viewDate: '2025-07-20', // 古い日付
      mode: 'today',
      showCompleted: false,
      showArchived: false
    }));
    
    // persist=falseで呼び出し（App.tsxと同じ）
    const { result } = renderHook(() => useDateNavigation());
    
    // 「今日」は常にJST基準の実際の今日の日付であるべき
    const actualTodayJST = jstTime.getCurrentDate();
    expect(result.current.currentDate).toBe(actualTodayJST);
    
    // goToTodayを実行しても同じ結果
    act(() => {
      result.current.goToToday();
    });
    
    expect(result.current.currentDate).toBe(actualTodayJST);
    
    vi.restoreAllMocks();
  });

  test('should not be affected by external filter state', () => {
    const { result } = renderHook(() => useDateNavigation());
    
    // T006: JST基準の今日の日付を期待
    const actualTodayJST = jstTime.getCurrentDate();
    
    // 初期化時点で正しい今日の日付（JST基準）
    expect(result.current.currentDate).toBe(actualTodayJST);
    
    // isToday判定も正しく動作
    expect(result.current.isToday).toBe(true);
  });
});
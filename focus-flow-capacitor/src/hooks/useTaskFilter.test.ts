// useTaskFilter カスタムフックのテスト - Phase 2.2a
// 🔴 Red Phase: Today-First UXのためのタスクフィルタリングフック

import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useTaskFilter } from './useTaskFilter';
import { Task, TaskFilter } from '../types/Task';

describe('useTaskFilter - Today-First UX タスクフィルタリングフック', () => {
  // テスト用サンプルタスク（固定日付を使用してテストの一貫性を保つ）
  const today = '2025-07-25'; // 固定日付
  const tomorrow = '2025-07-26'; // 固定日付
  
  beforeEach(() => {
    // 固定日付（2025-07-25）でDateを初期化
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-07-25T00:00:00.000Z'));
  });
  
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  
  const sampleTasks: Task[] = [
    {
      id: '1',
      title: '今日のタスク1',
      estimatedMinutes: 60,
      targetDate: today, // 実際の今日
      order: 1,
      completed: false,
      tags: ['work'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: '今日のタスク2（完了済み）',
      estimatedMinutes: 30,
      targetDate: today, // 実際の今日
      order: 2,
      completed: true,
      tags: ['personal'],
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: new Date(),
      actualMinutes: 25,
    },
    {
      id: '3',
      title: '明日のタスク',
      estimatedMinutes: 45,
      targetDate: tomorrow, // 実際の明日
      order: 3,
      completed: false,
      tags: ['meeting'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // ✅ **シンプルな今日起動テスト**
  test('should always start with today when app loads', () => {
    // LocalStorageに古い日付を設定（例: 7/24）
    const outdatedFilter: TaskFilter = {
      viewDate: '2025-07-24', // 古い日付
      mode: 'date',
      showCompleted: true, // これは復元される
      showArchived: false,
    };
    
    // Mock localStorage to return outdated filter
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(outdatedFilter));
    
    const { result } = renderHook(() => useTaskFilter(sampleTasks));
    
    // 常に今日の日付で起動（シンプル）
    expect(result.current.filter.viewDate).toBe(today);
    expect(result.current.filter.mode).toBe('today');
    // ただし設定は復元される
    expect(result.current.filter.showCompleted).toBe(true);
  });

  test('should detect date changes and auto-update localStorage filter', () => {
    // 古い日付のフィルターでスタート
    const { result } = renderHook(() => useTaskFilter(sampleTasks));
    const today = new Date().toISOString().split('T')[0];
    
    // フィルターが今日の日付に自動更新されることを期待（実装後）
    // この機能はまだ実装されていないので失敗する
    expect(result.current.filter.viewDate).toBe(today);
  });

  // 🔴 失敗するテスト：初期状態
  test('should initialize with today filter by default', () => {
    const { result } = renderHook(() => useTaskFilter(sampleTasks));
    
    expect(result.current.filter.mode).toBe('today');
    expect(result.current.filter.viewDate).toMatch(/^\d{4}-\d{2}-\d{2}$/); // 今日の日付
    expect(result.current.filter.showCompleted).toBe(false);
    expect(result.current.filter.showArchived).toBe(false);
  });

  // 🔴 失敗するテスト：今日のタスクフィルタリング
  test('should filter tasks for today by default', () => {
    const { result } = renderHook(() => useTaskFilter(sampleTasks));
    
    expect(result.current.filteredTasks).toHaveLength(1); // 未完了の今日のタスクのみ
    expect(result.current.filteredTasks[0].id).toBe('1');
    expect(result.current.filteredTasks[0].completed).toBe(false);
  });

  // 🔴 失敗するテスト：統計情報計算
  test('should calculate statistics for filtered tasks', () => {
    const { result } = renderHook(() => useTaskFilter(sampleTasks));
    
    expect(result.current.statistics.date).toBe(today);
    expect(result.current.statistics.totalTasks).toBe(2); // 今日のタスク総数
    expect(result.current.statistics.completedTasks).toBe(1); // 完了済み数
    expect(result.current.statistics.totalEstimatedMinutes).toBe(90); // 60 + 30
  });

  // 🔴 失敗するテスト：フィルタ更新
  test('should update filter and re-filter tasks', () => {
    const { result } = renderHook(() => useTaskFilter(sampleTasks));
    
    act(() => {
      result.current.updateFilter({ 
        viewDate: tomorrow, // 明日に変更
        mode: 'date' 
      });
    });
    
    expect(result.current.filter.viewDate).toBe(tomorrow);
    expect(result.current.filter.mode).toBe('date');
    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].id).toBe('3'); // 明日のタスク
  });

  // 🔴 失敗するテスト：完了済み表示切替
  test('should toggle completed task visibility', () => {
    const { result } = renderHook(() => useTaskFilter(sampleTasks));
    
    // 強制的に今日にフィルタを設定
    act(() => {
      result.current.updateFilter({ viewDate: today, mode: 'today' });
    });
    
    // 初期状態: 未完了のみ表示（今日のタスクのみ）
    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].id).toBe('1');
    expect(result.current.filteredTasks[0].completed).toBe(false);
    
    act(() => {
      result.current.updateFilter({ showCompleted: true });
    });
    
    // 完了済みも表示 (今日のタスク両方)
    expect(result.current.filteredTasks).toHaveLength(2);
    expect(result.current.filteredTasks.some(task => task.completed)).toBe(true);
    expect(result.current.filteredTasks.some(task => task.id === '2')).toBe(true);
  });

  // 🔴 失敗するテスト：今日に戻る機能
  test('should reset to today filter', () => {
    const { result } = renderHook(() => useTaskFilter(sampleTasks));
    
    // 明日に変更
    act(() => {
      result.current.updateFilter({ 
        viewDate: tomorrow,
        mode: 'date' 
      });
    });
    
    expect(result.current.filter.viewDate).toBe(tomorrow);
    
    // 今日に戻す
    act(() => {
      result.current.resetToToday();
    });
    
    expect(result.current.filter.mode).toBe('today');
    expect(result.current.filter.viewDate).toBe(today); // 固定日付を使用
    expect(result.current.filter.showCompleted).toBe(false); // デフォルトに戻る
  });

  // 🔴 失敗するテスト：LocalStorage連携
  test('should persist filter state to localStorage', () => {
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });
    
    const { result } = renderHook(() => useTaskFilter(sampleTasks));
    
    act(() => {
      result.current.updateFilter({ 
        viewDate: tomorrow,
        showCompleted: true 
      });
    });
    
    // LocalStorageに保存されることを確認
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'focus-flow-task-filter',
      expect.stringContaining(`"viewDate":"${tomorrow}"`)
    );
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'focus-flow-task-filter',
      expect.stringContaining('"showCompleted":true')
    );
  });

  // ✅ LocalStorageからの復元（日付以外の設定のみ）
  test('should restore settings but always start with today', () => {
    const savedFilter: TaskFilter = {
      viewDate: tomorrow, // 明日の日付（無視される）
      mode: 'date', // 無視される
      showCompleted: true, // 復元される
      showArchived: false, // 復元される
    };
    
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(JSON.stringify(savedFilter)),
      setItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });
    
    const { result } = renderHook(() => useTaskFilter(sampleTasks));
    
    // 常に今日から起動（シンプル）
    expect(result.current.filter.viewDate).toBe(today); 
    expect(result.current.filter.mode).toBe('today');
    // 設定は復元される
    expect(result.current.filter.showCompleted).toBe(true);
    expect(result.current.filter.showArchived).toBe(false);
  });

  // 🔴 失敗するテスト：タスク変更時の再計算
  test('should recalculate when tasks change', () => {
    const { result, rerender } = renderHook(
      ({ tasks }) => useTaskFilter(tasks),
      { initialProps: { tasks: sampleTasks } }
    );
    
    const initialCount = result.current.filteredTasks.length;
    
    // タスクを追加
    const newTasks: Task[] = [
      ...sampleTasks,
      {
        id: '4',
        title: '今日の新しいタスク',
        estimatedMinutes: 20,
        targetDate: today, // 今日（固定日付）
        order: 4,
        completed: false,
        tags: ['new'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    
    rerender({ tasks: newTasks });
    
    expect(result.current.filteredTasks.length).toBeGreaterThan(initialCount);
  });

  // 🔴 失敗するテスト：空配列の処理
  test('should handle empty task array', () => {
    const { result } = renderHook(() => useTaskFilter([]));
    
    expect(result.current.filteredTasks).toEqual([]);
    expect(result.current.statistics.totalTasks).toBe(0);
    expect(result.current.statistics.completedTasks).toBe(0);
    expect(result.current.statistics.totalEstimatedMinutes).toBe(0);
  });

  // 🔴 失敗するテスト：不正なタスクデータの処理
  test('should handle invalid task data gracefully', () => {
    const invalidTasks = [
      { id: '1', title: 'Task without targetDate' }, // targetDate missing
      null, // null value
      { ...sampleTasks[0], targetDate: 'invalid-date' }, // invalid date
    ] as any[];
    
    const { result } = renderHook(() => useTaskFilter(invalidTasks));
    
    act(() => {
      expect(() => result.current.filteredTasks).not.toThrow();
      expect(() => result.current.statistics).not.toThrow();
      expect(() => result.current.updateFilter({ showCompleted: true })).not.toThrow();
    });
  });
});
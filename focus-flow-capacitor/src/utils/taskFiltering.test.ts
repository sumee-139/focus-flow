// Task Filtering Operations のテスト - Phase 2.2a
// 🔴 Red Phase: Today-First UXのためのタスクフィルタリング機能

import { 
  filterTasksByDate,
  filterTasksByCompletion,
  calculateTaskStatistics,
  sortTasksForToday,
  createTaskFilter,
  groupTasksByDate
} from './taskFiltering';
import { Task, TaskFilter } from '../types/Task';
import { jstTime } from './jstTime';

describe('Task Filtering Operations - Today-First UX支援機能', () => {
  // テスト用サンプルタスク
  const sampleTasks: Task[] = [
    {
      id: '1',
      title: '今日のタスク1',
      description: '今日やる重要なタスク',
      estimatedMinutes: 60,
      order: 1,
      completed: false,
      tags: ['work'],
      createdAt: new Date('2025-07-21T09:00:00'),
      updatedAt: new Date('2025-07-21T09:00:00'),
      targetDate: '2025-07-21', // 今日
    },
    {
      id: '2', 
      title: '今日のタスク2（完了済み）',
      estimatedMinutes: 30,
      order: 2,
      completed: true,
      tags: ['personal'],
      createdAt: new Date('2025-07-21T10:00:00'),
      updatedAt: new Date('2025-07-21T11:00:00'),
      targetDate: '2025-07-21', // 今日
      completedAt: new Date('2025-07-21T11:00:00'),
      actualMinutes: 25,
    },
    {
      id: '3',
      title: '明日のタスク',
      estimatedMinutes: 45,
      order: 3,
      completed: false,
      tags: ['meeting'],
      createdAt: new Date('2025-07-21T12:00:00'),
      updatedAt: new Date('2025-07-21T12:00:00'),
      targetDate: '2025-07-22', // 明日
    },
    {
      id: '4',
      title: '昨日のタスク（未完了）',
      estimatedMinutes: 90,
      order: 4,
      completed: false,
      tags: ['overdue'],
      createdAt: new Date('2025-07-20T14:00:00'),
      updatedAt: new Date('2025-07-20T14:00:00'),
      targetDate: '2025-07-20', // 昨日
    }
  ];

  // 🔴 失敗するテスト：日付によるタスクフィルタリング
  test('should filter tasks by target date', () => {
    const todayTasks = filterTasksByDate(sampleTasks, '2025-07-21');
    expect(todayTasks).toHaveLength(2);
    expect(todayTasks[0].id).toBe('1');
    expect(todayTasks[1].id).toBe('2');

    const tomorrowTasks = filterTasksByDate(sampleTasks, '2025-07-22');
    expect(tomorrowTasks).toHaveLength(1);
    expect(tomorrowTasks[0].id).toBe('3');

    const yesterdayTasks = filterTasksByDate(sampleTasks, '2025-07-20');
    expect(yesterdayTasks).toHaveLength(1);
    expect(yesterdayTasks[0].id).toBe('4');
  });

  // 🔴 失敗するテスト：完了状態によるフィルタリング
  test('should filter tasks by completion status', () => {
    // 未完了タスクのみ
    const incompleteTasks = filterTasksByCompletion(sampleTasks, false);
    expect(incompleteTasks).toHaveLength(3);
    expect(incompleteTasks.every(task => !task.completed)).toBe(true);

    // 完了済みタスクのみ
    const completedTasks = filterTasksByCompletion(sampleTasks, true);
    expect(completedTasks).toHaveLength(1);
    expect(completedTasks[0].id).toBe('2');

    // すべて表示
    const allTasks = filterTasksByCompletion(sampleTasks, 'all');
    expect(allTasks).toHaveLength(4);
  });

  // 🔴 失敗するテスト：日付別タスク統計計算
  test('should calculate task statistics for a specific date', () => {
    const todayStats = calculateTaskStatistics(sampleTasks, '2025-07-21');
    
    expect(todayStats.date).toBe('2025-07-21');
    expect(todayStats.totalTasks).toBe(2);
    expect(todayStats.completedTasks).toBe(1);
    expect(todayStats.totalEstimatedMinutes).toBe(90); // 60 + 30
    expect(todayStats.totalActualMinutes).toBe(25);   // 完了済みタスクの実績のみ

    const tomorrowStats = calculateTaskStatistics(sampleTasks, '2025-07-22');
    expect(tomorrowStats.totalTasks).toBe(1);
    expect(tomorrowStats.completedTasks).toBe(0);
    expect(tomorrowStats.totalEstimatedMinutes).toBe(45);
    expect(tomorrowStats.totalActualMinutes).toBe(0);
  });

  // 🔴 失敗するテスト：Today-First用タスクソート
  test('should sort tasks optimized for Today-First UX', () => {
    const sortedTasks = sortTasksForToday(sampleTasks);
    
    // 優先度: 未完了 > 完了済み、見積もり時間昇順、作成順
    expect(sortedTasks[0].completed).toBe(false); // 未完了が先
    expect(sortedTasks[sortedTasks.length - 1].completed).toBe(true); // 完了済みが最後
    
    // 未完了タスク内では見積もり時間の短い順
    const incompleteTasks = sortedTasks.filter(task => !task.completed);
    for (let i = 0; i < incompleteTasks.length - 1; i++) {
      expect(incompleteTasks[i].estimatedMinutes).toBeLessThanOrEqual(
        incompleteTasks[i + 1].estimatedMinutes
      );
    }
  });

  // 🔴 失敗するテスト：タスクフィルタ作成
  test('should create task filter with default values', () => {
    const defaultFilter = createTaskFilter();
    // T006: JST基準の今日の日付を期待 - UTC/JST時差問題解決
    const todayJST = jstTime.getCurrentDate();
    
    expect(defaultFilter.viewDate).toBe(todayJST);
    expect(defaultFilter.mode).toBe('today');
    expect(defaultFilter.showCompleted).toBe(false);
    expect(defaultFilter.showArchived).toBe(false);
  });

  // 🔴 失敗するテスト：カスタムフィルタ作成
  test('should create task filter with custom values', () => {
    const customFilter = createTaskFilter({
      viewDate: '2025-07-22',
      mode: 'date',
      showCompleted: true,
    });
    
    expect(customFilter.viewDate).toBe('2025-07-22');
    expect(customFilter.mode).toBe('date');
    expect(customFilter.showCompleted).toBe(true);
    expect(customFilter.showArchived).toBe(false); // デフォルト値
  });

  // 🔴 失敗するテスト：日付別タスクグループ化
  test('should group tasks by target date', () => {
    const groupedTasks = groupTasksByDate(sampleTasks);
    
    expect(Object.keys(groupedTasks)).toHaveLength(3); // 3つの異なる日付
    expect(groupedTasks['2025-07-21']).toHaveLength(2);
    expect(groupedTasks['2025-07-22']).toHaveLength(1);
    expect(groupedTasks['2025-07-20']).toHaveLength(1);
    
    // 日付順にソートされていることを確認
    const dates = Object.keys(groupedTasks).sort();
    expect(dates).toEqual(['2025-07-20', '2025-07-21', '2025-07-22']);
  });

  // 🔴 失敗するテスト：フィルタ組み合わせ適用
  test('should apply combined filters correctly', () => {
    const filter: TaskFilter = {
      viewDate: '2025-07-21',
      mode: 'today',
      showCompleted: false,
      showArchived: false,
    };
    
    // 今日 + 未完了のタスクのみ
    let filteredTasks = filterTasksByDate(sampleTasks, filter.viewDate);
    filteredTasks = filterTasksByCompletion(filteredTasks, filter.showCompleted);
    
    expect(filteredTasks).toHaveLength(1);
    expect(filteredTasks[0].id).toBe('1');
    expect(filteredTasks[0].completed).toBe(false);
  });

  // 🔴 失敗するテスト：空配列の処理
  test('should handle empty task arrays gracefully', () => {
    const emptyTasks: Task[] = [];
    
    expect(filterTasksByDate(emptyTasks, '2025-07-21')).toEqual([]);
    expect(filterTasksByCompletion(emptyTasks, false)).toEqual([]);
    expect(sortTasksForToday(emptyTasks)).toEqual([]);
    expect(groupTasksByDate(emptyTasks)).toEqual({});
    
    const emptyStats = calculateTaskStatistics(emptyTasks, '2025-07-21');
    expect(emptyStats.totalTasks).toBe(0);
    expect(emptyStats.completedTasks).toBe(0);
    expect(emptyStats.totalEstimatedMinutes).toBe(0);
    expect(emptyStats.totalActualMinutes).toBe(0);
  });

  // 🔴 失敗するテスト：不正なデータの処理
  test('should handle invalid task data gracefully', () => {
    const invalidTasks = [
      { id: '1', title: 'Task without targetDate' }, // targetDate missing
      null, // null value
      { ...sampleTasks[0], targetDate: 'invalid-date' }, // invalid date
    ] as any[];
    
    expect(() => filterTasksByDate(invalidTasks, '2025-07-21')).not.toThrow();
    expect(() => calculateTaskStatistics(invalidTasks, '2025-07-21')).not.toThrow();
    expect(() => sortTasksForToday(invalidTasks)).not.toThrow();
  });
});
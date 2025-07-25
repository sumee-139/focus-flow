// Task型拡張のテスト - Phase 2.2a
// 🔴 Red Phase: 実装前に失敗するテストを作成

import { Task, TaskFilter, DateStatistics, TaskCreateInput } from './Task';

describe('Task型拡張 - Phase 2.2a', () => {
  // 🔴 失敗するテスト：新しい日付関連プロパティ
  test('Task should have targetDate property (YYYY-MM-DD)', () => {
    const task: Task = {
      id: '1',
      title: 'テストタスク',
      description: 'テスト用',
      estimatedMinutes: 60,
      order: 1,
      completed: false,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      targetDate: '2025-07-21', // 🆕 新規プロパティ
    };

    expect(task.targetDate).toBe('2025-07-21');
  });

  // 🔴 失敗するテスト：実際の作業時間
  test('Task should have actualMinutes property', () => {
    const task: Task = {
      id: '1',
      title: 'テストタスク',
      estimatedMinutes: 60,
      actualMinutes: 45, // 🆕 新規プロパティ
      targetDate: '2025-07-21',
      order: 1,
      completed: false,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(task.actualMinutes).toBe(45);
  });

  // 🔴 失敗するテスト：完了日時
  test('Task should have completedAt property', () => {
    const task: Task = {
      id: '1',
      title: '完了タスク',
      estimatedMinutes: 30,
      actualMinutes: 25,
      targetDate: '2025-07-21',
      order: 1,
      completed: true,
      completedAt: new Date('2025-07-21T10:30:00'), // 🆕 新規プロパティ
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(task.completedAt).toBeInstanceOf(Date);
    expect(task.completed).toBe(true);
  });
});

describe('TaskFilter型', () => {
  // 🔴 失敗するテスト：TaskFilter型定義
  test('TaskFilter should have required properties', () => {
    const filter: TaskFilter = {
      viewDate: '2025-07-21',
      mode: 'today',
      showCompleted: false,
      showArchived: false,
    };

    expect(filter.viewDate).toBe('2025-07-21');
    expect(filter.mode).toBe('today');
    expect(filter.showCompleted).toBe(false);
    expect(filter.showArchived).toBe(false);
  });

  // 🔴 失敗するテスト：mode値の種類
  test('TaskFilter mode should accept valid values', () => {
    const todayFilter: TaskFilter['mode'] = 'today';
    const dateFilter: TaskFilter['mode'] = 'date';
    const archiveFilter: TaskFilter['mode'] = 'archive';

    expect(todayFilter).toBe('today');
    expect(dateFilter).toBe('date');
    expect(archiveFilter).toBe('archive');
  });
});

describe('DateStatistics型', () => {
  // 🔴 失敗するテスト：DateStatistics型定義
  test('DateStatistics should calculate task statistics for a date', () => {
    const stats: DateStatistics = {
      date: '2025-07-21',
      totalTasks: 5,
      completedTasks: 2,
      totalEstimatedMinutes: 180,
      totalActualMinutes: 135,
    };

    expect(stats.date).toBe('2025-07-21');
    expect(stats.totalTasks).toBe(5);
    expect(stats.completedTasks).toBe(2);
    expect(stats.totalEstimatedMinutes).toBe(180);
    expect(stats.totalActualMinutes).toBe(135);
  });

  // 🔴 失敗するテスト：統計の計算結果
  test('DateStatistics should calculate completion rate', () => {
    const stats: DateStatistics = {
      date: '2025-07-21',
      totalTasks: 10,
      completedTasks: 7,
      totalEstimatedMinutes: 300,
      totalActualMinutes: 280,
    };

    const completionRate = stats.completedTasks / stats.totalTasks;
    const efficiency = stats.totalActualMinutes / stats.totalEstimatedMinutes;

    expect(completionRate).toBe(0.7); // 70%完了
    expect(efficiency).toBeCloseTo(0.93); // 93%効率
  });
});

describe('TaskCreateInput型', () => {
  // 🔴 失敗するテスト：タスク作成用の入力型
  test('TaskCreateInput should be a subset of Task for creation', () => {
    const input: TaskCreateInput = {
      title: '新しいタスク',
      description: 'タスクの説明',
      estimatedMinutes: 90,
      targetDate: '2025-07-22',
      tags: ['重要'],
      // id, createdAt, updatedAt, completed, order は含まない
    };

    expect(input.title).toBe('新しいタスク');
    expect(input.targetDate).toBe('2025-07-22');
    expect(input.estimatedMinutes).toBe(90);
  });
});

describe('既存データとの互換性', () => {
  // 🔴 失敗するテスト：既存Task形式との互換性
  test('should be compatible with existing Task format', () => {
    // 既存形式のタスク（targetDateなし）
    const oldTask = {
      id: '1',
      title: '既存タスク',
      description: '既存の説明',
      estimatedMinutes: 60,
      alarmTime: '09:00',
      order: 1,
      completed: false,
      tags: ['旧形式'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 新形式への変換処理をテスト
    const migratedTask: Task = {
      ...oldTask,
      targetDate: oldTask.createdAt.toISOString().split('T')[0], // YYYY-MM-DD形式に変換
      actualMinutes: undefined,
      completedAt: undefined,
    };

    expect(migratedTask.targetDate).toBe(oldTask.createdAt.toISOString().split('T')[0]);
    expect(migratedTask.actualMinutes).toBeUndefined();
    expect(migratedTask.completedAt).toBeUndefined();
  });
});
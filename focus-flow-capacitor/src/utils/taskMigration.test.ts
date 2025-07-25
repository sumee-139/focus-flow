// Task データマイグレーション機能のテスト - Phase 2.2a
// 🔴 Red Phase: 既存データ互換性のテスト

import { migrateTaskData, isTaskMigrationNeeded } from './taskMigration';
import { Task } from '../types/Task';

describe('Task データマイグレーション - Phase 2.2a', () => {
  // 🔴 失敗するテスト：旧形式のタスクデータ
  test('should detect old format task data without targetDate', () => {
    const oldTask = {
      id: '1',
      title: 'テストタスク',
      description: 'テスト用',
      estimatedMinutes: 60,
      alarmTime: '09:00',
      order: 1,
      completed: false,
      tags: ['test'],
      createdAt: new Date('2025-07-21T09:00:00'),
      updatedAt: new Date('2025-07-21T09:00:00'),
      // targetDate がない旧形式
    };

    const needsMigration = isTaskMigrationNeeded([oldTask as any]);
    expect(needsMigration).toBe(true);
  });

  // 🔴 失敗するテスト：新形式のタスクデータ
  test('should detect new format task data with targetDate', () => {
    const newTask: Task = {
      id: '1',
      title: 'テストタスク',
      description: 'テスト用',
      estimatedMinutes: 60,
      alarmTime: '09:00',
      order: 1,
      completed: false,
      tags: ['test'],
      createdAt: new Date('2025-07-21T09:00:00'),
      updatedAt: new Date('2025-07-21T09:00:00'),
      targetDate: '2025-07-21', // 新形式
    };

    const needsMigration = isTaskMigrationNeeded([newTask]);
    expect(needsMigration).toBe(false);
  });

  // 🔴 失敗するテスト：旧形式から新形式へのマイグレーション
  test('should migrate old format task to new format', () => {
    const oldTasks = [
      {
        id: '1',
        title: 'タスク1',
        description: 'タスク1の説明',
        estimatedMinutes: 60,
        alarmTime: '10:00',
        order: 1,
        completed: false,
        tags: ['work'],
        createdAt: new Date('2025-07-21T10:00:00'),
        updatedAt: new Date('2025-07-21T10:00:00'),
      },
      {
        id: '2',
        title: 'タスク2（完了済み）',
        estimatedMinutes: 30,
        order: 2,
        completed: true,
        tags: [],
        createdAt: new Date('2025-07-20T15:30:00'),
        updatedAt: new Date('2025-07-20T16:00:00'),
      },
    ];

    const migratedTasks = migrateTaskData(oldTasks as any[]);

    // タスク1のマイグレーション確認
    expect(migratedTasks[0].targetDate).toBe('2025-07-21');
    expect(migratedTasks[0].actualMinutes).toBeUndefined();
    expect(migratedTasks[0].completedAt).toBeUndefined();

    // タスク2のマイグレーション確認（完了済み）
    expect(migratedTasks[1].targetDate).toBe('2025-07-20');
    expect(migratedTasks[1].actualMinutes).toBeUndefined();
    expect(migratedTasks[1].completedAt).toEqual(migratedTasks[1].updatedAt); // 完了日時はupdatedAtを使用
  });

  // 🔴 失敗するテスト：混在データのマイグレーション
  test('should handle mixed old and new format data', () => {
    const mixedTasks = [
      // 旧形式
      {
        id: '1',
        title: '旧形式タスク',
        estimatedMinutes: 45,
        order: 1,
        completed: false,
        tags: [],
        createdAt: new Date('2025-07-19T09:00:00'),
        updatedAt: new Date('2025-07-19T09:00:00'),
      },
      // 新形式（既にマイグレーション済み）
      {
        id: '2',
        title: '新形式タスク',
        estimatedMinutes: 60,
        targetDate: '2025-07-21',
        order: 2,
        completed: true,
        completedAt: new Date('2025-07-21T11:00:00'),
        tags: [],
        createdAt: new Date('2025-07-21T10:00:00'),
        updatedAt: new Date('2025-07-21T10:30:00'),
      },
    ];

    const migratedTasks = migrateTaskData(mixedTasks as any[]);

    // 旧形式タスクがマイグレーションされる
    expect(migratedTasks[0].targetDate).toBe('2025-07-19');
    
    // 新形式タスクはそのまま保持
    expect(migratedTasks[1].targetDate).toBe('2025-07-21');
    expect(migratedTasks[1].completedAt).toEqual(new Date('2025-07-21T11:00:00'));
  });

  // 🔴 失敗するテスト：空配列のハンドリング
  test('should handle empty task array', () => {
    const emptyTasks: any[] = [];
    
    const needsMigration = isTaskMigrationNeeded(emptyTasks);
    const migratedTasks = migrateTaskData(emptyTasks);

    expect(needsMigration).toBe(false);
    expect(migratedTasks).toEqual([]);
  });

  // 🔴 失敗するテスト：不正なデータの処理
  test('should handle invalid task data gracefully', () => {
    const invalidTasks = [
      {
        id: '1',
        title: 'タスク', // 最小限の必須フィールドのみ
      },
      null, // null値
      {}, // 空オブジェクト
    ];

    // エラーを投げずに処理できることを確認
    expect(() => {
      isTaskMigrationNeeded(invalidTasks as any[]);
      migrateTaskData(invalidTasks as any[]);
    }).not.toThrow();
  });
});
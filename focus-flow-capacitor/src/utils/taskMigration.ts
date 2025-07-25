// Task データマイグレーション機能 - Phase 2.2a
// 既存データとの互換性を保つためのマイグレーション処理

import { Task } from '../types/Task';

/**
 * 旧形式のタスクデータ（targetDate なし）
 */
interface LegacyTask {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  alarmTime?: string;
  order: number;
  completed: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  // targetDate, actualMinutes, completedAt は存在しない
}

/**
 * タスクデータがマイグレーションを必要とするかチェック
 * @param tasks タスクの配列（任意の形式）
 * @returns マイグレーションが必要な場合 true
 */
export function isTaskMigrationNeeded(tasks: any[]): boolean {
  if (!tasks || tasks.length === 0) {
    return false;
  }

  // 最初のタスクに targetDate がない場合はマイグレーションが必要
  const firstTask = tasks.find(task => task && typeof task === 'object');
  if (!firstTask) {
    return false;
  }

  return !('targetDate' in firstTask);
}

/**
 * 旧形式のタスクデータを新形式に変換
 * @param tasks 旧形式のタスクデータ配列
 * @returns 新形式のタスクデータ配列
 */
export function migrateTaskData(tasks: (LegacyTask | Task | any)[]): Task[] {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }

  return tasks
    .filter((task): task is LegacyTask | Task => 
      task && typeof task === 'object' && task.id && task.title
    )
    .map((task): Task => {
      // 既に新形式の場合はそのまま返す
      if ('targetDate' in task) {
        return task as Task;
      }

      // 旧形式から新形式への変換
      const legacyTask = task as LegacyTask;
      
      // createdAt から targetDate を生成 (YYYY-MM-DD形式)
      const targetDate = legacyTask.createdAt instanceof Date 
        ? legacyTask.createdAt.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]; // フォールバック

      // 完了済みタスクの場合、updatedAt を completedAt として使用
      const completedAt = legacyTask.completed && legacyTask.updatedAt instanceof Date
        ? legacyTask.updatedAt
        : undefined;

      return {
        ...legacyTask,
        targetDate,
        actualMinutes: undefined, // 実績時間はデフォルトで未設定
        completedAt,
      };
    });
}

/**
 * LocalStorage からタスクデータを取得し、必要に応じてマイグレーションを実行
 * @param storageKey LocalStorage のキー
 * @returns マイグレーション済みのタスクデータ
 */
export function loadAndMigrateTaskData(storageKey: string): Task[] {
  try {
    const rawData = localStorage.getItem(storageKey);
    if (!rawData) {
      return [];
    }

    const parsedData = JSON.parse(rawData, (_key, value) => {
      // Date文字列を Date オブジェクトに復元
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return new Date(value);
      }
      return value;
    });

    // 配列でない場合は空配列を返す
    if (!Array.isArray(parsedData)) {
      return [];
    }

    // マイグレーションが必要かチェックして実行
    if (isTaskMigrationNeeded(parsedData)) {
      const migratedTasks = migrateTaskData(parsedData);
      
      // マイグレーション後のデータを保存
      localStorage.setItem(storageKey, JSON.stringify(migratedTasks));
      
      return migratedTasks;
    }

    return parsedData as Task[];
  } catch (error) {
    console.error('Failed to load and migrate task data:', error);
    return [];
  }
}

/**
 * マイグレーション処理のログ出力
 * @param oldCount マイグレーション前のタスク数
 * @param newCount マイグレーション後のタスク数
 */
export function logMigrationResult(oldCount: number, newCount: number): void {
  if (oldCount !== newCount) {
    console.warn(`Task migration completed: ${oldCount} → ${newCount} tasks`);
  } else {
    console.log(`Task migration completed: ${newCount} tasks processed`);
  }
}
// Task Filtering Operations - Phase 2.2a
// Today-First UXを支援するタスクフィルタリング機能

import { Task, TaskFilter, DateStatistics } from '../types/Task';
import { jstTime } from './jstTime';

/**
 * 日付によるタスクフィルタリング
 * @param tasks タスク配列
 * @param targetDate 対象日 (YYYY-MM-DD)
 * @returns フィルタリング済みタスク配列
 */
export function filterTasksByDate(tasks: Task[], targetDate: string): Task[] {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }

  return tasks.filter((task) => {
    if (!task || typeof task !== 'object' || !task.targetDate) {
      return false;
    }
    return task.targetDate === targetDate;
  });
}

/**
 * 完了状態によるタスクフィルタリング
 * @param tasks タスク配列
 * @param showCompleted 完了済みを表示するか（true: 完了済みのみ, false: 未完了のみ, 'all': すべて）
 * @returns フィルタリング済みタスク配列
 */
export function filterTasksByCompletion(
  tasks: Task[], 
  showCompleted: boolean | 'all'
): Task[] {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }

  if (showCompleted === 'all') {
    return tasks.filter(task => task && typeof task === 'object');
  }

  return tasks.filter((task) => {
    if (!task || typeof task !== 'object') {
      return false;
    }
    return task.completed === showCompleted;
  });
}

/**
 * 日付別タスク統計計算
 * @param tasks タスク配列
 * @param targetDate 対象日 (YYYY-MM-DD)
 * @returns 統計情報
 */
export function calculateTaskStatistics(tasks: Task[], targetDate: string): DateStatistics {
  const filteredTasks = filterTasksByDate(tasks, targetDate);
  
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => task.completed).length;
  
  const totalEstimatedMinutes = filteredTasks.reduce((sum, task) => {
    return sum + (task.estimatedMinutes || 0);
  }, 0);
  
  const totalActualMinutes = filteredTasks.reduce((sum, task) => {
    return sum + (task.actualMinutes || 0);
  }, 0);

  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    date: targetDate,
    totalTasks,
    completedTasks,
    totalEstimatedMinutes,
    totalActualMinutes,
    completionPercentage,
  };
}

/**
 * Today-First UXに最適化されたタスクソート
 * @param tasks タスク配列
 * @returns ソート済みタスク配列
 */
export function sortTasksForToday(tasks: Task[]): Task[] {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }

  return [...tasks]
    .filter(task => task && typeof task === 'object')
    .sort((a, b) => {
      // 1. 未完了を完了済みより前に
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // 2. 見積もり時間の短い順（集中しやすい短いタスクを先に）
      const aEstimated = a.estimatedMinutes || 0;
      const bEstimated = b.estimatedMinutes || 0;
      if (aEstimated !== bEstimated) {
        return aEstimated - bEstimated;
      }
      
      // 3. 作成順（order フィールドまたは作成時刻）
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      
      // 4. 作成時刻順
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
}

/**
 * タスクフィルタを作成
 * @param overrides カスタム設定（オプション）
 * @returns タスクフィルタ
 */
export function createTaskFilter(overrides?: Partial<TaskFilter>): TaskFilter {
  // 🟢 T006: JST基準タイムゾーン対応 - UTC/JST時差問題解決
  const today = jstTime.getCurrentDate();
  
  return {
    viewDate: today,
    mode: 'today',
    showCompleted: false, // 🔥 FIX: UX改善 - デフォルトで完了タスク非表示（未完了タスクに集中）
    showArchived: false,
    ...overrides,
  };
}

// getLocalDateString function removed - replaced with jstTime.getCurrentDate() for T006 JST fix

/**
 * 日付別タスクグループ化
 * @param tasks タスク配列
 * @returns 日付をキーとするタスクグループ
 */
export function groupTasksByDate(tasks: Task[]): Record<string, Task[]> {
  if (!tasks || !Array.isArray(tasks)) {
    return {};
  }

  const grouped: Record<string, Task[]> = {};
  
  tasks
    .filter(task => task && typeof task === 'object' && task.targetDate)
    .forEach(task => {
      const date = task.targetDate;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(task);
    });
  
  // 各日付のタスクをソート
  Object.keys(grouped).forEach(date => {
    grouped[date] = sortTasksForToday(grouped[date]);
  });
  
  return grouped;
}

/**
 * 複数フィルタの組み合わせ適用
 * @param tasks タスク配列
 * @param filter フィルタ設定
 * @returns フィルタリング済みタスク配列
 */
export function applyTaskFilters(tasks: Task[], filter: TaskFilter): Task[] {
  let filteredTasks = tasks;
  
  // 日付フィルタ
  if (filter.mode === 'today' || filter.mode === 'date') {
    filteredTasks = filterTasksByDate(filteredTasks, filter.viewDate);
  }
  
  // 完了状態フィルタ
  if (!filter.showCompleted) {
    filteredTasks = filterTasksByCompletion(filteredTasks, false);
  } else {
    filteredTasks = filterTasksByCompletion(filteredTasks, 'all');
  }
  
  // TODO: アーカイブフィルタ（将来実装）
  // if (!filter.showArchived) {
  //   filteredTasks = filterTasksByArchived(filteredTasks, false);
  // }
  
  // Today-First ソート
  filteredTasks = sortTasksForToday(filteredTasks);
  
  return filteredTasks;
}

/**
 * フィルタリング結果のサマリー取得
 * @param originalTasks 元のタスク配列
 * @param filteredTasks フィルタリング済みタスク配列
 * @param filter 適用されたフィルタ
 * @returns フィルタリングサマリー
 */
export function getFilteringSummary(
  originalTasks: Task[], 
  filteredTasks: Task[], 
  filter: TaskFilter
): {
  totalTasks: number;
  filteredTasks: number;
  hiddenTasks: number;
  statistics: DateStatistics;
} {
  const statistics = calculateTaskStatistics(originalTasks, filter.viewDate);
  
  return {
    totalTasks: originalTasks.length,
    filteredTasks: filteredTasks.length,
    hiddenTasks: originalTasks.length - filteredTasks.length,
    statistics,
  };
}
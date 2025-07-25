// useTaskFilter カスタムフック - Phase 2.2a
// Today-First UXのためのタスクフィルタリングフック

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, TaskFilter, DateStatistics } from '../types/Task';
import { 
  applyTaskFilters, 
  calculateTaskStatistics, 
  createTaskFilter 
} from '../utils/taskFiltering';
import { createDateNavigation } from '../utils/taskDate';

/**
 * useTaskFilter フック戻り値の型
 */
export interface UseTaskFilterResult {
  filter: TaskFilter;
  filteredTasks: Task[];
  statistics: DateStatistics;
  updateFilter: (updates: Partial<TaskFilter>) => void;
  resetToToday: () => void;
}

/**
 * LocalStorage キー
 */
const STORAGE_KEY = 'focus-flow-task-filter';

/**
 * LocalStorage からフィルタ設定を読み込み
 */
function loadFilterFromStorage(): TaskFilter | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const parsed = JSON.parse(saved) as TaskFilter;
    
    // 基本的な検証
    if (typeof parsed !== 'object' || !parsed.viewDate || !parsed.mode) {
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.warn('Failed to load filter from localStorage:', error);
    return null;
  }
}

/**
 * LocalStorage にフィルタ設定を保存
 */
function saveFilterToStorage(filter: TaskFilter): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filter));
  } catch (error) {
    console.warn('Failed to save filter to localStorage:', error);
  }
}

/**
 * ローカル時刻での今日の日付を取得（YYYY-MM-DD形式）
 */
function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Today-First UXのためのタスクフィルタリングフック
 * @param tasks タスク配列
 * @returns フィルタリング結果とフィルタ操作
 */
export function useTaskFilter(tasks: Task[]): UseTaskFilterResult {
  // フィルタ状態の初期化: シンプルに常に今日から開始
  const [filter, setFilter] = useState<TaskFilter>(() => {
    // LocalStorageからshowCompleted等の設定のみ復元、日付は常に今日
    const savedFilter = loadFilterFromStorage();
    const todayFilter = createTaskFilter(); // 常に今日の日付
    
    if (savedFilter) {
      // 日付以外の設定（showCompleted等）のみ復元
      return {
        ...todayFilter, // 今日の日付・今日モード
        showCompleted: savedFilter.showCompleted,
        showArchived: savedFilter.showArchived,
      };
    }
    
    return todayFilter;
  });

  // フィルタ更新関数
  const updateFilter = useCallback((updates: Partial<TaskFilter>) => {
    setFilter(prevFilter => {
      const newFilter = { ...prevFilter, ...updates };
      saveFilterToStorage(newFilter);
      return newFilter;
    });
  }, []);

  // 今日に戻る関数
  const resetToToday = useCallback(() => {
    const todayFilter = createTaskFilter();
    setFilter(todayFilter);
    saveFilterToStorage(todayFilter);
  }, []);

  // フィルタリング済みタスク（メモ化）
  const filteredTasks = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) {
      return [];
    }

    try {
      return applyTaskFilters(tasks, filter);
    } catch (error) {
      console.warn('Failed to apply task filters:', error);
      return [];
    }
  }, [tasks, filter]);

  // 統計情報（メモ化）
  const statistics = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) {
      return {
        date: filter.viewDate,
        totalTasks: 0,
        completedTasks: 0,
        totalEstimatedMinutes: 0,
        totalActualMinutes: 0,
        completionPercentage: 0,
      };
    }

    try {
      return calculateTaskStatistics(tasks, filter.viewDate);
    } catch (error) {
      console.warn('Failed to calculate task statistics:', error);
      return {
        date: filter.viewDate,
        totalTasks: 0,
        completedTasks: 0,
        totalEstimatedMinutes: 0,
        totalActualMinutes: 0,
        completionPercentage: 0,
      };
    }
  }, [tasks, filter.viewDate]);

  // タスクが変更された時に統計を再計算（副作用として）
  useEffect(() => {
    // 統計情報は useMemo で自動的に再計算されるので、
    // ここでは特別な処理は不要
  }, [tasks]);

  return {
    filter,
    filteredTasks,
    statistics,
    updateFilter,
    resetToToday,
  };
}

/**
 * Today-First UX用のクイックフィルタフック
 * よく使うフィルタパターンを簡単に適用できる
 */
export function useQuickTaskFilters(tasks: Task[]) {
  const taskFilter = useTaskFilter(tasks);
  const navigation = useMemo(() => createDateNavigation(), []);

  const quickFilters = useMemo(() => ({
    // 今日の未完了タスクのみ
    showTodayIncomplete: () => {
      taskFilter.updateFilter({
        viewDate: navigation.getToday(),
        mode: 'today',
        showCompleted: false,
      });
    },

    // 今日のすべてのタスク
    showTodayAll: () => {
      taskFilter.updateFilter({
        viewDate: navigation.getToday(),
        mode: 'today',
        showCompleted: true,
      });
    },

    // 明日のタスク
    showTomorrow: () => {
      taskFilter.updateFilter({
        viewDate: navigation.getTomorrow(),
        mode: 'date',
        showCompleted: false,
      });
    },

    // 昨日の未完了タスク（やり残し）
    showYesterdayIncomplete: () => {
      taskFilter.updateFilter({
        viewDate: navigation.getYesterday(),
        mode: 'date',
        showCompleted: false,
      });
    },

    // 特定の日付
    showSpecificDate: (date: string) => {
      taskFilter.updateFilter({
        viewDate: date,
        mode: 'date',
        showCompleted: false,
      });
    },
  }), [taskFilter, navigation]);

  return {
    ...taskFilter,
    quickFilters,
  };
}

/**
 * タスクフィルタリングの状態管理フック
 * より詳細な制御が必要な場合に使用
 */
export function useAdvancedTaskFilter(tasks: Task[]) {
  const basicFilter = useTaskFilter(tasks);
  
  // フィルタリングの詳細統計
  const detailedStats = useMemo(() => {
    const total = tasks.length;
    const filtered = basicFilter.filteredTasks.length;
    const hidden = total - filtered;
    
    const incompleteTasks = basicFilter.filteredTasks.filter(task => !task.completed);
    const overdueTasks = tasks.filter(task => {
      const today = new Date().toISOString().split('T')[0];
      return task.targetDate < today && !task.completed;
    });
    
    return {
      ...basicFilter.statistics,
      totalInDatabase: total,
      filteredCount: filtered,
      hiddenCount: hidden,
      incompleteCount: incompleteTasks.length,
      overdueCount: overdueTasks.length,
      filterEfficiency: total > 0 ? (filtered / total) * 100 : 0, // フィルタ効率（%）
    };
  }, [tasks, basicFilter.filteredTasks, basicFilter.statistics]);

  // フィルタ履歴の管理
  const [filterHistory, setFilterHistory] = useState<TaskFilter[]>([]);
  
  const updateFilterWithHistory = useCallback((updates: Partial<TaskFilter>) => {
    setFilterHistory(prev => [...prev.slice(-9), basicFilter.filter]); // 最大10件の履歴
    basicFilter.updateFilter(updates);
  }, [basicFilter]);

  const goBackInHistory = useCallback(() => {
    if (filterHistory.length > 0) {
      const previousFilter = filterHistory[filterHistory.length - 1];
      setFilterHistory(prev => prev.slice(0, -1));
      basicFilter.updateFilter(previousFilter);
    }
  }, [filterHistory, basicFilter]);

  return {
    ...basicFilter,
    updateFilter: updateFilterWithHistory,
    detailedStats,
    filterHistory,
    goBackInHistory,
    canGoBack: filterHistory.length > 0,
  };
}
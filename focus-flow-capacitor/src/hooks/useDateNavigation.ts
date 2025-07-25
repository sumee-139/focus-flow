// useDateNavigation カスタムフック - Phase 2.2a
// Today-First UXのための日付ナビゲーションフック

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  formatTaskDate, 
  calculateDateDifference, 
  createDateNavigation, 
  getTaskWeekStart,
  parseTaskDate
} from '../utils/taskDate';
import { jstTime } from '../utils/jstTime';

/**
 * 日付ナビゲーションフックのオプション
 */
export interface UseDateNavigationOptions {
  onChange?: (date: string) => void;
  persist?: boolean;
  initialDate?: string;
}

/**
 * 日付表示テキスト
 */
export interface DateDisplayText {
  short: string;      // "7/21(月)"
  long: string;       // "2025年7月21日(月)" 
  relative: string;   // "今日", "明日", "3日後"
}

/**
 * useDateNavigation フック戻り値の型
 */
export interface UseDateNavigationResult {
  currentDate: string;
  displayText: DateDisplayText;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isWeekStart: boolean;
  isMonthStart: boolean;
  weekStart: string;
  monthStart: string;
  canGoBack: boolean;
  canGoForward: boolean;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
  goToDate: (date: string) => void;
  moveByDays: (days: number) => void;
  prioritizeForTodayFirst: (dates: string[]) => string[];
}

/**
 * LocalStorage キー
 */
const STORAGE_KEY = 'focus-flow-current-date';

/**
 * LocalStorage から日付を読み込み
 */
function loadDateFromStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to load date from localStorage:', error);
    return null;
  }
}

/**
 * LocalStorage に日付を保存
 */
function saveDateToStorage(date: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, date);
  } catch (error) {
    console.warn('Failed to save date to localStorage:', error);
  }
}

/**
 * 今日の日付を取得（JST基準）
 * T006: UTC/JST時差問題解決のためjstTimeモジュールを使用
 */
function getTodayDate(): string {
  return jstTime.getCurrentDate();
}

/**
 * Today-First UXのための日付ナビゲーションフック
 * @param options オプション設定
 * @returns 日付ナビゲーション機能
 */
export function useDateNavigation(options: UseDateNavigationOptions = {}): UseDateNavigationResult {
  const { onChange, persist = false, initialDate } = options;
  
  // 現在の日付状態を初期化
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const actualToday = getTodayDate();
    if (initialDate) {
      const parsed = parseTaskDate(initialDate);
      if (parsed.isValid) {
        return parsed.date!;
      }
    }
    
    if (persist) {
      const saved = loadDateFromStorage();
      if (saved) {
        const parsed = parseTaskDate(saved);
        if (parsed.isValid) {
          return parsed.date!;
        }
      }
    }
    
    return actualToday;
  });

  // 基本的な日付ナビゲーション機能を取得
  const navigation = useMemo(() => createDateNavigation(), []);

  // 日付更新関数
  const updateDate = useCallback((newDate: string) => {
    const parsed = parseTaskDate(newDate);
    if (!parsed.isValid) {
      console.warn('Invalid date provided:', newDate);
      return;
    }

    setCurrentDate(parsed.date!);
    
    // LocalStorageに保存
    if (persist) {
      saveDateToStorage(parsed.date!);
    }
    
    // コールバック実行
    if (onChange) {
      onChange(parsed.date!);
    }
  }, [persist, onChange]);

  // 日付の状態情報（メモ化）
  const dateInfo = useMemo(() => {
    const today = getTodayDate();
    const isToday = jstTime.isToday(currentDate);
    const isPast = currentDate < today;
    const isFuture = currentDate > today;
    
    const weekStart = getTaskWeekStart(currentDate);
    const monthStart = currentDate.substring(0, 8) + '01'; // YYYY-MM-01
    
    const isWeekStart = currentDate === weekStart;
    const isMonthStart = currentDate.endsWith('-01');
    
    return {
      isToday,
      isPast,
      isFuture,
      weekStart,
      monthStart,
      isWeekStart,
      isMonthStart,
    };
  }, [currentDate]);

  // 表示テキスト（メモ化）
  const displayText = useMemo((): DateDisplayText => {
    return {
      short: formatTaskDate(currentDate, { format: 'short' }),
      long: formatTaskDate(currentDate, { format: 'long' }),
      relative: formatTaskDate(currentDate, { format: 'relative' }),
    };
  }, [currentDate]);

  // ナビゲーション関数
  const goToPreviousDay = useCallback(() => {
    const previousDay = calculateDateDifference(currentDate, -1);
    updateDate(previousDay);
  }, [currentDate, updateDate]);

  const goToNextDay = useCallback(() => {
    const nextDay = calculateDateDifference(currentDate, 1);
    updateDate(nextDay);
  }, [currentDate, updateDate]);

  const goToToday = useCallback(() => {
    const today = getTodayDate();
    updateDate(today);
  }, [updateDate]);

  const goToDate = useCallback((date: string) => {
    updateDate(date);
  }, [updateDate]);

  const moveByDays = useCallback((days: number) => {
    const targetDate = calculateDateDifference(currentDate, days);
    updateDate(targetDate);
  }, [currentDate, updateDate]);

  // Today-First優先度ソート
  const prioritizeForTodayFirst = useCallback((dates: string[]): string[] => {
    return navigation.prioritizeForTodayFirst(dates);
  }, [navigation]);

  return {
    currentDate,
    displayText,
    ...dateInfo,
    canGoBack: true, // 制限なし（過去への移動は常に可能）
    canGoForward: true, // 制限なし（未来への移動は常に可能）
    goToPreviousDay,
    goToNextDay,
    goToToday,
    goToDate,
    moveByDays,
    prioritizeForTodayFirst,
  };
}

/**
 * 日付ナビゲーション履歴管理フック
 * 最近訪れた日付の履歴を管理
 */
export function useDateNavigationWithHistory(options: UseDateNavigationOptions = {}) {
  const basicNavigation = useDateNavigation(options);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 日付が変更された時に履歴を更新
  useEffect(() => {
    const currentDate = basicNavigation.currentDate;
    
    setHistory(prevHistory => {
      // 同じ日付が既に履歴にある場合は移動しない
      if (prevHistory[prevHistory.length - 1] === currentDate) {
        return prevHistory;
      }
      
      // 履歴に追加（最大10件）
      const newHistory = [...prevHistory.slice(-9), currentDate];
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [basicNavigation.currentDate]);

  // 履歴内の移動
  const goBackInHistory = useCallback(() => {
    if (historyIndex > 0) {
      const previousDate = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      basicNavigation.goToDate(previousDate);
    }
  }, [history, historyIndex, basicNavigation]);

  const goForwardInHistory = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextDate = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      basicNavigation.goToDate(nextDate);
    }
  }, [history, historyIndex, basicNavigation]);

  return {
    ...basicNavigation,
    history,
    historyIndex,
    canGoBackInHistory: historyIndex > 0,
    canGoForwardInHistory: historyIndex < history.length - 1,
    goBackInHistory,
    goForwardInHistory,
  };
}

/**
 * 複数の日付ナビゲーションを同期するフック
 */
export function useSyncedDateNavigation(syncKey: string, options: UseDateNavigationOptions = {}) {
  const navigation = useDateNavigation(options);

  // 他のコンポーネントとの同期（実装は簡略化）
  useEffect(() => {
    // 実際のプロジェクトでは、イベントエミッターやContextを使用
    // ここでは基本機能のみ提供
  }, [navigation.currentDate, syncKey]);

  return navigation;
}
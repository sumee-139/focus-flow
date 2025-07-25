// Task Date Operations - Phase 2.2a
// Today-First UXを支援するタスク日付操作機能

/**
 * タスク日付フォーマット設定
 */
interface TaskDateFormatOptions {
  format: 'short' | 'long' | 'relative';
}

/**
 * 日付パース結果
 */
interface TaskDateParseResult {
  isValid: boolean;
  date: string | null;
  fallbackToToday: boolean;
}

/**
 * 日付ナビゲーション機能
 */
interface TaskDateNavigation {
  getToday: () => string;
  getTomorrow: () => string;
  getYesterday: () => string;
  navigateToDate: (date: string) => string;
  isToday: (date: string) => boolean;
  isPast: (date: string) => boolean;
  isFuture: (date: string) => boolean;
  prioritizeForTodayFirst: (dates: string[]) => string[];
}

/**
 * タスク日付をユーザー表示用にフォーマット
 * @param taskDate YYYY-MM-DD形式のタスク日付
 * @param options フォーマット設定
 * @returns フォーマット済み日付文字列
 */
export function formatTaskDate(taskDate: string, options: TaskDateFormatOptions): string {
  try {
    const date = new Date(taskDate);
    if (isNaN(date.getTime())) {
      return taskDate; // 不正な日付の場合はそのまま返す
    }

    // 🔵 Blue Phase: タイムゾーン問題修正 - 日付文字列比較を使用
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    let diffDays = 0;
    if (taskDate > todayString) {
      // 未来の日付
      const targetDate = new Date(taskDate);
      const todayDate = new Date(todayString);
      diffDays = Math.round((targetDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    } else if (taskDate < todayString) {
      // 過去の日付
      const targetDate = new Date(taskDate);
      const todayDate = new Date(todayString);
      diffDays = Math.round((targetDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      // 今日
      diffDays = 0;
    }

    switch (options.format) {
      case 'short':
        return formatShort(date);
      case 'long':
        return formatLong(date);
      case 'relative':
        return formatRelative(diffDays);
      default:
        return taskDate;
    }
  } catch (_error) {
    console.warn('Failed to format task date:', _error);
    return taskDate;
  }
}

/**
 * タスク日付が今日かどうか判定
 * @param taskDate YYYY-MM-DD形式のタスク日付
 * @returns 今日の場合 true
 */
export function isTaskDateToday(taskDate: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return taskDate === today;
}

/**
 * 日付の差分を計算（タスク計画用）
 * @param baseDate YYYY-MM-DD形式の基準日
 * @param dayDifference 日数差（負数で過去、正数で未来）
 * @returns 計算後の日付 (YYYY-MM-DD)
 */
export function calculateDateDifference(baseDate: string, dayDifference: number): string {
  try {
    const date = new Date(baseDate);
    if (isNaN(date.getTime())) {
      return baseDate; // 不正な日付の場合はそのまま返す
    }

    date.setDate(date.getDate() + dayDifference);
    return date.toISOString().split('T')[0];
  } catch (_error) {
    console.warn('Failed to calculate date difference:', _error);
    return baseDate;
  }
}

/**
 * タスク用日付ナビゲーション機能を作成
 * @returns 日付ナビゲーション機能
 */
export function createDateNavigation(): TaskDateNavigation {
  return {
    getToday: (): string => {
      return new Date().toISOString().split('T')[0];
    },

    getTomorrow: (): string => {
      const today = new Date().toISOString().split('T')[0];
      return calculateDateDifference(today, 1);
    },

    getYesterday: (): string => {
      const today = new Date().toISOString().split('T')[0];
      return calculateDateDifference(today, -1);
    },

    navigateToDate: (date: string): string => {
      const parsed = parseTaskDate(date);
      return parsed.isValid ? parsed.date! : new Date().toISOString().split('T')[0];
    },

    isToday: (date: string): boolean => {
      return isTaskDateToday(date);
    },

    isPast: (date: string): boolean => {
      const today = new Date().toISOString().split('T')[0];
      return date < today;
    },

    isFuture: (date: string): boolean => {
      const today = new Date().toISOString().split('T')[0];
      return date > today;
    },

    prioritizeForTodayFirst: (dates: string[]): string[] => {
      const today = new Date().toISOString().split('T')[0];
      
      return [...dates].sort((a, b) => {
        // 今日を最優先
        if (a === today) return -1;
        if (b === today) return 1;
        
        // 未来日は近い順
        if (a > today && b > today) return a.localeCompare(b);
        
        // 過去日は新しい順（遠い順）
        if (a < today && b < today) return b.localeCompare(a);
        
        // 未来日 > 過去日
        if (a > today && b < today) return -1;
        if (a < today && b > today) return 1;
        
        return 0;
      });
    }
  };
}

/**
 * タスク期間の日付範囲を生成
 * @param startDate 開始日 (YYYY-MM-DD)
 * @param endDate 終了日 (YYYY-MM-DD)
 * @returns 日付範囲の配列
 */
export function createTaskDateRange(startDate: string, endDate: string): string[] {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return [];
    }
    
    const dates: string[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  } catch (_error) {
    console.warn('Failed to create task date range:', _error);
    return [];
  }
}

/**
 * 週次タスク計画のための週開始日取得
 * @param taskDate タスク日付 (YYYY-MM-DD)
 * @returns 週の開始日（月曜日） (YYYY-MM-DD)
 */
export function getTaskWeekStart(taskDate: string): string {
  try {
    const date = new Date(taskDate);
    if (isNaN(date.getTime())) {
      return taskDate;
    }
    
    // 月曜日を週の開始とする (0=日曜, 1=月曜)
    const dayOfWeek = date.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
    
    return calculateDateDifference(taskDate, daysToMonday);
  } catch (_error) {
    console.warn('Failed to get task week start:', _error);
    return taskDate;
  }
}

/**
 * 安全なタスク日付パース
 * @param dateString 日付文字列
 * @returns パース結果
 */
export function parseTaskDate(dateString: string): TaskDateParseResult {
  if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
    return {
      isValid: false,
      date: null,
      fallbackToToday: true
    };
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        date: null,
        fallbackToToday: true
      };
    }
    
    // YYYY-MM-DD形式で正規化
    const normalizedDate = date.toISOString().split('T')[0];
    
    return {
      isValid: true,
      date: normalizedDate,
      fallbackToToday: false
    };
  } catch (_error) {
    return {
      isValid: false,
      date: null,
      fallbackToToday: true
    };
  }
}

/**
 * 短縮フォーマット (M/D(曜))
 */
function formatShort(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = getDayOfWeekJapanese(date.getDay());
  
  return `${month}/${day}(${dayOfWeek})`;
}

/**
 * 長いフォーマット (YYYY年M月D日(曜))
 */
function formatLong(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = getDayOfWeekJapanese(date.getDay());
  
  return `${year}年${month}月${day}日(${dayOfWeek})`;
}

/**
 * 相対フォーマット (今日, 明日, 昨日, N日後/前)
 */
function formatRelative(diffDays: number): string {
  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '明日';
  if (diffDays === -1) return '昨日';
  if (diffDays > 1) return `${diffDays}日後`;
  return `${Math.abs(diffDays)}日前`;
}

/**
 * 日本語曜日取得
 */
function getDayOfWeekJapanese(dayOfWeek: number): string {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return days[dayOfWeek];
}
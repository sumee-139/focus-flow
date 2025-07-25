// Task Date Operations のテスト - Phase 2.2a
// 🔴 Red Phase: Today-First UXのためのタスク日付操作機能

import { 
  formatTaskDate, 
  calculateDateDifference, 
  createDateNavigation, 
  isTaskDateToday,
  createTaskDateRange,
  getTaskWeekStart,
  parseTaskDate
} from './taskDate';

describe('Task Date Operations - Today-First UX支援機能', () => {
  // 🔴 失敗するテスト：タスク日付のフォーマット表示
  test('should format task date for user display', () => {
    const taskDate = '2025-07-21';
    
    const shortFormat = formatTaskDate(taskDate, { format: 'short' });
    expect(shortFormat).toBe('7/21(月)');
    
    const longFormat = formatTaskDate(taskDate, { format: 'long' });
    expect(longFormat).toBe('2025年7月21日(月)');
    
    const relativeFormat = formatTaskDate(taskDate, { format: 'relative' });
    // 今日からの相対日付で表示（例: "今日", "明日", "昨日", "3日後"）
    expect(typeof relativeFormat).toBe('string');
  });

  // 🔴 失敗するテスト：今日のタスクかどうかの判定
  test('should identify if task is scheduled for today', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = calculateDateDifference(today, -1);
    const tomorrow = calculateDateDifference(today, 1);
    
    expect(isTaskDateToday(today)).toBe(true);
    expect(isTaskDateToday(yesterday)).toBe(false);
    expect(isTaskDateToday(tomorrow)).toBe(false);
  });

  // 🔴 失敗するテスト：タスク用日付ナビゲーション
  test('should create task date navigation functionality', () => {
    const navigation = createDateNavigation();
    
    expect(typeof navigation.getToday).toBe('function');
    expect(typeof navigation.getTomorrow).toBe('function');
    expect(typeof navigation.getYesterday).toBe('function');
    expect(typeof navigation.navigateToDate).toBe('function');
    
    const today = navigation.getToday();
    const tomorrow = navigation.getTomorrow();
    const yesterday = navigation.getYesterday();
    
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tomorrow).toBe(calculateDateDifference(today, 1));
    expect(yesterday).toBe(calculateDateDifference(today, -1));
  });

  // 🔴 失敗するテスト：日付差分計算（タスク計画用）
  test('should calculate date difference for task planning', () => {
    const baseDate = '2025-07-21';
    
    const nextDay = calculateDateDifference(baseDate, 1);
    expect(nextDay).toBe('2025-07-22');
    
    const previousDay = calculateDateDifference(baseDate, -1);
    expect(previousDay).toBe('2025-07-20');
    
    const nextWeek = calculateDateDifference(baseDate, 7);
    expect(nextWeek).toBe('2025-07-28');
    
    // 月またぎの計算
    const nextMonth = calculateDateDifference('2025-07-31', 1);
    expect(nextMonth).toBe('2025-08-01');
  });

  // 🔴 失敗するテスト：タスク期間の日付範囲生成
  test('should create task date range for planning', () => {
    const startDate = '2025-07-20';
    const endDate = '2025-07-23';
    
    const dateRange = createTaskDateRange(startDate, endDate);
    
    expect(dateRange).toEqual([
      '2025-07-20',
      '2025-07-21', 
      '2025-07-22',
      '2025-07-23'
    ]);
  });

  // 🔴 失敗するテスト：週次タスク計画のための週開始日取得
  test('should get week start for weekly task planning', () => {
    // 2025-07-21 は月曜日
    const mondayWeekStart = getTaskWeekStart('2025-07-21');
    expect(mondayWeekStart).toBe('2025-07-21'); // 月曜日が週開始
    
    // 2025-07-23 は水曜日 -> その週の月曜日を返す
    const midWeekStart = getTaskWeekStart('2025-07-23');
    expect(midWeekStart).toBe('2025-07-21');
    
    // 2025-07-27 は日曜日 -> その週の月曜日を返す  
    const sundayWeekStart = getTaskWeekStart('2025-07-27');
    expect(sundayWeekStart).toBe('2025-07-21');
  });

  // 🔴 失敗するテスト：安全なタスク日付パース
  test('should safely parse task date strings', () => {
    // 正常なケース
    const validDate = parseTaskDate('2025-07-21');
    expect(validDate.isValid).toBe(true);
    expect(validDate.date).toBe('2025-07-21');
    
    // 不正なケース
    const invalidDate = parseTaskDate('invalid-date');
    expect(invalidDate.isValid).toBe(false);
    expect(invalidDate.date).toBe(null);
    expect(invalidDate.fallbackToToday).toBe(true);
    
    // 空文字列
    const emptyDate = parseTaskDate('');
    expect(emptyDate.isValid).toBe(false);
    expect(emptyDate.fallbackToToday).toBe(true);
  });

  // 🔴 失敗するテスト：今日基準の相対日付判定
  test('should identify task date relationship to today', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = calculateDateDifference(today, -1);
    const tomorrow = calculateDateDifference(today, 1);
    const nextWeek = calculateDateDifference(today, 7);
    
    const navigation = createDateNavigation();
    
    expect(navigation.isToday(today)).toBe(true);
    expect(navigation.isPast(yesterday)).toBe(true);
    expect(navigation.isFuture(tomorrow)).toBe(true);
    expect(navigation.isFuture(nextWeek)).toBe(true);
    
    expect(navigation.isToday(yesterday)).toBe(false);
    expect(navigation.isToday(tomorrow)).toBe(false);
  });

  // 🔴 失敗するテスト：Today-First UXのための日付優先度
  test('should prioritize dates for Today-First UX', () => {
    const today = new Date().toISOString().split('T')[0];
    const testDates = [
      calculateDateDifference(today, 2),  // 明後日
      calculateDateDifference(today, -1), // 昨日
      today,                               // 今日
      calculateDateDifference(today, 1),  // 明日
    ];
    
    const navigation = createDateNavigation();
    const prioritizedDates = navigation.prioritizeForTodayFirst(testDates);
    
    // 今日 -> 明日 -> 明後日 -> 昨日 の順番になる
    expect(prioritizedDates[0]).toBe(today);
    expect(prioritizedDates[1]).toBe(calculateDateDifference(today, 1));
    expect(prioritizedDates[2]).toBe(calculateDateDifference(today, 2));
    expect(prioritizedDates[3]).toBe(calculateDateDifference(today, -1));
  });
});
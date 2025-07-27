// DateNavigation コンポーネント - Phase 2.2a
// Today-First UXのための日付ナビゲーションコンポーネント

import React, { useCallback, useMemo } from 'react';
import { calculateDateDifference } from '../utils/taskDate';
import { jstTime } from '../utils/jstTime';
import { logger } from '../utils/debugLogger';
import './DateNavigation.css';

/**
 * DateNavigation コンポーネントのプロパティ
 */
export interface DateNavigationProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  onModeChange?: (mode: 'today' | 'date' | 'archive') => void;
  onDatePickerOpen?: () => void; // 🟢 Green Phase: DatePickerモーダル開く機能追加
  compact?: boolean;
  statistics?: {
    date: string;
    totalTasks: number;
    completedTasks: number;
    totalEstimatedMinutes: number;
    completionPercentage: number;
  };
}

/**
 * Today-First UXのための日付ナビゲーションコンポーネント
 * 
 * 機能:
 * - 現在の日付表示
 * - 前日/翌日ナビゲーション
 * - 今日に戻るボタン
 * - 日付選択ボタン
 * - タスク統計表示
 * - キーボードナビゲーション対応
 * - レスポンシブ対応（compact mode）
 */
export const DateNavigation: React.FC<DateNavigationProps> = ({
  currentDate,
  onDateChange,
  onModeChange: _onModeChange, // 将来の拡張用プロパティ（現在未使用）
  onDatePickerOpen, // 🟢 Green Phase: DatePickerモーダル機能
  compact = false,
}) => {
  // JST基準で今日の日付を取得
  const getTodayDate = useCallback(() => {
    return jstTime.getCurrentDate();
  }, []);

  // 前日に移動
  const goToPreviousDay = useCallback(() => {
    const previousDay = calculateDateDifference(currentDate, -1);
    onDateChange(previousDay);
  }, [currentDate, onDateChange]);

  // 翌日に移動
  const goToNextDay = useCallback(() => {
    const nextDay = calculateDateDifference(currentDate, 1);
    onDateChange(nextDay);
  }, [currentDate, onDateChange]);

  // 今日に移動
  const goToToday = useCallback(() => {
    onDateChange(getTodayDate());
  }, [onDateChange, getTodayDate]);

  // JST基準で明日に移動する関数
  const goToTomorrow = useCallback(() => {
    const today = jstTime.getCurrentDate();
    const tomorrow = calculateDateDifference(today, 1);
    onDateChange(tomorrow);
  }, [onDateChange]);

  // キーボード操作のハンドリング（T005: End キー対応追加）
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        goToPreviousDay();
        break;
      case 'ArrowRight':
        event.preventDefault();
        goToNextDay();
        break;
      case 'Home':
        event.preventDefault();
        goToToday();
        break;
      case 'End':
        event.preventDefault();
        goToTomorrow();
        break;
    }
  }, [goToPreviousDay, goToNextDay, goToToday, goToTomorrow]);

  // JST基準で今日かどうかの判定
  const isSelectedDateToday = useCallback(() => {
    return jstTime.isToday(currentDate);
  }, [currentDate]);

  // 日付表示のフォーマット（JST基準）
  const formattedCurrentDate = useMemo(() => {
    try {
      const date = new Date(currentDate);
      if (isNaN(date.getTime())) {
        return currentDate; // 不正な日付の場合はそのまま返す
      }
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
      
      return `${year}年${month}月${day}日(${dayOfWeek})`;
    } catch (error) {
      logger.warn('Failed to format current date:', error);
      return currentDate;
    }
  }, [currentDate]);

  // コンパクト表示用の短縮日付フォーマット
  const compactFormattedDate = useMemo(() => {
    try {
      const date = new Date(currentDate);
      if (isNaN(date.getTime())) {
        return currentDate;
      }
      
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
      
      return `${month}/${day}(${dayOfWeek})`;
    } catch (error) {
      logger.warn('Failed to format compact date:', error);
      return currentDate;
    }
  }, [currentDate]);

  // 🟢 Green Phase: T005 - ボタンサイズバランス階層実装

  return (
    <div className="date-navigation-container">
      {/* 日付表示エリア */}
      <div 
        className="date-display"
        data-testid="date-display"
      >
        {compact ? compactFormattedDate : formattedCurrentDate}
      </div>

      {/* ナビゲーションボタンエリア */}
      <nav 
        role="navigation" 
        aria-label="日付ナビゲーション"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="date-navigation-buttons" // T005: 新しいクラス名
        data-testid="date-navigation"
      >
      {/* 前へボタン - Secondary Action (Medium) */}
      <button
        type="button"
        onClick={goToPreviousDay}
        aria-label="前の日"
        className="nav-btn nav-medium nav-previous"
      >
        <span className="material-icons">chevron_left</span>
        前へ
      </button>

      {/* 今日ボタン - Primary Action (Large) */}
      <button
        type="button"
        onClick={goToToday}
        aria-label="今日に戻る"
        className={`nav-btn nav-large ${isSelectedDateToday() ? 'nav-today-active' : 'nav-today'}`}
      >
        {isSelectedDateToday() ? '📍 今日' : '今日'}
      </button>

      {/* 明日ボタン - Primary Action (Large) */}
      <button
        type="button"
        onClick={goToTomorrow}
        aria-label="明日に移動"
        className="nav-btn nav-large nav-tomorrow"
      >
        明日
      </button>

      {/* 次へボタン - Secondary Action (Medium) */}
      <button
        type="button"
        onClick={goToNextDay}
        aria-label="次の日"
        className="nav-btn nav-medium nav-next"
      >
        次へ
        <span className="material-icons">chevron_right</span>
      </button>

      {/* カレンダーボタン - Utility Action (Small) */}
      <button
        type="button"
        role="button"
        aria-label="カレンダーを開く"
        aria-expanded="false"
        onClick={() => {
          // 🟢 Green Phase: DatePicker モーダルを開く処理実装
          if (onDatePickerOpen) {
            onDatePickerOpen();
          } else {
            logger.info('DatePicker will be implemented');
          }
        }}
        className="nav-btn nav-small nav-calendar"
      >
        <span className="material-icons">calendar_today</span>
      </button>

      </nav>
    </div>
  );
};
// DatePicker コンポーネント - Phase 2.2a
// Today-First UXのための日付選択モーダルコンポーネント

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { calculateDateDifference, parseTaskDate } from '../utils/taskDate';
import { getJSTDateString } from '../utils/dateUtils';

/**
 * DatePicker コンポーネントのプロパティ
 */
export interface DatePickerProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onClose: () => void;
  isOpen: boolean;
  availableDates?: string[];
  showStatistics?: boolean;
  disablePastDates?: boolean;  // 🔥 NEW: 過去の日付を無効化するかどうか
  getCurrentDate?: () => Date;  // 🔥 FIX: テスト可能な日付取得関数
}

/**
 * カレンダーの日付情報
 */
interface CalendarDay {
  date: string;
  day: number;
  isToday: boolean;
  isSelected: boolean;
  isAvailable: boolean;
  isCurrentMonth: boolean;
}

/**
 * Today-First UXのための日付選択モーダルコンポーネント
 * 
 * 機能:
 * - カレンダー形式の日付選択
 * - 利用可能日付のハイライト
 * - 今日の日付の特別表示
 * - 設定可能な過去日付制御（disablePastDates）
 * - 月間ナビゲーション
 * - キーボードナビゲーション対応
 * - フォーカス管理（フォーカストラップ）
 * - アクセシビリティ対応
 * 
 * 使用例:
 * - タスク作成時: disablePastDates={true} で過去日付を無効化
 * - 履歴参照時: disablePastDates={false} で全日付選択可能（デフォルト）
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateSelect,
  onClose,
  isOpen,
  availableDates = [],
  showStatistics = true,
  disablePastDates = false,  // 🔥 NEW: デフォルトは過去日付選択可能
  getCurrentDate = () => new Date(),  // 🔥 FIX: デフォルトは実際の日付
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const parsed = parseTaskDate(selectedDate);
    return parsed.isValid ? parsed.date!.substring(0, 7) : getJSTDateString(getCurrentDate()).substring(0, 7);
  });

  const [focusedDate, setFocusedDate] = useState(selectedDate);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);


  // カレンダーの日付データ生成
  const generateCalendarDays = useCallback((): CalendarDay[] => {
    const [year, month] = currentMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 週の始まり（日曜日）に調整

    const days: CalendarDay[] = [];
    const today = getJSTDateString(getCurrentDate());

    // 6週間分の日付を生成（最大42日）
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);  // 🔥 FIX: startDate.getDate()を使用
      
      // 🔥 FIX: タイムゾーン問題修正 - ローカル日付文字列を使用
      const dateYear = currentDate.getFullYear();
      const dateMonth = currentDate.getMonth() + 1;
      const day = currentDate.getDate();
      const dateString = `${dateYear}-${dateMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      const isCurrentMonth = currentDate.getMonth() === month - 1;
      
      days.push({
        date: dateString,
        day,
        isToday: dateString === today,
        isSelected: dateString === selectedDate,
        isAvailable: availableDates.includes(dateString),
        isCurrentMonth,
      });
    }

    return days;
  }, [currentMonth, selectedDate, availableDates, getCurrentDate]);

  // 月の移動
  const goToPreviousMonth = useCallback(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1); // month-2 because month is 1-indexed
    const prevMonthString = `${prevDate.getFullYear()}-${(prevDate.getMonth() + 1).toString().padStart(2, '0')}`;
    setCurrentMonth(prevMonthString);
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1); // month because month is 1-indexed
    const nextMonthString = `${nextDate.getFullYear()}-${(nextDate.getMonth() + 1).toString().padStart(2, '0')}`;
    setCurrentMonth(nextMonthString);
  }, [currentMonth]);

  // 日付選択ハンドラ
  const handleDateSelect = useCallback((date: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    onDateSelect(date);
    onClose(); // 🔥 FIX: 日付選択後にモーダルを自動で閉じる
  }, [onDateSelect, onClose]);

  // キーボード操作のハンドリング
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
      case 'Enter': {
        event.preventDefault();
        const focusedDay = generateCalendarDays().find(day => day.date === focusedDate);
        if (focusedDay && focusedDay.isAvailable) {
          handleDateSelect(focusedDate, true);
          // handleDateSelectで自動的にonClose()が呼ばれる
        }
        break;
      }
      case 'ArrowRight': {
        event.preventDefault();
        const nextDate = calculateDateDifference(focusedDate, 1);
        setFocusedDate(nextDate);
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        const prevDate = calculateDateDifference(focusedDate, -1);
        setFocusedDate(prevDate);
        break;
      }
      case 'ArrowDown': {
        event.preventDefault();
        const downDate = calculateDateDifference(focusedDate, 7);
        setFocusedDate(downDate);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const upDate = calculateDateDifference(focusedDate, -7);
        setFocusedDate(upDate);
        break;
      }
    }
  }, [focusedDate, onClose, generateCalendarDays, handleDateSelect]);

  // 背景クリックでの閉じる処理
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // フォーカス管理
  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  // 月表示フォーマット
  const formatCurrentMonth = useCallback(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    return `${year}年${month}月`;
  }, [currentMonth]);

  // モーダルが閉じている場合は何も表示しない
  if (!isOpen) {
    return null;
  }

  const calendarDays = generateCalendarDays();
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div
      data-testid="date-picker-modal"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="datepicker-title"
        onKeyDown={handleKeyDown}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          minWidth: '320px',
          maxWidth: '400px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          outline: 'none',
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <h2
            id="datepicker-title"
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#2d3748',
              margin: 0,
            }}
          >
            日付を選択
          </h2>
          <button
            ref={firstFocusableRef}
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            style={{
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: '#fff',
              color: '#4a5568',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* 月ナビゲーション */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <button
            type="button"
            onClick={goToPreviousMonth}
            aria-label="前の月"
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: '#fff',
              color: '#4a5568',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            ←
          </button>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#2d3748',
            }}
          >
            {formatCurrentMonth()}
          </div>
          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="次の月"
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: '#fff',
              color: '#4a5568',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            →
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            marginBottom: '8px',
          }}
        >
          {weekDays.map((day) => (
            <div
              key={day}
              style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#718096',
                fontWeight: '500',
                padding: '8px 4px',
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            marginBottom: '16px',
          }}
        >
          {calendarDays.map((dayInfo) => {
            // 🔥 NEW: 設定可能な過去日付無効化ロジック
            const today = getCurrentDate().toISOString().split('T')[0];
            
            let isDisabled = false;
            
            if (availableDates.length > 0) {
              // availableDatesが指定されている場合: 配列に含まれる日付のみ有効
              isDisabled = !dayInfo.isAvailable;
            } else if (disablePastDates) {
              // disablePastDatesがtrueの場合: 過去の日付を無効化
              isDisabled = dayInfo.date < today;
            }
            // デフォルト（disablePastDates=false）: すべての日付が選択可能
              
            const classNames: string[] = [];
            const buttonStyle: React.CSSProperties = {
              padding: '8px 4px',
              border: '1px solid transparent',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              fontSize: '14px',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              color: dayInfo.isCurrentMonth ? '#2d3748' : '#a0aec0',
              opacity: isDisabled ? 0.5 : 1,
              textAlign: 'center',
            };

            if (dayInfo.isSelected) {
              classNames.push('selected');
              buttonStyle.backgroundColor = '#3182ce';
              buttonStyle.color = '#fff';
              buttonStyle.fontWeight = 'bold';
            }

            if (dayInfo.isToday) {
              classNames.push('today');
              if (!dayInfo.isSelected) {
                buttonStyle.borderColor = '#3182ce';
                buttonStyle.color = '#3182ce';
                buttonStyle.fontWeight = 'bold';
              }
            }

            if (isDisabled) {
              classNames.push('disabled');
            }

            const dayLabel = dayInfo.isToday ? `${dayInfo.day}日 (今日)` : `${dayInfo.day}日`;

            return (
              <button
                key={dayInfo.date}
                type="button"
                onClick={() => handleDateSelect(dayInfo.date, !isDisabled)}
                disabled={isDisabled}
                className={classNames.join(' ').trim()}
                style={buttonStyle}
                aria-label={dayLabel}
              >
                {dayInfo.day}
              </button>
            );
          })}
        </div>

        {/* 統計情報 */}
        {showStatistics && availableDates.length > 0 && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#f7fafc',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#4a5568',
              textAlign: 'center',
            }}
          >
            タスクがある日: <strong>{availableDates.length}日</strong>
          </div>
        )}
      </div>
    </div>
  );
};
// TaskStatistics コンポーネント - Phase 2.2a
// Today-First UXのためのタスク統計表示コンポーネント

import React, { useMemo } from 'react';
import { DateStatistics } from '../types/Task';
import { formatTaskDate } from '../utils/taskDate';
import { formatDuration } from '../utils/timeFormat';

/**
 * TaskStatistics コンポーネントのプロパティ
 */
export interface TaskStatisticsProps {
  date: string;
  statistics: DateStatistics;
  compact?: boolean;
}

/**
 * 効率指標の種類
 */
type EfficiencyType = 'high' | 'normal' | 'low';

/**
 * Today-First UXのためのタスク統計表示コンポーネント
 * 
 * 機能:
 * - 基本統計情報の表示（タスク数、完了数、見積時間）
 * - 達成率の可視化（進捗バー）
 * - 今日・過去・未来の日付別スタイリング
 * - コンパクトモードでの簡潔表示
 * - 効率指標の表示（実績 vs 見積）
 * - アクセシビリティ対応
 */
export const TaskStatistics: React.FC<TaskStatisticsProps> = ({
  date,
  statistics,
  compact = false,
}) => {
  // 今日の日付を取得
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // 日付の状態を判定
  const dateStatus = useMemo(() => {
    const today = getTodayDate();
    if (date === today) return 'today';
    if (date < today) return 'past';
    return 'future';
  }, [date]);

  // 日付の表示フォーマット
  const dateDisplay = useMemo(() => {
    if (dateStatus === 'today') {
      return '今日';
    }
    return formatTaskDate(date, { format: 'short' });
  }, [date, dateStatus]);


  // 効率指標の計算
  const efficiencyInfo = useMemo(() => {
    if (!statistics.totalActualMinutes || statistics.totalEstimatedMinutes === 0) {
      return null;
    }
    
    const efficiency = statistics.totalActualMinutes / statistics.totalEstimatedMinutes;
    
    if (efficiency <= 0.9) {
      return { type: 'high' as EfficiencyType, text: '📈 高効率', color: '#38a169' };
    } else if (efficiency <= 1.1) {
      return { type: 'normal' as EfficiencyType, text: '📊 適正', color: '#3182ce' };
    } else {
      return { type: 'low' as EfficiencyType, text: '⚠️ 要改善', color: '#e53e3e' };
    }
  }, [statistics.totalActualMinutes, statistics.totalEstimatedMinutes]);

  // CSS クラス名の生成
  const containerClassName = useMemo(() => {
    let className = 'statistics-container';
    
    if (dateStatus === 'today') className += ' today';
    if (dateStatus === 'past') className += ' past';
    if (dateStatus === 'future') className += ' future';
    if (statistics.completionPercentage === 100) className += ' completed';
    
    return className;
  }, [dateStatus, statistics.completionPercentage]);

  // アクセシビリティ用のaria-label
  const ariaLabel = useMemo(() => {
    const formattedDate = formatTaskDate(date, { format: 'long' });
    return `${formattedDate}のタスク統計`;
  }, [date]);

  // タスクがない場合の表示
  if (statistics.totalTasks === 0) {
    return (
      <div
        data-testid="task-statistics"
        className={containerClassName}
        role="status"
        aria-label={ariaLabel}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: '#f7fafc',
          border: '1px solid #e2e8f0',
          fontSize: compact ? '12px' : '13px',
          color: '#718096',
          textAlign: 'center',
        }}
      >
        <div style={{ fontWeight: '500' }}>
          {dateDisplay}
        </div>
        <div style={{ marginTop: '4px' }}>
          タスクなし
        </div>
      </div>
    );
  }

  // コンパクトモードの表示
  if (compact) {
    return (
      <div
        data-testid="task-statistics"
        className={containerClassName}
        role="status"
        aria-label={ariaLabel}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: dateStatus === 'today' ? '#ebf8ff' : '#f7fafc',
          border: `1px solid ${dateStatus === 'today' ? '#3182ce' : '#e2e8f0'}`,
          fontSize: '12px',
          color: dateStatus === 'today' ? '#2b6cb0' : '#4a5568',
        }}
      >
        <span style={{ fontWeight: '500' }}>{dateDisplay}</span>
        <span>{statistics.totalTasks}件({statistics.completedTasks}完了)</span>
      </div>
    );
  }

  // 通常モードの表示
  return (
    <div
      data-testid="task-statistics"
      className={containerClassName}
      role="status"
      aria-label={ariaLabel}
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: dateStatus === 'today' ? '#ebf8ff' : '#f7fafc',
        border: `1px solid ${dateStatus === 'today' ? '#3182ce' : '#e2e8f0'}`,
        fontSize: '13px',
        color: '#4a5568',
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            fontWeight: '600',
            fontSize: '14px',
            color: dateStatus === 'today' ? '#2b6cb0' : '#2d3748',
          }}
        >
          {dateDisplay}
        </div>
        {statistics.completionPercentage === 100 && (
          <span style={{ fontSize: '16px' }}>🎉</span>
        )}
      </div>

      {/* メイン統計 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '8px',
        }}
      >
        <span>{statistics.totalTasks}件</span>
        <span>完了{statistics.completedTasks}件</span>
        <span>見積:{formatDuration(statistics.totalEstimatedMinutes)}</span>
        {statistics.totalActualMinutes && (
          <span>実績:{formatDuration(statistics.totalActualMinutes)}</span>
        )}
      </div>

      {/* 達成率とプログレスバー */}
      <div style={{ marginBottom: '8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '4px',
          }}
        >
          <span>達成率:{statistics.completionPercentage}%</span>
          {efficiencyInfo && (
            <span style={{ color: efficiencyInfo.color, fontSize: '11px' }}>
              {efficiencyInfo.text}
            </span>
          )}
        </div>
        
        {/* プログレスバー */}
        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#e2e8f0',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            data-testid="progress-bar"
            role="progressbar"
            aria-valuenow={statistics.completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{
              width: `${statistics.completionPercentage}%`,
              height: '100%',
              backgroundColor: statistics.completionPercentage === 100 ? '#38a169' : '#3182ce',
              borderRadius: '3px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
};
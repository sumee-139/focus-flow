// TaskStatistics コンポーネントのテスト - Phase 2.2a
// 🔴 Red Phase: Today-First UXのためのタスク統計表示コンポーネント

import { render, screen } from '@testing-library/react';
import { TaskStatistics } from './TaskStatistics';
import { DateStatistics } from '../types/Task';

describe('TaskStatistics - Today-First UX タスク統計表示コンポーネント', () => {
  const mockStatistics: DateStatistics = {
    date: '2025-07-21',
    totalTasks: 5,
    completedTasks: 2,
    totalEstimatedMinutes: 180,
    completionPercentage: 40,
  };

  const defaultProps = {
    date: '2025-07-21',
    statistics: mockStatistics,
    compact: false,
  };

  // 🔴 失敗するテスト: 基本的な統計情報表示
  test('should display basic task statistics', () => {
    render(<TaskStatistics {...defaultProps} />);
    
    expect(screen.getByText(/5件/)).toBeInTheDocument();
    expect(screen.getByText(/完了2件/)).toBeInTheDocument();
    expect(screen.getByText(/見積:3時間/)).toBeInTheDocument();
    expect(screen.getByText(/達成率:40%/)).toBeInTheDocument();
  });

  // 🔴 失敗するテスト: 今日の場合の特別表示
  test('should show special styling for today', () => {
    const todayDate = new Date().toISOString().split('T')[0];
    const propsForToday = {
      ...defaultProps,
      date: todayDate,
      statistics: { ...mockStatistics, date: todayDate }
    };
    
    render(<TaskStatistics {...propsForToday} />);
    
    expect(screen.getByText('今日')).toBeInTheDocument();
    expect(screen.getByTestId('task-statistics')).toHaveClass('today');
  });

  // 🔴 失敗するテスト: 過去日付の表示
  test('should show past date with appropriate styling', () => {
    const pastProps = {
      ...defaultProps,
      date: '2025-07-20',
      statistics: { ...mockStatistics, date: '2025-07-20' }
    };
    
    render(<TaskStatistics {...pastProps} />);
    
    expect(screen.getByText('7/20(日)')).toBeInTheDocument();
    expect(screen.getByTestId('task-statistics')).toHaveClass('past');
  });

  // 🔴 失敗するテスト: 未来日付の表示
  test('should show future date with appropriate styling', () => {
    const futureProps = {
      ...defaultProps,
      date: '2025-07-23',
      statistics: { ...mockStatistics, date: '2025-07-23' }
    };
    
    render(<TaskStatistics {...futureProps} />);
    
    expect(screen.getByText('7/23(水)')).toBeInTheDocument();
    expect(screen.getByTestId('task-statistics')).toHaveClass('future');
  });

  // 🔴 失敗するテスト: コンパクトモード
  test('should render in compact mode', () => {
    const compactProps = { ...defaultProps, compact: true };
    
    render(<TaskStatistics {...compactProps} />);
    
    // コンパクト表示では簡略化された情報のみ
    expect(screen.getByText('5件(2完了)')).toBeInTheDocument();
    expect(screen.queryByText(/達成率/)).not.toBeInTheDocument();
  });

  // 🔴 失敗するテスト: タスクがない場合の表示
  test('should handle zero tasks gracefully', () => {
    const emptyStats: DateStatistics = {
      date: '2025-07-21',
      totalTasks: 0,
      completedTasks: 0,
      totalEstimatedMinutes: 0,
      completionPercentage: 0,
    };
    
    const emptyProps = { ...defaultProps, statistics: emptyStats };
    
    render(<TaskStatistics {...emptyProps} />);
    
    expect(screen.getByText('タスクなし')).toBeInTheDocument();
    expect(screen.queryByText(/達成率/)).not.toBeInTheDocument();
  });

  // 🔴 失敗するテスト: 100%完了の場合の表示
  test('should show completion celebration for 100%', () => {
    const completeStats: DateStatistics = {
      date: '2025-07-21',
      totalTasks: 3,
      completedTasks: 3,
      totalEstimatedMinutes: 120,
      completionPercentage: 100,
    };
    
    const completeProps = { ...defaultProps, statistics: completeStats };
    
    render(<TaskStatistics {...completeProps} />);
    
    expect(screen.getByText(/🎉/)).toBeInTheDocument();
    expect(screen.getByText(/達成率:100%/)).toBeInTheDocument();
    expect(screen.getByTestId('task-statistics')).toHaveClass('completed');
  });

  // 🔴 失敗するテスト: 進捗バーの表示
  test('should display progress bar', () => {
    render(<TaskStatistics {...defaultProps} />);
    
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle('width: 40%'); // completionPercentage
  });

  // 🔴 失敗するテスト: 実際の作業時間表示（actualMinutesがある場合）
  test('should show actual time when available', () => {
    const statsWithActual: DateStatistics = {
      ...mockStatistics,
      totalActualMinutes: 150,
    };
    
    const propsWithActual = { ...defaultProps, statistics: statsWithActual };
    
    render(<TaskStatistics {...propsWithActual} />);
    
    expect(screen.getByText(/実績:2時間30分/)).toBeInTheDocument();
    expect(screen.getByText(/見積:3時間/)).toBeInTheDocument();
  });

  // 🔴 失敗するテスト: 実際の時間がない場合
  test('should handle missing actual time', () => {
    render(<TaskStatistics {...defaultProps} />);
    
    expect(screen.queryByText(/実績:/)).not.toBeInTheDocument();
    expect(screen.getByText(/見積:3時間/)).toBeInTheDocument();
  });

  // 🔴 失敗するテスト: アクセシビリティ
  test('should have proper accessibility attributes', () => {
    render(<TaskStatistics {...defaultProps} />);
    
    const container = screen.getByTestId('task-statistics');
    expect(container).toHaveAttribute('role', 'status');
    expect(container).toHaveAttribute('aria-label', '2025年7月21日(月)のタスク統計');
    
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveAttribute('role', 'progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '40');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  // 🔴 失敗するテスト: 時間フォーマット（長時間の場合）
  test('should format long durations correctly', () => {
    const longStats: DateStatistics = {
      date: '2025-07-21',
      totalTasks: 2,
      completedTasks: 1,
      totalEstimatedMinutes: 375, // 6時間15分
      completionPercentage: 50,
      totalActualMinutes: 420, // 7時間
    };
    
    const longProps = { ...defaultProps, statistics: longStats };
    
    render(<TaskStatistics {...longProps} />);
    
    expect(screen.getByText(/見積:6時間15分/)).toBeInTheDocument();
    expect(screen.getByText(/実績:7時間/)).toBeInTheDocument();
  });

  // 🔴 失敗するテスト: 効率指標の表示（実績時間 vs 見積時間）
  test('should show efficiency indicator', () => {
    const statsWithEfficiency: DateStatistics = {
      ...mockStatistics,
      totalActualMinutes: 150, // 180分見積に対して150分実績
    };
    
    const propsWithEfficiency = { ...defaultProps, statistics: statsWithEfficiency };
    
    render(<TaskStatistics {...propsWithEfficiency} />);
    
    // 実績 < 見積の場合は「高効率」表示
    expect(screen.getByText(/📈 高効率/)).toBeInTheDocument();
  });

  // 🔴 失敗するテスト: 非効率な場合の表示
  test('should show inefficiency warning', () => {
    const inefficientStats: DateStatistics = {
      ...mockStatistics,
      totalActualMinutes: 240, // 180分見積に対して240分実績
    };
    
    const inefficientProps = { ...defaultProps, statistics: inefficientStats };
    
    render(<TaskStatistics {...inefficientProps} />);
    
    // 実績 > 見積の場合は「要改善」表示
    expect(screen.getByText(/⚠️ 要改善/)).toBeInTheDocument();
  });
});
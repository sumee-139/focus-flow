// DatePicker コンポーネントのテスト - Phase 2.2a
// 🔴 Red Phase: Today-First UXのための日付選択モーダルコンポーネント

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { DatePicker } from './DatePicker';

describe('DatePicker - Today-First UX 日付選択モーダルコンポーネント', () => {
  // 🔥 FIX: モック可能な日付取得関数
  const mockGetCurrentDate = vi.fn(() => new Date('2025-07-23T09:00:00.000Z'));
  
  const defaultProps = {
    selectedDate: '2025-07-23',  // 🔥 FIX: 今日に合わせる
    onDateSelect: vi.fn(),
    onClose: vi.fn(),
    isOpen: true,
    availableDates: ['2025-07-21', '2025-07-22', '2025-07-23'],  // 🔥 FIX: 今日を含む
    showStatistics: true,
    disablePastDates: false,  // 🔥 NEW: デフォルトは過去日付選択可能
    getCurrentDate: mockGetCurrentDate,  // 🔥 FIX: モック関数を渡す
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // 🔥 FIX: モック関数もリセット
    mockGetCurrentDate.mockReturnValue(new Date('2025-07-23T09:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 🔴 失敗するテスト: 基本的な表示
  test('should render calendar modal when open', () => {
    render(<DatePicker {...defaultProps} />);
    
    // モーダルの表示確認
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('日付を選択')).toBeInTheDocument();
    
    // カレンダーの表示確認
    expect(screen.getByText('2025年7月')).toBeInTheDocument();
    
    // 閉じるボタンの確認
    expect(screen.getByRole('button', { name: /閉じる/ })).toBeInTheDocument();
  });

  // Debug test - simple check
  test('debug: check available dates', () => {
    render(<DatePicker {...defaultProps} />);
    
    // Just check if any day buttons exist
    const dayButtons = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.includes('日')
    );
    
    expect(dayButtons.length).toBeGreaterThan(0);
    
    // Check for specific dates we care about
    const date21 = dayButtons.find(btn => btn.getAttribute('aria-label') === '21日');
    const date22 = dayButtons.find(btn => btn.getAttribute('aria-label') === '22日');
    const date23 = dayButtons.find(btn => btn.getAttribute('aria-label') === '23日 (今日)');
    
    expect(date21).toBeInTheDocument();
    expect(date22).toBeInTheDocument();
    expect(date23).toBeInTheDocument();
  });

  // 🔴 失敗するテスト: 非表示状態
  test('should not render when closed', () => {
    render(<DatePicker {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // 🔴 失敗するテスト: 日付選択機能
  test('should call onDateSelect when date is clicked', () => {
    render(<DatePicker {...defaultProps} />);
    
    // 利用可能な日付（21日）をクリック
    const dateButton = screen.getByRole('button', { name: /21日/ });
    fireEvent.click(dateButton);
    
    expect(defaultProps.onDateSelect).toHaveBeenCalledWith('2025-07-21');
  });

  // 🔴 失敗するテスト: 閉じるボタン機能
  test('should call onClose when close button is clicked', () => {
    render(<DatePicker {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /閉じる/ });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  // 🔴 失敗するテスト: ESCキーでの閉じる機能
  test('should call onClose when ESC key is pressed', () => {
    render(<DatePicker {...defaultProps} />);
    
    const modal = screen.getByRole('dialog');
    fireEvent.keyDown(modal, { key: 'Escape' });
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  // 🔴 失敗するテスト: 背景クリックでの閉じる機能
  test('should call onClose when backdrop is clicked', () => {
    render(<DatePicker {...defaultProps} />);
    
    // モーダルの背景をクリック
    const backdrop = screen.getByTestId('date-picker-modal');
    fireEvent.click(backdrop);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  // 🔴 失敗するテスト: 選択中の日付のハイライト
  test('should highlight selected date', () => {
    render(<DatePicker {...defaultProps} />);
    
    const selectedDate = screen.getByRole('button', { name: /23日 \(今日\)/ });
    expect(selectedDate).toHaveClass('selected');
  });

  // 🔴 失敗するテスト: 利用可能な日付の表示
  test('should show available dates with different styling', () => {
    const { rerender } = render(<DatePicker {...defaultProps} />);
    
    // Force re-render to ensure fresh data
    rerender(<DatePicker {...defaultProps} />);
    
    // 利用可能な日付は通常のスタイル
    const availableDate = screen.getByRole('button', { name: /21日/ });
    expect(availableDate).not.toHaveClass('disabled');
    
    // 利用可能でない日付は無効化（availableDatesに含まれない）
    const unavailableDate = screen.getByRole('button', { name: /20日/ });
    expect(unavailableDate).toHaveClass('disabled');
  });

  // 🔴 失敗するテスト: 今日の表示
  test('should mark today with special styling', () => {
    // Mock date is 2025-07-23, which is already in availableDates
    render(<DatePicker {...defaultProps} />);
    
    const todayButton = screen.getByRole('button', { name: '23日 (今日)' });
    expect(todayButton).toHaveClass('today');
  });

  // 🔴 失敗するテスト: 月の移動機能
  test('should navigate between months', () => {
    render(<DatePicker {...defaultProps} />);
    
    // 次の月へ
    const nextButton = screen.getByRole('button', { name: /次の月/ });
    fireEvent.click(nextButton);
    
    expect(screen.getByText('2025年8月')).toBeInTheDocument();
    
    // 前の月へ
    const prevButton = screen.getByRole('button', { name: /前の月/ });
    fireEvent.click(prevButton);
    
    expect(screen.getByText('2025年7月')).toBeInTheDocument();
  });

  // 🔴 失敗するテスト: 統計情報表示
  test('should show statistics when enabled', () => {
    const propsWithStats = {
      ...defaultProps,
      showStatistics: true,
    };
    
    render(<DatePicker {...propsWithStats} />);
    
    expect(screen.getByText(/タスクがある日/)).toBeInTheDocument();
    expect(screen.getByText('3日')).toBeInTheDocument(); // availableDates.length
  });

  // 🔴 失敗するテスト: 統計情報の非表示
  test('should hide statistics when disabled', () => {
    const propsWithoutStats = {
      ...defaultProps,
      showStatistics: false,
    };
    
    render(<DatePicker {...propsWithoutStats} />);
    
    expect(screen.queryByText(/タスクがある日/)).not.toBeInTheDocument();
  });

  // 🔴 失敗するテスト: アクセシビリティ
  test('should have proper accessibility attributes', () => {
    render(<DatePicker {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    
    // フォーカストラップ確認
    const firstFocusable = screen.getByRole('button', { name: /閉じる/ });
    expect(document.activeElement).toBe(firstFocusable);
  });

  // 🔴 失敗するテスト: キーボードナビゲーション
  test('should support keyboard navigation', () => {
    render(<DatePicker {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    
    // 最初は選択中の日付(2025-07-23)にフォーカス
    // 左矢印で前日(2025-07-22)に移動 - これは利用可能な日付
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
    
    // Enterキーでの選択 - 利用可能な日付なので選択される
    fireEvent.keyDown(dialog, { key: 'Enter' });
    
    expect(defaultProps.onDateSelect).toHaveBeenCalledWith('2025-07-22');
  });

  // 🔴 失敗するテスト: モーダル初期フォーカス管理
  test('should focus close button on mount', async () => {
    render(<DatePicker {...defaultProps} />);
    
    // モーダルが開かれると閉じるボタンにフォーカス
    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /閉じる/ });
      expect(document.activeElement).toBe(closeButton);
    });
  });

  // 🔴 新しいテスト: disablePastDates プロパティ
  test('should disable past dates when disablePastDates is true', () => {
    const propsWithDisabledPast = {
      ...defaultProps,
      availableDates: [], // availableDatesを空にして、disablePastDatesの効果を確認
      disablePastDates: true,
    };
    
    render(<DatePicker {...propsWithDisabledPast} />);
    
    // 過去の日付（22日）は無効化される
    const pastDate = screen.getByRole('button', { name: /22日/ });
    expect(pastDate).toHaveClass('disabled');
    expect(pastDate).toBeDisabled();
    
    // 今日（23日）は有効
    const today = screen.getByRole('button', { name: /23日 \(今日\)/ });
    expect(today).not.toHaveClass('disabled');
    expect(today).not.toBeDisabled();
  });

  // 🔴 新しいテスト: disablePastDates=false（デフォルト）では過去日付も選択可能
  test('should allow past dates when disablePastDates is false (default)', () => {
    const propsWithPastEnabled = {
      ...defaultProps,
      availableDates: [], // availableDatesを空にして、disablePastDatesの効果を確認
      disablePastDates: false,
    };
    
    render(<DatePicker {...propsWithPastEnabled} />);
    
    // 過去の日付（22日）も選択可能
    const pastDate = screen.getByRole('button', { name: /22日/ });
    expect(pastDate).not.toHaveClass('disabled');
    expect(pastDate).not.toBeDisabled();
    
    // 今日（23日）も有効
    const today = screen.getByRole('button', { name: /23日 \(今日\)/ });
    expect(today).not.toHaveClass('disabled');
    expect(today).not.toBeDisabled();
  });

  // 🔴 新しいテスト: availableDatesが優先される
  test('should prioritize availableDates over disablePastDates', () => {
    const propsWithBoth = {
      ...defaultProps,
      availableDates: ['2025-07-21', '2025-07-22'], // 過去の日付を含む
      disablePastDates: true, // 過去日付無効だが、availableDatesが優先される
    };
    
    render(<DatePicker {...propsWithBoth} />);
    
    // availableDatesに含まれる過去日付（21日、22日）は有効
    const date21 = screen.getByRole('button', { name: /21日/ });
    const date22 = screen.getByRole('button', { name: /22日/ });
    expect(date21).not.toHaveClass('disabled');
    expect(date22).not.toHaveClass('disabled');
    
    // availableDatesに含まれない今日（23日）は無効
    const today = screen.getByRole('button', { name: /23日 \(今日\)/ });
    expect(today).toHaveClass('disabled');
  });
});
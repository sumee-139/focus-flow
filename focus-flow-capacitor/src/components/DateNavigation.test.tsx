// DateNavigation コンポーネントのテスト - Phase 2.2a
// 🔴 Red Phase: Today-First UXのための日付ナビゲーションコンポーネント

import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { DateNavigation } from './DateNavigation';
import { DateStatistics } from '../types/Task';
import { jstTime } from '../utils/jstTime';

describe('DateNavigation - Today-First UX 日付ナビゲーションコンポーネント', () => {
  const mockStatistics: DateStatistics = {
    date: '2025-07-21',
    totalTasks: 5,
    completedTasks: 2,
    totalEstimatedMinutes: 180,
    completionPercentage: 40,
  };

  const defaultProps = {
    currentDate: '2025-07-21',
    onDateChange: vi.fn(),
    onModeChange: vi.fn(),
    statistics: mockStatistics,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ✅ 基本的な表示テスト
  test('should render current date and navigation buttons', () => {
    render(<DateNavigation {...defaultProps} />);
    
    // 日付表示確認
    expect(screen.getByText('2025年7月21日(月)')).toBeInTheDocument();
    
    // ナビゲーションボタン確認
    expect(screen.getByText('今日')).toBeInTheDocument();
    expect(screen.getByText('前へ')).toBeInTheDocument();
    expect(screen.getByText('次へ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /カレンダーを開く/ })).toBeInTheDocument();
  });

  // 🔴 失敗するテスト: 今日ボタン機能
  test('should call onDateChange with today when today button clicked', () => {
    // 今日以外の日付を設定
    const props = { ...defaultProps, currentDate: '2025-07-20' };
    render(<DateNavigation {...props} />);
    
    const todayButton = screen.getByText('今日');
    fireEvent.click(todayButton);
    
    // 今日の日付でコールバックが呼ばれることを確認
    expect(props.onDateChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });

  // 🔴 失敗するテスト: 前へボタン機能
  test('should call onDateChange with previous day when prev button clicked', () => {
    render(<DateNavigation {...defaultProps} />);
    
    const prevButton = screen.getByText('前へ');
    fireEvent.click(prevButton);
    
    expect(defaultProps.onDateChange).toHaveBeenCalledWith('2025-07-20');
  });

  // 🔴 失敗するテスト: 次へボタン機能
  test('should call onDateChange with next day when next button clicked', () => {
    render(<DateNavigation {...defaultProps} />);
    
    const nextButton = screen.getByText('次へ');
    fireEvent.click(nextButton);
    
    expect(defaultProps.onDateChange).toHaveBeenCalledWith('2025-07-22');
  });

  // ✅ 日付フォーマットのテスト（統計表示はTaskStatisticsコンポーネントの責務）
  test('should display formatted date correctly', () => {
    render(<DateNavigation {...defaultProps} />);
    
    // 日付表示確認（統計表示は別コンポーネントなので削除）
    expect(screen.getByTestId('date-display')).toHaveTextContent('2025年7月21日(月)');
  });

  // ✅ コンパクト表示モードテスト
  test('should render in compact mode when compact prop is true', () => {
    render(<DateNavigation {...defaultProps} compact={true} />);
    
    // コンパクト表示では短縮形式で表示
    expect(screen.getByTestId('date-display')).toHaveTextContent('7/21(月)');
    
    // フルバージョンは表示されない
    expect(screen.queryByText('2025年7月21日(月)')).not.toBeInTheDocument();
  });

  // ✅ 今日の場合のスタイリングテスト
  test('should highlight today button when current date is today', () => {
    // JST基準の今日の日付を使用（T006: JST時差バグ修正）
    const todayDate = jstTime.getCurrentDate();
    const props = { ...defaultProps, currentDate: todayDate };
    render(<DateNavigation {...props} />);
    
    const todayButton = screen.getByText('📍 今日');
    expect(todayButton).toHaveClass('nav-today-active'); // 正しいクラス名
  });

  // 🔴 失敗するテスト: アクセシビリティ
  test('should have proper accessibility attributes', () => {
    render(<DateNavigation {...defaultProps} />);
    
    // ARIAラベル確認
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', '日付ナビゲーション');
    
    // ボタンのアクセシビリティ確認
    const datePickerButton = screen.getByRole('button', { name: /カレンダーを開く/ });
    expect(datePickerButton).toHaveAttribute('aria-expanded', 'false');
  });

  // 🔴 失敗するテスト: キーボード操作
  test('should support keyboard navigation', () => {
    render(<DateNavigation {...defaultProps} />);
    
    const navigation = screen.getByRole('navigation');
    
    // 左矢印で前日
    fireEvent.keyDown(navigation, { key: 'ArrowLeft' });
    expect(defaultProps.onDateChange).toHaveBeenCalledWith('2025-07-20');
    
    // 右矢印で翌日
    fireEvent.keyDown(navigation, { key: 'ArrowRight' });
    expect(defaultProps.onDateChange).toHaveBeenCalledWith('2025-07-22');
    
    // Homeで今日
    fireEvent.keyDown(navigation, { key: 'Home' });
    expect(defaultProps.onDateChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });

  // 🔴 失敗するテスト: 日付フォーマット関数のテスト
  test('should format dates correctly for different locales', () => {
    const testDates = [
      { date: '2025-01-01', expected: '2025年1月1日(水)' },
      { date: '2025-12-31', expected: '2025年12月31日(水)' },
      { date: '2025-07-21', expected: '2025年7月21日(月)' },
    ];
    
    testDates.forEach(({ date, expected }) => {
      const props = { ...defaultProps, currentDate: date };
      const { unmount } = render(<DateNavigation {...props} />);
      
      expect(screen.getByText(expected)).toBeInTheDocument();
      
      // cleanup for next iteration
      unmount();
    });
  });

  // 🔴 T005専用テスト: ボタンサイズバランス階層
  describe('T005: Button Size Balance Hierarchy', () => {
    test('should have balanced navigation button sizes according to T005 specification', () => {
      render(<DateNavigation {...defaultProps} />);
      
      const prevButton = screen.getByRole('button', { name: '前の日' });
      const todayButton = screen.getByText('今日');
      const tomorrowButton = screen.getByText('明日');
      const nextButton = screen.getByRole('button', { name: '次の日' });
      const calendarButton = screen.getByRole('button', { name: 'カレンダーを開く' });
      
      // T005サイズ階層: 前へ（中）・今日（大）・明日（大）・次へ（中）・📅（小）
      expect(prevButton).toHaveClass('nav-btn nav-medium');
      expect(todayButton).toHaveClass('nav-btn nav-large');
      expect(tomorrowButton).toHaveClass('nav-btn nav-large');
      expect(nextButton).toHaveClass('nav-btn nav-medium');
      expect(calendarButton).toHaveClass('nav-btn nav-small');
    });

    test('should emphasize primary action buttons (today and tomorrow)', () => {
      render(<DateNavigation {...defaultProps} />);
      
      const todayButton = screen.getByText('今日');
      const tomorrowButton = screen.getByText('明日');
      
      // プライマリボタンの視覚的強調確認（クラス名ベース）
      expect(todayButton).toHaveClass('nav-btn nav-large');
      expect(tomorrowButton).toHaveClass('nav-btn nav-large');
    });

    test('should use Material Icons for navigation buttons', () => {
      render(<DateNavigation {...defaultProps} />);
      
      const prevButton = screen.getByRole('button', { name: '前の日' });
      const nextButton = screen.getByRole('button', { name: '次の日' });
      const calendarButton = screen.getByRole('button', { name: 'カレンダーを開く' });
      
      // Material Icons確認
      expect(prevButton.querySelector('.material-icons')).toHaveTextContent('chevron_left');
      expect(nextButton.querySelector('.material-icons')).toHaveTextContent('chevron_right');
      expect(calendarButton.querySelector('.material-icons')).toHaveTextContent('calendar_today');
    });

    test('should maintain WCAG compliant touch targets (44x44px minimum)', () => {
      render(<DateNavigation {...defaultProps} />);
      
      const allButtons = screen.getAllByRole('button');
      
      // CSS定義でminHeight: 44pxが設定されていることをクラス名で確認
      allButtons.forEach(button => {
        expect(button).toHaveClass('nav-btn');
      });
      
      // ボタンが5つ存在することを確認（前・今日・明日・次・カレンダー）
      expect(allButtons).toHaveLength(5);
    });

    test('should support enhanced keyboard navigation with tomorrow button', () => {
      render(<DateNavigation {...defaultProps} />);
      
      const navigation = screen.getByRole('navigation');
      
      // 左矢印で前日
      fireEvent.keyDown(navigation, { key: 'ArrowLeft' });
      expect(defaultProps.onDateChange).toHaveBeenCalledWith('2025-07-20');
      
      // 右矢印で翌日
      fireEvent.keyDown(navigation, { key: 'ArrowRight' });
      expect(defaultProps.onDateChange).toHaveBeenCalledWith('2025-07-22');
      
      // Homeで今日
      fireEvent.keyDown(navigation, { key: 'Home' });
      expect(defaultProps.onDateChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
      
      // Endで明日（新機能）
      fireEvent.keyDown(navigation, { key: 'End' }); // 🔴 失敗予定
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      expect(defaultProps.onDateChange).toHaveBeenCalledWith(tomorrowStr); // 🔴 失敗予定
    });

    test('should display tomorrow button with proper functionality', () => {
      render(<DateNavigation {...defaultProps} />);
      
      const tomorrowButton = screen.getByText('明日'); // 🔴 失敗予定
      
      // 明日ボタンクリック機能
      fireEvent.click(tomorrowButton); // 🔴 失敗予定
      
      // JST基準での明日の日付を計算（T006: JST時差バグ修正）
      const jstToday = jstTime.getJSTDate();
      const jstTomorrow = new Date(jstToday);
      jstTomorrow.setDate(jstTomorrow.getDate() + 1);
      const tomorrowStr = jstTime.formatYMD(jstTomorrow);
      
      expect(defaultProps.onDateChange).toHaveBeenCalledWith(tomorrowStr); // 🔴 失敗予定
    });

    test('should render navigation buttons in correct order', () => {
      render(<DateNavigation {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      
      // T005仕様: 前へ（中）・今日（大）・明日（大）・次へ（中）・📅（小）
      expect(buttons[0]).toHaveTextContent('前へ');
      expect(buttons[1]).toHaveTextContent('今日');
      expect(buttons[2]).toHaveTextContent('明日'); // 🔴 失敗予定（順序変更）
      expect(buttons[3]).toHaveTextContent('次へ');
      expect(buttons[4]).toHaveAttribute('aria-label', expect.stringMatching(/カレンダー|日付選択/));
    });

    test('should adapt button sizes responsively on mobile', () => {
      // モバイル環境をシミュレート
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, configurable: true });
      window.dispatchEvent(new Event('resize'));
      
      render(<DateNavigation {...defaultProps} />);
      
      const navigation = screen.getByRole('navigation');
      
      // ナビゲーション要素の基本クラス確認
      expect(navigation).toHaveClass('date-navigation-buttons');
      
      // モバイルでのボタンサイズ調整確認
      const mediumButtons = screen.getAllByRole('button').filter(btn => 
        btn.classList.contains('nav-medium')
      );
      const largeButtons = screen.getAllByRole('button').filter(btn => 
        btn.classList.contains('nav-large')
      );
      
      expect(mediumButtons.length).toBe(2); // 前へ・次へ
      expect(largeButtons.length).toBe(2); // 今日・明日
    });

    test('should maintain button hierarchy on tablet screens', () => {
      // タブレット環境をシミュレート
      Object.defineProperty(window, 'innerWidth', { value: 768, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1024, configurable: true });
      window.dispatchEvent(new Event('resize'));
      
      render(<DateNavigation {...defaultProps} />);
      
      const navigation = screen.getByRole('navigation');
      
      // ナビゲーション要素の基本クラス確認
      expect(navigation).toHaveClass('date-navigation-buttons');
      
      // すべてのボタンが表示されることを確認
      expect(screen.getByText('前へ')).toBeInTheDocument();
      expect(screen.getByText('今日')).toBeInTheDocument();
      expect(screen.getByText('明日')).toBeInTheDocument();
      expect(screen.getByText('次へ')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'カレンダーを開く' })).toBeInTheDocument();
    });

    test('should show calendar button as smallest utility action', () => {
      render(<DateNavigation {...defaultProps} />);
      
      const calendarButton = screen.getByRole('button', { name: 'カレンダーを開く' });
      
      // 最小サイズクラス確認
      expect(calendarButton).toHaveClass('nav-btn nav-small');
      
      // Material Iconの確認
      const icon = calendarButton.querySelector('.material-icons');
      expect(icon).toHaveTextContent('calendar_today');
      
      // サイズ仕様確認：CSS定義によるサイズ階層
      expect(calendarButton).toHaveClass('nav-btn nav-small');
    });

    test('should prevent unnatural size imbalance (T005 main objective)', () => {
      render(<DateNavigation {...defaultProps} />);
      
      const prevButton = screen.getByRole('button', { name: '前の日' });
      const nextButton = screen.getByRole('button', { name: '次の日' });
      
      // T005目標: 「前へが大きく次へが小さい不自然さ」の解消
      // 前へ・次へボタンは同じ中サイズで統一
      expect(prevButton).toHaveClass('nav-btn nav-medium');
      expect(nextButton).toHaveClass('nav-btn nav-medium');
    });

    test('should implement proper button accessibility with aria labels', () => {
      render(<DateNavigation {...defaultProps} />);
      
      // 各ボタンの適切なARIAラベル確認
      expect(screen.getByRole('button', { name: '前の日' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '今日に戻る' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '明日に移動' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '次の日' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'カレンダーを開く' })).toBeInTheDocument();
    });

    test('should support focus management and keyboard accessibility', () => {
      render(<DateNavigation {...defaultProps} />);
      
      const allButtons = screen.getAllByRole('button');
      
      // 全ボタンがタブナビゲーション可能
      allButtons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
      
      // フォーカス状態確認：CSS定義によるアウトライン
      const todayButton = screen.getByText('今日');
      todayButton.focus();
      
      expect(todayButton).toHaveClass('nav-btn nav-large'); // フォーカス可能要素
    });
  });

  // 🔴 T006専用テスト: JST基準日付処理（Phase 2.2d）
  describe('T006: JST Timezone Handling', () => {
    test('should use JST-based today detection correctly', () => {
      // UTC 2025-07-25 10:00 (JST 2025-07-25 19:00) - JST午後7時
      const mockUTCDate = new Date('2025-07-25T10:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockUTCDate);

      const props = { ...defaultProps, currentDate: '2025-07-25' };
      render(<DateNavigation {...props} />);
      
      // JST基準で今日の場合、アクティブ状態の今日ボタンを探す
      const todayButton = screen.getByText('📍 今日');
      
      // JST基準で今日の場合、今日ボタンが適切な状態になっているか
      expect(todayButton).toHaveClass('nav-today-active');
    });

    test('should handle JST date boundary correctly at midnight', () => {
      // UTC 2025-07-24 15:00 (JST 2025-07-25 00:00) - JST午前0時
      const mockUTCDate = new Date('2025-07-24T15:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockUTCDate);

      render(<DateNavigation {...defaultProps} />);
      
      const todayButton = screen.getByText('今日');
      fireEvent.click(todayButton);
      
      // JST基準では2025-07-25が今日（UTC基準だと2025-07-24）
      // 🔴 失敗予定: 現在はUTC基準なので間違った日付が設定される
      expect(defaultProps.onDateChange).toHaveBeenCalledWith('2025-07-25');
    });

    test('should handle JST early morning hours (0-9 AM) correctly', () => {
      const criticalMorningTimes = [
        { utc: '2025-07-24T15:00:00.000Z', expectedJSTDate: '2025-07-25' }, // JST 00:00
        { utc: '2025-07-24T15:30:00.000Z', expectedJSTDate: '2025-07-25' }, // JST 00:30
        { utc: '2025-07-24T17:00:00.000Z', expectedJSTDate: '2025-07-25' }, // JST 02:00
        { utc: '2025-07-24T20:00:00.000Z', expectedJSTDate: '2025-07-25' }, // JST 05:00
        { utc: '2025-07-24T23:00:00.000Z', expectedJSTDate: '2025-07-25' }, // JST 08:00
        { utc: '2025-07-24T23:59:00.000Z', expectedJSTDate: '2025-07-25' }, // JST 08:59
        { utc: '2025-07-25T00:00:00.000Z', expectedJSTDate: '2025-07-25' }, // JST 09:00
      ];

      criticalMorningTimes.forEach(({ utc, expectedJSTDate }) => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(utc));
        
        const { unmount } = render(<DateNavigation {...defaultProps} />);
        
        const todayButton = screen.getByText('今日');
        fireEvent.click(todayButton);
        
        // JST基準の正しい日付が設定されることを確認
        // 🔴 失敗予定: 現在はUTC基準なので間違った日付になる
        expect(defaultProps.onDateChange).toHaveBeenCalledWith(expectedJSTDate);
        
        unmount();
        vi.clearAllMocks();
        vi.useRealTimers();
      });
    });

    test('should show correct today button state for JST date', () => {
      // UTC 2025-07-25 16:30 (JST 2025-07-26 01:30) - JST午前1時30分
      const mockUTCDate = new Date('2025-07-25T16:30:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockUTCDate);

      // currentDateがJST基準の今日（2025-07-26）
      const props = { ...defaultProps, currentDate: '2025-07-26' };
      render(<DateNavigation {...props} />);
      
      // JST基準で今日の場合、アクティブ状態のボタンを探す
      const todayButton = screen.getByText('📍 今日');
      
      // JST基準で今日の場合の表示状態確認
      expect(todayButton).toHaveClass('nav-today-active');
      expect(todayButton).toHaveTextContent('📍 今日');
    });

    test('should navigate to JST-based today when today button clicked', () => {
      // UTC 2025-07-25 08:00 (JST 2025-07-25 17:00) - JST午後5時
      const mockUTCDate = new Date('2025-07-25T08:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockUTCDate);

      // 今日以外の日付を設定
      const props = { ...defaultProps, currentDate: '2025-07-24' };
      render(<DateNavigation {...props} />);
      
      const todayButton = screen.getByText('今日');
      fireEvent.click(todayButton);
      
      // JST基準の今日（2025-07-25）に移動するはず
      // 🔴 失敗予定: 現在はUTC基準のため間違った日付になる
      expect(defaultProps.onDateChange).toHaveBeenCalledWith('2025-07-25');
    });

    test('should handle New Year boundary in JST correctly', () => {
      // UTC 2024-12-31 16:00 (JST 2025-01-01 01:00) - JST元日午前1時
      const mockUTCDate = new Date('2024-12-31T16:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockUTCDate);

      render(<DateNavigation {...defaultProps} />);
      
      const todayButton = screen.getByText('今日');
      fireEvent.click(todayButton);
      
      // JST基準では2025-01-01が今日
      // 🔴 失敗予定: UTC基準だと2024-12-31になってしまう
      expect(defaultProps.onDateChange).toHaveBeenCalledWith('2025-01-01');
    });

    test('should consistently use JST across all date operations', () => {
      // UTC 2025-07-25 14:00 (JST 2025-07-26 00:00) - JST午前0時
      const mockUTCDate = new Date('2025-07-25T15:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockUTCDate);

      render(<DateNavigation {...defaultProps} />);
      
      // 前日・翌日操作でもJST基準であることを確認
      const prevButton = screen.getByRole('button', { name: /前の日/ });
      const nextButton = screen.getByRole('button', { name: /次の日/ });
      
      fireEvent.click(prevButton);
      // 現在日2025-07-21の前日 = 2025-07-20
      expect(defaultProps.onDateChange).toHaveBeenCalledWith('2025-07-20');
      
      fireEvent.click(nextButton);
      // 現在日2025-07-21の翌日 = 2025-07-22
      expect(defaultProps.onDateChange).toHaveBeenCalledWith('2025-07-22');
    });
  });
});
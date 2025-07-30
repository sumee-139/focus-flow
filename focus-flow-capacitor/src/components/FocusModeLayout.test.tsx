import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { FocusModeLayout } from './FocusModeLayout'
import { FocusModeProvider } from '../contexts/FocusModeContext'
import { Task } from '../types/Task'

// Mock hook dependencies
vi.mock('../hooks/useFocusTimer', () => ({
  useFocusTimer: vi.fn(() => ({
    timeRemaining: 1500,
    isActive: false,
    isPaused: false,
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
    reset: vi.fn()
  }))
}))

const mockTask: Task = {
  id: 'test-task-1',
  title: 'テスト用フォーカスタスク',
  description: 'フォーカスモードのテスト',
  isCompleted: false,
  createdAt: new Date(),
  targetDate: '2025-07-28',
  estimatedMinutes: 25
}

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FocusModeProvider>
    {children}
  </FocusModeProvider>
)

describe('FocusModeLayout - Phase 2.2b Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
    
    // Reset viewport
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })
  })

  test('should render desktop layout (1200px+) with left-right split', () => {
    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', { value: 1200 })
    
    render(
      <TestWrapper>
        <FocusModeLayout currentTask={mockTask} />
      </TestWrapper>
    )

    // デスクトップレイアウトの確認
    expect(screen.getByTestId('focus-mode-layout-desktop')).toBeInTheDocument()
    expect(screen.getByTestId('timer-section-left')).toBeInTheDocument()
    expect(screen.getByTestId('memo-section-right')).toBeInTheDocument()
    expect(screen.getByTestId('daily-memo-section-bottom')).toBeInTheDocument()
  })

  test('should render tablet layout (768px-1199px) with top-bottom split', () => {
    // Mock tablet viewport
    Object.defineProperty(window, 'innerWidth', { value: 1000 })
    
    render(
      <TestWrapper>
        <FocusModeLayout currentTask={mockTask} />
      </TestWrapper>
    )

    // タブレットレイアウトの確認
    expect(screen.getByTestId('focus-mode-layout-tablet')).toBeInTheDocument()
    expect(screen.getByTestId('timer-section-top')).toBeInTheDocument()
    expect(screen.getByTestId('memo-section-bottom')).toBeInTheDocument()
    expect(screen.getByTestId('daily-memo-section-overlay')).toBeInTheDocument()
  })

  test('should render mobile layout (<768px) with vertical stack', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 })
    
    render(
      <TestWrapper>
        <FocusModeLayout currentTask={mockTask} />
      </TestWrapper>
    )

    // モバイルレイアウトの確認
    expect(screen.getByTestId('focus-mode-layout-mobile')).toBeInTheDocument()
    expect(screen.getByTestId('timer-section-compact')).toBeInTheDocument()
    expect(screen.getByTestId('memo-section-main')).toBeInTheDocument()
    expect(screen.getByTestId('daily-memo-section-float')).toBeInTheDocument()
  })

  test('should handle showDailyMemo toggle functionality', () => {
    render(
      <TestWrapper>
        <FocusModeLayout currentTask={mockTask} />
      </TestWrapper>
    )

    // ひらめきメモボタンの確認
    const toggleButton = screen.getByTestId('daily-memo-toggle-button')
    expect(toggleButton).toBeInTheDocument()
    expect(screen.queryByTestId('append-only-daily-memo')).not.toBeInTheDocument()

    // トグル実行
    fireEvent.click(toggleButton)
    expect(screen.getByTestId('append-only-daily-memo')).toBeInTheDocument()

    // 再度トグル実行
    fireEvent.click(toggleButton)
    expect(screen.queryByTestId('append-only-daily-memo')).not.toBeInTheDocument()
  })

  test('should handle Ctrl+I keyboard shortcut for daily memo toggle', () => {
    render(
      <TestWrapper>
        <FocusModeLayout currentTask={mockTask} />
      </TestWrapper>
    )

    // 初期状態確認
    expect(screen.queryByTestId('append-only-daily-memo')).not.toBeInTheDocument()

    // Ctrl+I キーボードショートカット実行
    fireEvent.keyDown(document, { key: 'i', ctrlKey: true })
    expect(screen.getByTestId('append-only-daily-memo')).toBeInTheDocument()

    // 再度実行
    fireEvent.keyDown(document, { key: 'i', ctrlKey: true })
    expect(screen.queryByTestId('append-only-daily-memo')).not.toBeInTheDocument()
  })

  test('should integrate with existing CircularTimer component', () => {
    render(
      <TestWrapper>
        <FocusModeLayout currentTask={mockTask} />
      </TestWrapper>
    )

    // CircularTimerの統合確認
    expect(screen.getByTestId('circular-timer')).toBeInTheDocument()
    
    // Mock上書きによりアクティブなフォーカスモードが表示される
    expect(screen.getByText('🎯 テスト用フォーカスタスク')).toBeInTheDocument()
    expect(screen.getByText('中程度制約')).toBeInTheDocument()
  })

  test('should display CircularTimer with task info when focus mode is active', async () => {
    // Mock active focus mode
    vi.mock('../contexts/FocusModeContext', () => ({
      useFocusMode: vi.fn(() => ({
        focusMode: {
          isActive: true,
          currentTask: mockTask,
          constraintLevel: 'moderate',
          timeRemaining: 1500,
          isPaused: false
        },
        isInFocusMode: true,
        pauseFocus: vi.fn(),
        resumeFocus: vi.fn(),
        endFocus: vi.fn(),
        focusProgress: 25
      })),
      FocusModeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
    }))

    render(<FocusModeLayout currentTask={mockTask} />)

    // アクティブなフォーカスモード表示確認
    expect(screen.getByText('🎯 テスト用フォーカスタスク')).toBeInTheDocument()
    expect(screen.getByText('中程度制約')).toBeInTheDocument()
  })

  test('should integrate with EmbeddedTaskMemo with autoSave enabled', () => {
    render(
      <TestWrapper>
        <FocusModeLayout currentTask={mockTask} />
      </TestWrapper>
    )

    // TaskMemoの統合確認
    expect(screen.getByTestId('embedded-task-memo')).toBeInTheDocument()
    
    // autoSave機能の確認（属性確認）
    const memoComponent = screen.getByTestId('embedded-task-memo')
    expect(memoComponent).toHaveAttribute('data-auto-save', 'true')
  })
})
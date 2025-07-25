import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { MemoPanel } from './MemoPanel'
import type { Task } from '../types/Task'

// Mock dependencies
vi.mock('./TaskMemo', () => ({
  TaskMemo: ({ taskId, task }: { taskId: string; task: Task }) => (
    <div data-testid="task-memo">
      TaskMemo for task {taskId}: {task.title}
    </div>
  )
}))

vi.mock('./DailyMemo', () => ({
  DailyMemo: ({ embedded }: { embedded?: boolean }) => (
    <div data-testid="daily-memo">
      DailyMemo {embedded ? '(embedded)' : '(standalone)'}
    </div>
  )
}))

// Mock window.matchMedia for responsive tests
// 768px境界に統一
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: query === '(max-width: 768px)' ? false : true, // Default to desktop
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test Description',
  tags: ['work'],
  estimatedMinutes: 30,
  completed: false,
  order: 1,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z')
}

const defaultProps = {
  isOpen: true,
  mode: 'task' as const,
  selectedTaskId: 'task-1',
  selectedTask: mockTask,
  onClose: vi.fn(),
  onModeChange: vi.fn(),
  onTaskAction: vi.fn()
}

describe('MemoPanel - レスポンシブ切り替え', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should display as 70% side panel on desktop (>768px)', () => {
    // Set up desktop viewport
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 768px)' ? false : false, // デスクトップ = max-width query false
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))

    render(<MemoPanel {...defaultProps} />)
    
    const panel = screen.getByTestId('memo-panel')
    expect(panel).toHaveClass('memo-panel')
    expect(panel).toHaveClass('desktop')
    expect(panel).not.toHaveClass('mobile')
    
    // Should have overlay for desktop mode
    const overlay = screen.getByTestId('app-overlay')
    expect(overlay).toBeInTheDocument()
  })

  test('should display as fullscreen modal on mobile (≤768px)', () => {
    // Set up mobile viewport
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 768px)' ? true : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))

    render(<MemoPanel {...defaultProps} />)
    
    const panel = screen.getByTestId('memo-panel')
    expect(panel).toHaveClass('memo-panel')
    expect(panel).toHaveClass('mobile')
    expect(panel).not.toHaveClass('desktop')
    
    // Should not have overlay for mobile mode
    expect(screen.queryByTestId('app-overlay')).not.toBeInTheDocument()
  })

  test('should toggle between TaskMemo and DailyMemo views', () => {
    render(<MemoPanel {...defaultProps} />)
    
    // Should show TaskMemo initially
    expect(screen.getByTestId('task-memo')).toBeInTheDocument()
    expect(screen.queryByTestId('daily-memo')).not.toBeInTheDocument()
    
    // Find and click daily memo button
    const dailyButton = screen.getByRole('button', { name: /daily memo/i })
    fireEvent.click(dailyButton)
    
    expect(defaultProps.onModeChange).toHaveBeenCalledWith('daily')
  })

  test('should preserve memo content during view switching', () => {
    const { rerender } = render(<MemoPanel {...defaultProps} />)
    
    // Switch to daily mode
    rerender(<MemoPanel {...defaultProps} mode="daily" />)
    
    expect(screen.getByTestId('daily-memo')).toBeInTheDocument()
    expect(screen.queryByTestId('task-memo')).not.toBeInTheDocument()
    
    // Switch back to task mode
    rerender(<MemoPanel {...defaultProps} mode="task" />)
    
    expect(screen.getByTestId('task-memo')).toBeInTheDocument()
    expect(screen.queryByTestId('daily-memo')).not.toBeInTheDocument()
  })

  test('should show task actions in mobile TaskMemo mode', () => {
    // Set up mobile viewport
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 768px)' ? true : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))

    render(<MemoPanel {...defaultProps} />)
    
    // Should show task header in mobile mode
    const taskHeader = screen.getByTestId('task-header')
    expect(taskHeader).toBeInTheDocument()
    
    // Should show task actions
    const taskActions = screen.getByTestId('task-actions')
    expect(taskActions).toBeInTheDocument()
    
    // Test task action buttons (updated for Day 3 icons)
    const toggleButton = screen.getByLabelText('完了切り替え')
    const deleteButton = screen.getByLabelText('削除')
    const focusButton = screen.getByLabelText('フォーカスモード')
    
    expect(toggleButton).toBeInTheDocument()
    expect(deleteButton).toBeInTheDocument()
    expect(focusButton).toBeInTheDocument()
    
    // Test action callbacks
    fireEvent.click(toggleButton)
    expect(defaultProps.onTaskAction).toHaveBeenCalledWith('toggle', 'task-1')
    
    fireEvent.click(deleteButton)
    expect(defaultProps.onTaskAction).toHaveBeenCalledWith('delete', 'task-1')
    
    fireEvent.click(focusButton)
    expect(defaultProps.onTaskAction).toHaveBeenCalledWith('focus', 'task-1')
  })
})

describe('MemoPanel - モバイル専用機能 (Day 3)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should show task actions only in mobile task mode', () => {
    // Set up mobile viewport
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 768px)' ? true : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))

    // Test mobile task mode - should show actions
    render(<MemoPanel {...defaultProps} mode="task" />)
    expect(screen.getByTestId('task-actions')).toBeInTheDocument()
  })

  test('should hide task actions in mobile daily mode', () => {
    // Set up mobile viewport
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 768px)' ? true : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))

    // Test mobile daily mode - should NOT show actions
    render(<MemoPanel {...defaultProps} mode="daily" />)
    expect(screen.queryByTestId('task-actions')).not.toBeInTheDocument()
    expect(screen.queryByTestId('task-header')).not.toBeInTheDocument()
  })

  test('should handle task action callbacks correctly in mobile', () => {
    // Set up mobile viewport
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 768px)' ? true : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))

    render(<MemoPanel {...defaultProps} mode="task" />)
    
    // Test all three action buttons work correctly
    const toggleButton = screen.getByLabelText('完了切り替え')
    const deleteButton = screen.getByLabelText('削除')
    const focusButton = screen.getByLabelText('フォーカスモード')

    fireEvent.click(toggleButton)
    expect(defaultProps.onTaskAction).toHaveBeenCalledWith('toggle', 'task-1')

    fireEvent.click(deleteButton)
    expect(defaultProps.onTaskAction).toHaveBeenCalledWith('delete', 'task-1')

    fireEvent.click(focusButton)
    expect(defaultProps.onTaskAction).toHaveBeenCalledWith('focus', 'task-1')
  })

  test('should apply correct CSS classes for mobile responsiveness', () => {
    // Test desktop first
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 768px)' ? false : true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))

    const { unmount } = render(<MemoPanel {...defaultProps} />)
    let panel = screen.getByTestId('memo-panel')
    expect(panel).toHaveClass('desktop')
    expect(panel).not.toHaveClass('mobile')
    
    // Unmount to allow fresh mount with new mock
    unmount()

    // Switch to mobile and create fresh component
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 768px)' ? true : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))

    render(<MemoPanel {...defaultProps} />)
    panel = screen.getByTestId('memo-panel')
    expect(panel).toHaveClass('mobile')
    expect(panel).not.toHaveClass('desktop')
  })

  test('should maintain performance on mobile viewport changes', () => {
    const addEventListener = vi.fn()
    const removeEventListener = vi.fn()
    
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 768px)' ? false : true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener,
      removeEventListener,
      dispatchEvent: vi.fn()
    }))

    const { unmount } = render(<MemoPanel {...defaultProps} />)
    
    // Should add event listener on mount
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    
    // Should remove event listener on unmount
    unmount()
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
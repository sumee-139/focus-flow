import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { TaskItem } from './TaskItem'
import type { Task } from '../types/Task'

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  estimatedMinutes: 30,
  alarmTime: '14:30',
  order: 1,
  completed: false,
  tags: ['work'],
  createdAt: new Date(),
  updatedAt: new Date(),
  // 🆕 Phase 2.2a: 日付管理拡張フィールド
  targetDate: new Date().toISOString().split('T')[0], // 今日の日付
  actualMinutes: 25, // 実際に要した時間
  completedAt: new Date()
}

describe('TaskItem', () => {
  test('should display task with unified icon', () => {
    const mockHandlers = {
      onToggle: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onReorder: vi.fn()
    }

    render(<TaskItem task={mockTask} {...mockHandlers} />)
    
    // 統一アイコン（📝）の使用確認
    expect(screen.getByText('📝')).toBeInTheDocument()
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  test('should not use colors for priority distinction', () => {
    const mockHandlers = {
      onToggle: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onReorder: vi.fn()
    }

    const { container } = render(<TaskItem task={mockTask} {...mockHandlers} />)
    
    // 色による区別が使用されていないことを確認
    const taskElement = container.querySelector('.task-item')
    const computedStyle = window.getComputedStyle(taskElement!)
    
    // 優先度を示す色（赤・黄・緑）が使用されていないことを確認
    expect(computedStyle.backgroundColor).not.toMatch(/(red|green|yellow|#ff|#00ff|#ffff)/)
  })

  test('should toggle completion on checkbox click', () => {
    const mockToggle = vi.fn()
    const mockHandlers = {
      onToggle: mockToggle,
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onReorder: vi.fn()
    }

    render(<TaskItem task={mockTask} {...mockHandlers} />)
    
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    
    expect(mockToggle).toHaveBeenCalledWith('1')
  })

  test('should show drag handle for reordering', () => {
    const mockHandlers = {
      onToggle: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onReorder: vi.fn()
    }

    render(<TaskItem task={mockTask} {...mockHandlers} />)
    
    // ドラッグハンドル（⋮⋮）の表示確認
    expect(screen.getByText('⋮⋮')).toBeInTheDocument()
  })

  test('should not display progress percentage', () => {
    const mockHandlers = {
      onToggle: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onReorder: vi.fn()
    }

    render(<TaskItem task={mockTask} {...mockHandlers} />)
    
    // 進捗率表示がないことを確認
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  // 🔴 Red Phase: タスク完了機能の追加テスト
  test('should handle completed task correctly', () => {
    const completedTask: Task = {
      ...mockTask,
      completed: true
    }
    const mockHandlers = {
      onToggle: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onReorder: vi.fn()
    }

    render(<TaskItem task={completedTask} {...mockHandlers} />)
    
    // 完了状態のタスクには completed クラスが付与される
    const taskElement = screen.getByTestId(`task-item-${completedTask.id}`)
    expect(taskElement).toHaveClass('completed')
    
    // チェックボックスがチェック状態
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  test('should handle uncompleted task correctly', () => {
    const mockHandlers = {
      onToggle: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onReorder: vi.fn()
    }

    render(<TaskItem task={mockTask} {...mockHandlers} />)
    
    // 未完了タスクには completed クラスが付与されない
    const taskElement = screen.getByTestId(`task-item-${mockTask.id}`)
    expect(taskElement).not.toHaveClass('completed')
    
    // チェックボックスが未チェック状態
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  // 🔴 Red Phase - Phase 2.2a TaskItem拡張テスト（実装前に失敗するテスト）
  describe('Phase 2.2a Extensions - Target Date & Statistics', () => {
    test('should display target date in Today-First UX format', () => {
      const mockHandlers = {
        onToggle: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onReorder: vi.fn()
      }

      render(<TaskItem task={mockTask} {...mockHandlers} />)
      
      // 今日の日付の場合、「今日」と表示されること
      expect(screen.getByText(/今日/)).toBeInTheDocument()
      
      // 具体的な日付（YYYY-MM-DD）は表示されないこと
      const today = new Date().toISOString().split('T')[0]
      expect(screen.queryByText(today)).not.toBeInTheDocument()
    })

    test('should display relative dates for tomorrow and yesterday', () => {
      const mockHandlers = {
        onToggle: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onReorder: vi.fn()
      }

      // 明日のタスク
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowTask: Task = {
        ...mockTask,
        id: '2',
        targetDate: tomorrow.toISOString().split('T')[0]
      }

      const { rerender } = render(<TaskItem task={tomorrowTask} {...mockHandlers} />)
      expect(screen.getByText(/明日/)).toBeInTheDocument()

      // 昨日のタスク
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayTask: Task = {
        ...mockTask,
        id: '3',
        targetDate: yesterday.toISOString().split('T')[0]
      }

      rerender(<TaskItem task={yesterdayTask} {...mockHandlers} />)
      expect(screen.getByText(/昨日/)).toBeInTheDocument()
    })

    test('should display actual minutes when task is completed', () => {
      const completedTaskWithActual: Task = {
        ...mockTask,
        completed: true,
        actualMinutes: 35
      }
      
      const mockHandlers = {
        onToggle: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onReorder: vi.fn()
      }

      render(<TaskItem task={completedTaskWithActual} {...mockHandlers} />)
      
      // 実際に要した時間が表示されること
      expect(screen.getByText('実際: 35分')).toBeInTheDocument()
      
      // 見積との比較表示（見積30分 vs 実際35分）
      expect(screen.getByText('⏱️ 30分')).toBeInTheDocument() // 見積時間
    })

    test('should not display actual minutes for incomplete tasks', () => {
      const incompleteTask: Task = {
        ...mockTask,
        completed: false,
        actualMinutes: undefined
      }
      
      const mockHandlers = {
        onToggle: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onReorder: vi.fn()
      }

      render(<TaskItem task={incompleteTask} {...mockHandlers} />)
      
      // 未完了タスクには実際時間は表示されない
      expect(screen.queryByText(/実際:/)).not.toBeInTheDocument()
    })

    test('should display completion timestamp for completed tasks', () => {
      const completedTime = new Date('2025-07-23T15:30:00')
      const completedTaskWithTime: Task = {
        ...mockTask,
        completed: true,
        completedAt: completedTime
      }
      
      const mockHandlers = {
        onToggle: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onReorder: vi.fn()
      }

      render(<TaskItem task={completedTaskWithTime} {...mockHandlers} />)
      
      // 完了時刻が表示されること
      expect(screen.getByText('完了: 15:30')).toBeInTheDocument()
    })

    test('should maintain Design Philosophy - no progress bars or colors', () => {
      const mockHandlers = {
        onToggle: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onReorder: vi.fn()
      }

      render(<TaskItem task={mockTask} {...mockHandlers} />)
      
      // プログレスバーは使用しない
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      
      // パーセンテージ表示は使用しない
      expect(screen.queryByText(/%/)).not.toBeInTheDocument()
      
      // 優先度を示す色は使用しない（Design Philosophy準拠）
      const { container } = render(<TaskItem task={mockTask} {...mockHandlers} />)
      const taskElement = container.querySelector('.task-item')
      const computedStyle = window.getComputedStyle(taskElement!)
      expect(computedStyle.backgroundColor).not.toMatch(/(red|green|yellow|#ff|#00ff|#ffff)/)
    })
  })

  // 🔴 Red Phase: レスポンシブ対応テスト（Phase 2.2a 新要素対応）
  describe('Responsive Design - Phase 2.2a Elements', () => {
    test('should display task meta information in mobile layout', () => {
      // モバイル環境をシミュレート
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(max-width: 480px)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      const mockHandlers = {
        onToggle: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onReorder: vi.fn()
      }

      render(<TaskItem task={mockTask} {...mockHandlers} />)
      
      // モバイルでも日付・統計情報がすべて表示されること
      expect(screen.getByText(/今日/)).toBeInTheDocument()
      expect(screen.getByText('⏱️ 30分')).toBeInTheDocument()
      
      // レイアウトがモバイル対応していること（task-metaの flex-wrap が有効）
      const taskMeta = document.querySelector('.task-meta')
      expect(taskMeta).toBeInTheDocument()
    })

    test('should handle text overflow in mobile with proper wrapping', () => {
      const longTitleTask: Task = {
        ...mockTask,
        title: 'とても長いタスクタイトルでモバイル画面での表示をテストします',
        description: 'これも長い説明文でモバイルでの表示がどうなるかをテストするためのものです'
      }

      const mockHandlers = {
        onToggle: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onReorder: vi.fn()
      }

      render(<TaskItem task={longTitleTask} {...mockHandlers} />)
      
      // 長いテキストが表示されること（word-wrap によって）
      expect(screen.getByText(longTitleTask.title)).toBeInTheDocument()
      expect(screen.getByText(longTitleTask.description!)).toBeInTheDocument()
    })

    test('should maintain proper touch targets for mobile buttons', () => {
      const mockHandlers = {
        onToggle: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onReorder: vi.fn()
      }

      render(<TaskItem task={mockTask} {...mockHandlers} />)
      
      // モバイル用ボタンのサイズが適切であること（44x44px推奨）
      const editButton = screen.getByTestId('edit-task-button')
      const deleteButton = screen.getByTestId('delete-task-button')
      
      expect(editButton).toBeInTheDocument()
      expect(deleteButton).toBeInTheDocument()
      
      // ボタンがクリック可能であること
      fireEvent.click(editButton)
      expect(mockHandlers.onEdit).toHaveBeenCalledWith('1')
      
      fireEvent.click(deleteButton)
      expect(mockHandlers.onDelete).toHaveBeenCalledWith('1')
    })

    test('should adapt Phase 2.2a statistics display for smaller screens', () => {
      const completedTaskWithStats: Task = {
        ...mockTask,
        completed: true,
        actualMinutes: 45,
        completedAt: new Date('2025-07-23T16:45:00')
      }

      const mockHandlers = {
        onToggle: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onReorder: vi.fn()
      }

      render(<TaskItem task={completedTaskWithStats} {...mockHandlers} />)
      
      // 統計情報がモバイルでも適切に表示されること
      expect(screen.getByText(/今日/)).toBeInTheDocument()
      expect(screen.getByText('実際: 45分')).toBeInTheDocument()
      expect(screen.getByText('完了: 16:45')).toBeInTheDocument()
      
      // gap とフレックスレイアウトで適切に配置されること
      const taskMeta = document.querySelector('.task-meta')
      expect(taskMeta).toHaveClass('task-meta')
    })
  })
})
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
  updatedAt: new Date()
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
    const taskElement = screen.getByTestId('task-item')
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
    const taskElement = screen.getByTestId('task-item')
    expect(taskElement).not.toHaveClass('completed')
    
    // チェックボックスが未チェック状態
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })
})
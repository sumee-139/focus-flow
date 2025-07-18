import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { AddTaskForm } from './AddTaskForm'

// 🔴 Red Phase: 失敗するテストを先に書く（実装より前）
describe('AddTaskForm', () => {
  test('should render add task form with required fields', () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    // 必須フィールドの存在確認
    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/estimated minutes/i)).toBeInTheDocument()
    expect(screen.getByText(/add task/i)).toBeInTheDocument()
    expect(screen.getByText(/cancel/i)).toBeInTheDocument()
  })

  test('should create task with unified icon when submitted', async () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    // フォームに入力
    const titleInput = screen.getByLabelText(/task title/i)
    const minutesInput = screen.getByLabelText(/estimated minutes/i)
    
    fireEvent.change(titleInput, {
      target: { value: 'Test Task' }
    })
    fireEvent.change(minutesInput, {
      target: { value: '30' }
    })
    
    // フォーム送信
    fireEvent.submit(screen.getByRole('form'))
    
    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Task',
        estimatedMinutes: 30,
        completed: false,
        id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        order: expect.any(Number),
        tags: []
      }))
    })
  })

  test('should not allow submission with empty title', async () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    // タイトルを空のままでフォーム送信
    fireEvent.submit(screen.getByRole('form'))
    
    // バリデーションエラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    })
    
    // onAddが呼ばれないことを確認
    expect(mockOnAdd).not.toHaveBeenCalled()
  })

  test('should call onCancel when cancel button is clicked', () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  test('should support optional fields', async () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    // 全フィールドに入力
    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: 'Complex Task' }
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Task description' }
    })
    fireEvent.change(screen.getByLabelText(/estimated minutes/i), {
      target: { value: '60' }
    })
    fireEvent.change(screen.getByLabelText(/alarm time/i), {
      target: { value: '14:30' }
    })
    fireEvent.change(screen.getByLabelText(/tags/i), {
      target: { value: 'work,urgent' }
    })
    
    fireEvent.submit(screen.getByRole('form'))
    
    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Complex Task',
        description: 'Task description',
        estimatedMinutes: 60,
        alarmTime: '14:30',
        tags: ['work', 'urgent']
      }))
    })
  })

  test('should comply with Design Philosophy - no priority or deadline fields', () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    // Design Philosophy禁止フィールドが存在しないことを確認
    expect(screen.queryByLabelText(/priority/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/deadline/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/due date/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/importance/i)).not.toBeInTheDocument()
  })
})
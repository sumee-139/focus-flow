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

// 🔴 Red Phase - Phase 2.1改修版テスト（失敗するテストを先に書く）
describe('TaskForm - 改修版 (Phase 2.1)', () => {
  test('should accept valid estimated minutes input', async () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    // ユーザーフィードバック：30分で「有効な値を入力してください」エラーが出る問題
    const titleInput = screen.getByLabelText(/タスクタイトル/i)
    const minutesInput = screen.getByLabelText(/見積時間/i)
    
    fireEvent.change(titleInput, { target: { value: 'テストタスク' } })
    fireEvent.change(minutesInput, { target: { value: '30' } })
    
    fireEvent.submit(screen.getByRole('form'))
    
    // 30分の入力でエラーが出ずに正常に送信されることを確認
    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith(expect.objectContaining({
        estimatedMinutes: 30
      }))
    })
    
    // バリデーションエラーが表示されないことを確認
    expect(screen.queryByText(/有効な値を入力してください/i)).not.toBeInTheDocument()
  })

  test('should display proper Japanese labels', () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    // 日本語ラベルの存在確認
    expect(screen.getByLabelText(/タスクタイトル/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/説明/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/見積時間/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/アラーム時刻/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/タグ/i)).toBeInTheDocument()
    
    // ボタンの日本語化確認
    expect(screen.getByRole('button', { name: /タスクを追加/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /キャンセル/i })).toBeInTheDocument()
  })

  test('should have unified design tone', () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    const form = screen.getByRole('form')
    
    // Design Philosophy準拠のクラス名確認
    expect(form).toHaveClass('add-task-form')
    
    // 統一されたbutton要素の確認
    const submitButton = screen.getByRole('button', { name: /タスクを追加/i })
    const cancelButton = screen.getByRole('button', { name: /キャンセル/i })
    
    expect(submitButton).toHaveClass('btn', 'btn-primary')
    expect(cancelButton).toHaveClass('btn', 'btn-secondary')
  })

  test('should render buttons properly', () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    // ボタンが適切に表示されることを確認（ユーザーフィードバック：ボタンの視認性問題）
    const submitButton = screen.getByRole('button', { name: /タスクを追加/i })
    const cancelButton = screen.getByRole('button', { name: /キャンセル/i })
    
    // ボタンが表示されていることを確認
    expect(submitButton).toBeVisible()
    expect(cancelButton).toBeVisible()
    
    // フォームアクションコンテナ内に配置されていることを確認
    const formActions = document.querySelector('.form-actions')
    expect(formActions).toContainElement(submitButton)
    expect(formActions).toContainElement(cancelButton)
  })

  test('should show Japanese validation error messages', async () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    // タイトルを空のままでフォーム送信
    fireEvent.submit(screen.getByRole('form'))
    
    // 日本語バリデーションエラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText(/タスクタイトルは必須です/i)).toBeInTheDocument()
    })
    
    // 英語エラーメッセージが表示されないことを確認
    expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument()
  })
})
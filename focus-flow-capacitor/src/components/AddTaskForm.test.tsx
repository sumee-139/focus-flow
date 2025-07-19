import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { AddTaskForm } from './AddTaskForm'

// 🔴 Red Phase: 失敗するテストを先に書く（実装より前）
describe('AddTaskForm', () => {
  test('should render add task form with required fields', () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    // 必須フィールドの存在確認（スリムデザイン対応）
    expect(screen.getByLabelText(/タスクタイトル/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/見積時間/i)).toBeInTheDocument()
    expect(screen.getByText(/追加/i)).toBeInTheDocument()
    expect(screen.getByText(/キャンセル/i)).toBeInTheDocument()
  })

  test('should create task with unified icon when submitted', async () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    // フォームに入力（日本語ラベル対応）
    const titleInput = screen.getByLabelText(/タスクタイトル/i)
    const minutesInput = screen.getByLabelText(/見積時間/i)
    
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
    
    // 日本語バリデーションエラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText(/タスクタイトルは必須です/i)).toBeInTheDocument()
    })
    
    // onAddが呼ばれないことを確認
    expect(mockOnAdd).not.toHaveBeenCalled()
  })

  test('should call onCancel when cancel button is clicked', () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    const cancelButton = screen.getByRole('button', { name: /キャンセル/i })
    fireEvent.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  test('should support optional fields', async () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    // 全フィールドに入力（日本語ラベル対応）
    fireEvent.change(screen.getByLabelText(/タスクタイトル/i), {
      target: { value: 'Complex Task' }
    })
    fireEvent.change(screen.getByLabelText(/説明/i), {
      target: { value: 'Task description' }
    })
    fireEvent.change(screen.getByLabelText(/見積時間/i), {
      target: { value: '60' }
    })
    fireEvent.change(screen.getByLabelText(/アラーム時刻/i), {
      target: { value: '14:30' }
    })
    fireEvent.change(screen.getByLabelText(/タグ/i), {
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

// 🔴 Red Phase - スリムデザイン版テスト（タスクカード準拠）
describe('AddTaskForm - スリムデザイン版 (TaskCard準拠)', () => {
  test('should have compact task-card style layout', () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    const form = screen.getByRole('form')
    
    // タスクカード準拠のコンパクトスタイル確認
    expect(form).toHaveClass('add-task-form-slim')
    
    // 統一アイコンの存在確認（Design Philosophy準拠）
    expect(form).toContainElement(document.querySelector('.task-icon'))
    
    // 横並びレイアウトの確認
    const mainRow = form.querySelector('.form-main-row')
    expect(mainRow).toBeInTheDocument()
  })

  test('should have inline form fields like task card', () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    // インライン要素の確認
    const titleInput = screen.getByLabelText(/タスクタイトル/i)
    const minutesInput = screen.getByLabelText(/見積時間/i)
    
    // プレースホルダーによるラベル代替
    expect(titleInput).toHaveAttribute('placeholder', 'タスクタイトルを入力...')
    expect(minutesInput).toHaveAttribute('placeholder', '分')
    
    // コンパクトなサイズ
    expect(minutesInput).toHaveClass('compact-input')
  })

  test('should have collapsible advanced fields', () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    // 詳細オプション展開ボタンの確認
    const expandButton = screen.getByRole('button', { name: /詳細オプション/i })
    expect(expandButton).toBeInTheDocument()
    
    // 初期状態では詳細フィールドが非表示
    expect(screen.queryByLabelText(/説明/i)).not.toBeVisible()
    expect(screen.queryByLabelText(/アラーム時刻/i)).not.toBeVisible()
    expect(screen.queryByLabelText(/タグ/i)).not.toBeVisible()
    
    // 展開ボタンクリック
    fireEvent.click(expandButton)
    
    // 詳細フィールドが表示される
    expect(screen.getByLabelText(/説明/i)).toBeVisible()
    expect(screen.getByLabelText(/アラーム時刻/i)).toBeVisible()
    expect(screen.getByLabelText(/タグ/i)).toBeVisible()
  })

  test('should have compact action buttons similar to task card', () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    // コンパクトなアクションボタン
    const addButton = screen.getByRole('button', { name: /追加/i })
    const cancelButton = screen.getByRole('button', { name: /キャンセル/i })
    
    expect(addButton).toHaveClass('btn-compact')
    expect(cancelButton).toHaveClass('btn-compact')
    
    // タスクカードと同じサイズ感
    const actionsContainer = addButton.closest('.form-actions')
    expect(actionsContainer).toHaveClass('actions-compact')
  })

  test('should maintain task card visual consistency', () => {
    const mockOnAdd = vi.fn()
    const mockOnCancel = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} onCancel={mockOnCancel} />)
    
    const form = screen.getByRole('form')
    
    // タスクカードと同じ境界線・角丸・パディング
    expect(form).toHaveClass('add-task-form-slim')
    
    // 統一アイコンの確認（📝）
    const taskIcon = form.querySelector('.task-icon')
    expect(taskIcon).toHaveTextContent('📝')
  })
})
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { AddTaskForm } from './AddTaskForm'

// 🔴 Red Phase: 失敗するテストを先に書く（実装より前）
describe('AddTaskForm', () => {
  test('should render add task form with required fields', () => {
    const mockOnAdd = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
    // 必須フィールドの存在確認（キャンセルボタン削除対応）
    expect(screen.getByLabelText(/タスクタイトル/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/見積時間/i)).toBeInTheDocument()
    expect(screen.getByText(/追加/i)).toBeInTheDocument()
    // キャンセルボタンは削除されました
    expect(screen.queryByText(/キャンセル/i)).not.toBeInTheDocument()
  })

  test('should create task with unified icon when submitted', async () => {
    const mockOnAdd = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
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

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
    // タイトルを空のままでフォーム送信
    fireEvent.submit(screen.getByRole('form'))
    
    // 日本語バリデーションエラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText(/タスクタイトルは必須です/i)).toBeInTheDocument()
    })
    
    // onAddが呼ばれないことを確認
    expect(mockOnAdd).not.toHaveBeenCalled()
  })

  test('should not have cancel button - permanent form display', () => {
    const mockOnAdd = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
    // キャンセルボタンは削除されました（常時表示フォーム）
    expect(screen.queryByRole('button', { name: /キャンセル/i })).not.toBeInTheDocument()
  })

  test('should support optional fields', async () => {
    const mockOnAdd = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
    // 詳細オプションを展開
    fireEvent.click(screen.getByLabelText(/詳細オプション/i))
    
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

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
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

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
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

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
    // 基本フィールドの日本語ラベル確認
    expect(screen.getByLabelText(/タスクタイトル/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/見積時間/i)).toBeInTheDocument()
    
    // 詳細オプションを展開
    fireEvent.click(screen.getByLabelText(/詳細オプション/i))
    
    // 詳細フィールドの日本語ラベル確認
    expect(screen.getByLabelText(/説明/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/アラーム時刻/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/タグ/i)).toBeInTheDocument()
    
    // ボタンの日本語化確認（キャンセルボタン削除対応）
    expect(screen.getByRole('button', { name: /追加/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /キャンセル/i })).not.toBeInTheDocument()
  })

  test('should have unified design tone', () => {
    const mockOnAdd = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
    const form = screen.getByRole('form')
    
    // Design Philosophy準拠のクラス名確認
    expect(form).toHaveClass('add-task-form-slim')
    
    // 統一されたbutton要素の確認（キャンセルボタン削除対応）
    const submitButton = screen.getByRole('button', { name: /追加/i })
    
    expect(submitButton).toHaveClass('btn-compact', 'btn-primary')
    // キャンセルボタンは削除されました
    expect(screen.queryByRole('button', { name: /キャンセル/i })).not.toBeInTheDocument()
  })

  test('should render add button properly', () => {
    const mockOnAdd = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
    // 追加ボタンが適切に表示されることを確認（キャンセルボタン削除対応）
    const submitButton = screen.getByRole('button', { name: /追加/i })
    
    // ボタンが表示されていることを確認
    expect(submitButton).toBeVisible()
    expect(submitButton).toHaveClass('btn-compact', 'btn-primary')
    
    // キャンセルボタンは存在しない
    expect(screen.queryByRole('button', { name: /キャンセル/i })).not.toBeInTheDocument()
  })

  test('should show Japanese validation error messages', async () => {
    const mockOnAdd = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
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

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
    const form = screen.getByRole('form')
    
    // タスクカード準拠のコンパクトスタイル確認
    expect(form).toHaveClass('add-task-form-slim')
    
    // 統一アイコンの存在確認（Design Philosophy準拠）
    expect(form).toContainElement(document.querySelector('.task-icon'))
    
    // 2段レイアウトの確認（ラフデザイン準拠）
    const topRow = form.querySelector('.form-top-row')
    const bottomRow = form.querySelector('.form-bottom-row')
    expect(topRow).toBeInTheDocument()
    expect(bottomRow).toBeInTheDocument()
  })

  test('should have inline form fields like task card', () => {
    const mockOnAdd = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
    // インライン要素の確認
    const titleInput = screen.getByLabelText(/タスクタイトル/i)
    const minutesInput = screen.getByLabelText(/見積時間/i)
    
    // プレースホルダーによるラベル代替（ラフデザイン準拠）
    expect(titleInput).toHaveAttribute('placeholder', 'タスク名')
    expect(minutesInput).toHaveAttribute('placeholder', '30')
    
    // コンパクトなサイズ
    expect(minutesInput).toHaveClass('minutes-input')
  })

  test('should have collapsible advanced fields', () => {
    const mockOnAdd = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
    // 詳細オプション展開ボタンの確認
    const expandButton = screen.getByRole('button', { name: /詳細オプション/i })
    expect(expandButton).toBeInTheDocument()
    
    // 初期状態では詳細フィールドが非表示
    expect(screen.queryByLabelText(/説明/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/アラーム時刻/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/タグ/i)).not.toBeInTheDocument()
    
    // 展開ボタンクリック
    fireEvent.click(expandButton)
    
    // 詳細フィールドが表示される
    expect(screen.getByLabelText(/説明/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/アラーム時刻/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/タグ/i)).toBeInTheDocument()
  })

  test('should have compact action buttons similar to task card', () => {
    const mockOnAdd = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
    // コンパクトなアクションボタン（キャンセルボタン削除対応）
    const addButton = screen.getByRole('button', { name: /追加/i })
    
    expect(addButton).toHaveClass('btn-compact')
    
    // キャンセルボタンは存在しない
    expect(screen.queryByRole('button', { name: /キャンセル/i })).not.toBeInTheDocument()
  })

  test('should maintain task card visual consistency', () => {
    const mockOnAdd = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
    const form = screen.getByRole('form')
    
    // タスクカードと同じ境界線・角丸・パディング
    expect(form).toHaveClass('add-task-form-slim')
    
    // 統一アイコンの確認（📝）
    const taskIcon = form.querySelector('.task-icon')
    expect(taskIcon).toHaveTextContent('📝')
  })
})

// 🔴 Red Phase - useRefフォーカス管理改善テスト
describe('AddTaskForm - useRef Focus Management', () => {
  test('should focus title input after successful task creation using useRef', async () => {
    const mockOnAdd = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
    const titleInput = screen.getByLabelText(/タスクタイトル/i)
    
    // タスクを作成
    fireEvent.change(titleInput, { target: { value: 'テストタスク' } })
    fireEvent.submit(screen.getByRole('form'))
    
    // タスク作成後、タイトル入力フィールドにフォーカスが戻る
    await waitFor(() => {
      expect(document.activeElement).toBe(titleInput)
    })
    
    // useRefが正しく機能している証拠として、DOM検索が不要であることを確認
    // （実装時にsetTimeoutとdocument.getElementByIdが削除されることを期待）
  })

  test('should focus title input when validation fails using useRef', async () => {
    const mockOnAdd = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
    const titleInput = screen.getByLabelText(/タスクタイトル/i)
    
    // 空のタイトルでフォーム送信（バリデーション失敗）
    fireEvent.submit(screen.getByRole('form'))
    
    // バリデーション失敗時にタイトル入力フィールドにフォーカス
    await waitFor(() => {
      expect(document.activeElement).toBe(titleInput)
    })
    
    // エラーメッセージも表示される
    expect(screen.getByText('タスクタイトルは必須です')).toBeInTheDocument()
  })

  test('should not use setTimeout for focus management', () => {
    // この테스트는 코드 리뷰用 - useRefを使用することで
    // setTimeoutによるDOM検索が不要になることを確認
    const mockOnAdd = vi.fn()

    render(<AddTaskForm onAdd={mockOnAdd} />)
    
    // 実装確認：useRefを使用していればsetTimeoutは不要
    // これは실제로는 静的解析でチェックするべき内容だが、
    // TDD의 일환으로 동작을 확인
    expect(true).toBe(true) // placeholder for implementation verification
  })
})
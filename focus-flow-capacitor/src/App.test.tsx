import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import App from './App'

// 🔴 Red Phase: タスク削除機能の失敗するテストを先に書く
describe('App - Task Delete Functionality', () => {
  test('should show confirm dialog when delete button is clicked', async () => {
    render(<App />)
    
    // 既存のタスクの削除ボタンを探す
    const deleteButtons = screen.getAllByLabelText(/delete/i)
    expect(deleteButtons.length).toBeGreaterThan(0)
    
    // 最初のタスクの削除ボタンをクリック
    fireEvent.click(deleteButtons[0])
    
    // ConfirmDialogが表示される
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/delete task/i)).toBeInTheDocument()
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    })
  })

  test('should delete task when confirm is clicked in dialog', async () => {
    render(<App />)
    
    // 初期タスク数を確認
    const initialTasks = screen.getAllByTestId('task-item')
    const initialTaskCount = initialTasks.length
    
    // 最初のタスクの削除ボタンをクリック
    const deleteButtons = screen.getAllByLabelText(/delete/i)
    fireEvent.click(deleteButtons[0])
    
    // ConfirmDialogが表示される
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // 確認ボタンをクリック（ダイアログ内の削除ボタン）
    fireEvent.click(screen.getByText('Delete'))
    
    // タスクが削除される
    await waitFor(() => {
      const remainingTasks = screen.getAllByTestId('task-item')
      expect(remainingTasks.length).toBe(initialTaskCount - 1)
    })
    
    // ダイアログが閉じられる
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('should cancel deletion when cancel is clicked in dialog', async () => {
    render(<App />)
    
    // 初期タスク数を確認
    const initialTasks = screen.getAllByTestId('task-item')
    const initialTaskCount = initialTasks.length
    
    // 最初のタスクの削除ボタンをクリック
    const deleteButtons = screen.getAllByLabelText(/delete/i)
    fireEvent.click(deleteButtons[0])
    
    // ConfirmDialogが表示される
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // キャンセルボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    
    // タスクが削除されない
    await waitFor(() => {
      const remainingTasks = screen.getAllByTestId('task-item')
      expect(remainingTasks.length).toBe(initialTaskCount)
    })
    
    // ダイアログが閉じられる
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('should cancel deletion when escape key is pressed', async () => {
    render(<App />)
    
    // 初期タスク数を確認
    const initialTasks = screen.getAllByTestId('task-item')
    const initialTaskCount = initialTasks.length
    
    // 最初のタスクの削除ボタンをクリック
    const deleteButtons = screen.getAllByLabelText(/delete/i)
    fireEvent.click(deleteButtons[0])
    
    // ConfirmDialogが表示される
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Escapeキーを押す
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    
    // タスクが削除されない
    await waitFor(() => {
      const remainingTasks = screen.getAllByTestId('task-item')
      expect(remainingTasks.length).toBe(initialTaskCount)
    })
    
    // ダイアログが閉じられる
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('should follow ConfirmDialog usage guidelines - only for irreversible operations', async () => {
    render(<App />)
    
    // 可逆的操作（タスク完了）にはConfirmDialogを使用しない
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    
    // ConfirmDialogが表示されないことを確認
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    
    // 不可逆的操作（削除）にはConfirmDialogを使用する
    const deleteButtons = screen.getAllByLabelText(/delete/i)
    fireEvent.click(deleteButtons[0])
    
    // ConfirmDialogが表示されることを確認
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
})

// 🔴 Red Phase - フォーム固定表示のテスト（Add Task Button廃止）
describe('App - Permanent Task Form Display', () => {
  test('should always display slim task form at top of task list', () => {
    render(<App />)
    
    // スリムタスクフォームが常時表示されている
    const taskForm = screen.getByRole('form')
    expect(taskForm).toBeInTheDocument()
    expect(taskForm).toHaveClass('add-task-form-slim')
    
    // タスクリストの上部に配置されている
    const tasksSection = screen.getByTestId('tasks-section')
    const formArea = screen.getByTestId('form-fixed-area')
    const scrollableArea = screen.getByTestId('tasks-scrollable-area')
    
    expect(formArea).toBeInTheDocument()
    expect(scrollableArea).toBeInTheDocument()
    
    // フォームエリアがスクロールエリアより前に配置されている
    const formAreaIndex = Array.from(tasksSection.children).indexOf(formArea)
    const scrollableAreaIndex = Array.from(tasksSection.children).indexOf(scrollableArea)
    expect(formAreaIndex).toBeLessThan(scrollableAreaIndex)
  })

  test('should not display "Add Task" button anymore', () => {
    render(<App />)
    
    // 従来の「Add Task」ボタンが存在しない
    expect(screen.queryByRole('button', { name: /add task/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/\+ add task/i)).not.toBeInTheDocument()
    
    // 代わりにスリムフォームが常時表示
    expect(screen.getByRole('form')).toBeInTheDocument()
  })

  test('should have separate scrollable areas for form and task list', () => {
    render(<App />)
    
    // フォーム固定表示エリア
    const formArea = screen.getByTestId('form-fixed-area')
    expect(formArea).toBeInTheDocument()
    expect(formArea).toHaveClass('form-fixed-area')
    
    // スクロール可能なタスクリストエリア
    const scrollableArea = screen.getByTestId('tasks-scrollable-area')
    expect(scrollableArea).toBeInTheDocument()
    expect(scrollableArea).toHaveClass('tasks-scrollable-area')
    
    // フォームがスクロールエリア外に配置
    expect(formArea).toContainElement(screen.getByRole('form'))
    expect(scrollableArea).not.toContainElement(screen.getByRole('form'))
  })

  test('should add new task and clear form without page reload', async () => {
    render(<App />)
    
    // 初期タスク数を確認
    const initialTasks = screen.getAllByTestId('task-item')
    const initialTaskCount = initialTasks.length
    
    // フォームに入力
    const titleInput = screen.getByLabelText(/タスクタイトル/i)
    fireEvent.change(titleInput, { target: { value: '新しいテスト用タスク' } })
    
    // 追加ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /追加/i }))
    
    // タスクが追加される
    await waitFor(() => {
      const newTasks = screen.getAllByTestId('task-item')
      expect(newTasks.length).toBe(initialTaskCount + 1)
    })
    
    // フォームがクリアされる
    expect(titleInput).toHaveValue('')
    
    // フォームは引き続き表示されている
    expect(screen.getByRole('form')).toBeInTheDocument()
    
    // 新しいタスクがリストに表示される
    expect(screen.getByText('新しいテスト用タスク')).toBeInTheDocument()
  })

  test('should maintain proper focus management when adding tasks', async () => {
    render(<App />)
    
    // タイトル入力フィールドにフォーカス
    const titleInput = screen.getByLabelText(/タスクタイトル/i)
    titleInput.focus()
    expect(document.activeElement).toBe(titleInput)
    
    // タスク追加
    fireEvent.change(titleInput, { target: { value: 'フォーカステスト' } })
    fireEvent.click(screen.getByRole('button', { name: /追加/i }))
    
    // タスク追加後、フォーカスがタイトル入力に戻る
    await waitFor(() => {
      expect(document.activeElement).toBe(titleInput)
    })
  })
})
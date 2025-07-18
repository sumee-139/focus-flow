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
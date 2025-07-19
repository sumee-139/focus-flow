import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import App from './App'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// 🔴 Red Phase: LocalStorage統合の失敗するテストを先に書く
describe('App - LocalStorage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should load tasks from localStorage on initial render', async () => {
    const storedTasks = [
      {
        id: 'stored-1',
        title: 'Stored Task 1',
        description: 'Task from localStorage',
        estimatedMinutes: 60,
        order: 1,
        completed: false,
        tags: ['stored'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'stored-2',
        title: 'Stored Task 2',
        description: 'Another stored task',
        estimatedMinutes: 30,
        order: 2,
        completed: true,
        tags: ['stored', 'completed'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedTasks))

    render(<App />)

    // localStorage からタスクが読み込まれることを確認
    await waitFor(() => {
      expect(screen.getByText('Stored Task 1')).toBeInTheDocument()
      expect(screen.getByText('Stored Task 2')).toBeInTheDocument()
    })

    expect(localStorageMock.getItem).toHaveBeenCalledWith('focus-flow-tasks')
  })

  test('should save tasks to localStorage when new task is added', async () => {
    localStorageMock.getItem.mockReturnValue(null)

    render(<App />)

    // 追加ボタンをクリック（Phase 2.1: slim design対応）
    fireEvent.click(screen.getByRole('button', { name: /追加/i }))

    // フォームに入力（Phase 2.1: 日本語ラベル対応）
    fireEvent.change(screen.getByLabelText(/タスクタイトル/i), {
      target: { value: 'New Task from Test' }
    })

    // フォームを送信
    fireEvent.submit(screen.getByRole('form'))

    // localStorageにタスクが保存されることを確認
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'focus-flow-tasks',
        expect.stringContaining('New Task from Test')
      )
    })
  })

  test('should save tasks to localStorage when task is toggled', async () => {
    localStorageMock.getItem.mockReturnValue(null)

    render(<App />)

    // 既存のタスクのチェックボックスをクリック
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    // タスクの状態変更がlocalStorageに保存される
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'focus-flow-tasks',
        expect.stringContaining('"completed":true')
      )
    })
  })

  test('should save tasks to localStorage when task is deleted', async () => {
    localStorageMock.getItem.mockReturnValue(null)

    render(<App />)

    // 最初のタスクを削除
    const deleteButtons = screen.getAllByLabelText(/delete/i)
    fireEvent.click(deleteButtons[0])

    // 確認ダイアログで削除を確認
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Delete'))

    // タスクの削除がlocalStorageに保存される
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  test('should handle localStorage errors gracefully', async () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    // エラーが発生してもアプリが正常に動作すること
    render(<App />)

    // デフォルトタスクが表示される
    await waitFor(() => {
      expect(screen.getByText(/FocusFlowプロトタイプ/)).toBeInTheDocument()
    })
  })

  test('should handle invalid JSON in localStorage gracefully', async () => {
    localStorageMock.getItem.mockReturnValue('invalid-json{')

    // 不正なJSONでもアプリが正常に動作すること
    render(<App />)

    // デフォルトタスクが表示される
    await waitFor(() => {
      expect(screen.getByText(/FocusFlowプロトタイプ/)).toBeInTheDocument()
    })
  })

  test('should migrate Date objects correctly', async () => {
    const storedTasksWithStringDates = [
      {
        id: 'date-test-1',
        title: 'Date Test Task',
        description: 'Task with string dates',
        estimatedMinutes: 60,
        order: 1,
        completed: false,
        tags: ['date-test'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedTasksWithStringDates))

    render(<App />)

    // 文字列の日付が正しく処理されることを確認
    await waitFor(() => {
      expect(screen.getByText('Date Test Task')).toBeInTheDocument()
    })
  })
})
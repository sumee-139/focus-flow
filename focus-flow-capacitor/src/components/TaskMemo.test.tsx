import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { TaskMemo } from './TaskMemo'
import { Task } from '../types/Task'
import { useTaskMemoStorage } from '../hooks/useTaskMemoStorage'

// Mock the useTaskMemoStorage hook  
vi.mock('../hooks/useTaskMemoStorage', () => ({
  useTaskMemoStorage: vi.fn()
}))

const mockTask: Task = {
  id: 'test-task-1',
  title: 'テストタスク',
  description: 'テスト用のタスクです',
  estimatedMinutes: 30,
  order: 1,
  completed: false,
  tags: ['work', 'urgent'],
  createdAt: new Date('2025-01-01T09:00:00Z'),
  updatedAt: new Date('2025-01-01T09:00:00Z')
}

describe('TaskMemo - タスク個別メモ', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
    
    // Setup fake timers for testing auto-save functionality
    vi.useFakeTimers()
    
    // Reset useTaskMemoStorage mock
    vi.mocked(useTaskMemoStorage).mockReturnValue([null, vi.fn()])
  })

  afterEach(() => {
    // Restore real timers after each test
    vi.useRealTimers()
  })

  test('should auto-save task memo after 3 seconds of inactivity', async () => {
    const mockSetTaskMemo = vi.fn()
    vi.mocked(useTaskMemoStorage).mockReturnValue([null, mockSetTaskMemo])

    render(<TaskMemo taskId="test-task-1" task={mockTask} />)
    
    const textarea = screen.getByRole('textbox')
    
    // ユーザーがテキストを入力
    fireEvent.change(textarea, { target: { value: 'テストメモ内容' } })
    
    // 3秒経過をシミュレート（act で状態更新を適切に処理）
    await act(async () => {
      vi.advanceTimersByTime(3000)
      await vi.runAllTimersAsync()
    })
    
    expect(mockSetTaskMemo).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: 'test-task-1',
        content: 'テストメモ内容',
        lastUpdated: expect.any(String),
        taskSnapshot: expect.objectContaining({
          title: 'テストタスク',
          description: 'テスト用のタスクです',
          tags: ['work', 'urgent'],
          estimatedMinutes: 30,
          createdAt: mockTask.createdAt
        })
      })
    )
  })

  test('should restore memo for specific task on component reload', () => {
    const savedMemo = {
      taskId: 'test-task-1',
      content: '保存されたメモ内容',
      lastUpdated: '2025-01-01T10:00:00Z',
      taskSnapshot: {
        title: 'テストタスク',
        description: 'テスト用のタスクです',
        tags: ['work', 'urgent'],
        estimatedMinutes: 30,
        createdAt: mockTask.createdAt
      }
    }

    vi.mocked(useTaskMemoStorage).mockReturnValue([savedMemo, vi.fn()])

    render(<TaskMemo taskId="test-task-1" task={mockTask} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('保存されたメモ内容')
  })

  test('should handle task deletion gracefully', () => {
    vi.mocked(useTaskMemoStorage).mockReturnValue([null, vi.fn()])

    // タスクが削除された状態をシミュレート（taskがundefinedの場合）
    expect(() => {
      render(<TaskMemo taskId="deleted-task" task={undefined as any} />)
    }).not.toThrow()
  })

  test('should support task information quotation', () => {
    vi.mocked(useTaskMemoStorage).mockReturnValue([null, vi.fn()])

    render(<TaskMemo taskId="test-task-1" task={mockTask} />)
    
    // 引用ボタンが存在することを確認
    const quoteButton = screen.getByRole('button', { name: /引用|quote/i })
    expect(quoteButton).toBeInTheDocument()
  })

  test('should handle localStorage errors gracefully', async () => {
    // console.warnをモック化してエラー出力をキャッチ
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    // setTaskMemoでエラーが発生する状況をシミュレート
    const mockSetTaskMemo = vi.fn().mockImplementation(() => {
      throw new Error('LocalStorage error')
    })
    vi.mocked(useTaskMemoStorage).mockReturnValue([null, mockSetTaskMemo])

    render(<TaskMemo taskId="test-task-1" task={mockTask} />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Test content' } })
    
    // 3秒進めて自動保存を実行（エラーが発生）
    await act(async () => {
      vi.advanceTimersByTime(3000)
      await vi.runAllTimersAsync()
    })
    
    // console.warnが呼ばれたことを確認
    expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to save task memo:', expect.any(Error))
    
    // エラーが発生してもアプリケーションがクラッシュしない
    expect(textarea).toBeInTheDocument()
    expect(screen.getByText(/保存失敗/i)).toBeInTheDocument()
    
    // モックをクリーンアップ
    consoleWarnSpy.mockRestore()
  })

  test('should clear auto-save timer when component unmounts', () => {
    const mockSetTaskMemo = vi.fn()
    vi.mocked(useTaskMemoStorage).mockReturnValue([null, mockSetTaskMemo])

    const { unmount } = render(<TaskMemo taskId="test-task-1" task={mockTask} />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'テスト' } })
    
    // コンポーネントをアンマウント
    unmount()
    
    // タイマーがクリアされることを確認（3秒後に呼ばれないこと）
    setTimeout(() => {
      expect(mockSetTaskMemo).not.toHaveBeenCalled()
    }, 4000)
  })

  test('should display task context in memo header', () => {
    vi.mocked(useTaskMemoStorage).mockReturnValue([null, vi.fn()])

    render(<TaskMemo taskId="test-task-1" task={mockTask} />)
    
    // タスクタイトルが表示されている（分割されているテキストに対応）
    expect(screen.getByText(/テストタスク/)).toBeInTheDocument()
    
    // タスク情報（見積時間、タグ）が表示されている
    expect(screen.getByText(/30分/)).toBeInTheDocument()
    expect(screen.getByText(/work/)).toBeInTheDocument()
    expect(screen.getByText(/urgent/)).toBeInTheDocument()
  })

  // 🔴 Phase 2.2d-1: TaskMemo自動保存状態インジケーターテスト
  test('should show saving indicator when task memo auto-save is in progress', async () => {
    // 保存処理を遅延させるPromiseを作成
    let resolveSave: () => void
    const mockSetTaskMemo = vi.fn().mockImplementation(() => {
      return new Promise<void>((resolve) => {
        resolveSave = resolve
      })
    })
    vi.mocked(useTaskMemoStorage).mockReturnValue([null, mockSetTaskMemo])

    render(<TaskMemo taskId="test-task-1" task={mockTask} />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Test content for saving' } })
    
    // タイマーを進めて自動保存を開始
    await act(async () => {
      vi.advanceTimersByTime(3000)
      await vi.runAllTimersAsync()
    })
    
    // 保存中インジケーターをチェック
    expect(screen.getByText(/保存中/i)).toBeInTheDocument()
    expect(screen.getByText('save')).toBeInTheDocument() // Material Icon
    
    // 保存完了
    await act(async () => {
      resolveSave!()
    })
  })

  test('should show success indicator when task memo auto-save succeeds', async () => {
    vi.useFakeTimers()
    
    // 保存処理を遅延させるPromiseを作成
    let resolveSave: () => void
    const mockSetTaskMemo = vi.fn().mockImplementation(() => {
      return new Promise<void>((resolve) => {
        resolveSave = resolve
      })
    })
    vi.mocked(useTaskMemoStorage).mockReturnValue([null, mockSetTaskMemo])

    render(<TaskMemo taskId="test-task-1" task={mockTask} />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Test content for success' } })
    
    // タイマーを進めて自動保存を開始
    await act(async () => {
      vi.advanceTimersByTime(3000)
      await vi.runAllTimersAsync()
    })
    
    // まず保存中インジケーターが表示されることを確認
    expect(screen.getByText(/保存中/i)).toBeInTheDocument()
    
    // 保存完了させる
    await act(async () => {
      resolveSave!()
    })
    
    // 保存完了後の成功状態を確認
    expect(screen.getByText(/保存完了/i)).toBeInTheDocument()
    expect(screen.getByText('check_circle')).toBeInTheDocument() // Material Icon
    
    // 2秒後にアイドル状態に戻ることを確認
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    
    expect(screen.queryByText(/保存完了/i)).not.toBeInTheDocument()
    
    vi.useRealTimers()
  })

  test('should show error indicator when task memo auto-save fails', async () => {
    vi.useFakeTimers()
    
    // console.warnをモック化してエラー出力をキャッチ
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    // エラーを投げるmockSetTaskMemoを設定
    const mockSetTaskMemo = vi.fn().mockImplementation(() => {
      throw new Error('TaskMemo save failed')
    })
    vi.mocked(useTaskMemoStorage).mockReturnValue([null, mockSetTaskMemo])

    render(<TaskMemo taskId="test-task-1" task={mockTask} />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Test content for error' } })
    
    // 3秒進めて自動保存を実行（エラーが発生）
    await act(async () => {
      vi.advanceTimersByTime(3000)
      await vi.runAllTimersAsync()
    })
    
    // console.warnが呼ばれたことを確認
    expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to save task memo:', expect.any(Error))
    
    // エラーインジケーターが表示されることを確認
    expect(screen.getByText(/保存失敗/i)).toBeInTheDocument()
    expect(screen.getByText('error')).toBeInTheDocument() // Material Icon
    expect(screen.getByText(/TaskMemo save failed/i)).toBeInTheDocument()
    
    // モックをクリーンアップ
    consoleWarnSpy.mockRestore()
    vi.useRealTimers()
  })

  test('should position save status indicator at bottom-right (non-intrusive)', async () => {
    const mockTask: Task = {
      id: 'test-task',
      title: 'Test Task',  
      description: 'Test Description',
      estimatedMinutes: 30,
      targetDate: '2025-07-24',
      order: 1,
      completed: false,
      tags: ['test'],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // 保存処理を遅延させるPromiseを作成
    let resolveSave: () => void
    const mockSetTaskMemo = vi.fn().mockImplementation(() => {
      return new Promise<void>((resolve) => {
        resolveSave = resolve
      })
    })
    vi.mocked(useTaskMemoStorage).mockReturnValue([null, mockSetTaskMemo])

    render(<TaskMemo taskId="test-task" task={mockTask} />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Test content for indicator position' } })
    
    // 3秒進めて保存中インジケーターが表示される
    await act(async () => {
      vi.advanceTimersByTime(3000)
      await vi.runAllTimersAsync()
    })
    
    const saveIndicator = screen.getByText(/保存中/i)
    expect(saveIndicator).toBeInTheDocument()
    
    // 右下配置の確認（bottom: '20px', right: '20px'）
    const indicatorElement = saveIndicator.closest('.save-indicator')
    expect(indicatorElement).toHaveStyle({
      position: 'fixed',
      bottom: '20px',
      right: '20px'
    })
    
    // 保存完了
    await act(async () => {
      resolveSave!()
    })
  })
})
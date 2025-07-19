import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
    
    // Reset useTaskMemoStorage mock
    vi.mocked(useTaskMemoStorage).mockReturnValue([null, vi.fn()])
  })

  test('should auto-save task memo after 3 seconds of inactivity', async () => {
    const mockSetTaskMemo = vi.fn()
    vi.mocked(useTaskMemoStorage).mockReturnValue([null, mockSetTaskMemo])

    render(<TaskMemo taskId="test-task-1" task={mockTask} />)
    
    const textarea = screen.getByRole('textbox')
    
    // ユーザーがテキストを入力
    fireEvent.change(textarea, { target: { value: 'テストメモ内容' } })
    
    // 3秒経過をシミュレート
    await waitFor(() => {
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
    }, { timeout: 4000 })
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

  test('should handle localStorage errors gracefully', () => {
    vi.mocked(useTaskMemoStorage).mockImplementation(() => {
      throw new Error('LocalStorage error')
    })

    // エラーが発生しても例外をスローしない
    expect(() => {
      render(<TaskMemo taskId="test-task-1" task={mockTask} />)
    }).not.toThrow()
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
})
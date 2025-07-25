import { describe, test, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTaskMemoStorage } from './useTaskMemoStorage'
import { TaskMemoData } from '../types/Task'
import { useLocalStorage } from './useLocalStorage'

// Mock the useLocalStorage hook
vi.mock('./useLocalStorage', () => ({
  useLocalStorage: vi.fn()
}))

describe('useTaskMemoStorage - 個別キー管理', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should save task memo with individual key pattern', () => {
    const mockSetTaskMemo = vi.fn()
    vi.mocked(useLocalStorage).mockReturnValue([null, mockSetTaskMemo])

    const { result } = renderHook(() => useTaskMemoStorage('test-task-1'))
    
    const testMemoData: TaskMemoData = {
      taskId: 'test-task-1',
      content: 'テストメモ',
      lastUpdated: '2025-01-01T10:00:00Z',
      taskSnapshot: {
        title: 'テストタスク',
        description: 'テスト説明',
        tags: ['work'],
        estimatedMinutes: 30,
        createdAt: new Date('2025-01-01T09:00:00Z')
      }
    }

    // 正しいキーパターンでuseLocalStorageが呼ばれることを確認
    expect(vi.mocked(useLocalStorage)).toHaveBeenCalledWith(
      'focus-flow-task-memo-test-task-1',
      null
    )

    // セット関数が利用可能であることを確認
    const [, setTaskMemo] = result.current
    setTaskMemo(testMemoData)
    
    expect(mockSetTaskMemo).toHaveBeenCalledWith(testMemoData)
  })

  test('should load correct task memo by taskId', () => {
    const savedMemo: TaskMemoData = {
      taskId: 'task-123',
      content: '保存されたメモ',
      lastUpdated: '2025-01-01T10:00:00Z',
      taskSnapshot: {
        title: '保存されたタスク',
        description: undefined,
        tags: ['test'],
        estimatedMinutes: 15,
        createdAt: new Date('2025-01-01T09:00:00Z')
      }
    }

    vi.mocked(useLocalStorage).mockReturnValue([savedMemo, vi.fn()])

    const { result } = renderHook(() => useTaskMemoStorage('task-123'))
    
    // 正しいキーで保存されたデータが読み込まれることを確認
    expect(vi.mocked(useLocalStorage)).toHaveBeenCalledWith(
      'focus-flow-task-memo-task-123',
      null
    )

    const [taskMemo] = result.current
    expect(taskMemo).toEqual(savedMemo)
  })

  test('should handle multiple task memos independently', () => {
    
    // タスク1用のhook
    vi.mocked(useLocalStorage).mockReturnValueOnce([
      { taskId: 'task-1', content: 'メモ1', lastUpdated: '2025-01-01T10:00:00Z', taskSnapshot: {} },
      vi.fn()
    ])
    
    // タスク2用のhook
    vi.mocked(useLocalStorage).mockReturnValueOnce([
      { taskId: 'task-2', content: 'メモ2', lastUpdated: '2025-01-01T11:00:00Z', taskSnapshot: {} },
      vi.fn()
    ])

    const { result: result1 } = renderHook(() => useTaskMemoStorage('task-1'))
    const { result: result2 } = renderHook(() => useTaskMemoStorage('task-2'))

    // 各タスクが独立したキーを使用することを確認
    expect(vi.mocked(useLocalStorage)).toHaveBeenNthCalledWith(1, 'focus-flow-task-memo-task-1', null)
    expect(vi.mocked(useLocalStorage)).toHaveBeenNthCalledWith(2, 'focus-flow-task-memo-task-2', null)

    // 各タスクが独立したデータを持つことを確認
    const [memo1] = result1.current
    const [memo2] = result2.current
    
    expect(memo1?.content).toBe('メモ1')
    expect(memo2?.content).toBe('メモ2')
    expect(memo1?.taskId).toBe('task-1')
    expect(memo2?.taskId).toBe('task-2')
  })
})
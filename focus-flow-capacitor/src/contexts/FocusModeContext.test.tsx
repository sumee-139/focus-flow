import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FocusModeProvider, useFocusMode } from './FocusModeContext'
import { Task } from '../types/Task'

// テスト用のタスクデータ
const mockTask1: Task = {
  id: 'task-1',
  title: 'First Task',
  description: 'First task description',
  estimatedMinutes: 60,
  targetDate: '2025-01-15',
  order: 1,
  completed: false,
  tags: ['work'],
  createdAt: new Date('2025-01-15T10:00:00Z'),
  updatedAt: new Date('2025-01-15T10:00:00Z')
}

const mockTask2: Task = {
  id: 'task-2',
  title: 'Second Task',
  description: 'Second task description',
  estimatedMinutes: 45,
  targetDate: '2025-01-15',
  order: 2,
  completed: false,
  tags: ['personal'],
  createdAt: new Date('2025-01-15T11:00:00Z'),
  updatedAt: new Date('2025-01-15T11:00:00Z')
}

// テスト用コンポーネント
const TestComponent: React.FC = () => {
  const { startFocus, focusMode, isInFocusMode } = useFocusMode()

  return (
    <div>
      <div data-testid="focus-status">
        {isInFocusMode ? 'IN_FOCUS' : 'NOT_IN_FOCUS'}
      </div>
      <div data-testid="selected-task">
        {focusMode.currentTask ? focusMode.currentTask.title : 'NO_TASK'}
      </div>
      <button 
        data-testid="start-focus-task1"
        onClick={() => startFocus(mockTask1, 'moderate', 25)}
      >
        Start Focus Task 1
      </button>
      <button 
        data-testid="start-focus-task2"
        onClick={() => startFocus(mockTask2, 'moderate', 25)}
      >
        Start Focus Task 2
      </button>
    </div>
  )
}

describe('FocusModeContext - Task Selection Bug Fix', () => {
  beforeEach(() => {
    // LocalStorageをクリア
    localStorage.clear()
  })

  test('should store selected task when focus mode starts with task 1', async () => {
    render(
      <FocusModeProvider>
        <TestComponent />
      </FocusModeProvider>
    )

    // 初期状態確認
    expect(screen.getByTestId('focus-status')).toHaveTextContent('NOT_IN_FOCUS')
    expect(screen.getByTestId('selected-task')).toHaveTextContent('NO_TASK')

    // Task 1でフォーカスモード開始
    fireEvent.click(screen.getByTestId('start-focus-task1'))

    await waitFor(() => {
      expect(screen.getByTestId('focus-status')).toHaveTextContent('IN_FOCUS')
      expect(screen.getByTestId('selected-task')).toHaveTextContent('First Task')
    })
  })

  test('should store selected task when focus mode starts with task 2', async () => {
    render(
      <FocusModeProvider>
        <TestComponent />
      </FocusModeProvider>
    )

    // Task 2でフォーカスモード開始
    fireEvent.click(screen.getByTestId('start-focus-task2'))

    await waitFor(() => {
      expect(screen.getByTestId('focus-status')).toHaveTextContent('IN_FOCUS')
      expect(screen.getByTestId('selected-task')).toHaveTextContent('Second Task')
    })
  })

  test('should maintain selected task throughout focus session', async () => {
    render(
      <FocusModeProvider>
        <TestComponent />
      </FocusModeProvider>
    )

    // Task 2でフォーカスモード開始
    fireEvent.click(screen.getByTestId('start-focus-task2'))

    await waitFor(() => {
      expect(screen.getByTestId('selected-task')).toHaveTextContent('Second Task')
    })

    // 少し待機してもタスクが維持されているか確認
    await new Promise(resolve => setTimeout(resolve, 100))
    
    expect(screen.getByTestId('selected-task')).toHaveTextContent('Second Task')
  })

  test('should handle switching between different tasks', async () => {
    render(
      <FocusModeProvider>
        <TestComponent />
      </FocusModeProvider>
    )

    // Task 1でフォーカスモード開始
    fireEvent.click(screen.getByTestId('start-focus-task1'))

    await waitFor(() => {
      expect(screen.getByTestId('selected-task')).toHaveTextContent('First Task')
    })

    // Task 2に切り替え（新しいフォーカスセッション）
    fireEvent.click(screen.getByTestId('start-focus-task2'))

    await waitFor(() => {
      expect(screen.getByTestId('selected-task')).toHaveTextContent('Second Task')
    })
  })
})
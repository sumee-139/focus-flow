import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import App from './App'

// Focus Mode Task Selection Bug Fix Tests - Simplified Version
describe('App - Focus Mode Task Selection Bug Fix', () => {

// 固定日時でテストを安定化（2025-07-25 09:00 JST）
const MOCK_DATE = new Date('2025-07-25T00:00:00.000Z') // UTC midnight = JST 09:00

// Mock window.matchMedia for MemoPanel and Mobile Detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: query === '(max-width: 768px)' ? false : // Mobile detection: false for desktop
             query === '(max-width: 1200px)' ? false : // MemoPanel: false for desktop
             false, // Default to false for other queries
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// LocalStorage cleanup and date mock before each test
beforeEach(() => {
  localStorage.clear()
  
  // 固定日時でテストを安定化
  vi.useFakeTimers()
  vi.setSystemTime(MOCK_DATE)
})

afterEach(() => {
  vi.useRealTimers()
})

// 🔴 Red Phase: Focus Mode Task Selection Bug - Failing Tests
test('should display correct task memo in focus mode when user selects specific task', async () => {
  render(<App />)

  // Wait for initial render
  await waitFor(() => {
    expect(screen.getByText('FocusFlow')).toBeInTheDocument()
  })

  // Find tasks
  const taskItems = screen.getAllByTestId(/^task-item-/)
  expect(taskItems.length).toBeGreaterThan(1)

  // Get the second task title for verification
  const secondTaskItem = taskItems[1]
  const secondTaskTitle = secondTaskItem.querySelector('.task-title')?.textContent
  expect(secondTaskTitle).toBeTruthy()

  // Find and click the focus button on the second task
  const focusButton = secondTaskItem.querySelector('[data-testid="start-focus-button"]')
  expect(focusButton).toBeInTheDocument()

  fireEvent.click(focusButton!)

  // Wait for focus mode to activate
  await waitFor(() => {
    const focusLayout = screen.queryByTestId('focus-mode-layout-desktop')
    expect(focusLayout).toBeInTheDocument()
  }, { timeout: 3000 })

  // 🔴 RED PHASE: This should fail with current implementation
  // Because App.tsx:872 passes `filteredTasks.find(task => !task.completed) || filteredTasks[0]`
  // instead of the user-selected task from FocusModeContext
  const embeddedTaskMemo = screen.getByTestId('embedded-task-memo')
  const displayedTaskTitle = embeddedTaskMemo.querySelector('.embedded-task-title')?.textContent

  // This assertion will FAIL because current code shows first task instead of selected task
  expect(displayedTaskTitle).toContain(secondTaskTitle)
})

test('should maintain selected task throughout focus session', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByText('FocusFlow')).toBeInTheDocument()
  })

  const taskItems = screen.getAllByTestId(/^task-item-/)
  const secondTaskTitle = taskItems[1].querySelector('.task-title')?.textContent
  
  // Start focus on second task
  const focusButton = taskItems[1].querySelector('[data-testid="start-focus-button"]')
  fireEvent.click(focusButton!)

  await waitFor(() => {
    const focusLayout = screen.queryByTestId('focus-mode-layout-desktop')
    expect(focusLayout).toBeInTheDocument()
  })

  const embeddedTaskMemo = screen.getByTestId('embedded-task-memo')
  const displayedTaskTitle = embeddedTaskMemo.querySelector('.embedded-task-title')?.textContent
  
  // This will also FAIL due to the same bug
  expect(displayedTaskTitle).toContain(secondTaskTitle)
})

})
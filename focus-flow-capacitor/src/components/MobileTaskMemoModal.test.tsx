import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MobileTaskMemoModal } from './MobileTaskMemoModal'

// MobileTaskMemoModal用のテスト定数
const MOCK_TASK_ID = 'task-123'
const MOCK_TASK_TITLE = 'Test Task Title'
const MOCK_TASK_MEMO_CONTENT = 'Test task memo content'
const MODAL_HEADER_TEXT = '📝 タスクメモ'
const CLOSE_BUTTON_TEXT = '← 戻る'

describe('Mobile Task Memo Modal', () => {
  let mockOnSave: ReturnType<typeof vi.fn>
  let mockOnClose: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnSave = vi.fn()
    mockOnClose = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should open full screen modal on mobile', () => {
    render(
      <MobileTaskMemoModal
        isOpen={true}
        taskId={MOCK_TASK_ID}
        taskTitle={MOCK_TASK_TITLE}
        taskMemoContent={MOCK_TASK_MEMO_CONTENT}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    // モーダルが全画面で表示される
    const modal = screen.getByTestId('mobile-task-memo-modal')
    expect(modal).toBeInTheDocument()
    expect(modal).toHaveClass('mobile-modal')
    expect(modal).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      zIndex: '4000' // Z_INDEX.MODAL
    })
  })

  test('should display task title in header', () => {
    render(
      <MobileTaskMemoModal
        isOpen={true}
        taskId={MOCK_TASK_ID}
        taskTitle={MOCK_TASK_TITLE}
        taskMemoContent=""
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    // ヘッダーにタスクタイトルが表示される
    const header = screen.getByText(MOCK_TASK_TITLE)
    expect(header).toBeInTheDocument()
    
    // モーダルヘッダーのテキスト
    const modalHeader = screen.getByText(MODAL_HEADER_TEXT)
    expect(modalHeader).toBeInTheDocument()
  })

  test('should close when back button is clicked', () => {
    render(
      <MobileTaskMemoModal
        isOpen={true}
        taskId={MOCK_TASK_ID}
        taskTitle={MOCK_TASK_TITLE}
        taskMemoContent=""
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const backButton = screen.getByText(CLOSE_BUTTON_TEXT)
    fireEvent.click(backButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  test('should save and close on save action', async () => {
    render(
      <MobileTaskMemoModal
        isOpen={true}
        taskId={MOCK_TASK_ID}
        taskTitle={MOCK_TASK_TITLE}
        taskMemoContent=""
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const textarea = screen.getByLabelText(/タスクメモ/i)
    const newContent = 'New task memo content'
    
    fireEvent.change(textarea, { target: { value: newContent } })

    // 3秒後に自動保存されることを確認
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(newContent)
    }, { timeout: 4000 })
  })

  test('should load existing memo content', () => {
    render(
      <MobileTaskMemoModal
        isOpen={true}
        taskId={MOCK_TASK_ID}
        taskTitle={MOCK_TASK_TITLE}
        taskMemoContent={MOCK_TASK_MEMO_CONTENT}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const textarea = screen.getByLabelText(/タスクメモ/i)
    expect(textarea).toHaveValue(MOCK_TASK_MEMO_CONTENT)
  })

  test('should not render when closed', () => {
    render(
      <MobileTaskMemoModal
        isOpen={false}
        taskId={MOCK_TASK_ID}
        taskTitle={MOCK_TASK_TITLE}
        taskMemoContent=""
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    // モーダルが表示されない
    const modal = screen.queryByTestId('mobile-task-memo-modal')
    expect(modal).not.toBeInTheDocument()
  })

  test('should handle task actions in header', () => {
    render(
      <MobileTaskMemoModal
        isOpen={true}
        taskId={MOCK_TASK_ID}
        taskTitle={MOCK_TASK_TITLE}
        taskMemoContent=""
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    // タスク情報がヘッダーに表示される
    const taskInfo = screen.getByTestId('task-info-header')
    expect(taskInfo).toBeInTheDocument()
    expect(taskInfo).toHaveTextContent(MOCK_TASK_TITLE)
  })

  test('should apply proper mobile styling', () => {
    render(
      <MobileTaskMemoModal
        isOpen={true}
        taskId={MOCK_TASK_ID}
        taskTitle={MOCK_TASK_TITLE}
        taskMemoContent=""
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    // メモエリアが適切なサイズで表示
    const memoArea = screen.getByLabelText(/タスクメモ/i)
    expect(memoArea).toHaveStyle({
      width: '100%',
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem'
    })
  })
})
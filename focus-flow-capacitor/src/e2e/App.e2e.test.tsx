// App E2E Tests - Phase 2.2a
// Today-First UXのためのEnd-to-Endワークフローテスト

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import App from '../App'

// Mock window.matchMedia for consistent testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: query === '(max-width: 768px)' ? false : false, // Desktop for E2E
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

describe('App E2E Tests - Phase 2.2a Today-First UX Workflows', () => {
  beforeEach(() => {
    // E2Eテスト前にLocalStorageをクリア
    localStorage.clear()
  })

  // 🔴 Red Phase: 明日のタスク準備フロー（Today-First UXの核心）
  test('Workflow: Tomorrow Task Planning (Today → Tomorrow)', async () => {
    render(<App />)

    // Step 1: 今日の状態を確認（DateNavigationの今日ボタンに特定）
    const todayButton = screen.getByRole('button', { name: /今日/ })
    expect(todayButton).toBeInTheDocument()
    expect(todayButton).toHaveClass('today-button-active')
    expect(screen.getByText(/2025年7月24日/)).toBeInTheDocument()

    // Step 2: 「次へ」ボタンで明日に移動
    const nextButton = screen.getByLabelText(/翌日/)
    fireEvent.click(nextButton)

    await waitFor(() => {
      // 明日の日付に変更されている
      expect(screen.getByText(/2025年7月25日/)).toBeInTheDocument()
      // 「今日」ボタンが非アクティブになっている
      expect(todayButton).not.toHaveClass('today-button-active')
    })

    // Step 3: 明日のタスクを追加
    const titleInput = screen.getByLabelText(/タスクタイトル/)
    fireEvent.change(titleInput, { target: { value: '明日の重要会議の準備' } })
    
    const addButton = screen.getByRole('button', { name: /追加/ })
    fireEvent.click(addButton)

    await waitFor(() => {
      // 明日のタスクが追加されている
      expect(screen.getByText('明日の重要会議の準備')).toBeInTheDocument()
      // タスク統計が更新されている
      expect(screen.getByTestId('statistics-container')).toHaveTextContent(/1件/)
    })

    // Step 4: 「今日」ボタンで今日に戻る
    fireEvent.click(todayButton)

    await waitFor(() => {
      // 今日の日付に戻っている
      expect(screen.getByText(/2025年7月24日/)).toBeInTheDocument()
      expect(todayButton).toHaveClass('today-button-active')
      // 明日のタスクは表示されない（日付フィルタリング）
      expect(screen.queryByText('明日の重要会議の準備')).not.toBeInTheDocument()
    })

    // Step 5: 再度明日に移動して追加したタスクが保持されていることを確認
    fireEvent.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('明日の重要会議の準備')).toBeInTheDocument()
    })
  })

  // 🔴 Red Phase: DatePicker統合ワークフロー
  test('Workflow: DatePicker Calendar Selection', async () => {
    render(<App />)

    // Step 1: DatePickerボタンをクリック
    const datePickerButton = screen.getByLabelText(/日付選択/)
    fireEvent.click(datePickerButton)

    await waitFor(() => {
      // DatePickerモーダルが開く
      expect(screen.getByTestId('date-picker-modal')).toBeInTheDocument()
      expect(screen.getByText('日付を選択')).toBeInTheDocument()
    })

    // Step 2: カレンダーで3日後を選択（仮定: 7月27日）
    const targetDay = screen.getByLabelText(/27日/)
    fireEvent.click(targetDay)

    await waitFor(() => {
      // DatePickerが閉じる
      expect(screen.queryByTestId('date-picker-modal')).not.toBeInTheDocument()
      // 選択した日付に移動
      expect(screen.getByText(/2025年7月27日/)).toBeInTheDocument()
    })

    // Step 3: 選択した日付でタスクを追加
    const titleInput = screen.getByLabelText(/タスクタイトル/)
    fireEvent.change(titleInput, { target: { value: '週末プロジェクトの準備' } })
    
    const addButton = screen.getByRole('button', { name: /追加/ })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('週末プロジェクトの準備')).toBeInTheDocument()
    })

    // Step 4: 「今日」ボタンで戻って、再度DatePickerで同じ日付を選択
    const todayButton = screen.getByRole('button', { name: /今日/ })
    fireEvent.click(todayButton)

    await waitFor(() => {
      expect(screen.getByText(/2025年7月24日/)).toBeInTheDocument()
    })

    // DatePickerで再度同じ日付を選択
    fireEvent.click(screen.getByLabelText(/日付選択/))
    await waitFor(() => {
      expect(screen.getByTestId('date-picker-modal')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText(/27日/))

    await waitFor(() => {
      // 日付が正しく変更されている
      expect(screen.getByText(/2025年7月27日/)).toBeInTheDocument()
    })

    // DatePickerを手動で閉じる（現実的なユーザー操作）
    if (screen.queryByTestId('date-picker-modal')) {
      fireEvent.keyDown(document, { key: 'Escape' })
    }

    await waitFor(() => {
      // 追加したタスクが保持されている
      expect(screen.getByText('週末プロジェクトの準備')).toBeInTheDocument()
    })
  })

  // 🔴 Red Phase: 日付ナビゲーション連続操作フロー
  test('Workflow: Multi-day Navigation with Task Persistence', async () => {
    render(<App />)

    const addTaskOnDate = async (taskTitle: string) => {
      const titleInput = screen.getByLabelText(/タスクタイトル/)
      fireEvent.change(titleInput, { target: { value: taskTitle } })
      fireEvent.click(screen.getByRole('button', { name: /追加/ }))
      await waitFor(() => {
        expect(screen.getByText(taskTitle)).toBeInTheDocument()
      })
    }

    // Step 1: 今日のタスクを追加
    await addTaskOnDate('今日のタスク')

    // Step 2: 昨日に移動してタスクを追加
    const prevButton = screen.getByLabelText(/前日/)
    fireEvent.click(prevButton)

    await waitFor(() => {
      expect(screen.getByText(/2025年7月23日/)).toBeInTheDocument()
    })

    await addTaskOnDate('昨日のタスク')

    // Step 3: 明日に移動（今日をスキップして明日へ）
    const nextButton = screen.getByLabelText(/翌日/)
    fireEvent.click(nextButton) // 今日へ
    fireEvent.click(nextButton) // 明日へ

    await waitFor(() => {
      expect(screen.getByText(/2025年7月25日/)).toBeInTheDocument()
    })

    await addTaskOnDate('明日のタスク')

    // Step 4: 各日付に戻ってタスクが保持されていることを確認
    
    // 昨日に戻る
    fireEvent.click(prevButton) // 今日へ
    fireEvent.click(prevButton) // 昨日へ
    
    await waitFor(() => {
      expect(screen.getByText('昨日のタスク')).toBeInTheDocument()
      expect(screen.queryByText('今日のタスク')).not.toBeInTheDocument()
    })

    // 今日に戻る
    fireEvent.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('今日のタスク')).toBeInTheDocument()
      expect(screen.queryByText('昨日のタスク')).not.toBeInTheDocument()
    })

    // 明日に戻る
    fireEvent.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('明日のタスク')).toBeInTheDocument()
      expect(screen.queryByText('今日のタスク')).not.toBeInTheDocument()
    })
  })

  // 🔴 Red Phase: TaskStatistics連動フロー
  test('Workflow: Task Statistics Real-time Updates', async () => {
    render(<App />)

    // Step 1: 初期状態（デフォルトタスクがある状態）
    const statisticsContainer = screen.getByTestId('statistics-container')
    expect(statisticsContainer).toHaveTextContent(/2件/) // デフォルトタスク2件

    // Step 2: タスクを追加して統計が更新されることを確認
    const titleInput = screen.getByLabelText(/タスクタイトル/)
    fireEvent.change(titleInput, { target: { value: '新しいタスク' } })
    fireEvent.click(screen.getByRole('button', { name: /追加/ }))

    await waitFor(() => {
      expect(statisticsContainer).toHaveTextContent(/3件/) // 3件に増加
      expect(statisticsContainer).toHaveTextContent(/完了0件/) // まだ完了なし
    })

    // Step 3: タスクを完了して統計が更新されることを確認
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0]) // 最初のタスクを完了

    await waitFor(() => {
      expect(statisticsContainer).toHaveTextContent(/完了1件/) // 完了が1件に
      // 達成率の更新も確認
      const progressBar = screen.getByTestId('progress-bar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '33') // 1/3 = 33%
    })

    // Step 4: 別の日付に移動して統計がリセットされることを確認
    const nextButton = screen.getByLabelText(/翌日/)
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(statisticsContainer).toHaveTextContent(/タスクなし/) // 明日はタスクなし
    })

    // Step 5: 今日に戻って統計が復元されることを確認
    const todayButton = screen.getByRole('button', { name: /今日/ })
    fireEvent.click(todayButton)

    await waitFor(() => {
      expect(statisticsContainer).toHaveTextContent(/3件/)
      expect(statisticsContainer).toHaveTextContent(/完了1件/)
    })
  })

  // 🔴 Red Phase: データ永続化総合フロー
  test('Workflow: Complete Data Persistence Across Sessions', async () => {
    // Session 1: データを作成
    const { unmount } = render(<App />)

    // 今日のタスクを追加
    const titleInput = screen.getByLabelText(/タスクタイトル/)
    fireEvent.change(titleInput, { target: { value: 'セッション1のタスク' } })
    fireEvent.click(screen.getByRole('button', { name: /追加/ }))

    await waitFor(() => {
      expect(screen.getByText('セッション1のタスク')).toBeInTheDocument()
    })

    // 明日に移動してタスクを追加
    const nextButton = screen.getByLabelText(/翌日/)
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/2025年7月25日/)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/タスクタイトル/), { 
      target: { value: '明日のセッション1タスク' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /追加/ }))

    await waitFor(() => {
      expect(screen.getByText('明日のセッション1タスク')).toBeInTheDocument()
    })

    // コンポーネントをアンマウント（セッション終了をシミュレート）
    unmount()

    // Session 2: 新しいセッションでデータが復元されることを確認
    render(<App />)

    // 今日のタスクが復元されている
    await waitFor(() => {
      expect(screen.getByText('セッション1のタスク')).toBeInTheDocument()
    })

    // 明日に移動して明日のタスクも復元されている
    fireEvent.click(screen.getByLabelText(/翌日/))

    await waitFor(() => {
      expect(screen.getByText('明日のセッション1タスク')).toBeInTheDocument()
    })

    // Session 2でも新しいタスクを追加できる
    fireEvent.change(screen.getByLabelText(/タスクタイトル/), {
      target: { value: 'セッション2で追加したタスク' }
    })
    fireEvent.click(screen.getByRole('button', { name: /追加/ }))

    await waitFor(() => {
      expect(screen.getByText('セッション2で追加したタスク')).toBeInTheDocument()
      // 両方のセッションのタスクが表示されている
      expect(screen.getByText('明日のセッション1タスク')).toBeInTheDocument()
    })
  })
})
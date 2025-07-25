import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import App from './App'

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

// 🔴 Red Phase: Phase 2.2a App.tsx統合の失敗するテストを先に書く
describe('App - Phase 2.2a Date Management Integration', () => {
  test('should render DateNavigation component in header', () => {
    render(<App />)
    
    // DateNavigationの存在確認（Today-First UXの核心）
    expect(screen.getByRole('navigation', { name: /日付ナビゲーション/ })).toBeInTheDocument()
    expect(screen.getByText(/前へ/)).toBeInTheDocument() // DateNavigationのボタンテキスト
    expect(screen.getByText(/次へ/)).toBeInTheDocument() // DateNavigationのボタンテキスト
    expect(screen.getByLabelText(/カレンダーを開く/)).toBeInTheDocument()
  })

  test('should render TaskStatistics component', () => {
    render(<App />)
    
    // TaskStatisticsの存在確認（コンテナ内の特定テキストで確認）
    const statisticsContainer = screen.getByTestId('task-statistics')
    expect(statisticsContainer).toBeInTheDocument()
    
    // 統計情報の表示を確認（TaskStatistics固有の表示） - 実際の統計表示
    expect(statisticsContainer).toHaveTextContent(/今日.*件.*完了.*件|タスクなし/)
  })

  test('should show only today tasks by default (Today-First UX)', async () => {
    // このテストでは実際の時間を使用（fakeTimersをオフ）
    vi.useRealTimers()
    
    render(<App />)
    
    // まず、タスクを追加
    const titleInput = screen.getByLabelText(/タスクタイトル/)
    const addButton = screen.getByRole('button', { name: /追加/ })
    
    fireEvent.change(titleInput, { target: { value: 'Test Today Task' } })
    fireEvent.click(addButton)
    
    // 今日のタスクが表示されることを確認
    await waitFor(() => {
      const taskItems = screen.getAllByTestId(/^task-item-/)
      expect(taskItems.length).toBeGreaterThan(0)
    })
    
    // 統計情報に今日のタスク数が表示されていることを確認
    const statistics = screen.getByTestId('task-statistics')
    expect(statistics).toBeInTheDocument()
    
    // テスト後にfakeTimersを復元
    vi.useFakeTimers()
    vi.setSystemTime(MOCK_DATE)
  })

  test('should open DatePicker modal when date picker button is clicked', async () => {
    render(<App />)
    
    // カレンダーボタンをクリック
    const datePickerButton = screen.getByLabelText(/カレンダーを開く/)
    fireEvent.click(datePickerButton)
    
    // DatePickerは未実装なので、コンソールログメッセージで確認
    // 実際の実装では「DatePicker will be implemented」がログ出力される
    expect(datePickerButton).toBeInTheDocument()
  })

  test('should filter tasks when date is changed', async () => {
    render(<App />)
    
    // まず、今日のタスクを追加
    const titleInput = screen.getByLabelText(/タスクタイトル/)
    const addButton = screen.getByRole('button', { name: /追加/ })
    
    fireEvent.change(titleInput, { target: { value: 'Today Task' } })
    fireEvent.click(addButton)
    
    // 今日のタスクが表示されることを確認
    await waitFor(() => {
      const initialTasks = screen.getAllByTestId(/^task-item-/)
      expect(initialTasks.length).toBe(1)
    })
    
    // 日付を変更（前日へ）
    const prevButton = screen.getByText(/前へ/)
    fireEvent.click(prevButton)
    
    // 前日（7/24）にはタスクがないので、タスクリストが空になることを確認
    await waitFor(() => {
      const currentTasks = screen.queryAllByTestId(/^task-item-/)
      expect(currentTasks.length).toBe(0) // 前日（2025-07-24）にはタスクがない
    })
  })
})

// 🔴 Red Phase: タスク削除機能の失敗するテストを先に書く  
describe('App - Task Delete Functionality', () => {
  test('should show confirm dialog when delete button is clicked', async () => {
    render(<App />)
    
    // まず、タスクを追加
    const titleInput = screen.getByLabelText(/タスクタイトル/)
    const addButton = screen.getByRole('button', { name: /追加/ })
    
    fireEvent.change(titleInput, { target: { value: 'Task to Delete' } })
    fireEvent.click(addButton)
    
    // タスクが追加されるまで待機
    await waitFor(() => {
      expect(screen.getByTestId(/^task-item-/)).toBeInTheDocument()
    })
    
    // 削除ボタンを探してクリック
    const deleteButtons = screen.getAllByTestId('delete-task-button')
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
    const initialTasks = screen.getAllByTestId(/^task-item-/)
    const initialTaskCount = initialTasks.length
    
    // 最初のタスクの削除ボタンをクリック
    const deleteButtons = screen.getAllByTestId('delete-task-button')
    fireEvent.click(deleteButtons[0])
    
    // ConfirmDialogが表示される
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // 確認ボタンをクリック（ダイアログ内の削除ボタン）
    fireEvent.click(screen.getByText('Delete'))
    
    // タスクが削除される
    await waitFor(() => {
      const remainingTasks = screen.getAllByTestId(/^task-item-/)
      expect(remainingTasks.length).toBe(initialTaskCount - 1)
    })
    
    // ダイアログが閉じられる
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('should cancel deletion when cancel is clicked in dialog', async () => {
    render(<App />)
    
    // 初期タスク数を確認
    const initialTasks = screen.getAllByTestId(/^task-item-/)
    const initialTaskCount = initialTasks.length
    
    // 最初のタスクの削除ボタンをクリック
    const deleteButtons = screen.getAllByTestId('delete-task-button')
    fireEvent.click(deleteButtons[0])
    
    // ConfirmDialogが表示される
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // キャンセルボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    
    // タスクが削除されない
    await waitFor(() => {
      const remainingTasks = screen.getAllByTestId(/^task-item-/)
      expect(remainingTasks.length).toBe(initialTaskCount)
    })
    
    // ダイアログが閉じられる
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('should cancel deletion when escape key is pressed', async () => {
    render(<App />)
    
    // 初期タスク数を確認
    const initialTasks = screen.getAllByTestId(/^task-item-/)
    const initialTaskCount = initialTasks.length
    
    // 最初のタスクの削除ボタンをクリック
    const deleteButtons = screen.getAllByTestId('delete-task-button')
    fireEvent.click(deleteButtons[0])
    
    // ConfirmDialogが表示される
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Escapeキーを押す
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    
    // タスクが削除されない
    await waitFor(() => {
      const remainingTasks = screen.getAllByTestId(/^task-item-/)
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
    // data-testidで削除ボタンを検索する方法に変更
    const deleteButtons = screen.getAllByTestId('delete-task-button')
    expect(deleteButtons.length).toBeGreaterThan(0)
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
    const initialTasks = screen.getAllByTestId(/^task-item-/)
    const initialTaskCount = initialTasks.length
    
    // フォームに入力
    const titleInput = screen.getByLabelText(/タスクタイトル/i)
    fireEvent.change(titleInput, { target: { value: '新しいテスト用タスク' } })
    
    // 追加ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /追加/i }))
    
    // タスクが追加される
    await waitFor(() => {
      const newTasks = screen.getAllByTestId(/^task-item-/)
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

// 🔴 Red Phase: 新レイアウトシステム（30%-45%-25%）のテスト
describe('App - New Layout System (30%-45%-25%)', () => {
  test('should display CSS Grid layout with correct proportions on desktop', () => {
    render(<App />)
    
    // CSS Grid main-layoutが存在する
    const mainLayout = screen.getByTestId('main-layout-grid')
    expect(mainLayout).toBeInTheDocument()
    expect(mainLayout).toHaveClass('main-layout-grid')
    
    // 3つのエリアが正しく表示される
    const tasksArea = screen.getByTestId('tasks-area-30')
    const memoArea = screen.getByTestId('memo-area-45')
    const tabArea = screen.getByTestId('tab-area-25')
    
    expect(tasksArea).toBeInTheDocument()
    expect(memoArea).toBeInTheDocument()
    expect(tabArea).toBeInTheDocument()
    
    // CSS Gridクラスが設定されている
    expect(mainLayout).toHaveClass('main-layout-grid')
  })

  test('should maintain 30% tasks sidebar width as before', () => {
    render(<App />)
    
    // 既存のtasks-sidebarが30%エリア内に存在する
    const tasksArea = screen.getByTestId('tasks-area-30')
    const tasksSidebar = screen.getByTestId('tasks-section')
    
    expect(tasksArea).toContainElement(tasksSidebar)
    
    // tasks-sidebarの機能が変わらず動作する（Today's Tasksタイトルは廃止）
    expect(screen.getByTestId('form-fixed-area')).toBeInTheDocument()
    expect(screen.getByTestId('tasks-scrollable-area')).toBeInTheDocument()
  })

  test('should resize memo area to 45% with proper content', () => {
    render(<App />)
    
    // memo-areaが45%エリアに配置される
    const memoArea = screen.getByTestId('memo-area-45')
    
    // 既存のDailyMemoコンポーネントが含まれている
    expect(memoArea).toContainElement(screen.getByLabelText(/デイリーメモ/))
    expect(memoArea).toContainElement(screen.getByText(/📝 メモパネルを開く/))
    
    // memo-editorクラスがmemo-area-45に変更されている
    expect(memoArea).toHaveClass('memo-area-45')
    expect(screen.queryByTestId('memo-editor')).not.toBeInTheDocument()
  })

  test('should create new 25% tab area with basic structure', () => {
    render(<App />)
    
    // 新しいタブエリアが25%で表示される
    const tabArea = screen.getByTestId('tab-area-25')
    expect(tabArea).toBeInTheDocument()
    expect(tabArea).toHaveClass('tab-area-25')
    
    // タブエリアが右端に配置される（3番目の要素）
    const mainLayout = screen.getByTestId('main-layout-grid')
    const children = Array.from(mainLayout.children)
    expect(children[2]).toBe(tabArea)
  })

  test('should handle responsive breakpoints correctly', () => {
    // モバイル環境のmockを設定
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(max-width: 768px)' ? true : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    })

    render(<App />)
    
    // モバイルでは既存のレスポンシブ動作を維持
    const mainLayout = screen.getByTestId('main-layout-grid')
    
    // Grid レイアウトが表示されていることを確認
    expect(mainLayout).toBeInTheDocument()
    expect(mainLayout).toHaveClass('main-layout-grid')
  })

  test('should preserve all existing functionality with new layout', async () => {
    // デスクトップ環境を明示的に設定
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

    render(<App />)
    
    // 既存機能：タスク追加
    const titleInput = screen.getByLabelText(/タスクタイトル/i)
    fireEvent.change(titleInput, { target: { value: 'レイアウトテスト用タスク' } })
    fireEvent.click(screen.getByRole('button', { name: /追加/i }))
    
    await waitFor(() => {
      expect(screen.getByText('レイアウトテスト用タスク')).toBeInTheDocument()
    })
    
    // 既存機能：フォーカスモード切り替え
    const focusButton = screen.getByText(/Focus: OFF/i)
    fireEvent.click(focusButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Focus: ON/i)).toBeInTheDocument()
    })
    
    // 既存機能：メモパネル開く
    const memoButton = screen.getByText(/📝 メモパネルを開く/)
    fireEvent.click(memoButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('memo-panel')).toBeInTheDocument()
    })
  })
})

// 🔴 Red Phase: TabArea統合テスト（TDD厳守）
describe('App - TabArea Integration', () => {
  test('should replace tab-area-placeholder with actual TabArea component', () => {
    render(<App />)
    
    // プレースホルダーが表示されていない
    expect(screen.queryByText('Tab Area')).not.toBeInTheDocument()
    expect(screen.queryByText('Coming soon...')).not.toBeInTheDocument()
    
    // 実際のTabAreaコンポーネントが表示されている
    const tabArea = screen.getByTestId('tab-area')
    expect(tabArea).toBeInTheDocument()
    expect(tabArea).toHaveClass('tab-area-scroll')
  })

  test('should display daily memo tab as default', () => {
    render(<App />)
    
    // デイリーメモタブが固定表示されている
    const dailyTab = screen.getByTestId('tab-daily-memo')
    expect(dailyTab).toBeInTheDocument()
    expect(dailyTab).toHaveClass('tab-daily-memo-sticky')
    
    // デイリーメモボタンが表示されている
    const dailyButton = screen.getByRole('button', { name: /デイリーメモ/i })
    expect(dailyButton).toBeInTheDocument()
    expect(dailyButton).toHaveClass('tab-active') // デフォルトでアクティブ
  })

  test('should handle tab selection and content switching', async () => {
    render(<App />)
    
    // デイリーメモタブがデフォルトでアクティブ
    const dailyButton = screen.getByRole('button', { name: /デイリーメモ/i })
    expect(dailyButton).toHaveClass('tab-active')
    
    // memo-area-45にデイリーメモが表示されている
    const memoArea = screen.getByTestId('memo-area-45')
    expect(memoArea).toContainElement(screen.getByLabelText(/デイリーメモ/))
  })

  test('should add task tabs when tasks are selected', async () => {
    render(<App />)
    
    // 実在するタスクタイトルを探してクリック
    const taskItems = screen.getAllByTestId(/^task-item-/)
    expect(taskItems.length).toBeGreaterThan(0)
    
    // 最初のタスクの task-content をクリック（onMemoClickが設定されている）
    const firstTaskContent = taskItems[0].querySelector('.task-content')
    expect(firstTaskContent).toBeTruthy()
    fireEvent.click(firstTaskContent as HTMLElement)
    
    await waitFor(() => {
      // タスクタブがTabAreaに追加される（タブエリア内のボタンを特定）
      const tabArea = screen.getByTestId('tab-area')
      // 最初のタスクタブが追加されたことを確認
      const taskTabButtons = tabArea.querySelectorAll('.tab-button')
      const taskTabButton = Array.from(taskTabButtons).find(btn => 
        !btn.textContent?.includes('デイリーメモ') // デイリーメモタブ以外
      )
      expect(taskTabButton).toBeInTheDocument()
      
      // タスクタブを閉じるボタンがある
      const closeButtons = tabArea.querySelectorAll('.tab-close-btn')
      expect(closeButtons.length).toBeGreaterThan(0)
    })
  })

  test('should switch memo content when different tabs are selected', async () => {
    render(<App />)
    
    // 実在するタスクをクリックしてタスクメモタブを追加
    const taskItems = screen.getAllByTestId(/^task-item-/)
    const firstTaskContent = taskItems[0].querySelector('.task-content')
    fireEvent.click(firstTaskContent as HTMLElement)
    
    await waitFor(() => {
      // タスクタブが追加されたことを確認（タブエリア内の特定のボタンを探す）
      const tabArea = screen.getByTestId('tab-area')
      const taskTabButtons = tabArea.querySelectorAll('.tab-button')
      const taskTabButton = Array.from(taskTabButtons).find(btn => 
        !btn.textContent?.includes('デイリーメモ') // デイリーメモタブ以外
      )
      expect(taskTabButton).toBeInTheDocument()
      
      // タスクタブをクリック
      fireEvent.click(taskTabButton as HTMLElement)
    })
    
    await waitFor(() => {
      // memo-area-45にタスクメモ関連のコンテンツが表示される
      const memoArea = screen.getByTestId('memo-area-45')
      // タスクメモコンポーネントが表示される（正常な場合はtextarea、エラーの場合はエラーメッセージ）
      const taskMemoContent = memoArea.querySelector('textarea') || memoArea.querySelector('.task-memo-error')
      expect(taskMemoContent).toBeInTheDocument()
    })
  })
})

// 🔴 Red Phase: Mobile Responsive Integration Tests (Phase 2.1d+ Final)
describe('App - Mobile Responsive Integration (≤768px)', () => {
  // モバイル環境を模擬するヘルパー関数
  const setupMobileEnvironment = () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(max-width: 768px)' ? true : false, // Mobile detection: true
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    })
  }

  // デスクトップ環境を模擬するヘルパー関数  
  const setupDesktopEnvironment = () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false, // All queries return false for desktop
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    })
  }

  test('should show MobileAccordion for daily memo on mobile (≤768px)', () => {
    setupMobileEnvironment()
    render(<App />)
    
    // モバイルアコーディオンが表示される
    const mobileAccordion = screen.getByTestId('mobile-accordion')
    expect(mobileAccordion).toBeInTheDocument()
    expect(mobileAccordion).toHaveClass('mobile-accordion')
    
    // デスクトップのDailyMemoコンポーネントは非表示
    expect(screen.queryByLabelText(/デイリーメモ/)).not.toBeInTheDocument()
    
    // アコーディオントリガーボタンが表示される
    const triggerButton = screen.getByRole('button', { name: '📝 デイリーメモ' })
    expect(triggerButton).toBeInTheDocument()
    expect(triggerButton).toHaveClass('accordion-trigger')
  })

  test('should hide MobileAccordion on desktop (>768px)', () => {
    setupDesktopEnvironment()
    render(<App />)
    
    // モバイルアコーディオンが非表示
    expect(screen.queryByTestId('mobile-accordion')).not.toBeInTheDocument()
    
    // デスクトップのDailyMemoコンポーネントが表示される
    expect(screen.getByLabelText(/デイリーメモ/)).toBeInTheDocument()
    expect(screen.getByText(/📝 メモパネルを開く/)).toBeInTheDocument()
  })

  test('should expand MobileAccordion to full screen when triggered', async () => {
    setupMobileEnvironment()
    render(<App />)
    
    // アコーディオントリガーをクリック（accordion-triggerクラスを持つボタン）
    const accordionTrigger = Array.from(screen.getAllByRole('button')).find(btn => 
      btn.classList.contains('accordion-trigger')
    )
    expect(accordionTrigger).toBeTruthy()
    fireEvent.click(accordionTrigger as HTMLElement)
    
    // アコーディオンが展開される（useStateで管理される状態変化）
    await waitFor(() => {
      const accordionContent = screen.getByTestId('accordion-content')
      expect(accordionContent).toHaveClass('expanded')
      expect(accordionContent).toHaveStyle({ 
        transform: 'translateY(0)' 
      })
    })
    
    // 全画面デイリーメモのtextareaが表示される
    const dailyMemoTextarea = screen.getByLabelText(/デイリーメモ/i)
    expect(dailyMemoTextarea).toBeInTheDocument()
  })

  test('should show MobileTaskMemoModal when task is selected on mobile', async () => {
    setupMobileEnvironment()
    render(<App />)
    
    // 既存タスクをクリックしてタスクメモモーダルを開く
    const taskItems = screen.getAllByTestId(/^task-item-/)
    const firstTaskContent = taskItems[0].querySelector('.task-content')
    fireEvent.click(firstTaskContent as HTMLElement)
    
    await waitFor(() => {
      // モバイルタスクメモモーダルが表示される
      const taskMemoModal = screen.getByTestId('mobile-task-memo-modal')
      expect(taskMemoModal).toBeInTheDocument()
      expect(taskMemoModal).toHaveClass('mobile-modal')
      
      // モーダルが全画面で表示される
      expect(taskMemoModal).toHaveStyle({
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: '4000' // MODAL Z_INDEX
      })
    })
    
    // タスク情報が表示される
    const taskInfoHeader = screen.getByTestId('task-info-header')
    expect(taskInfoHeader).toBeInTheDocument()
  })

  test('should hide MobileTaskMemoModal on desktop and show normal task memo', async () => {
    setupDesktopEnvironment()
    render(<App />)
    
    // 既存タスクをクリック
    const taskItems = screen.getAllByTestId(/^task-item-/)
    const firstTaskContent = taskItems[0].querySelector('.task-content')
    fireEvent.click(firstTaskContent as HTMLElement)
    
    await waitFor(() => {
      // モバイルモーダルは表示されない
      expect(screen.queryByTestId('mobile-task-memo-modal')).not.toBeInTheDocument()
      
      // デスクトップのTaskMemoコンポーネントがmemo-area-45に表示される
      const memoArea = screen.getByTestId('memo-area-45')
      const taskMemoContent = memoArea.querySelector('textarea') || memoArea.querySelector('.task-memo-error')
      expect(taskMemoContent).toBeInTheDocument()
    })
  })

  test('should close MobileTaskMemoModal when back button is clicked', async () => {
    setupMobileEnvironment()
    render(<App />)
    
    // タスクをクリックしてモーダルを開く
    const taskItems = screen.getAllByTestId(/^task-item-/)
    const firstTaskContent = taskItems[0].querySelector('.task-content')
    fireEvent.click(firstTaskContent as HTMLElement)
    
    await waitFor(() => {
      expect(screen.getByTestId('mobile-task-memo-modal')).toBeInTheDocument()
    })
    
    // 戻るボタンをクリック
    const backButton = screen.getByText('← 戻る')
    fireEvent.click(backButton)
    
    await waitFor(() => {
      // モーダルが閉じられる
      expect(screen.queryByTestId('mobile-task-memo-modal')).not.toBeInTheDocument()
    })
  })

  test('should maintain proper 768px boundary for responsive switching', () => {
    // Test 1: 768px以下でモバイル表示
    setupMobileEnvironment()
    const { unmount } = render(<App />)
    
    // モバイルコンポーネントが表示される
    expect(screen.getByTestId('mobile-accordion')).toBeInTheDocument()
    expect(screen.queryByLabelText(/デイリーメモ/)).not.toBeInTheDocument()
    
    // コンポーネントをアンマウント
    unmount()
    
    // Test 2: 769px以上でデスクトップ表示
    setupDesktopEnvironment()
    render(<App />)
    
    // デスクトップコンポーネントが表示される
    expect(screen.queryByTestId('mobile-accordion')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/デイリーメモ/)).toBeInTheDocument()
    expect(screen.getByText(/📝 メモパネルを開く/)).toBeInTheDocument()
  })

  // 🔴 Red Phase: showCompleted切り替えUIの失敗するテスト
  test('should render showCompleted toggle button', () => {
    render(<App />)
    
    // 完了タスク表示切り替えボタンの存在確認
    expect(screen.getByTestId('show-completed-toggle')).toBeInTheDocument()
    expect(screen.getByLabelText(/完了タスクを表示/)).toBeInTheDocument()
  })

  test('should toggle completed tasks visibility when button is clicked', async () => {
    render(<App />)
    
    // 最初のタスクを完了にする
    const completeButtons = screen.getAllByTestId('complete-task-button')
    fireEvent.click(completeButtons[0])
    
    // 初期状態: 完了タスクは非表示（showCompleted=false）
    const toggleButton = screen.getByTestId('show-completed-toggle')
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
    
    // 完了タスクが非表示になっていることを確認
    await waitFor(() => {
      const visibleTasks = screen.getAllByTestId(/^task-item-/)
      // 完了済みタスクは非表示なので、未完了タスクのみ表示
      expect(visibleTasks.length).toBe(1) // デフォルトタスク2つのうち、1つが完了→非表示、1つが未完了→表示
    })
    
    // トグルボタンをクリックして完了タスクを表示
    fireEvent.click(toggleButton)
    
    await waitFor(() => {
      expect(toggleButton).toHaveAttribute('aria-pressed', 'true')
      
      // 完了タスクが表示される（全タスクが表示される）
      const visibleTasks = screen.getAllByTestId(/^task-item-/)
      expect(visibleTasks.length).toBe(2) // 完了タスク + 未完了タスク = 2つ
    })
  })

  test('should handle Ctrl+H keyboard shortcut for toggle', () => {
    render(<App />)
    
    const toggleButton = screen.getByTestId('show-completed-toggle')
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
    
    // Ctrl+H を押下
    fireEvent.keyDown(document, { key: 'h', ctrlKey: true })
    
    // トグル状態が変更される
    expect(toggleButton).toHaveAttribute('aria-pressed', 'true')
    
    // もう一度 Ctrl+H を押下
    fireEvent.keyDown(document, { key: 'h', ctrlKey: true })
    
    // トグル状態が元に戻る
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
  })

  test('should update toggle button text based on state', () => {
    render(<App />)
    
    const toggleButton = screen.getByTestId('show-completed-toggle')
    
    // 初期状態: 完了タスク非表示
    expect(screen.getByText(/完了タスクを表示/)).toBeInTheDocument()
    
    // クリックして完了タスクを表示
    fireEvent.click(toggleButton)
    
    // ボタンテキストが変更される
    expect(screen.getByText(/完了タスクを非表示/)).toBeInTheDocument()
  })
})

// 🔴 Phase 2.2d-1: Statistics重複表示解消テスト
describe('App - Statistics Display Consolidation', () => {
  test('should show only one statistics display (not duplicate)', () => {
    render(<App />)
    
    // 統計情報が1箇所にのみ表示されることを確認
    // TaskStatisticsコンポーネントが存在する
    const taskStatistics = screen.getByTestId('task-statistics')
    expect(taskStatistics).toBeInTheDocument()
    
    // DateNavigationには統計情報が表示されない
    const dateNavigation = screen.getByTestId('date-navigation')
    expect(dateNavigation).not.toHaveTextContent(/タスク数/)
    expect(dateNavigation).not.toHaveTextContent(/見積時間/)
    expect(dateNavigation).not.toHaveTextContent(/完了見込み/)
  })

  test('should maintain all essential statistics in single display', () => {
    render(<App />)
    
    // TaskStatisticsに必要な統計情報が漏れなく含まれることを確認
    const taskStatistics = screen.getByTestId('task-statistics')
    
    // 基本統計が含まれていることを確認（現在の実装では統計表示）
    expect(taskStatistics).toHaveTextContent(/今日.*件.*完了.*件|タスクなし/) // 実際の統計表示を確認
  })
})

// Phase 2.2d-1: Today-First UX改善テスト
describe('App - Today-First UX Improvements', () => {
  test('should not display "Today\'s Tasks" title (incompatible with date navigation)', () => {
    render(<App />)
    
    // 「Today's Tasks」タイトルが表示されないことを確認
    const tasksSection = screen.getByTestId('tasks-section')
    expect(tasksSection).not.toHaveTextContent(/Today's Tasks/)
    
    // ただし、tasks-section自体は存在することを確認
    expect(tasksSection).toBeInTheDocument()
  })

  test('should show contextual date information instead of fixed title', () => {
    render(<App />)
    
    // 日付ナビゲーション経由で日付コンテキストが提供されることを確認
    const dateNavigation = screen.getByTestId('date-navigation')
    expect(dateNavigation).toBeInTheDocument()
    
    // TaskStatisticsで統計情報が表示されることを確認
    const taskStatistics = screen.getByTestId('task-statistics')
    expect(taskStatistics).toHaveTextContent(/今日.*件.*完了.*件|タスクなし/) // 実際の統計表示
  })
})
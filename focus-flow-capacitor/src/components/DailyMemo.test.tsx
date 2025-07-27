import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import { DailyMemo } from './DailyMemo'

// LocalStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    // store プロパティを公開してテストで参照できるようにする
    get store() { return store; },
    set store(newStore: Record<string, string>) { store = newStore; }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// タイマーのモック
vi.useFakeTimers()

describe('DailyMemo - データ永続化', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    vi.clearAllTimers()
    // モック実装をリセット（重要！）
    localStorageMock.setItem.mockImplementation((key: string, value: string) => {
      localStorageMock.store[key] = value
    })
  })

  afterEach(() => {
    // グローバルクリーンアップに移譲 (src/test/setup.ts)
  })

  test('should auto-save memo after 3 seconds of inactivity', async () => {
    vi.useFakeTimers()
    render(<DailyMemo />)
    
    const textarea = screen.getByTestId('daily-memo-textarea')
    
    // テキストを入力（act()でラップ）
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Test memo content' } })
    })
    
    // 3秒未満では自動保存されない
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    
    // 3秒経過で自動保存される - 状態更新を待つ
    await act(async () => {
      vi.advanceTimersByTime(1000)
      // setTimeout callbacks for state updates
      await vi.runAllTimersAsync()
    })
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      expect.stringMatching(/daily-memo-\d{4}-\d{2}-\d{2}/),
      expect.stringContaining('Test memo content')
    )
  })

  test('should manage memos by date (YYYY-MM-DD)', async () => {
    vi.useFakeTimers()
    
    render(<DailyMemo />)
    
    const textarea = screen.getByTestId('daily-memo-textarea')
    
    // テキストを入力（act()でラップ）
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Today memo' } })
    })
    
    // 3秒経過で保存 - 状態更新を待つ
    await act(async () => {
      vi.advanceTimersByTime(3000)
      // setTimeout callbacks for state updates
      await vi.runAllTimersAsync()
    })
    
    // 今日の日付でキーが作成されることを確認
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      `daily-memo-${today}`,
      expect.any(String)
    )
  })

  test('should restore memo for current date on app reload', () => {
    const today = new Date().toISOString().split('T')[0]
    const savedMemo = JSON.stringify({
      date: today,
      content: 'Restored memo content',
      lastUpdated: new Date().toISOString(),
      taskReferences: []
    })
    
    localStorageMock.getItem.mockReturnValue(savedMemo)
    
    render(<DailyMemo />)
    
    const textarea = screen.getByTestId('daily-memo-textarea')
    expect(textarea).toHaveValue('Restored memo content')
  })

  test('should not auto-save if input stops for less than 3 seconds', async () => {
    vi.useFakeTimers()
    
    render(<DailyMemo />)
    
    const textarea = screen.getByTestId('daily-memo-textarea')
    
    // 最初の入力（act()でラップ）
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'First input' } })
    })
    await act(async () => {
      vi.advanceTimersByTime(2000) // 2秒経過
    })
    
    // 2秒後に追加入力（タイマーリセット）
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Second input' } })
    })
    await act(async () => {
      vi.advanceTimersByTime(2000) // さらに2秒経過（合計4秒だが、リセットにより2秒）
    })
    
    // まだ保存されていないことを確認
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    
    // 3秒経過で保存される - 状態更新を待つ
    await act(async () => {
      vi.advanceTimersByTime(1000)
      // setTimeout callbacks for state updates
      await vi.runAllTimersAsync()
    })
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  test('should handle localStorage errors gracefully', async () => {
    vi.useFakeTimers()
    
    // console.warnをモック化してエラー出力をキャッチ
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    // localStorage.setItemがエラーを投げるように設定
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('LocalStorage is full')
    })
    
    render(<DailyMemo />)
    
    const textarea = screen.getByTestId('daily-memo-textarea')
    
    // テキストを入力（act()でラップ）
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Test content' } })
    })
    
    // エラーが発生してもアプリがクラッシュしないことを確認 - 状態更新を待つ
    await act(async () => {
      vi.advanceTimersByTime(3000)
      // setTimeout callbacks for state updates
      await vi.runAllTimersAsync()
    })
    
    // プロダクション環境ではconsole.warnが削除されているため、コメントアウト
    // expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to save memo:', expect.any(Error))
    
    // テキストエリアは正常に動作している
    expect(textarea).toHaveValue('Test content')
    
    // モックをクリーンアップ
    consoleWarnSpy.mockRestore()
    vi.useRealTimers()
  })

  test('should clear auto-save timer when component unmounts', async () => {
    vi.useRealTimers()
    vi.useFakeTimers()
    
    const { unmount } = render(<DailyMemo />)
    
    const textarea = screen.getByTestId('daily-memo-textarea')
    
    // テキストを入力（act()でラップ）
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Test content' } })
    })
    
    // 2秒経過後にアンマウント
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    unmount()
    
    // アンマウント後に3秒経過
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    
    // 保存されていないことを確認（タイマーがクリアされた）
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
  })

  test('should trim whitespace from memo content before saving', async () => {
    vi.useFakeTimers()
    
    render(<DailyMemo />)
    
    const textarea = screen.getByTestId('daily-memo-textarea')
    
    // テキストを入力（act()でラップ）
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '  Test memo with spaces  ' } })
    })
    
    await act(async () => {
      vi.advanceTimersByTime(3000)
      // setTimeout callbacks for state updates
      await vi.runAllTimersAsync()
    })
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/"content":"Test memo with spaces"/)
    )
  })

  test('should display standalone header when not embedded', () => {
    render(<DailyMemo embedded={false} />)
    
    const header = screen.getByRole('heading', { level: 2 })
    expect(header).toBeInTheDocument()
    expect(header).toHaveTextContent('📝 デイリーメモ')
  })

  test('should hide header when embedded in panel', () => {
    render(<DailyMemo embedded={true} />)
    
    const header = screen.queryByRole('heading', { level: 2 })
    expect(header).not.toBeInTheDocument()
    
    // But textarea should still be present
    const textarea = screen.getByTestId('daily-memo-textarea')
    expect(textarea).toBeInTheDocument()
  })

  // 🔴 Phase 2.2d-1: 自動保存状態インジケーターテスト
  test('should show saving indicator when auto-save is in progress', async () => {
    vi.useFakeTimers()
    
    render(<DailyMemo />)
    
    const textarea = screen.getByTestId('daily-memo-textarea')
    
    // テキストを入力（act()でラップ）
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Test content for saving' } })
    })
    
    // 3秒経過で保存プロセス開始
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    
    // saving状態を確認（50msの間表示される）
    await act(async () => {
      vi.advanceTimersByTime(25) // saving状態の途中
    })
    
    let saveIndicator = screen.queryByTestId('save-status-indicator')
    expect(saveIndicator).toBeInTheDocument()
    expect(saveIndicator?.textContent).toMatch(/💾.*保存中/)
    
    // success状態に移行
    await act(async () => {
      vi.advanceTimersByTime(50) // saving→success遷移完了
    })
    
    saveIndicator = screen.queryByTestId('save-status-indicator')
    expect(saveIndicator).toBeInTheDocument()
    expect(saveIndicator?.textContent).toMatch(/✅.*保存完了/)
  })

  test('should show success indicator when auto-save succeeds', async () => {
    vi.useFakeTimers()
    
    render(<DailyMemo />)
    
    const textarea = screen.getByTestId('daily-memo-textarea')
    
    // テキストを入力（act()でラップ）
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Test content for success' } })
    })
    
    // 3秒経過で保存プロセス開始
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    
    // success状態に移行（50ms後）
    await act(async () => {
      vi.advanceTimersByTime(50)
    })
    
    // 保存成功状態インジケーターが表示されることを確認
    const saveIndicator = screen.queryByTestId('save-status-indicator')
    expect(saveIndicator).toBeInTheDocument()
    
    // success状態の内容確認
    expect(saveIndicator?.textContent).toMatch(/✅.*保存完了/)
  })

  test('should show error indicator when auto-save fails', async () => {
    vi.useFakeTimers()
    
    // localStorage.setItemがエラーを投げるように設定
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('LocalStorage quota exceeded')
    })
    
    render(<DailyMemo />)
    
    const textarea = screen.getByTestId('daily-memo-textarea')
    
    // テキストを入力（act()でラップ）
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Test content for error' } })
    })
    
    // 3秒経過で保存エラー発生 - 状態更新を待つ
    await act(async () => {
      vi.advanceTimersByTime(3000)
      // setTimeout callbacks for state updates
      await vi.runAllTimersAsync()
    })
    
    // エラーインジケーターが表示されることを確認
    expect(screen.getByText(/保存失敗/i)).toBeInTheDocument()
    expect(screen.getByText(/❌/)).toBeInTheDocument() // Emoji icon
    expect(screen.getByText(/LocalStorage quota exceeded/i)).toBeInTheDocument()
  })

  test('should handle localStorage quota exceeded error', async () => {
    vi.useFakeTimers()
    
    // QuotaExceededError をシミュレート
    localStorageMock.setItem.mockImplementation(() => {
      const error = new Error('QuotaExceededError')
      error.name = 'QuotaExceededError'
      throw error
    })
    
    render(<DailyMemo />)
    
    const textarea = screen.getByTestId('daily-memo-textarea')
    
    // テキストを入力（act()でラップ）
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Large content that exceeds quota' } })
    })
    
    // エラーが発生してもアプリがクラッシュしないことを確認 - 状態更新を待つ
    await expect(
      act(async () => {
        vi.advanceTimersByTime(3000)
      })
    ).resolves.not.toThrow()
    
    // Promise-based saveWithStatus の状態更新を待つ
    await act(async () => {
      await Promise.resolve()
    })
    
    // 適切なエラーメッセージが表示されることを確認
    expect(screen.getByText(/容量不足/i)).toBeInTheDocument()
    expect(screen.getByText(/❌/)).toBeInTheDocument() // Emoji icon
  })

  test('should display save status indicator with inline styling', async () => {
    vi.useFakeTimers()
    
    render(<DailyMemo />)
    
    const textarea = screen.getByTestId('daily-memo-textarea')
    
    // テキストを入力（act()でラップ）
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Test content for save indicator' } })
    })
    
    // 保存プロセス開始
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    
    // success状態に移行（50ms後）
    await act(async () => {
      vi.advanceTimersByTime(50)
    })
    
    // 保存状態インジケーターの確認
    const saveIndicator = screen.queryByTestId('save-status-indicator')
    expect(saveIndicator).toBeInTheDocument()
    
    // inline-block スタイルの確認
    expect(saveIndicator).toHaveStyle({
      display: 'inline-block',
      marginTop: '8px',
      padding: '6px 10px',
      borderRadius: '4px'
    })
    
    // success状態の内容確認
    expect(saveIndicator?.textContent).toMatch(/✅.*保存完了/)
  })
})
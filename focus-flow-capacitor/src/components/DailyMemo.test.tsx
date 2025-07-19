import { render, screen, fireEvent } from '@testing-library/react'
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
    })
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
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.useFakeTimers()
  })

  test('should auto-save memo after 3 seconds of inactivity', async () => {
    render(<DailyMemo />)
    
    const textarea = screen.getByRole('textbox', { name: /デイリーメモ/i })
    
    // テキストを入力
    fireEvent.change(textarea, { target: { value: 'Test memo content' } })
    
    // 3秒未満では自動保存されない
    vi.advanceTimersByTime(2000)
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    
    // 3秒経過で自動保存される
    vi.advanceTimersByTime(1000)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      expect.stringMatching(/daily-memo-\d{4}-\d{2}-\d{2}/),
      expect.stringContaining('Test memo content')
    )
  })

  test('should manage memos by date (YYYY-MM-DD)', () => {
    render(<DailyMemo />)
    
    const textarea = screen.getByRole('textbox', { name: /デイリーメモ/i })
    fireEvent.change(textarea, { target: { value: 'Today memo' } })
    
    // 3秒経過で保存
    vi.advanceTimersByTime(3000)
    
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
    
    const textarea = screen.getByRole('textbox', { name: /デイリーメモ/i })
    expect(textarea).toHaveValue('Restored memo content')
  })

  test('should not auto-save if input stops for less than 3 seconds', () => {
    render(<DailyMemo />)
    
    const textarea = screen.getByRole('textbox', { name: /デイリーメモ/i })
    
    // 最初の入力
    fireEvent.change(textarea, { target: { value: 'First input' } })
    vi.advanceTimersByTime(2000) // 2秒経過
    
    // 2秒後に追加入力（タイマーリセット）
    fireEvent.change(textarea, { target: { value: 'Second input' } })
    vi.advanceTimersByTime(2000) // さらに2秒経過（合計4秒だが、リセットにより2秒）
    
    // まだ保存されていないことを確認
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    
    // 3秒経過で保存される
    vi.advanceTimersByTime(1000)
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  test('should handle localStorage errors gracefully', () => {
    // localStorage.setItemがエラーを投げるように設定
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('LocalStorage is full')
    })
    
    render(<DailyMemo />)
    
    const textarea = screen.getByRole('textbox', { name: /デイリーメモ/i })
    fireEvent.change(textarea, { target: { value: 'Test content' } })
    
    // エラーが発生してもアプリがクラッシュしないことを確認
    expect(() => {
      vi.advanceTimersByTime(3000)
    }).not.toThrow()
    
    // テキストエリアは正常に動作している
    expect(textarea).toHaveValue('Test content')
  })

  test('should clear auto-save timer when component unmounts', () => {
    const { unmount } = render(<DailyMemo />)
    
    const textarea = screen.getByRole('textbox', { name: /デイリーメモ/i })
    fireEvent.change(textarea, { target: { value: 'Test content' } })
    
    // 2秒経過後にアンマウント
    vi.advanceTimersByTime(2000)
    unmount()
    
    // アンマウント後に3秒経過
    vi.advanceTimersByTime(2000)
    
    // 保存されていないことを確認（タイマーがクリアされた）
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
  })

  test('should trim whitespace from memo content before saving', () => {
    render(<DailyMemo />)
    
    const textarea = screen.getByRole('textbox', { name: /デイリーメモ/i })
    fireEvent.change(textarea, { target: { value: '  Test memo with spaces  ' } })
    
    vi.advanceTimersByTime(3000)
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/"content":"Test memo with spaces"/)
    )
  })
})
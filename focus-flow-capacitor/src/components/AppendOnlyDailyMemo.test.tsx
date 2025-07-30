import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { AppendOnlyDailyMemo } from './AppendOnlyDailyMemo'

describe('AppendOnlyDailyMemo - Phase 2.2b Inspiration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  test('should render append-only daily memo with correct structure', () => {
    render(<AppendOnlyDailyMemo />)

    // 基本構造の確認
    expect(screen.getByTestId('append-only-daily-memo')).toBeInTheDocument()
    expect(screen.getByText('💡 ひらめきメモ')).toBeInTheDocument()
    expect(screen.getByTestId('inspiration-input')).toBeInTheDocument()
    expect(screen.getByText('追加')).toBeInTheDocument()
  })

  test('should handle inspiration entry and append to memo list', async () => {
    render(<AppendOnlyDailyMemo />)

    const input = screen.getByTestId('inspiration-input')
    const addButton = screen.getByText('追加')

    // ひらめきメモを入力
    fireEvent.change(input, { target: { value: 'フォーカスモードでの新しいアイデア' } })
    fireEvent.click(addButton)

    // エントリが追加されることを確認
    await waitFor(() => {
      expect(screen.getByText(/フォーカスモードでの新しいアイデア/)).toBeInTheDocument()
    })

    // 入力フィールドがクリアされることを確認
    expect(input).toHaveValue('')
  })

  test('should append multiple inspirations with timestamps', async () => {
    render(<AppendOnlyDailyMemo />)

    const input = screen.getByTestId('inspiration-input')
    const addButton = screen.getByText('追加')

    // 複数のひらめきを追加
    fireEvent.change(input, { target: { value: '第一のアイデア' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText(/第一のアイデア/)).toBeInTheDocument()
    })

    fireEvent.change(input, { target: { value: '第二のアイデア' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText(/第二のアイデア/)).toBeInTheDocument()
    })

    // 両方のアイデアが表示されることを確認
    expect(screen.getByText(/第一のアイデア/)).toBeInTheDocument()
    expect(screen.getByText(/第二のアイデア/)).toBeInTheDocument()
  })

  test('should handle Enter key for quick inspiration entry', async () => {
    render(<AppendOnlyDailyMemo />)

    const input = screen.getByTestId('inspiration-input')

    // Enterキーでの追加
    fireEvent.change(input, { target: { value: 'Enterキーテスト' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // エントリが追加されることを確認
    await waitFor(() => {
      expect(screen.getByText(/Enterキーテスト/)).toBeInTheDocument()
    })
  })

  test('should not add empty inspirations', () => {
    render(<AppendOnlyDailyMemo />)

    const addButton = screen.getByText('追加')

    // 空の状態で追加ボタンをクリック
    fireEvent.click(addButton)

    // 何も追加されないことを確認
    expect(screen.queryByTestId('inspiration-entry')).not.toBeInTheDocument()
  })

  test('should auto-save inspirations to localStorage', async () => {
    render(<AppendOnlyDailyMemo />)

    const input = screen.getByTestId('inspiration-input')
    const addButton = screen.getByText('追加')

    // ひらめきを追加
    fireEvent.change(input, { target: { value: 'LocalStorage保存テスト' } })
    fireEvent.click(addButton)

    // アイテムが追加されることを確認
    await waitFor(() => {
      expect(screen.getByText(/LocalStorage保存テスト/)).toBeInTheDocument()
    })

    // LocalStorageに実際に保存されているかを確認
    const today = new Date().toISOString().split('T')[0]
    const savedData = localStorage.getItem(`inspiration-memo-${today}`)
    expect(savedData).toBeTruthy()
    
    const parsedData = JSON.parse(savedData!)
    expect(parsedData.inspirations).toHaveLength(1)
    expect(parsedData.inspirations[0].content).toBe('LocalStorage保存テスト')
  })

  test('should restore inspirations from localStorage on component mount', () => {
    // 事前にLocalStorageにデータを設定
    const testDate = new Date().toISOString().split('T')[0]
    const mockData = {
      date: testDate,
      inspirations: [
        {
          id: 'test-1',
          content: '復元されたアイデア',
          timestamp: new Date().toISOString()
        }
      ],
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem(`inspiration-memo-${testDate}`, JSON.stringify(mockData))

    render(<AppendOnlyDailyMemo />)

    // 復元されたアイデアが表示されることを確認
    expect(screen.getByText(/復元されたアイデア/)).toBeInTheDocument()
  })

  test('should handle localStorage errors gracefully', () => {
    // LocalStorageのsetItemでエラーを発生させる
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    render(<AppendOnlyDailyMemo />)

    const input = screen.getByTestId('inspiration-input')
    const addButton = screen.getByText('追加')

    // エラーが発生してもアプリケーションが停止しないことを確認
    expect(() => {
      fireEvent.change(input, { target: { value: 'エラーテスト' } })
      fireEvent.click(addButton)
    }).not.toThrow()
  })

  // 🔴 FAILING TEST: Reproduces data loss bug with DailyMemo integration
  test('should preserve existing DailyMemo content when adding inspirations', async () => {
    const today = new Date().toISOString().split('T')[0]
    const dailyMemoKey = `daily-memo-${today}` // Correct key used by DailyMemo.tsx
    
    // Setup: Pre-populate DailyMemo with existing JSON data (as DailyMemo.tsx does)
    const existingDailyMemoData = {
      date: today,
      content: '今日のタスク整理:\n- 朝のルーティン確認\n- プロジェクト進捗レビュー',
      lastUpdated: new Date().toISOString(),
      taskReferences: []
    }
    localStorage.setItem(dailyMemoKey, JSON.stringify(existingDailyMemoData))
    
    render(<AppendOnlyDailyMemo />)

    const input = screen.getByTestId('inspiration-input')
    const addButton = screen.getByText('追加')

    // Act - ひらめきメモを追加
    fireEvent.change(input, { target: { value: 'フォーカス中のアイデア' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByTestId('inspiration-entry')).toBeInTheDocument()
    })

    // Assert 1: Inspiration should be saved to its own storage
    const inspirationKey = `inspiration-memo-${today}`
    const inspirationData = localStorage.getItem(inspirationKey)
    expect(inspirationData).toBeDefined()
    
    // Assert 2: DailyMemo JSON structure should be preserved
    const dailyMemoData = localStorage.getItem(dailyMemoKey)
    expect(dailyMemoData).toBeDefined()
    
    // Debug: Log the fixed data
    // console.log('Fixed dailyMemoData:', dailyMemoData)
    
    // This should FAIL currently due to string overwrite bug
    const parsedDailyMemo = JSON.parse(dailyMemoData!)
    expect(parsedDailyMemo.content).toContain('今日のタスク整理')
    expect(parsedDailyMemo.content).toContain('朝のルーティン確認')
    expect(parsedDailyMemo.content).toContain('### 🎯 集中セッション記録')
    expect(parsedDailyMemo.content).toContain('フォーカス中のアイデア')
  })

  // 🔴 FAILING TEST: DailyMemo.tsx should be able to read data after inspiration addition
  test('should allow DailyMemo component to read data after inspiration addition', async () => {
    const today = new Date().toISOString().split('T')[0]
    const dailyMemoKey = `daily-memo-${today}`
    
    // Setup: Pre-populate DailyMemo with valid JSON data
    const existingDailyMemoData = {
      date: today,
      content: 'Morning notes:\n- Daily standup completed',
      lastUpdated: new Date().toISOString(),
      taskReferences: []
    }
    localStorage.setItem(dailyMemoKey, JSON.stringify(existingDailyMemoData))
    
    render(<AppendOnlyDailyMemo />)

    const input = screen.getByTestId('inspiration-input')
    const addButton = screen.getByText('追加')

    // Act - Add inspiration (this should corrupt the daily memo data)
    fireEvent.change(input, { target: { value: 'Breakthrough idea' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByTestId('inspiration-entry')).toBeInTheDocument()
    })

    // Assert: The daily memo should still be valid JSON that DailyMemo can parse
    const dailyMemoData = localStorage.getItem(dailyMemoKey)
    expect(dailyMemoData).toBeDefined()
    
    // This will FAIL - data should be parseable as JSON but currently it's corrupted
    expect(() => JSON.parse(dailyMemoData!)).not.toThrow()
    
    const parsedData = JSON.parse(dailyMemoData!)
    expect(parsedData).toHaveProperty('content')
    expect(parsedData).toHaveProperty('date')
    expect(parsedData).toHaveProperty('lastUpdated')
    expect(parsedData).toHaveProperty('taskReferences')
  })
})
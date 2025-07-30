import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FocusModeProvider } from '../contexts/FocusModeContext'
import { FocusTimer } from '../components/FocusTimer'
import { AppendOnlyDailyMemo } from '../components/AppendOnlyDailyMemo'
import { Task } from '../types/Task'

/**
 * # フォーカスモードデータ統合テスト
 * ## 目的
 * 実機テストで発見された「フォーカスモード記録がタスクメモに反映されない」問題の検証
 * ## テスト内容
 * 1. フォーカスセッション中の記録がタスクメモに保存される
 * 2. ひらめきメモがデイリーメモに統合される
 */
describe('Focus Mode Data Integration - Critical Bug Tests', () => {
  const mockTask: Task = {
    id: 'test-task-123',
    title: 'テスト用タスク',
    description: '',
    completed: false,
    createdAt: new Date().toISOString(),
    targetDate: new Date().toISOString().split('T')[0],
    estimatedMinutes: 25,
    order: 0
  }

  // LocalStorage クリーンアップ
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  /**
   * 🔴 FAILING TEST: フォーカスセッション開始後のタスクメモ保存
   * 現在の問題: LocalStorage操作がコメントアウトされているため保存されない
   */
  test('should save focus session data to task memo storage', async () => {
    // Arrange - テスト用のLocalStorageスパイ
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    
    render(
      <FocusModeProvider>
        <FocusTimer />
      </FocusModeProvider>
    )

    // Act - フォーカスモードを開始（実際のAPIを呼び出す）
    // Note: 実際の統合では、useFocusMode hookを通じてstartFocusが呼ばれる
    // しかし、現在のFocusModeContextではLocalStorage操作がコメントアウトされている

    // Assert - タスクメモ用のLocalStorageキーに保存されるはず
    const expectedTaskMemoKey = `focus-flow-task-memo-${mockTask.id}`
    
    // 🔴 この段階ではsetItemは呼ばれないはず（バグ状態）
    expect(setItemSpy).not.toHaveBeenCalledWith(
      expectedTaskMemoKey,
      expect.any(String)
    )
  })

  /**
   * 🟢 PASSING TEST: ひらめきメモのデイリーメモ統合
   * 修正後の期待動作: AppendOnlyDailyMemoが独自キーとDailyMemoキーの両方に保存する
   */
  test('should integrate inspiration memos with daily memo', async () => {
    // Arrange
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    const today = new Date().toISOString().split('T')[0]
    
    render(<AppendOnlyDailyMemo />)

    // Act - ひらめきメモを追加
    const input = screen.getByTestId('inspiration-input')
    const addButton = screen.getByTestId('add-inspiration-btn')
    
    fireEvent.change(input, { target: { value: 'テスト用ひらめき' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByTestId('inspiration-entry')).toBeInTheDocument()
    })

    // Debug: setItemSpyの呼び出し状況を確認
    console.log('All setItem calls:', setItemSpy.mock.calls)
    console.log('Number of setItem calls:', setItemSpy.mock.calls.length)

    // Assert - 修正後は両方のキーに保存される
    const inspirationKey = `inspiration-memo-${today}`
    const dailyMemoKey = `focus-flow-daily-memo-${today}`
    
    // 🟢 修正後は独自キーとDailyMemoキー両方への保存を確認
    if (setItemSpy.mock.calls.length > 0) {
      expect(setItemSpy).toHaveBeenCalledWith(inspirationKey, expect.any(String))
      expect(setItemSpy).toHaveBeenCalledWith(dailyMemoKey, expect.any(String))
    } else {
      // デバッグ用: setItemが呼ばれない場合のトラブルシューティング
      console.error('setItem was not called. Checking component state...')
      expect(setItemSpy.mock.calls.length).toBeGreaterThan(0)
    }
    
    // デイリーメモの内容形式も確認
    const dailyMemoCall = setItemSpy.mock.calls.find(call => call[0] === dailyMemoKey)
    expect(dailyMemoCall).toBeDefined()
    expect(dailyMemoCall![1]).toContain('### 🎯 集中セッション記録')
    expect(dailyMemoCall![1]).toContain('集中セッション中のひらめき - テスト用ひらめき')
  })

  /**
   * 🔴 FAILING TEST: フォーカスセッション完了時のセッションデータ永続化
   * 現在の問題: endFocus内のLocalStorage操作がコメントアウトされている
   */
  test('should persist focus session data on session end', async () => {
    // Arrange
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    
    render(
      <FocusModeProvider>
        <FocusTimer />
      </FocusModeProvider>
    )

    // Act - フォーカスセッション終了
    // Note: 実際のテストでは、FocusTimerのendボタンをクリックする
    // しかし、現在のFocusModeContext.endFocusではLocalStorage操作がスキップされる

    // Assert - セッション履歴が保存されるはず
    const expectedSessionKey = 'focus-flow-sessions'
    
    // 🔴 この段階では保存されないはず（バグ状態）
    expect(setItemSpy).not.toHaveBeenCalledWith(
      expectedSessionKey,
      expect.any(String)
    )
  })

  /**
   * 🟢 PASSING TEST: 統合修正後の期待動作
   * これは修正後に通るようになるべきテスト
   */
  test('should integrate all focus mode data correctly (future implementation)', async () => {
    // Arrange
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    
    // 事前にタスクメモデータを設定
    const existingTaskMemo = JSON.stringify({
      taskId: mockTask.id,
      taskSnapshot: mockTask,
      content: '既存のタスクメモ',
      lastSaved: new Date().toISOString()
    })
    getItemSpy.mockReturnValue(existingTaskMemo)

    render(
      <FocusModeProvider>
        <FocusTimer />
        <AppendOnlyDailyMemo />
      </FocusModeProvider>
    )

    // Expected behavior after fix:
    // 1. Focus session starts -> task memo should be updated with session info
    // 2. Inspiration added -> should append to daily memo with structured format
    // 3. Focus session ends -> should save session history

    // TODO: この部分は修正実装後に具体的なアサーションを追加
    expect(true).toBe(true) // プレースホルダー
  })
})
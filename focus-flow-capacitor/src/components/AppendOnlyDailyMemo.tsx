import React, { useState, useEffect, useCallback } from 'react'
import { logger } from '../utils/debugLogger'
import './AppendOnlyDailyMemo.css'

// DailyMemoのデータ型定義（DailyMemo.tsxとの整合性を保つ）
interface DailyMemoData {
  date: string         // YYYY-MM-DD
  content: string      // メモ本文
  lastUpdated: string  // ISO Date string
  taskReferences: any[] // 将来拡張用
}

// ひらめきエントリの型定義
interface InspirationEntry {
  id: string
  content: string
  timestamp: string
}

// ひらめきメモデータの型定義
interface InspirationMemoData {
  date: string
  inspirations: InspirationEntry[]
  lastUpdated: string
}

// ストレージキープレフィックス
const STORAGE_KEY_PREFIX = 'inspiration-memo-'

// UI定数
const MEMO_TITLE = '💡 ひらめきメモ'
const INPUT_PLACEHOLDER = '集中中のひらめき・アイデアを記録...'
const ADD_BUTTON_TEXT = '追加'

interface AppendOnlyDailyMemoProps {
  onFullscreenToggle?: () => void
}

/**
 * # AppendOnly デイリーメモコンポーネント
 * ## 用途
 * フォーカスモード中のひらめき・アイデアを追記専用で記録
 * ## 引数
 * - onFullscreenToggle?: () => void - フルスクリーンモード切り替え時のコールバック
 * ## 戻り値
 * JSX.Element - 追記専用ひらめきメモエディタ
 */
export const AppendOnlyDailyMemo: React.FC<AppendOnlyDailyMemoProps> = ({ onFullscreenToggle }) => {
  const [inputValue, setInputValue] = useState('')
  const [inspirations, setInspirations] = useState<InspirationEntry[]>([])
  const [isFullscreenMode, setIsFullscreenMode] = useState(false)

  // 今日の日付キーを取得
  const getTodayKey = useCallback((): string => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    return `${STORAGE_KEY_PREFIX}${today}`
  }, [])

  // 今日の日付を取得
  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0]
  }

  // DailyMemoDataを安全に取得または作成するヘルパー関数
  const getDailyMemoDataSafely = (storageKey: string): DailyMemoData => {
    const existingData = localStorage.getItem(storageKey)
    
    if (existingData) {
      try {
        const parsedData = JSON.parse(existingData) as DailyMemoData
        return parsedData
      } catch (_error) {
        // 後方互換性: 古い文字列形式をJSON形式に移行
        logger.warn('Legacy string format detected, migrating to JSON format')
        return {
          date: getTodayDate(),
          content: existingData,
          lastUpdated: new Date().toISOString(),
          taskReferences: []
        }
      }
    }
    
    // 新規作成
    return {
      date: getTodayDate(),
      content: '',
      lastUpdated: new Date().toISOString(),
      taskReferences: []
    }
  }

  // LocalStorageから保存されたひらめきメモを取得
  const loadSavedInspirations = useCallback((): InspirationEntry[] => {
    try {
      const savedData = localStorage.getItem(getTodayKey())
      if (savedData) {
        const parsed = JSON.parse(savedData) as InspirationMemoData
        return parsed.inspirations || []
      }
    } catch (error) {
      logger.warn('Failed to load saved inspirations:', error)
    }
    return []
  }, [getTodayKey])

  // LocalStorageにひらめきメモを保存
  const saveInspirations = (inspirationList: InspirationEntry[]): void => {
    try {
      const memoData: InspirationMemoData = {
        date: getTodayDate(),
        inspirations: inspirationList,
        lastUpdated: new Date().toISOString()
      }
      
      // Debug: 保存処理の開始
      logger.debug('saveInspirations called:', { inspirationList, todayKey: getTodayKey() })
      
      localStorage.setItem(getTodayKey(), JSON.stringify(memoData))
      logger.debug('Saved to inspiration storage successfully')
      
      // デイリーメモにも統合保存
      if (inspirationList.length > 0) {
        saveToDailyMemo(inspirationList[inspirationList.length - 1]) // 最新のひらめきを追記
      }
    } catch (error) {
      logger.warn('Failed to save inspirations:', error)
    }
  }
  
  // ひらめきメモをデイリーメモに追記する（JSON形式を保持）
  const saveToDailyMemo = (inspiration: InspirationEntry): void => {
    try {
      const todayKey = `daily-memo-${getTodayDate()}`
      
      // フォーマット済みエントリを作成
      const formattedEntry = `**${new Date(inspiration.timestamp).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      })}** 集中セッション中のひらめき - ${inspiration.content}`
      
      // 既存のDailyMemoDataを安全に取得
      const dailyMemoData = getDailyMemoDataSafely(todayKey)
      const existingContent = dailyMemoData.content
      
      // コンテンツに集中セッション記録を追記
      if (existingContent.includes('### 🎯 集中セッション記録')) {
        // 既存セクションに追記
        dailyMemoData.content = existingContent + '\n' + formattedEntry
      } else {
        // 新規セクション作成
        dailyMemoData.content = existingContent + 
          (existingContent.trim() ? '\n\n---\n' : '') + 
          '### 🎯 集中セッション記録\n' + formattedEntry
      }
      
      // 更新時刻を更新
      dailyMemoData.lastUpdated = new Date().toISOString()
      
      // JSON形式で保存
      localStorage.setItem(todayKey, JSON.stringify(dailyMemoData))
      logger.debug('Inspiration saved to daily memo:', { todayKey, formattedEntry })
    } catch (error) {
      logger.warn('Failed to save inspiration to daily memo:', error)
    }
  }

  // 新しいひらめきを追加
  const addInspiration = (): void => {
    const trimmedInput = inputValue.trim()
    if (!trimmedInput) return

    const newInspiration: InspirationEntry = {
      id: `inspiration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: trimmedInput,
      timestamp: new Date().toISOString()
    }

    const updatedInspirations = [...inspirations, newInspiration]
    setInspirations(updatedInspirations)
    
    // Debug: 保存処理の確認
    logger.debug('Adding inspiration:', { newInspiration, updatedInspirations })
    
    saveInspirations(updatedInspirations)
    setInputValue('')
  }

  // Enterキーでの追加
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addInspiration()
    }
  }


  // 初回ロード時に保存されたひらめきを復元
  useEffect(() => {
    const savedInspirations = loadSavedInspirations()
    setInspirations(savedInspirations)
  }, [loadSavedInspirations])

  return (
    <div 
      className="append-only-daily-memo"
      data-testid="append-only-daily-memo"
    >
      <h3 className="inspiration-title">{MEMO_TITLE}</h3>
      
      {/* ひらめき入力エリア */}
      <div className="inspiration-input-section">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={INPUT_PLACEHOLDER}
          className="inspiration-input"
          data-testid="inspiration-input"
        />
        <button
          onClick={addInspiration}
          className="add-inspiration-btn"
          data-testid="add-inspiration-btn"
        >
          {ADD_BUTTON_TEXT}
        </button>
      </div>

      {/* ひらめき件数がある場合のみ一覧表示ボタンを表示 */}
      {inspirations.length > 0 && (
        <button
          className="inspirations-view-all-btn"
          onClick={() => setIsFullscreenMode(true)}
          data-testid="inspirations-view-all-btn"
        >
          🔍 一覧表示 ({inspirations.length}件)
        </button>
      )}

      {/* フルスクリーンモード */}
      {isFullscreenMode && (
        <div 
          className="inspirations-fullscreen-overlay"
          data-testid="inspirations-fullscreen-overlay"
        >
          <div className="inspirations-fullscreen-content">
            <div className="inspirations-fullscreen-header">
              <h3>💡 ひらめき履歴</h3>
              <button 
                className="inspirations-close-btn"
                onClick={() => {
                  setIsFullscreenMode(false)
                  onFullscreenToggle?.()
                }}
              >
                ✕
              </button>
            </div>
            <div 
              className="inspirations-fullscreen-list"
              data-testid="inspirations-fullscreen-list"
            >
              {inspirations.map((inspiration) => (
                <div key={inspiration.id} className="inspiration-item-full">
                  <div className="inspiration-timestamp">
                    {new Date(inspiration.timestamp).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="inspiration-content">
                    {inspiration.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
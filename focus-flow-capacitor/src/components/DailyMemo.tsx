import React, { useState, useEffect, useRef } from 'react'
import { AUTO_SAVE } from '../constants/ui'

// DailyMemoのデータ型定義
interface TaskReference {
  taskId: string
  taskTitle: string
  timestamp: string
}

interface DailyMemoData {
  date: string         // YYYY-MM-DD
  content: string      // メモ本文
  lastUpdated: string  // ISO Date string
  taskReferences: TaskReference[]
}

// 定数定義 (AUTO_SAVE_DELAY は統一定数を使用)
const AUTO_SAVE_DELAY = AUTO_SAVE.DELAY_MS // 自動保存の間隔（3秒）
const STORAGE_KEY_PREFIX = 'daily-memo-'
const MEMO_PLACEHOLDER = '今日の出来事や気付きをメモしてください...'
const MEMO_TITLE = '📝 デイリーメモ'
const AUTO_SAVE_INFO = '📄 自動保存: 入力停止から3秒後'

// UI定数
const TEXTAREA_ROWS = 10
const TEXTAREA_MIN_HEIGHT = '200px'
const TEXTAREA_PADDING = '1rem'
const TEXTAREA_BORDER_RADIUS = '0.5rem'
const TEXTAREA_FONT_SIZE = '1rem'
const TEXTAREA_BORDER_COLOR = '#e2e8f0'
const INFO_TEXT_FONT_SIZE = '0.875rem'
const INFO_TEXT_COLOR = '#718096'
const INFO_TEXT_MARGIN_TOP = '0.5rem'

export interface DailyMemoProps {
  embedded?: boolean
  onQuoteRequest?: (content: string) => void
}

export const DailyMemo: React.FC<DailyMemoProps> = ({ 
  embedded = false,
  onQuoteRequest: _onQuoteRequest 
}) => {
  const [content, setContent] = useState('')
  const autoSaveTimerRef = useRef<number | null>(null)

  // 今日の日付キーを取得
  const getTodayKey = (): string => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    return `${STORAGE_KEY_PREFIX}${today}`
  }

  // 今日の日付を取得（保存用）
  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0]
  }

  // LocalStorageから保存されたメモを解析
  const parseSavedMemo = (savedData: string): DailyMemoData | null => {
    try {
      return JSON.parse(savedData) as DailyMemoData
    } catch (error) {
      console.warn('Failed to parse saved memo:', error)
      return null
    }
  }

  // LocalStorageから保存されたメモを取得
  const loadSavedMemo = (): string => {
    try {
      const savedData = localStorage.getItem(getTodayKey())
      if (savedData) {
        const parsed = parseSavedMemo(savedData)
        return parsed?.content || ''
      }
    } catch (error) {
      console.warn('Failed to load saved memo:', error)
    }
    return ''
  }

  // LocalStorageにメモを保存
  const saveMemo = (memoContent: string): void => {
    try {
      const trimmedContent = memoContent.trim()
      const memoData: DailyMemoData = {
        date: getTodayDate(),
        content: trimmedContent,
        lastUpdated: new Date().toISOString(),
        taskReferences: []
      }
      localStorage.setItem(getTodayKey(), JSON.stringify(memoData))
    } catch (error) {
      console.warn('Failed to save memo:', error)
    }
  }

  // タイマーをクリアする
  const clearAutoSaveTimer = (): void => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
    }
  }

  // 自動保存タイマーを設定する
  const scheduleAutoSave = (memoContent: string): void => {
    clearAutoSaveTimer()
    autoSaveTimerRef.current = window.setTimeout(() => {
      saveMemo(memoContent)
    }, AUTO_SAVE_DELAY)
  }

  // 初回ロード時に保存されたメモを復元
  useEffect(() => {
    const savedContent = loadSavedMemo()
    setContent(savedContent)
  }, [])

  // コンポーネントアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      clearAutoSaveTimer()
    }
  }, [])

  // メモ内容の変更を処理
  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value
    setContent(newContent)
    scheduleAutoSave(newContent)
  }

  return (
    <div className={`daily-memo ${embedded ? 'embedded' : 'standalone'}`} data-testid="daily-memo">
      {!embedded && <h2>{MEMO_TITLE}</h2>}
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder={MEMO_PLACEHOLDER}
        aria-label="デイリーメモ"
        className="daily-memo-textarea"
        data-testid="daily-memo-textarea"
        rows={TEXTAREA_ROWS}
        style={{
          width: '100%',
          padding: TEXTAREA_PADDING,
          border: `1px solid ${TEXTAREA_BORDER_COLOR}`,
          borderRadius: TEXTAREA_BORDER_RADIUS,
          fontSize: TEXTAREA_FONT_SIZE,
          fontFamily: 'inherit',
          resize: 'vertical',
          minHeight: TEXTAREA_MIN_HEIGHT
        }}
      />
      <p style={{ 
        fontSize: INFO_TEXT_FONT_SIZE, 
        color: INFO_TEXT_COLOR, 
        marginTop: INFO_TEXT_MARGIN_TOP 
      }}>
        {AUTO_SAVE_INFO}
      </p>
    </div>
  )
}
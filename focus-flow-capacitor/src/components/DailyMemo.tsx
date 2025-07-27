import React, { useState, useEffect, useRef } from 'react'
import { AUTO_SAVE } from '../constants/ui'

// 自動保存状態の型定義
interface SaveStatus {
  status: 'idle' | 'saving' | 'success' | 'error'
  message?: string
}

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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ status: 'idle' })
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
      // プロダクション環境向けにconsole.warnを除去
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
      // プロダクション環境向けにconsole.warnを除去
    }
    return ''
  }

  // LocalStorageにメモを保存（状態インジケーター付き）
  const saveWithStatus = (memoContent: string): void => {
    // 即座に保存中状態に設定
    setSaveStatus({ status: 'saving' })
    
    // マイクロタスクで実際の保存処理を実行（状態更新を確実に反映）
    Promise.resolve().then(() => {
      try {
        const trimmedContent = memoContent.trim()
        const memoData: DailyMemoData = {
          date: getTodayDate(),
          content: trimmedContent,
          lastUpdated: new Date().toISOString(),
          taskReferences: []
        }
        
        localStorage.setItem(getTodayKey(), JSON.stringify(memoData))
        
        // 成功状態を表示し、1.5秒後にアイドル状態に戻す
        setTimeout(() => {
          setSaveStatus({ status: 'success' })
          
          // 1.5秒後にアイドル状態に戻す（ユーザーが確認できる十分な時間）
          setTimeout(() => {
            setSaveStatus({ status: 'idle' })
          }, 1500)
        }, 50) // saving状態を最低50ms表示
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        // QuotaExceededErrorの特別処理
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          setSaveStatus({ 
            status: 'error', 
            message: '容量不足のため保存できません' 
          })
        } else {
          setSaveStatus({ 
            status: 'error', 
            message: errorMessage 
          })
        }
        
        // プロダクション環境向けにconsole.warnを除去
      }
    })
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
      saveWithStatus(memoContent)
    }, AUTO_SAVE_DELAY)
  }

  // 初回ロード時に保存されたメモを復元
  useEffect(() => {
    const savedContent = loadSavedMemo()
    setContent(savedContent)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  // 保存状態インジケーターコンポーネント
  const SaveStatusIndicator: React.FC<{ status: SaveStatus }> = ({ status }) => {
    if (status.status === 'idle') return null

    return (
      <div 
        className={`save-indicator ${status.status}`} 
        data-testid="save-status-indicator"
        style={{
          display: 'inline-block',
          marginTop: '8px',
          padding: '6px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
          backgroundColor: status.status === 'saving' ? '#fbbf24' : 
                          status.status === 'success' ? '#10b981' : '#ef4444',
          color: status.status === 'saving' ? '#92400e' : 'white'
        }}>
        {status.status === 'saving' && (
          <>
            💾 保存中...
          </>
        )}
        {status.status === 'success' && (
          <>
            ✅ 保存完了
          </>
        )}
        {status.status === 'error' && (
          <>
            ❌ 保存失敗: {status.message}
          </>
        )}
      </div>
    )
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
      <SaveStatusIndicator status={saveStatus} />
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
import React, { useState, useEffect, useRef } from 'react'
import { Task, TaskMemoData } from '../types/Task'
import { useTaskMemoStorage } from '../hooks/useTaskMemoStorage'
import { AUTO_SAVE } from '../constants/ui'
import { logger } from '../utils/debugLogger'

// 自動保存状態の型定義
interface SaveStatus {
  status: 'idle' | 'saving' | 'success' | 'error'
  message?: string
}

// タイミング定数 (統一定数を使用)
const AUTO_SAVE_DELAY = AUTO_SAVE.DELAY_MS // 自動保存の間隔（3秒）

// テキスト定数
const MEMO_PLACEHOLDER = 'このタスクに関するメモを記録してください...'
const AUTO_SAVE_INFO = '📄 自動保存: 入力停止から3秒後'
const TASK_MEMO_ICON = '📝'
const QUOTE_ICON = '🔗'
const UNKNOWN_TASK_TITLE = 'Unknown Task'
const QUOTE_BUTTON_TEXT = '引用'

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

// ヘッダー定数
const HEADER_MARGIN_BOTTOM = '1rem'
const HEADER_PADDING = '1rem'
const HEADER_BORDER = '1px solid #e2e8f0'
const HEADER_BORDER_RADIUS = '0.5rem'

interface TaskMemoProps {
  taskId: string
  task?: Task
  onTaskAction?: (action: 'toggle' | 'delete' | 'focus', taskId: string) => void
}

export const TaskMemo: React.FC<TaskMemoProps> = ({ taskId, task, onTaskAction: _onTaskAction }) => {
  const [content, setContent] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ status: 'idle' })
  const autoSaveTimerRef = useRef<number | null>(null)
  
  // タスクメモストレージ
  const [taskMemo, setTaskMemo] = useTaskMemoStorage(taskId)

  // タスクスナップショットを生成する
  const createTaskSnapshot = (task: Task) => {
    if (!task) return {
      title: UNKNOWN_TASK_TITLE,
      description: undefined,
      tags: [],
      estimatedMinutes: 0,
      createdAt: new Date()
    }

    return {
      title: task.title,
      description: task.description,
      tags: task.tags,
      estimatedMinutes: task.estimatedMinutes,
      createdAt: task.createdAt
    }
  }

  // LocalStorageにメモを保存（状態インジケーター付き）
  const saveWithStatus = async (memoContent: string): Promise<void> => {
    setSaveStatus({ status: 'saving' })
    
    try {
      const trimmedContent = memoContent.trim()
      const memoData: TaskMemoData = {
        taskId,
        content: trimmedContent,
        lastUpdated: new Date().toISOString(),
        taskSnapshot: task ? createTaskSnapshot(task) : { title: '', description: '', tags: [], estimatedMinutes: 0, createdAt: new Date() }
      }
      
      // 保存処理を非同期で実行（テスト時のPromise解決を待つ）
      await Promise.resolve(setTaskMemo(memoData))
      
      setSaveStatus({ status: 'success' })
      
      // 2秒後にアイドル状態に戻す
      window.setTimeout(() => setSaveStatus({ status: 'idle' }), 2000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setSaveStatus({ 
        status: 'error', 
        message: errorMessage 
      })
      logger.warn('Failed to save task memo:', error)
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
      saveWithStatus(memoContent)
    }, AUTO_SAVE_DELAY)
  }

  // taskIdの変更時やメモデータの変更時にコンテンツを復元
  useEffect(() => {
    // タスク切り替え時に自動保存タイマーをクリア
    clearAutoSaveTimer()
    
    if (taskMemo) {
      setContent(taskMemo.content)
    } else {
      // taskIdが変更されて新しいタスクのメモが空の場合、contentもクリア
      setContent('')
    }
  }, [taskMemo, taskId])

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

  // 引用ボタンのハンドラー
  const handleQuote = () => {
    // 仮実装: まだ機能は実装しない
    logger.info('Quote button clicked')
  }

  // 保存状態インジケーターコンポーネント
  const SaveStatusIndicator: React.FC<{ status: SaveStatus }> = ({ status }) => {
    if (status.status === 'idle') return null

    return (
      <div className={`save-indicator ${status.status}`} style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 1000,
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

  // タスクが存在しない場合のハンドリング
  if (!task) {
    return (
      <div className="task-memo-error">
        <p>タスクが見つかりません</p>
      </div>
    )
  }

  return (
    <div className="task-memo">
      <SaveStatusIndicator status={saveStatus} />
      {/* タスク情報ヘッダー */}
      <div className="task-header" style={{ 
        marginBottom: HEADER_MARGIN_BOTTOM, 
        padding: HEADER_PADDING, 
        border: HEADER_BORDER, 
        borderRadius: HEADER_BORDER_RADIUS 
      }}>
        <h2>{TASK_MEMO_ICON} {task.title}</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
          <span>{task.estimatedMinutes}分</span>
          {task.tags.length > 0 && (
            <span>{task.tags.join(', ')}</span>
          )}
          <button onClick={handleQuote} aria-label={QUOTE_BUTTON_TEXT}>
            {QUOTE_ICON} {QUOTE_BUTTON_TEXT}
          </button>
        </div>
      </div>

      {/* メモエリア */}
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder={MEMO_PLACEHOLDER}
        aria-label="タスクメモ"
        className="task-memo-textarea"
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
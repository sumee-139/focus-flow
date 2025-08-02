import React, { useState, useEffect, useRef } from 'react'
import { Task, TaskMemoData } from '../types/Task'
import { useTaskMemoStorage } from '../hooks/useTaskMemoStorage'
import { AUTO_SAVE } from '../constants/ui'
import { logger } from '../utils/debugLogger'
import './EmbeddedTaskMemo.css'

// 自動保存状態の型定義
interface SaveStatus {
  status: 'idle' | 'saving' | 'success' | 'error'
  message?: string
}

// タイミング定数 (統一定数を使用)
const AUTO_SAVE_DELAY = AUTO_SAVE.DELAY_MS // 自動保存の間隔（3秒）

// テキスト定数
const MEMO_PLACEHOLDER = 'フォーカス中のメモ・アイデア・気づきを記録...'
const AUTO_SAVE_INFO = '📄 自動保存: 入力停止から3秒後'
const TASK_MEMO_ICON = '📝'

interface EmbeddedTaskMemoProps {
  currentTask: Task
  readOnly?: boolean
  autoSave?: boolean
}

/**
 * # 埋め込み型タスクメモコンポーネント
 * ## 用途
 * FocusModeLayoutに埋め込み表示するタスクメモエディタ
 * ## 引数
 * - currentTask: Task - 現在フォーカス中のタスク
 * - readOnly?: boolean - 読み取り専用モード（デフォルト: false）
 * - autoSave?: boolean - 自動保存有効（デフォルト: true）
 * ## 戻り値
 * JSX.Element - 埋め込み型タスクメモエディタ
 */
export const EmbeddedTaskMemo: React.FC<EmbeddedTaskMemoProps> = ({ 
  currentTask, 
  readOnly = false, 
  autoSave = true 
}) => {
  const [content, setContent] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ status: 'idle' })
  const autoSaveTimerRef = useRef<number | null>(null)
  
  // タスクメモストレージ
  const [taskMemo, setTaskMemo] = useTaskMemoStorage(currentTask.id)

  // タスクスナップショットを生成する
  const createTaskSnapshot = (task: Task) => {
    return {
      title: task.title,
      description: task.description || '',
      tags: task.tags || [],
      estimatedMinutes: task.estimatedMinutes || 0,
      createdAt: task.createdAt
    }
  }

  // LocalStorageにメモを保存（状態インジケーター付き）
  const saveWithStatus = async (memoContent: string): Promise<void> => {
    if (readOnly || !autoSave) return
    
    setSaveStatus({ status: 'saving' })
    
    try {
      const trimmedContent = memoContent.trim()
      const memoData: TaskMemoData = {
        taskId: currentTask.id,
        content: trimmedContent,
        lastUpdated: new Date().toISOString(),
        taskSnapshot: createTaskSnapshot(currentTask)
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
      logger.warn('Failed to save embedded task memo:', error)
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
    if (!autoSave || readOnly) return
    
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
  }, [taskMemo, currentTask.id])

  // コンポーネントアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      clearAutoSaveTimer()
    }
  }, [])

  // メモ内容の変更を処理
  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (readOnly) return
    
    const newContent = event.target.value
    setContent(newContent)
    scheduleAutoSave(newContent)
  }

  // 保存状態インジケーターコンポーネント
  const SaveStatusIndicator: React.FC<{ status: SaveStatus }> = ({ status }) => {
    if (status.status === 'idle' || !autoSave) return null

    return (
      <div 
        className={`embedded-save-indicator ${status.status}`}
        data-testid="embedded-save-indicator"
      >
        {status.status === 'saving' && '💾 保存中...'}
        {status.status === 'success' && '✅ 保存完了'}
        {status.status === 'error' && `❌ 保存失敗: ${status.message}`}
      </div>
    )
  }

  return (
    <div 
      className="embedded-task-memo" 
      data-testid="embedded-task-memo"
      data-auto-save={autoSave.toString()}
      data-read-only={readOnly.toString()}
    >
      <SaveStatusIndicator status={saveStatus} />
      
      {/* タスク情報ヘッダー（簡略版） */}
      <div className="embedded-task-header">
        <h3 className="embedded-task-title">
          {TASK_MEMO_ICON} {currentTask.title}
        </h3>
        <div className="embedded-task-meta">
          <span>{currentTask.estimatedMinutes || 0}分</span>
          {currentTask.tags && currentTask.tags.length > 0 && (
            <span>{currentTask.tags.join(', ')}</span>
          )}
        </div>
      </div>

      {/* メモエリア */}
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder={MEMO_PLACEHOLDER}
        aria-label="埋め込みタスクメモ"
        className="embedded-memo-textarea"
        readOnly={readOnly}
        data-testid="embedded-memo-textarea"
      />
      
      {autoSave && !readOnly && (
        <p className="embedded-auto-save-info">
          {AUTO_SAVE_INFO}
        </p>
      )}
    </div>
  )
}
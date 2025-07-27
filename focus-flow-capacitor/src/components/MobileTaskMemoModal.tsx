import React, { useState, useEffect, useRef, useCallback } from 'react'
import { AUTO_SAVE, Z_INDEX } from '../constants/ui'
import { logger } from '../utils/debugLogger'

// モバイル全画面タスクメモモーダルのProps
interface MobileTaskMemoModalProps {
  isOpen: boolean
  taskId: string
  taskTitle: string
  taskMemoContent: string
  onSave: (content: string) => void
  onClose: () => void
}

// UI定数（統一定数を使用）
const AUTO_SAVE_DELAY = AUTO_SAVE.DELAY_MS
const MODAL_Z_INDEX = Z_INDEX.MODAL

// テキスト定数
const MODAL_HEADER_TEXT = '📝 タスクメモ'
const CLOSE_BUTTON_TEXT = '← 戻る'
const MEMO_PLACEHOLDER = 'このタスクに関するメモを記録してください...'

export const MobileTaskMemoModal: React.FC<MobileTaskMemoModalProps> = ({
  isOpen,
  taskId,
  taskTitle,
  taskMemoContent,
  onSave,
  onClose
}) => {
  const [content, setContent] = useState(taskMemoContent)
  const autoSaveTimerRef = useRef<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // 自動保存タイマーをクリア
  const clearAutoSaveTimer = useCallback((): void => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
    }
  }, [])

  // 自動保存をスケジュール
  const scheduleAutoSave = useCallback((newContent: string): void => {
    clearAutoSaveTimer()
    setSaveStatus('saving')
    
    autoSaveTimerRef.current = window.setTimeout(() => {
      try {
        onSave(newContent)
        setSaveStatus('saved')
        // 2秒後にsavedステータスをクリア
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch (error) {
        logger.warn('Failed to save task memo:', error)
        setSaveStatus('error')
        // 3秒後にerrorステータスをクリア
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    }, AUTO_SAVE_DELAY)
  }, [clearAutoSaveTimer, onSave])

  // コンテンツ変更ハンドラ
  const handleContentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value
    setContent(newContent)
    scheduleAutoSave(newContent)
  }, [scheduleAutoSave])

  // モーダルクローズハンドラ
  const handleClose = useCallback(() => {
    clearAutoSaveTimer()
    
    // 🟢 T007: 戻るボタンでも現在の内容を保存
    try {
      setSaveStatus('saving')
      onSave(content)
      setSaveStatus('saved')
    } catch (error) {
      logger.warn('Failed to save task memo on close:', error)
      setSaveStatus('error')
    }
    
    onClose()
  }, [clearAutoSaveTimer, onSave, content, onClose])

  // コンテンツ初期化
  useEffect(() => {
    setContent(taskMemoContent)
  }, [taskMemoContent])


  // モーダルが閉じている場合は何も表示しない
  if (!isOpen) {
    return null
  }

  return (
    <div 
      className="mobile-modal" 
      data-testid="mobile-task-memo-modal"
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: MODAL_Z_INDEX,
        background: 'var(--background, white)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* モーダルヘッダー */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '1.1rem',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          {CLOSE_BUTTON_TEXT}
        </button>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{MODAL_HEADER_TEXT}</h2>
        <div style={{ width: '60px' }} /> {/* spacer */}
      </div>

      {/* タスク情報ヘッダー */}
      <div 
        data-testid="task-info-header" 
        style={{
          padding: '1rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8f9fa'
        }}
      >
        <h3 style={{ margin: 0, color: '#2d3748' }}>{taskTitle}</h3>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#718096' }}>
          Task ID: {taskId}
        </p>
      </div>

      {/* メモエリア */}
      <div style={{ flex: 1, padding: '1rem' }}>
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder={MEMO_PLACEHOLDER}
          aria-label="タスクメモ"
          style={{
            width: '100%',
            height: '100%',
            padding: '1rem',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none'
          }}
        />
      </div>

      {/* 🔵 Blue Phase: 保存状態フィードバックUI */}
      <div style={{
        padding: '0.5rem 1rem',
        borderTop: '1px solid #e2e8f0',
        fontSize: '0.875rem',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        {saveStatus === 'idle' && (
          <span style={{ color: '#718096' }}>📄 自動保存: 入力停止から3秒後</span>
        )}
        {saveStatus === 'saving' && (
          <span style={{ color: '#3182ce' }}>💾 保存中...</span>
        )}
        {saveStatus === 'saved' && (
          <span style={{ color: '#38a169' }}>✅ 保存完了</span>
        )}
        {saveStatus === 'error' && (
          <span style={{ color: '#e53e3e' }}>⚠️ 保存に失敗しました</span>
        )}
      </div>
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { TaskMemo } from './TaskMemo'
import { DailyMemo } from './DailyMemo'
import type { Task } from '../types/Task'
import { MEDIA_QUERIES } from '../constants/ui'
import './MemoPanel.css'

export interface MemoPanelProps {
  isOpen: boolean
  mode: 'task' | 'daily'
  selectedTaskId?: string
  selectedTask?: Task
  onClose: () => void
  onModeChange: (mode: 'task' | 'daily') => void
  onTaskAction?: (action: 'toggle' | 'delete' | 'focus', taskId: string) => void
}

export const MemoPanel: React.FC<MemoPanelProps> = ({
  isOpen,
  mode,
  selectedTaskId,
  selectedTask,
  onClose,
  onModeChange,
  onTaskAction
}) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      try {
        setIsMobile(window.matchMedia(MEDIA_QUERIES.MOBILE).matches)
      } catch (error) {
        console.warn('matchMedia not supported:', error)
        setIsMobile(false) // デスクトップとして扱う
      }
    }
    
    checkIsMobile()
    
    let mediaQuery: MediaQueryList | null = null
    try {
      mediaQuery = window.matchMedia(MEDIA_QUERIES.MOBILE)
      mediaQuery.addEventListener('change', checkIsMobile)
    } catch (error) {
      console.warn('matchMedia event listener not supported:', error)
    }
    
    return () => {
      try {
        mediaQuery?.removeEventListener('change', checkIsMobile)
      } catch (error) {
        // cleanup error は無視
      }
    }
  }, [])

  if (!isOpen) return null

  const panelClasses = [
    'memo-panel',
    isMobile ? 'mobile' : 'desktop',
    mode === 'task' ? 'task-mode' : 'daily-mode'
  ].join(' ')

  return (
    <>
      {/* Desktop overlay */}
      {!isMobile && (
        <div 
          data-testid="app-overlay"
          className="app-overlay"
          onClick={onClose}
        />
      )}
      
      <div data-testid="memo-panel" className={panelClasses}>
        {/* Header */}
        <div className="memo-panel-header">
          <button 
            onClick={onClose}
            className="close-button"
            aria-label="Close panel"
          >
            ← 戻る
          </button>
          
          <div className="mode-switcher">
            <button
              onClick={() => onModeChange('task')}
              className={mode === 'task' ? 'active' : ''}
              disabled={!selectedTask}
            >
              Task Memo
            </button>
            <button
              onClick={() => onModeChange('daily')}
              className={mode === 'daily' ? 'active' : ''}
            >
              Daily Memo
            </button>
          </div>
        </div>

        {/* Task header for mobile task mode */}
        {isMobile && mode === 'task' && selectedTask && (
          <div data-testid="task-header" className="task-header">
            <h3>{selectedTask.title}</h3>
            <div data-testid="task-actions" className="task-actions">
              {/* 完了切り替え */}
              <button
                onClick={() => onTaskAction?.('toggle', selectedTask.id)}
                className={`task-action-btn ${selectedTask.completed ? 'completed' : 'pending'}`}
                aria-label="完了切り替え"
                title="完了状態を切り替える"
              >
                {selectedTask.completed ? '✅' : '⭕'}
              </button>
              
              {/* 削除 */}
              <button
                onClick={() => onTaskAction?.('delete', selectedTask.id)}
                className="task-action-btn delete"
                aria-label="削除"
                title="タスクを削除する"
              >
                🗑️
              </button>
              
              {/* フォーカスモード */}
              <button
                onClick={() => onTaskAction?.('focus', selectedTask.id)}
                className="task-action-btn focus"
                aria-label="フォーカスモード"
                title="このタスクでフォーカスモードを開始"
              >
                🎯
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="memo-panel-content">
          {mode === 'task' && selectedTaskId && selectedTask ? (
            <TaskMemo 
              taskId={selectedTaskId}
              task={selectedTask}
              onTaskAction={onTaskAction}
            />
          ) : mode === 'daily' ? (
            <DailyMemo embedded={true} />
          ) : null}
        </div>
      </div>
    </>
  )
}
import React, { useState, useCallback, useEffect } from 'react'
import { Task } from '../types/Task'
import { CircularTimer } from './CircularTimer'
import { EmbeddedTaskMemo } from './EmbeddedTaskMemo'
import { AppendOnlyDailyMemo } from './AppendOnlyDailyMemo'
import './FocusModeLayout.css'

interface FocusModeLayoutProps {
  currentTask: Task
}

/**
 * # フォーカスモード統合レイアウトコンポーネント
 * ## 用途
 * タイマー+タスクメモ+デイリーメモの同時表示による集中環境提供
 * ## 引数
 * - currentTask: Task - 現在フォーカス中のタスク
 * ## 戻り値
 * JSX.Element - レスポンシブ分割レイアウト
 */
export const FocusModeLayout: React.FC<FocusModeLayoutProps> = ({ currentTask }) => {
  const [showDailyMemo, setShowDailyMemo] = useState(false)
  const [screenSize, setScreenSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  // レスポンシブ検出
  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth
    if (width >= 1200) {
      setScreenSize('desktop')
    } else if (width >= 768) {
      setScreenSize('tablet')
    } else {
      setScreenSize('mobile')
    }
  }, [])

  useEffect(() => {
    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [updateScreenSize])

  // Ctrl+I キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'i') {
        event.preventDefault()
        setShowDailyMemo(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleDailyMemoToggle = useCallback(() => {
    setShowDailyMemo(prev => !prev)
  }, [])

  // デスクトップレイアウト（1200px以上）
  if (screenSize === 'desktop') {
    return (
      <div 
        className="focus-mode-layout desktop-layout"
        data-testid="focus-mode-layout-desktop"
      >
        <div className="timer-section timer-left" data-testid="timer-section-left">
          <CircularTimer size="large" />
        </div>
        
        <div className="memo-section memo-right" data-testid="memo-section-right">
          <EmbeddedTaskMemo 
            currentTask={currentTask}
            autoSave={true}
            readOnly={false}
          />
        </div>
        
        <div className="daily-memo-section inspiration-bottom" data-testid="daily-memo-section-bottom">
          <button
            className="daily-memo-toggle-button"
            data-testid="daily-memo-toggle-button"
            onClick={handleDailyMemoToggle}
          >
            💡 ひらめきメモ {showDailyMemo ? '▲' : '▼'}
          </button>
          {showDailyMemo && (
            <AppendOnlyDailyMemo />
          )}
        </div>
      </div>
    )
  }

  // タブレットレイアウト（768px-1199px）
  if (screenSize === 'tablet') {
    return (
      <div 
        className="focus-mode-layout tablet-layout"
        data-testid="focus-mode-layout-tablet"
      >
        <div className="timer-section timer-top" data-testid="timer-section-top">
          <CircularTimer size="medium" />
        </div>
        
        <div className="memo-section memo-bottom" data-testid="memo-section-bottom">
          <EmbeddedTaskMemo 
            currentTask={currentTask}
            autoSave={true}
            readOnly={false}
          />
        </div>
        
        <div className="daily-memo-section inspiration-overlay" data-testid="daily-memo-section-overlay">
          <button
            className="daily-memo-toggle-button"
            data-testid="daily-memo-toggle-button"
            onClick={handleDailyMemoToggle}
          >
            💡 ひらめき
          </button>
          {showDailyMemo && (
            <AppendOnlyDailyMemo />
          )}
        </div>
      </div>
    )
  }

  // モバイルレイアウト（768px未満）
  return (
    <div 
      className="focus-mode-layout mobile-layout"
      data-testid="focus-mode-layout-mobile"
    >
      <div className="timer-section timer-compact" data-testid="timer-section-compact">
        <CircularTimer size="small" />
      </div>
      
      <div className="memo-section memo-main" data-testid="memo-section-main">
        <EmbeddedTaskMemo 
          currentTask={currentTask}
          autoSave={true}
          readOnly={false}
        />
      </div>
      
      <div className="daily-memo-section inspiration-float" data-testid="daily-memo-section-float">
        <button
          className="daily-memo-toggle-button floating-button"
          data-testid="daily-memo-toggle-button"
          onClick={handleDailyMemoToggle}
        >
          💡
        </button>
        {showDailyMemo && (
          <div 
            data-testid="append-only-daily-memo"
            className="append-only-daily-memo"
          >
            AppendOnly DailyMemo
          </div>
        )}
      </div>
    </div>
  )
}
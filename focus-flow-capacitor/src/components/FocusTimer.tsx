import React from 'react'
import { useFocusMode } from '../contexts/FocusModeContext'
import './FocusTimer.css'

/**
 * # 円型インジケーター付きフォーカスタイマーコンポーネント
 * ## 用途
 * フォーカスモード中に円型プログレスバーで残り時間を表示し、操作ボタンを提供
 * ## 引数
 * なし
 * ## 戻り値
 * JSX.Element | null - フォーカスモード中のみ表示
 */
export const FocusTimer: React.FC = () => {
  const { 
    focusMode, 
    isInFocusMode, 
    pauseFocus, 
    resumeFocus, 
    endFocus,
    focusProgress 
  } = useFocusMode()

  if (!isInFocusMode || !focusMode.currentTask) {
    return null
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleEndFocus = () => {
    endFocus('interrupted')
  }

  const getConstraintLevelText = () => {
    switch (focusMode.constraintLevel) {
      case 'minimal': return '最小制約'
      case 'moderate': return '中程度制約'
      case 'intensive': return '集中制約'
      default: return '制約レベル'
    }
  }

  const getConstraintColorClass = () => {
    switch (focusMode.constraintLevel) {
      case 'minimal': return 'minimal'
      case 'moderate': return 'moderate'
      case 'intensive': return 'intensive'
      default: return 'moderate'
    }
  }

  // SVG円の半径と円周の計算
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (focusProgress / 100) * circumference

  return (
    <div 
      className="focus-timer-overlay"
      data-testid="focus-timer-overlay"
    >
      <div className="focus-timer-container">
        {/* タスク情報 */}
        <div className="focus-timer-task-info">
          <h2 className="focus-timer-task-title">
            🎯 {focusMode.currentTask.title}
          </h2>
          <p className="focus-timer-constraint-level">
            {getConstraintLevelText()}
          </p>
        </div>

        {/* 円型タイマー */}
        <div className="focus-timer-circle-container">
          <div className="focus-timer-circle">
            <svg className="focus-timer-svg" viewBox="0 0 200 200">
              {/* トラック（背景円） */}
              <circle
                className="focus-timer-track"
                cx="100"
                cy="100"
                r={radius}
              />
              {/* プログレス円 */}
              <circle
                className={`focus-timer-progress ${getConstraintColorClass()}`}
                cx="100"
                cy="100"
                r={radius}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            
            {/* 中央のコンテンツ */}
            <div className="focus-timer-center-content">
              <p className="focus-timer-time">
                {formatTime(focusMode.timeRemaining)}
              </p>
              <p className="focus-timer-percentage">
                {Math.round(focusProgress)}%
              </p>
            </div>
          </div>
        </div>

        {/* 一時停止状態の表示 */}
        {focusMode.isPaused && (
          <p className="focus-timer-pause-indicator">
            ⏸️ 一時停止中
          </p>
        )}

        {/* コントロールボタン */}
        <div className="focus-timer-controls">
          {focusMode.isPaused ? (
            <button
              className="focus-timer-btn resume"
              onClick={resumeFocus}
              data-testid="resume-focus-btn"
              aria-label="フォーカスタイマーを再開"
            >
              <span className="focus-timer-btn-icon">▶️</span>
              再開
            </button>
          ) : (
            <button
              className="focus-timer-btn pause"
              onClick={pauseFocus}
              data-testid="pause-focus-btn"
              aria-label="フォーカスタイマーを一時停止"
            >
              <span className="focus-timer-btn-icon">⏸️</span>
              一時停止
            </button>
          )}
          
          <button
            className="focus-timer-btn end"
            onClick={handleEndFocus}
            data-testid="end-focus-btn"
            aria-label="フォーカスモードを終了"
          >
            <span className="focus-timer-btn-icon">⏹️</span>
            終了
          </button>
        </div>
      </div>
    </div>
  )
}
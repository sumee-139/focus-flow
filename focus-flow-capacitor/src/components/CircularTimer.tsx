import React from 'react'
import { useFocusMode } from '../contexts/FocusModeContext'
import './CircularTimer.css'

/**
 * # 埋め込み型円型タイマーコンポーネント
 * ## 用途
 * FocusModeLayoutに埋め込み表示する円型プログレスタイマー
 * ## 引数
 * - size?: 'small' | 'medium' | 'large' - タイマーサイズ（デフォルト: medium）
 * ## 戻り値
 * JSX.Element - 円型タイマーUI
 */
interface CircularTimerProps {
  size?: 'small' | 'medium' | 'large'
}

export const CircularTimer: React.FC<CircularTimerProps> = ({ size = 'medium' }) => {
  const { 
    focusMode, 
    isInFocusMode, 
    pauseFocus, 
    resumeFocus, 
    endFocus,
    focusProgress 
  } = useFocusMode()

  if (!isInFocusMode || !focusMode.currentTask) {
    return (
      <div className={`circular-timer ${size}`} data-testid="circular-timer">
        <div className="circular-timer-placeholder">
          <p>🎯 フォーカスモード未開始</p>
        </div>
      </div>
    )
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

  // SVG円の半径と円周の計算（サイズ別）
  const sizeConfig = {
    small: { radius: 45, container: 120 },
    medium: { radius: 70, container: 180 },
    large: { radius: 90, container: 220 }
  }
  
  const { radius, container } = sizeConfig[size]
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (focusProgress / 100) * circumference

  return (
    <div 
      className={`circular-timer ${size}`}
      data-testid="circular-timer"
    >
      {/* タスク情報 */}
      <div className="circular-timer-task-info">
        <h3 className="circular-timer-task-title">
          🎯 {focusMode.currentTask.title}
        </h3>
        <p className="circular-timer-constraint-level">
          {getConstraintLevelText()}
        </p>
      </div>

      {/* 円型タイマー */}
      <div className="circular-timer-circle-container">
        <div className="circular-timer-circle" style={{ width: container, height: container }}>
          <svg className="circular-timer-svg" viewBox={`0 0 ${container} ${container}`}>
            {/* トラック（背景円） */}
            <circle
              className="circular-timer-track"
              cx={container / 2}
              cy={container / 2}
              r={radius}
            />
            {/* プログレス円 */}
            <circle
              className={`circular-timer-progress ${getConstraintColorClass()}`}
              cx={container / 2}
              cy={container / 2}
              r={radius}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          
          {/* 中央のコンテンツ */}
          <div className="circular-timer-center-content">
            <p className="circular-timer-time">
              {formatTime(focusMode.timeRemaining)}
            </p>
            <p className="circular-timer-percentage">
              {Math.round(focusProgress)}%
            </p>
          </div>
        </div>
      </div>

      {/* 一時停止状態の表示 */}
      {focusMode.isPaused && (
        <p className="circular-timer-pause-indicator">
          ⏸️ 一時停止中
        </p>
      )}

      {/* コントロールボタン */}
      <div className="circular-timer-controls">
        {focusMode.isPaused ? (
          <button
            className="circular-timer-btn resume"
            onClick={resumeFocus}
            data-testid="resume-focus-btn"
            aria-label="フォーカスタイマーを再開"
          >
            <span className="circular-timer-btn-icon">▶️</span>
            再開
          </button>
        ) : (
          <button
            className="circular-timer-btn pause"
            onClick={pauseFocus}
            data-testid="pause-focus-btn"
            aria-label="フォーカスタイマーを一時停止"
          >
            <span className="circular-timer-btn-icon">⏸️</span>
            一時停止
          </button>
        )}
        
        <button
          className="circular-timer-btn end"
          onClick={handleEndFocus}
          data-testid="end-focus-btn"
          aria-label="フォーカスモードを終了"
        >
          <span className="circular-timer-btn-icon">⏹️</span>
          終了
        </button>
      </div>
    </div>
  )
}
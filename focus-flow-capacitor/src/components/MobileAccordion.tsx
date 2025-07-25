import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { AUTO_SAVE, TOUCH_TARGET, ANIMATION, Z_INDEX } from '../constants/ui'

// アコーディオン式デイリーメモのProps
interface MobileAccordionProps {
  isExpanded: boolean
  onToggle: () => void
  dailyMemoContent: string
  onSave: (content: string) => void
}

// UI定数（統一定数を使用）
const ACCORDION_TRIGGER_HEIGHT = `${TOUCH_TARGET.MIN_SIZE}px`
const AUTO_SAVE_DELAY = AUTO_SAVE.DELAY_MS
const ANIMATION_DURATION = `${ANIMATION.PANEL_TRANSITION}ms`
const ACCORDION_Z_INDEX = Z_INDEX.MOBILE_PANEL

// テキスト定数
const ACCORDION_TRIGGER_TEXT = '📝 デイリーメモ'
const ACCORDION_CLOSE_TEXT = '× 閉じる'
const MEMO_PLACEHOLDER = '今日の出来事や気付きをメモしてください...'

export const MobileAccordion: React.FC<MobileAccordionProps> = ({
  isExpanded,
  onToggle,
  dailyMemoContent,
  onSave
}) => {
  const [content, setContent] = useState(dailyMemoContent)
  const autoSaveTimerRef = useRef<number | null>(null)

  // 自動保存タイマーをクリア
  const clearAutoSaveTimer = (): void => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
    }
  }

  // 自動保存をスケジュール
  const scheduleAutoSave = useCallback((newContent: string): void => {
    clearAutoSaveTimer()
    autoSaveTimerRef.current = window.setTimeout(() => {
      onSave(newContent)
    }, AUTO_SAVE_DELAY)
  }, [onSave])

  // コンテンツ変更ハンドラ
  const handleContentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value
    setContent(newContent)
    scheduleAutoSave(newContent)
  }, [scheduleAutoSave])

  // コンテンツ初期化
  useEffect(() => {
    setContent(dailyMemoContent)
  }, [dailyMemoContent])

  // コンポーネントアンマウント時にタイマークリア
  useEffect(() => {
    return () => {
      clearAutoSaveTimer()
    }
  }, [])

  // Performance optimization: Memoize style objects
  const accordionContainerStyle = useMemo(() => ({
    position: 'fixed' as const,
    bottom: '0',
    left: '0',
    right: '0',
    // 動的高さ: 未展開時はtrigger領域のみ、展開時は全画面
    height: isExpanded ? '100vh' : ACCORDION_TRIGGER_HEIGHT,
    zIndex: ACCORDION_Z_INDEX,
    display: 'flex',
    // column-reverseでtriggerボタンを下部に配置（UX改善）
    flexDirection: 'column-reverse' as const,
    overflow: 'hidden' // コンテンツが枠外に出ないよう制御
  }), [isExpanded])

  const triggerButtonStyle = useMemo(() => ({
    height: ACCORDION_TRIGGER_HEIGHT,
    background: 'var(--primary-color, #3182ce)',
    color: 'white',
    border: 'none',
    width: '100%',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    position: 'relative' as const,
    zIndex: '1', // accordionContentより上に表示（クリック可能性確保）
    // WCAG 2.1準拠: 44px最小タッチターゲット確保
    flexShrink: 0 // Flexboxで高さが縮むのを防ぐ
  }), [])

  const accordionContentStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: '0',
    left: '0',
    right: '0',
    bottom: ACCORDION_TRIGGER_HEIGHT, // triggerボタン分を除く
    // 上向き展開アニメーション: 未展開時は下方向に完全隠蔽
    transform: isExpanded ? 'translateY(0)' : 'translateY(100%)',
    transition: `transform ${ANIMATION_DURATION} ease`,
    background: 'var(--background, white)',
    padding: '1rem',
    overflow: 'auto' as const,
    // 未展開時のポインターイベント無効化（triggerボタンクリック干渉防止）
    pointerEvents: (isExpanded ? 'auto' : 'none') as 'auto' | 'none'
  }), [isExpanded])

  const headerStyle = useMemo(() => ({
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: '1rem'
  }), [])

  const closeButtonStyle = useMemo(() => ({
    background: 'transparent',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer'
  }), [])

  const textareaStyle = useMemo(() => ({
    width: '100%',
    height: 'calc(100% - 60px)',
    padding: '1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'none' as const,
    outline: 'none'
  }), [])

  return (
    <div className="mobile-accordion" data-testid="mobile-accordion" style={accordionContainerStyle}>
      {/* アコーディオントリガーボタン */}
      <button
        type="button"
        className="accordion-trigger"
        onClick={onToggle}
        style={triggerButtonStyle}
      >
        {ACCORDION_TRIGGER_TEXT}
      </button>

      {/* アコーディオンコンテンツ */}
      <div
        className={`accordion-content ${isExpanded ? 'expanded' : ''}`}
        data-testid="accordion-content"
        style={accordionContentStyle}
      >
        {isExpanded && (
          <>
            {/* ヘッダーエリア */}
            <div style={headerStyle}>
              <h2 style={{ margin: 0 }}>📝 デイリーメモ</h2>
              <button
                onClick={onToggle}
                style={closeButtonStyle}
              >
                {ACCORDION_CLOSE_TEXT}
              </button>
            </div>

            {/* メモエリア */}
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder={MEMO_PLACEHOLDER}
              aria-label="デイリーメモ"
              style={textareaStyle}
            />
          </>
        )}
      </div>
    </div>
  )
}
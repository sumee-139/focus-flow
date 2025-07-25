import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MobileAccordion } from './MobileAccordion'

// MobileAccordion用のテスト定数
const MOCK_DAILY_MEMO_CONTENT = 'Test daily memo content'
const ACCORDION_TRIGGER_TEXT = '📝 デイリーメモ'
const ACCORDION_CLOSE_TEXT = '× 閉じる'

describe('Mobile Accordion Daily Memo', () => {
  let mockOnToggle: ReturnType<typeof vi.fn>
  let mockOnSave: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnToggle = vi.fn()
    mockOnSave = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should render accordion trigger button with correct text and size', () => {
    render(
      <MobileAccordion
        isExpanded={false}
        onToggle={mockOnToggle}
        dailyMemoContent=""
        onSave={mockOnSave}
      />
    )

    const triggerButton = screen.getByText(ACCORDION_TRIGGER_TEXT)
    expect(triggerButton).toBeInTheDocument()
    expect(triggerButton).toHaveAttribute('type', 'button')
    
    // WCAG準拠の44px最小タッチターゲット
    const triggerElement = triggerButton.closest('.accordion-trigger')
    expect(triggerElement).toHaveStyle({ height: '44px' })
  })

  test('should expand to full screen when triggered', async () => {
    render(
      <MobileAccordion
        isExpanded={false}
        onToggle={mockOnToggle}
        dailyMemoContent=""
        onSave={mockOnSave}
      />
    )

    const triggerButton = screen.getByText(ACCORDION_TRIGGER_TEXT)
    fireEvent.click(triggerButton)

    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  test('should display full screen content when expanded', () => {
    render(
      <MobileAccordion
        isExpanded={true}
        onToggle={mockOnToggle}
        dailyMemoContent={MOCK_DAILY_MEMO_CONTENT}
        onSave={mockOnSave}
      />
    )

    // 展開時は全画面表示
    const accordionContent = screen.getByTestId('accordion-content')
    expect(accordionContent).toHaveClass('expanded')
    expect(accordionContent).toHaveStyle({ 
      bottom: '44px', // triggerボタン分を除く
      transform: 'translateY(0)' 
    })

    // デイリーメモのtextareaが表示される
    const textarea = screen.getByLabelText(/デイリーメモ/i)
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveValue(MOCK_DAILY_MEMO_CONTENT)
  })

  test('should collapse when close button is clicked', async () => {
    render(
      <MobileAccordion
        isExpanded={true}
        onToggle={mockOnToggle}
        dailyMemoContent=""
        onSave={mockOnSave}
      />
    )

    const closeButton = screen.getByText(ACCORDION_CLOSE_TEXT)
    fireEvent.click(closeButton)

    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  test('should save content automatically on input', async () => {
    render(
      <MobileAccordion
        isExpanded={true}
        onToggle={mockOnToggle}
        dailyMemoContent=""
        onSave={mockOnSave}
      />
    )

    const textarea = screen.getByLabelText(/デイリーメモ/i)
    const newContent = 'New memo content'
    
    fireEvent.change(textarea, { target: { value: newContent } })

    // 3秒後に自動保存されることを確認
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(newContent)
    }, { timeout: 4000 })
  })

  test('should handle mobile viewport correctly', () => {
    // モバイル環境での固定位置配置テスト
    render(
      <MobileAccordion
        isExpanded={false}
        onToggle={mockOnToggle}
        dailyMemoContent=""
        onSave={mockOnSave}
      />
    )

    const accordionContainer = screen.getByTestId('mobile-accordion')
    expect(accordionContainer).toHaveClass('mobile-accordion')
    expect(accordionContainer).toHaveStyle({
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      zIndex: '2000' // Z_INDEX.MOBILE_PANEL
    })
  })

  test('should apply smooth animation transitions', () => {
    render(
      <MobileAccordion
        isExpanded={false}
        onToggle={mockOnToggle}
        dailyMemoContent=""
        onSave={mockOnSave}
      />
    )

    const accordionContent = screen.getByTestId('accordion-content')
    expect(accordionContent).toHaveStyle({
      transition: 'transform 300ms ease' // ANIMATION.PANEL_TRANSITION
    })
  })

  // 🟢 Green Phase: 修正後のテスト - triggerボタンが下部に配置される
  test('should position trigger button at bottom of screen for better mobile UX', () => {
    // Phase 2実装完了により有効化
    
    render(
      <MobileAccordion
        isExpanded={false}
        onToggle={mockOnToggle}
        dailyMemoContent=""
        onSave={mockOnSave}
      />
    )

    const accordionContainer = screen.getByTestId('mobile-accordion')
    // const triggerButton = screen.getByText(ACCORDION_TRIGGER_TEXT) // 未使用のため削除
    
    // 修正後の期待値検証
    // 1. 未展開時のコンテナは下部のみを占有（height: 44px）
    const containerStyle = getComputedStyle(accordionContainer)
    expect(containerStyle.height).toBe('44px')
    
    // 2. Flexbox column-reverse設計によりtriggerボタンが下部に配置
    expect(containerStyle.flexDirection).toBe('column-reverse')
    expect(containerStyle.display).toBe('flex')
    
    // 3. 固定位置で画面下部に配置
    expect(containerStyle.position).toBe('fixed')
    expect(containerStyle.bottom).toBe('0px')
  })

  // 🟢 Green Phase: 問題解決済みの記録テスト（解決事項の文書化）
  test('should document resolved layout issue for mobile UX improvement', () => {
    render(
      <MobileAccordion
        isExpanded={false}
        onToggle={mockOnToggle}
        dailyMemoContent=""
        onSave={mockOnSave}
      />
    )

    const accordionContainer = screen.getByTestId('mobile-accordion')
    const triggerButton = screen.getByText(ACCORDION_TRIGGER_TEXT)
    
    // ✅ 解決済み: DOM構造とCSS設計の改善
    // 1. Flexbox column-reverse設計により、triggerボタンが下部に配置
    const containerChildren = accordionContainer.children
    expect(containerChildren[0]).toBe(triggerButton) // DOMでは最初だが、視覚的には最下部
    
    // 2. CSS設計: コンテナが適切な動的高さを持つ
    const containerStyle = getComputedStyle(accordionContainer)
    expect(containerStyle.flexDirection).toBe('column-reverse') // 解決手法
    expect(containerStyle.height).toBe('44px') // 未展開時は最小限の高さ
    
    // ✅ Phase 2で完全に解決された
    // - Flexbox column-reverseでtriggerボタン下部配置を実現
    // - 動的高さでコンテナサイズを最適化
    // - pointer-eventsでクリック干渉を防止
  })

  // 🔴 Red Phase: アコーディオン展開時の上向き動作テスト
  test('should expand accordion content upward from bottom trigger', () => {
    const { rerender } = render(
      <MobileAccordion
        isExpanded={false}
        onToggle={mockOnToggle}
        dailyMemoContent=""
        onSave={mockOnSave}
      />
    )

    // 展開前：コンテンツは下方向に隠れている
    const accordionContent = screen.getByTestId('accordion-content')
    expect(accordionContent).toHaveStyle({
      transform: 'translateY(100%)'
    })

    // 展開後：コンテンツが上向きに展開される
    rerender(
      <MobileAccordion
        isExpanded={true}
        onToggle={mockOnToggle}
        dailyMemoContent=""
        onSave={mockOnSave}
      />
    )

    expect(accordionContent).toHaveStyle({
      transform: 'translateY(0)'
    })
    
    // コンテンツの配置が正しく設定される
    // （下部のtriggerボタン分を除いた領域を使用）
    expect(accordionContent).toHaveStyle({
      bottom: '44px' // triggerボタンの高さ分除く
    })
  })
})
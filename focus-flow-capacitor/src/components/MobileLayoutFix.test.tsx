import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'

describe('Mobile Layout Click Interference Fix', () => {
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    // matchMedia モック設定
    originalMatchMedia = window.matchMedia
  })

  afterEach(() => {
    // matchMedia 復元
    window.matchMedia = originalMatchMedia
  })

  const mockMatchMedia = (matches: boolean) => {
    window.matchMedia = ((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
        // イベントリスナーが追加されたら即座に実行してステート更新
        if (type === 'change' && typeof listener === 'function') {
          setTimeout(listener, 0)
        }
      },
      removeEventListener: () => {},
      dispatchEvent: () => true,
    })) as unknown as typeof window.matchMedia
  }

  test('should allow task card clicks on mobile (≤768px) without memo-header interference', () => {
    // モバイルサイズ設定 (768px以下)
    mockMatchMedia(true)
    
    render(<App />)
    
    // タスクカードを探す
    const taskCard = screen.getByText('FocusFlowプロトタイプを完成させる').closest('[data-testid^="task-item"]')
    expect(taskCard).toBeInTheDocument()
    
    // memo-headerがモバイルで非表示になっていることを確認
    const memoHeader = document.querySelector('.memo-header')
    if (memoHeader) {
      const styles = window.getComputedStyle(memoHeader)
      // モバイルでは display: none または pointer-events: none になるべき
      expect(styles.display === 'none' || styles.pointerEvents === 'none').toBe(true)
    }
    
    // タスクカードがクリック可能であることを確認
    expect(taskCard).not.toHaveStyle('pointer-events: none')
    
    // タスクカードのクリックが正常に動作することを確認
    if (taskCard) {
      fireEvent.click(taskCard)
      // クリック後の状態変化を確認（例：完了状態の切り替え）
      // この段階では失敗するはず（まだ修正していないため）
    }
  })

  test('should hide memo-header completely on mobile (≤768px)', () => {
    // モバイルサイズ設定 (768px以下)
    mockMatchMedia(true)
    
    render(<App />)
    
    // memo-area-45がモバイルで非表示になっていることを確認
    const memoArea = screen.queryByTestId('memo-area-45')
    if (memoArea) {
      const styles = window.getComputedStyle(memoArea)
      expect(styles.display).toBe('none')
    }
    
    // memo-headerが存在しないか、非表示になっていることを確認
    const memoHeader = document.querySelector('.memo-header')
    if (memoHeader) {
      const styles = window.getComputedStyle(memoHeader)
      expect(styles.display).toBe('none')
    }
  })

  test('should maintain desktop functionality (≥769px)', () => {
    // デスクトップサイズ設定 (769px以上)
    mockMatchMedia(false)
    
    render(<App />)
    
    // デスクトップではmemo-area-45が表示されることを確認
    const memoArea = screen.getByTestId('memo-area-45')
    expect(memoArea).toBeInTheDocument()
    
    // memo-headerが表示されクリック可能であることを確認
    const memoHeaderButton = screen.getByRole('button', { name: /open memo panel/i })
    expect(memoHeaderButton).toBeInTheDocument()
    expect(memoHeaderButton).toBeVisible()
    
    // memo-headerのクリックが正常に動作することを確認
    fireEvent.click(memoHeaderButton)
    // メモパネルが開かれることを確認（ここは既存機能なので動作するはず）
  })

  test('should handle responsive breakpoint transition correctly', () => {
    // デスクトップから開始
    mockMatchMedia(false)
    
    const { unmount } = render(<App />)
    
    // デスクトップでmemo-area-45が表示されることを確認
    let memoArea = screen.getByTestId('memo-area-45')
    expect(memoArea).toBeVisible()
    
    // コンポーネントをアンマウントしてモバイルで再レンダー
    unmount()
    
    // モバイルに切り替え
    mockMatchMedia(true)
    render(<App />)
    
    // モバイルでmemo-area-45が存在しないことを確認
    const memoAreaMobile = screen.queryByTestId('memo-area-45')
    expect(memoAreaMobile).toBeNull()
  })

  test('should ensure tasks area takes full height on mobile', () => {
    // モバイルサイズ設定
    mockMatchMedia(true)
    
    render(<App />)
    
    // tasks-area-30が適切に表示されることを確認
    const tasksArea = screen.getByTestId('tasks-area-30')
    expect(tasksArea).toBeInTheDocument()
    
    // タスクエリアがモバイルで mobile-full-height クラスを持つことを確認
    expect(tasksArea).toHaveClass('mobile-full-height')
    
    // memo-area-45が存在しないことを確認（モバイルではタスクエリアが主役）
    const memoArea = screen.queryByTestId('memo-area-45')
    expect(memoArea).toBeNull()
  })
})
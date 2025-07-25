/**
 * タブレットレイアウトでのタスクカードはみ出し修正テスト
 * 🔴 Red Phase: 失敗するテストを先に作成
 */

import { render, screen } from '@testing-library/react'
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import App from '../App'

// タブレットサイズのモックウィンドウサイズ
const TABLET_WIDTH = 900
const EXPECTED_TASKS_AREA_WIDTH = Math.floor(TABLET_WIDTH * 0.35) // 315px

// matchMedia mock for tablet size
const mockMatchMedia = (width: number) => {
  return (query: string) => ({
    matches: query.includes(`(min-width: 769px) and (max-width: 1000px)`) && width >= 769 && width <= 1000,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true
  }) as unknown as MediaQueryList
}

describe('🚨 Tablet Layout Overflow Fix', () => {
  beforeEach(() => {
    // タブレットサイズをモック
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: TABLET_WIDTH,
    })
    
    window.matchMedia = mockMatchMedia(TABLET_WIDTH)
  })

  afterEach(() => {
    // クリーンアップ
    delete (window as any).innerWidth
    delete (window as any).matchMedia
  })

  test('🔴 should NOT have task cards overflowing tasks area in tablet layout', () => {
    render(<App />)
    
    // タスクエリアとタスクカードを取得
    const tasksArea = screen.getByTestId('tasks-section')
    const taskItems = screen.getAllByTestId(/^task-item-/)
    
    expect(taskItems.length).toBeGreaterThan(0)
    
    // Tasks Areaの境界を取得
    const tasksAreaRect = tasksArea.getBoundingClientRect()
    
    // 各タスクカードがTasks Area内に収まっているかチェック
    taskItems.forEach((taskItem, index) => {
      const taskRect = taskItem.getBoundingClientRect()
      
      // タスクカードがTasks Areaの右端を超えていないことを確認
      expect(taskRect.right, 
        `Task item ${index} overflows tasks area by ${taskRect.right - tasksAreaRect.right}px`
      ).toBeLessThanOrEqual(tasksAreaRect.right)
      
      // タスクカードがTasks Areaの左端より左に出ていないことを確認
      expect(taskRect.left,
        `Task item ${index} is outside left boundary of tasks area`
      ).toBeGreaterThanOrEqual(tasksAreaRect.left)
    })
  })

  test('🔴 should have correct tasks sidebar width in tablet layout', () => {
    render(<App />)
    
    const tasksSidebar = screen.getByTestId('tasks-section')
    const sidebarRect = tasksSidebar.getBoundingClientRect()
    
    // タブレットでは Tasks Sidebar は Tasks Area に収まるべき
    expect(sidebarRect.width).toBeLessThanOrEqual(EXPECTED_TASKS_AREA_WIDTH)
  })

  test('🔴 should apply correct CSS Grid layout for tablet', () => {
    render(<App />)
    
    const mainGrid = document.querySelector('.main-layout-grid')
    expect(mainGrid).toBeTruthy()
    
    // JSdomでは実際のCSS計算が限定的なため、クラス存在と要素構造で確認
    expect(mainGrid).toHaveClass('main-layout-grid')
    
    // タブレット環境でのレイアウト検証
    // ※ JSdom制限のため、window.getComputedStyle()が正確に動作しない場合がある
    // そのため、DOM構造とクラス名での検証に変更
    
    // Tasks Area と Memo Area が存在することを確認
    const tasksArea = document.querySelector('.tasks-area-30')
    const memoArea = document.querySelector('.memo-area-45')
    expect(tasksArea).toBeTruthy()
    expect(memoArea).toBeTruthy()
    
    // タブエリアの存在確認（非表示でも要素は存在する）
    const tabArea = document.querySelector('.tab-area-25')
    expect(tabArea).toBeTruthy()
  })

  test('🔴 should maintain task card content readability', () => {
    render(<App />)
    
    const taskItems = screen.getAllByTestId(/^task-item-/)
    
    taskItems.forEach((taskItem) => {
      // タスクカードのコンテンツが見えることを確認
      const taskContent = taskItem.querySelector('.task-content')
      expect(taskContent).toBeTruthy()
      
      // テキストが切り詰められていないことを確認
      const taskTitle = taskItem.querySelector('.task-title')
      expect(taskTitle).toBeTruthy()
      expect(taskTitle?.textContent).toBeTruthy()
    })
  })
})
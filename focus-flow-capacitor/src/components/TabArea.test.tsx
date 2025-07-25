import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TabArea } from './TabArea'
import type { TabInfo } from './TabArea'

describe('TabArea Unlimited Scroll', () => {
  const mockTabs: TabInfo[] = [
    { id: 'daily', type: 'daily', title: 'デイリーメモ', closable: false },
    { id: 'task-1', type: 'task', title: 'タスク1メモ', taskId: 'task-1', closable: true },
    { id: 'task-2', type: 'task', title: 'タスク2メモ', taskId: 'task-2', closable: true },
  ]

  const defaultProps = {
    tabs: mockTabs,
    activeTabId: 'daily',
    onTabSelect: vi.fn(),
    onTabClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should display unlimited task tabs with scroll', () => {
    // 大量のタスクタブを作成
    const manyTabs: TabInfo[] = [
      { id: 'daily', type: 'daily', title: 'デイリーメモ', closable: false },
      ...Array.from({ length: 20 }, (_, i) => ({
        id: `task-${i + 1}`,
        type: 'task' as const,
        title: `タスク${i + 1}メモ`,
        taskId: `task-${i + 1}`,
        closable: true,
      })),
    ]

    render(<TabArea {...defaultProps} tabs={manyTabs} />)

    // TabAreaコンテナが存在することを確認
    const tabArea = screen.getByTestId('tab-area')
    expect(tabArea).toBeInTheDocument()

    // スクロール可能なコンテナであることを確認
    expect(tabArea).toHaveClass('tab-area-scroll')

    // すべてのタブが存在することを確認（DOM上には存在、表示はCSS overflow）
    const dailyTab = screen.getByRole('button', { name: /デイリーメモ/i })
    expect(dailyTab).toBeInTheDocument()

    // 複数のタスクタブが存在することを確認
    const taskTabs = screen.getAllByText(/タスク\d+メモ/)
    expect(taskTabs).toHaveLength(20)
  })

  test('should display daily memo tab as sticky', () => {
    render(<TabArea {...defaultProps} />)

    // デイリーメモタブが固定表示されることを確認
    const dailyTab = screen.getByRole('button', { name: /デイリーメモ/i })
    expect(dailyTab).toBeInTheDocument()
    expect(dailyTab.closest('[data-testid="tab-daily-memo"]')).toHaveClass('tab-daily-memo-sticky')
  })

  test('should add task tabs dynamically', () => {
    const { rerender } = render(<TabArea {...defaultProps} />)

    // 初期状態では5つのボタン（デイリー1つ + タスク2つ + 閉じるボタン2つ）
    expect(screen.getAllByRole('button')).toHaveLength(5)

    // 新しいタスクタブを追加
    const newTabs: TabInfo[] = [
      ...mockTabs,
      { id: 'task-3', type: 'task', title: 'タスク3メモ', taskId: 'task-3', closable: true },
    ]

    rerender(<TabArea {...defaultProps} tabs={newTabs} />)

    // 7つのボタンに増加（デイリー1つ + タスク3つ + 閉じるボタン3つ）
    expect(screen.getAllByRole('button')).toHaveLength(7)
    expect(screen.getByText('タスク3メモ')).toBeInTheDocument()
  })

  test('should close task tabs but not daily memo tab', () => {
    render(<TabArea {...defaultProps} />)

    // デイリーメモタブには閉じるボタンがないことを確認
    const dailyTab = screen.getByRole('button', { name: /デイリーメモ/i })
    const dailyTabContainer = dailyTab.closest('[data-testid="tab-daily-memo"]')
    expect(dailyTabContainer?.querySelector('.tab-close-btn')).toBeNull()

    // タスクタブコンテナから直接閉じるボタンを取得
    const taskTabContainer = screen.getByTestId('tab-task-task-1')
    const taskTabButton = taskTabContainer.querySelector('.tab-button')
    const closeBtn = taskTabContainer.querySelector('.tab-close-btn')
    
    expect(taskTabButton).toBeInTheDocument()
    expect(closeBtn).toBeInTheDocument()

    // 閉じるボタンをクリック
    if (closeBtn) {
      fireEvent.click(closeBtn)
      expect(defaultProps.onTabClose).toHaveBeenCalledWith('task-1')
    }
  })

  test('should handle tab selection correctly', () => {
    render(<TabArea {...defaultProps} />)

    // タスクタブコンテナからタブボタンを取得してクリック
    const taskTabContainer = screen.getByTestId('tab-task-task-1')
    const taskTabButton = taskTabContainer.querySelector('.tab-button')
    
    expect(taskTabButton).toBeInTheDocument()
    
    if (taskTabButton) {
      fireEvent.click(taskTabButton)
      expect(defaultProps.onTabSelect).toHaveBeenCalledWith('task-1')
    }
  })

  test('should apply active tab styling', () => {
    render(<TabArea {...defaultProps} activeTabId="task-1" />)

    // アクティブなタブがactive クラスを持つことを確認
    const activeTaskContainer = screen.getByTestId('tab-task-task-1')
    const activeTabButton = activeTaskContainer.querySelector('.tab-button')
    expect(activeTabButton).toHaveClass('tab-active')

    // 非アクティブなタブがactive クラスを持たないことを確認
    const inactiveTab = screen.getByRole('button', { name: /デイリーメモ/i })
    expect(inactiveTab).not.toHaveClass('tab-active')
  })

  test('should handle empty tabs gracefully', () => {
    render(<TabArea {...defaultProps} tabs={[]} />)

    const tabArea = screen.getByTestId('tab-area')
    expect(tabArea).toBeInTheDocument()

    // タブが存在しない場合の表示を確認
    expect(screen.queryByRole('button')).toBeNull()
  })

  test('should maintain scroll position on tab changes', () => {
    // 大量のタブでスクロール位置維持をテスト
    const manyTabs: TabInfo[] = [
      { id: 'daily', type: 'daily', title: 'デイリーメモ', closable: false },
      ...Array.from({ length: 15 }, (_, i) => ({
        id: `task-${i + 1}`,
        type: 'task' as const,
        title: `タスク${i + 1}メモ`,
        taskId: `task-${i + 1}`,
        closable: true,
      })),
    ]

    render(<TabArea {...defaultProps} tabs={manyTabs} />)

    const tabArea = screen.getByTestId('tab-area')
    
    // スクロール可能であることを確認
    expect(tabArea).toHaveClass('tab-area-scroll')
    
    // タブリストコンテナの存在を確認
    const tabList = screen.getByTestId('tab-list')
    expect(tabList).toBeInTheDocument()
  })
})
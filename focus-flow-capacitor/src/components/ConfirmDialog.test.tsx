import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { ConfirmDialog } from './ConfirmDialog'

// 🔴 Red Phase: ConfirmDialog失敗するテストを先に書く
describe('ConfirmDialog', () => {
  test('should render dialog when open', () => {
    const mockOnConfirm = vi.fn()
    const mockOnCancel = vi.fn()

    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    // ダイアログが表示される
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Delete Task')).toBeInTheDocument()
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument()
  })

  test('should not render dialog when closed', () => {
    const mockOnConfirm = vi.fn()
    const mockOnCancel = vi.fn()

    render(
      <ConfirmDialog
        isOpen={false}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    // ダイアログが表示されない
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('should call onConfirm when confirm button is clicked', () => {
    const mockOnConfirm = vi.fn()
    const mockOnCancel = vi.fn()

    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))
    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
  })

  test('should call onCancel when cancel button is clicked', () => {
    const mockOnConfirm = vi.fn()
    const mockOnCancel = vi.fn()

    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  test('should handle escape key press', () => {
    const mockOnConfirm = vi.fn()
    const mockOnCancel = vi.fn()

    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  test('should support custom button labels', () => {
    const mockOnConfirm = vi.fn()
    const mockOnCancel = vi.fn()

    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /keep/i })).toBeInTheDocument()
  })

  test('should have proper ARIA attributes for accessibility', () => {
    const mockOnConfirm = vi.fn()
    const mockOnCancel = vi.fn()

    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby')
    expect(dialog).toHaveAttribute('aria-describedby')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  // Design Philosophy確認テスト
  test('should comply with Focus-Flow Design Philosophy', () => {
    const mockOnConfirm = vi.fn()
    const mockOnCancel = vi.fn()

    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    // 統一アイコン（📝）は使用しない（削除確認なので）
    expect(screen.queryByText('📝')).not.toBeInTheDocument()
    
    // 色による優先度区別は使用しない
    const dialog = screen.getByRole('dialog')
    const computedStyle = window.getComputedStyle(dialog)
    expect(computedStyle.backgroundColor).not.toMatch(/(red|green|yellow|#ff|#00ff|#ffff)/)
  })

  // 🔴 Red Phase: CSS styling失敗テスト - 実装前に書く
  describe('CSS Styling', () => {
    test('should have proper overlay styling', () => {
      const mockOnConfirm = vi.fn()
      const mockOnCancel = vi.fn()

      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Task"
          message="Are you sure you want to delete this task?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const overlay = screen.getByRole('dialog').parentElement
      expect(overlay).toHaveClass('confirm-dialog-overlay')
      
      // オーバーレイスタイルの確認
      const overlayStyle = window.getComputedStyle(overlay!)
      expect(overlayStyle.position).toBe('fixed')
      expect(overlayStyle.zIndex).toBe('1000')
      expect(overlayStyle.top).toBe('0px')
      expect(overlayStyle.left).toBe('0px')
      expect(overlayStyle.width).toBe('100%')
      expect(overlayStyle.height).toBe('100%')
    })

    test('should have proper dialog styling', () => {
      const mockOnConfirm = vi.fn()
      const mockOnCancel = vi.fn()

      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Task"
          message="Are you sure you want to delete this task?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveClass('confirm-dialog')
      
      // ダイアログスタイルの確認
      const dialogStyle = window.getComputedStyle(dialog)
      expect(dialogStyle.backgroundColor).toBe('rgb(255, 255, 255)') // var(--background)
      expect(dialogStyle.borderRadius).toBe('8px')
      expect(dialogStyle.border).toBe('1px solid rgb(224, 224, 224)') // var(--border)
    })

    test('should have proper button styling', () => {
      const mockOnConfirm = vi.fn()
      const mockOnCancel = vi.fn()

      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Task"
          message="Are you sure you want to delete this task?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const confirmBtn = screen.getByRole('button', { name: /confirm/i })
      const cancelBtn = screen.getByRole('button', { name: /cancel/i })
      
      // プライマリボタンとセカンダリボタンのスタイル確認
      expect(confirmBtn).toHaveClass('btn', 'btn-primary')
      expect(cancelBtn).toHaveClass('btn', 'btn-secondary')
    })

    test('should be responsive on mobile devices', () => {
      const mockOnConfirm = vi.fn()
      const mockOnCancel = vi.fn()

      // モバイルビューポートを模擬
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      })

      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Task"
          message="Are you sure you want to delete this task?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const dialog = screen.getByRole('dialog')
      const dialogStyle = window.getComputedStyle(dialog)
      
      // モバイルでの適切な幅とマージン
      expect(dialogStyle.width).toBe('90%')
      expect(dialogStyle.maxWidth).toBe('400px')
    })
  })
})
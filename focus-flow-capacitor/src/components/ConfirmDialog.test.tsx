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
    test('should have proper overlay styling with correct CSS classes', () => {
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
      
      // オーバーレイのDOM構造確認
      expect(overlay).toBeInTheDocument()
      expect(overlay).toBeDefined()
    })

    test('should have proper dialog styling with correct CSS classes', () => {
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
      
      // ダイアログの内部構造確認
      expect(dialog.querySelector('.confirm-dialog-header')).toBeInTheDocument()
      expect(dialog.querySelector('.confirm-dialog-body')).toBeInTheDocument()
      expect(dialog.querySelector('.confirm-dialog-footer')).toBeInTheDocument()
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

    test('should have proper header, body, and footer structure', () => {
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
      
      // ヘッダー構造確認
      const header = dialog.querySelector('.confirm-dialog-header')
      expect(header).toBeInTheDocument()
      expect(header!.querySelector('h3')).toHaveTextContent('Delete Task')
      
      // ボディ構造確認
      const body = dialog.querySelector('.confirm-dialog-body')
      expect(body).toBeInTheDocument()
      expect(body!.querySelector('p')).toHaveTextContent(/are you sure you want to delete/i)
      
      // フッター構造確認
      const footer = dialog.querySelector('.confirm-dialog-footer')
      expect(footer).toBeInTheDocument()
      expect(footer!.querySelectorAll('button')).toHaveLength(2)
    })
  })
})
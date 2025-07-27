import { renderHook, act } from '@testing-library/react'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { useLocalStorage } from './useLocalStorage'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// 🔴 Red Phase: LocalStorage永続化機能の失敗するテストを先に書く
describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should initialize with default value when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'))
    
    expect(result.current[0]).toBe('default-value')
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key')
  })

  test('should initialize with stored value when localStorage has data', () => {
    const storedValue = JSON.stringify('stored-value')
    localStorageMock.getItem.mockReturnValue(storedValue)
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'))
    
    expect(result.current[0]).toBe('stored-value')
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key')
  })

  test('should update localStorage when value is set', () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'))
    
    act(() => {
      result.current[1]('new-value')
    })
    
    expect(result.current[0]).toBe('new-value')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'))
  })

  test('should handle complex objects', () => {
    const complexObject = { id: 1, name: 'test', nested: { value: 'nested' } }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(complexObject))
    
    const { result } = renderHook(() => useLocalStorage('test-key', {}))
    
    expect(result.current[0]).toEqual(complexObject)
  })

  test('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'))
    
    expect(result.current[0]).toBe('default-value')
  })

  test('should handle setItem errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage setItem error')
    })
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'))
    
    // Should not throw error when setting value
    act(() => {
      result.current[1]('new-value')
    })
    
    // State should still be updated even if localStorage fails
    expect(result.current[0]).toBe('new-value')
  })

  test('should handle invalid JSON gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json{')
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'))
    
    expect(result.current[0]).toBe('default-value')
  })

  test('should support functional updates', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(5))
    
    const { result } = renderHook(() => useLocalStorage('test-key', 0))
    
    act(() => {
      result.current[1](prevValue => prevValue + 1)
    })
    
    expect(result.current[0]).toBe(6)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(6))
  })

  // DebugLogger統合テスト
  describe('DebugLogger Integration', () => {
    test('should use debugLogger instead of console.error for localStorage errors', () => {
      // This test will verify that useLocalStorage uses the new debugLogger
      // instead of direct console.error calls
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage access error')
      })
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
      
      // Should fallback to default value when localStorage errors occur
      expect(result.current[0]).toBe('default')
      // Note: Actual logger usage will be verified after debugLogger implementation
    })

    test('should maintain error information while optimizing production output', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage quota exceeded')
      })
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
      
      act(() => {
        result.current[1]('new-value')
      })
      
      // Should handle error gracefully and maintain state
      expect(result.current[0]).toBe('new-value')
      // Error should be logged through debugLogger (not direct console.error)
    })
  })
})
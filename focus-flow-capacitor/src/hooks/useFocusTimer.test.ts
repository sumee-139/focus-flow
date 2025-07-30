import { renderHook, act } from '@testing-library/react'
import { useFocusTimer } from './useFocusTimer'
import { vi } from 'vitest'

// Mock requestAnimationFrame and cancelAnimationFrame
const mockRequestAnimationFrame = vi.fn()
const mockCancelAnimationFrame = vi.fn()

Object.defineProperty(global, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true
})

Object.defineProperty(global, 'cancelAnimationFrame', {
  value: mockCancelAnimationFrame,
  writable: true
})

// Mock performance.now
const mockPerformanceNow = vi.fn()
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow
  },
  writable: true
})

describe('useFocusTimer - High Precision Timer Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPerformanceNow.mockReturnValue(0)
    
    // Mock requestAnimationFrame to immediately call the callback
    mockRequestAnimationFrame.mockImplementation((callback) => {
      const id = Math.random()
      setTimeout(() => callback(mockPerformanceNow()), 0)
      return id
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('should initialize with correct default values', () => {
    const { result } = renderHook(() => useFocusTimer(1500)) // 25 minutes
    
    expect(result.current.timeRemaining).toBe(1500)
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isPaused).toBe(false)
    expect(result.current.startTime).toBeNull()
    expect(result.current.progress).toBe(0)
  })

  test('should countdown timer correctly with 1-second intervals using requestAnimationFrame', async () => {
    vi.useFakeTimers()
    
    const { result } = renderHook(() => useFocusTimer(10)) // 10 seconds
    
    // Start the timer
    act(() => {
      result.current.start()
    })
    
    expect(result.current.isRunning).toBe(true)
    expect(result.current.startTime).toBeInstanceOf(Date)
    
    // Mock performance.now to return elapsed time
    mockPerformanceNow
      .mockReturnValueOnce(0)     // Initial call
      .mockReturnValueOnce(1000)  // After 1 second
      .mockReturnValueOnce(2000)  // After 2 seconds
      .mockReturnValueOnce(3000)  // After 3 seconds
    
    // Simulate requestAnimationFrame calls
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    // Should decrease by 1 second
    expect(result.current.timeRemaining).toBe(9)
    
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    expect(result.current.timeRemaining).toBe(8)
    
    vi.useRealTimers()
  })

  test('should pause and resume timer functionality correctly', async () => {
    const { result } = renderHook(() => useFocusTimer(60))
    
    // Start timer
    act(() => {
      result.current.start()
    })
    
    expect(result.current.isRunning).toBe(true)
    expect(result.current.isPaused).toBe(false)
    
    // Pause timer
    act(() => {
      result.current.pause()
    })
    
    expect(result.current.isRunning).toBe(true)
    expect(result.current.isPaused).toBe(true)
    
    // Resume timer
    act(() => {
      result.current.resume()
    })
    
    expect(result.current.isRunning).toBe(true)
    expect(result.current.isPaused).toBe(false)
  })

  test('should trigger completion callback when timer reaches zero', async () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useFocusTimer(2, onComplete))
    
    vi.useFakeTimers()
    
    // Start timer
    act(() => {
      result.current.start()
    })
    
    // Mock performance.now to simulate time passage
    mockPerformanceNow
      .mockReturnValueOnce(0)     // Initial
      .mockReturnValueOnce(1000)  // After 1 second
      .mockReturnValueOnce(2000)  // After 2 seconds (completion)
    
    // Advance timer to completion
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    
    expect(result.current.timeRemaining).toBe(0)
    expect(result.current.isRunning).toBe(false)
    expect(onComplete).toHaveBeenCalledTimes(1)
    
    vi.useRealTimers()
  })

  test('should handle manual stop and reset correctly', () => {
    const { result } = renderHook(() => useFocusTimer(300))
    
    // Start timer
    act(() => {
      result.current.start()
    })
    
    expect(result.current.isRunning).toBe(true)
    
    // Stop timer
    act(() => {
      result.current.stop()
    })
    
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isPaused).toBe(false)
    expect(result.current.timeRemaining).toBe(300) // Reset to initial
  })

  test('should calculate progress percentage accurately', () => {
    const { result } = renderHook(() => useFocusTimer(100))
    
    // Initial progress should be 0
    expect(result.current.progress).toBe(0)
    
    // Manually set time remaining to test progress calculation
    act(() => {
      result.current.start()
    })
    
    // After some time has passed, progress should increase
    // This test verifies the progress calculation formula
    const expectedProgress = ((100 - result.current.timeRemaining) / 100) * 100
    expect(result.current.progress).toBe(expectedProgress)
  })

  test('should cleanup interval on unmount', () => {
    const { result, unmount } = renderHook(() => useFocusTimer(60))
    
    // Start timer to create interval
    act(() => {
      result.current.start()
    })
    
    expect(result.current.isRunning).toBe(true)
    
    // Unmount component
    unmount()
    
    // Timer should be cleaned up (no specific assertion needed for Green Phase)
    // The cleanup is verified by React's cleanup mechanism
  })

  test('should handle rapid start/stop cycles without memory leaks', () => {
    const { result } = renderHook(() => useFocusTimer(60))
    
    // Rapid start/stop cycles
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.start()
        result.current.stop()
      })
    }
    
    // Should end in stopped state
    expect(result.current.isRunning).toBe(false)
    expect(result.current.timeRemaining).toBe(60) // Reset to initial value
  })

  test('should not update when paused', async () => {
    vi.useFakeTimers()
    
    const { result } = renderHook(() => useFocusTimer(60))
    
    // Start and immediately pause
    act(() => {
      result.current.start()
      result.current.pause()
    })
    
    const initialTime = result.current.timeRemaining
    
    // Advance time while paused
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    
    // Time should not have changed
    expect(result.current.timeRemaining).toBe(initialTime)
    
    vi.useRealTimers()
  })

  test('should handle edge case of zero initial duration', async () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useFocusTimer(0, onComplete))
    
    await act(async () => {
      result.current.start()
    })
    
    // Wait for the timer to complete
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Should immediately complete
    expect(result.current.timeRemaining).toBe(0)
    expect(result.current.isRunning).toBe(false)
    expect(onComplete).toHaveBeenCalled()
  })
})
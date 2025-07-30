import { useState, useCallback, useRef, useEffect } from 'react'

interface UseFocusTimerReturn {
  timeRemaining: number
  isRunning: boolean
  isPaused: boolean
  startTime: Date | null
  start: (duration?: number) => void
  pause: () => void
  resume: () => void
  stop: () => void
  progress: number
}

export const useFocusTimer = (
  initialDuration: number,
  onComplete?: () => void
): UseFocusTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState(initialDuration)
  const [originalDuration, setOriginalDuration] = useState(initialDuration)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Simplified timer for Green Phase - using setInterval for now
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1
          if (newTime <= 0) {
            setIsRunning(false)
            onComplete?.()
            return 0
          }
          return newTime
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, isPaused, onComplete])

  const start = useCallback((duration?: number) => {
    const targetDuration = duration ?? originalDuration
    
    setOriginalDuration(targetDuration)
    setTimeRemaining(targetDuration)
    setIsRunning(true)
    setIsPaused(false)
    setStartTime(new Date())
    
    // Handle zero duration edge case
    if (targetDuration === 0) {
      setIsRunning(false)
      onComplete?.()
    }
  }, [originalDuration, onComplete])

  const pause = useCallback(() => {
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    setIsPaused(false)
  }, [])

  const stop = useCallback(() => {
    setIsRunning(false)
    setIsPaused(false)
    setTimeRemaining(originalDuration)
  }, [originalDuration])

  const progress = originalDuration > 0 ? ((originalDuration - timeRemaining) / originalDuration) * 100 : 0

  return {
    timeRemaining,
    isRunning,
    isPaused,
    startTime,
    start,
    pause,
    resume,
    stop,
    progress
  }
}
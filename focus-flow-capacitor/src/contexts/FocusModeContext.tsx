import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { Task } from '../types/Task'
import { 
  FocusModeState, 
  FocusSession, 
  ConstraintLevel
} from '../types/FocusMode'
import { useFocusTimer } from '../hooks/useFocusTimer'
import { ScreenConstraintEngine } from '../utils/screenConstraintEngine'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface FocusModeContextValue {
  focusMode: FocusModeState
  startFocus: (task: Task, level: ConstraintLevel, duration: number) => Promise<void>
  endFocus: (reason: 'completed' | 'interrupted') => Promise<void>
  pauseFocus: () => void
  resumeFocus: () => void
  updateConstraintLevel: (level: ConstraintLevel) => void
  isInFocusMode: boolean
  currentSession: FocusSession | null
  focusProgress: number
  focusSessions: FocusSession[]
}

const FocusModeContext = createContext<FocusModeContextValue | undefined>(undefined)

const initialState: FocusModeState = {
  isActive: false,
  startTime: null,
  endTime: null,
  currentTask: null,
  constraintLevel: 'moderate',
  sessionData: null,
  plannedDuration: 0,
  timeRemaining: 0,
  isPaused: false,
  sessionId: null,
  interruptions: []
}

export const FocusModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [focusMode, setFocusMode] = useState<FocusModeState>(initialState)
  const [constraintEngine] = useState(() => new ScreenConstraintEngine())
  
  // Timer integration - start with 0 duration, will be updated when focus starts
  const timer = useFocusTimer(0, () => {
    // Timer completed
    endFocus('completed')
  })
  
  // Focus sessions history management
  const [focusSessions, setFocusSessions] = useLocalStorage<FocusSession[]>('focus-flow-sessions', [])
  
  // Sync timer state with focus mode state
  useEffect(() => {
    if (focusMode.isActive) {
      setFocusMode(prev => ({
        ...prev,
        timeRemaining: timer.timeRemaining,
        isPaused: timer.isPaused
      }))
    }
  }, [timer.timeRemaining, timer.isPaused, focusMode.isActive])

  const startFocus = useCallback(async (task: Task, level: ConstraintLevel, duration: number) => {
    const sessionId = `focus-session-${Date.now()}`
    const startTime = new Date()
    const durationInSeconds = duration * 60
    
    setFocusMode(prev => ({
      ...prev,
      isActive: true,
      startTime,
      currentTask: task,
      constraintLevel: level,
      plannedDuration: durationInSeconds,
      timeRemaining: durationInSeconds,
      sessionId,
      interruptions: []
    }))

    // Apply screen constraints
    try {
      const targetElement = document.querySelector(`[data-testid="task-item-${task.id}"]`) || document.body
      await constraintEngine.applyConstraint(level, targetElement)
    } catch (error) {
      console.warn('Failed to apply screen constraints:', error)
    }

    // Start timer with the specified duration
    timer.start(durationInSeconds)

    // Note: For Green Phase, we don't need to create a session record at start
    // Session will be created when focus ends with complete data
    
    // Save task memo with focus session start info
    const taskMemoKey = `focus-flow-task-memo-${task.id}`
    try {
      const existingMemo = localStorage.getItem(taskMemoKey)
      let taskMemoData = existingMemo ? JSON.parse(existingMemo) : {
        taskId: task.id,
        taskSnapshot: task,
        content: '',
        lastSaved: new Date().toISOString()
      }
      
      // Append focus session start note
      const sessionStartNote = `\n\n--- フォーカスセッション開始 ---\n開始時刻: ${startTime.toLocaleTimeString('ja-JP')}\n制約レベル: ${level}\n予定時間: ${duration}分\n\n`
      taskMemoData.content += sessionStartNote
      taskMemoData.lastSaved = new Date().toISOString()
      
      localStorage.setItem(taskMemoKey, JSON.stringify(taskMemoData))
    } catch (error) {
      console.warn('Failed to save focus session start to task memo:', error)
    }
  }, [constraintEngine, timer])

  const endFocus = useCallback(async (reason: 'completed' | 'interrupted') => {
    const endTime = new Date()
    
    // Remove screen constraints
    constraintEngine.removeConstraint()
    
    // Stop timer
    timer.stop()
    
    // Calculate actual duration and create session record
    if (focusMode.sessionId && focusMode.currentTask && focusMode.startTime) {
      const actualDuration = Math.floor((endTime.getTime() - focusMode.startTime.getTime()) / 1000)
      
      const completedSession: FocusSession = {
        sessionId: focusMode.sessionId,
        taskId: focusMode.currentTask.id,
        constraintLevel: focusMode.constraintLevel,
        startTime: focusMode.startTime.toISOString(),
        endTime: endTime.toISOString(),
        plannedDuration: Math.round(focusMode.plannedDuration / 60), // Convert seconds to minutes
        actualDuration: Math.round(actualDuration / 60), // Convert seconds to minutes
        interruptions: focusMode.interruptions,
        completionStatus: reason,
        metrics: {
          focusScore: reason === 'completed' ? 100 : Math.max(0, Math.round((actualDuration / focusMode.plannedDuration) * 100)),
          interruptionCount: focusMode.interruptions.length,
          resumeCount: focusMode.interruptions.filter(i => i.resumedAt !== null).length
        }
      }
      
      // Save session to history
      setFocusSessions(prev => [...prev, completedSession])
      
      // Save task memo with focus session end info
      const taskMemoKey = `focus-flow-task-memo-${focusMode.currentTask.id}`
      try {
        const existingMemo = localStorage.getItem(taskMemoKey)
        if (existingMemo) {
          let taskMemoData = JSON.parse(existingMemo)
          
          // Append focus session end note
          const sessionEndNote = `--- フォーカスセッション終了 ---\n終了時刻: ${endTime.toLocaleTimeString('ja-JP')}\n実際の時間: ${Math.round(actualDuration / 60)}分\n完了状態: ${reason === 'completed' ? '完了' : '中断'}\n\n`
          
          // Ensure proper line break before appending session end note
          const currentContent = taskMemoData.content || ''
          const needsLineBreak = currentContent.length > 0 && !currentContent.endsWith('\n')
          taskMemoData.content = currentContent + (needsLineBreak ? '\n' : '') + sessionEndNote
          taskMemoData.lastSaved = new Date().toISOString()
          
          localStorage.setItem(taskMemoKey, JSON.stringify(taskMemoData))
        }
      } catch (error) {
        console.warn('Failed to save focus session end to task memo:', error)
      }
    }
    
    setFocusMode(prev => ({
      ...prev,
      isActive: false,
      endTime,
      isPaused: false
    }))
  }, [constraintEngine, timer, focusMode, setFocusSessions])

  const pauseFocus = useCallback(() => {
    timer.pause()
    setFocusMode(prev => ({
      ...prev,
      isPaused: true
    }))
  }, [timer])

  const resumeFocus = useCallback(() => {
    timer.resume()
    setFocusMode(prev => ({
      ...prev,
      isPaused: false
    }))
  }, [timer])

  const updateConstraintLevel = useCallback((level: ConstraintLevel) => {
    setFocusMode(prev => ({
      ...prev,
      constraintLevel: level
    }))
  }, [])

  const isInFocusMode = focusMode.isActive
  const currentSession = focusMode.sessionData
  const focusProgress = focusMode.plannedDuration > 0 
    ? ((focusMode.plannedDuration - focusMode.timeRemaining) / focusMode.plannedDuration) * 100 
    : 0

  const contextValue: FocusModeContextValue = {
    focusMode,
    startFocus,
    endFocus,
    pauseFocus,
    resumeFocus,
    updateConstraintLevel,
    isInFocusMode,
    currentSession,
    focusProgress,
    focusSessions
  }

  return (
    <FocusModeContext.Provider value={contextValue}>
      {children}
    </FocusModeContext.Provider>
  )
}

export const useFocusMode = (): FocusModeContextValue => {
  const context = useContext(FocusModeContext)
  if (context === undefined) {
    throw new Error('useFocusMode must be used within a FocusModeProvider')
  }
  return context
}
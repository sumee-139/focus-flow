import { Task } from './Task'

export type ConstraintLevel = 'minimal' | 'moderate' | 'intensive'

export type CompletionStatus = 'completed' | 'interrupted' | 'extended'

export interface Interruption {
  timestamp: Date
  reason: string
  resumedAt: Date | null
}

export interface FocusSession {
  sessionId: string
  taskId: string
  constraintLevel: ConstraintLevel
  startTime: string // ISO 8601
  endTime: string | null // ISO 8601
  plannedDuration: number // minutes
  actualDuration: number // minutes
  interruptions: Interruption[]
  completionStatus: CompletionStatus
  metrics: {
    focusScore: number // 0-100
    interruptionCount: number
    resumeCount: number
  }
}

export interface FocusModeState {
  isActive: boolean
  startTime: Date | null
  endTime: Date | null
  currentTask: Task | null
  constraintLevel: ConstraintLevel
  sessionData: FocusSession | null
  
  // Timer state
  plannedDuration: number // seconds
  timeRemaining: number // seconds
  isPaused: boolean
  
  // Session management
  sessionId: string | null
  interruptions: Interruption[]
}

export interface FocusSettings {
  defaultConstraintLevel: ConstraintLevel
  defaultDuration: number // minutes
  enableSoundEffects: boolean
  enableVisualEffects: boolean
  autoStartOnTaskSelect: boolean
}

export interface TaskFocusData {
  taskId: string
  focusHistory: FocusSession[]
  totalFocusTime: number // minutes
  averageSessionLength: number // minutes
  lastFocusDate: string // ISO 8601
  focusStreak: number // consecutive days
}

// Extended LocalStorage data structure
export interface FocusFlowData {
  // Existing data (maintain backward compatibility)
  tasks: Task[]
  dailyMemos: Record<string, any> // DailyMemo
  taskMemos: Record<string, any> // TaskMemo
  
  // New focus mode data (optional for backward compatibility)
  focusSessions?: Record<string, FocusSession> // sessionId -> FocusSession
  focusSettings?: FocusSettings
  taskFocusData?: Record<string, TaskFocusData> // taskId -> TaskFocusData
}
// FocusFlow Task Type Definition
// Design Philosophy準拠: 重要度・期限・進捗率フィールドは禁止

export interface Task {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  alarmTime?: string; // HH:MM format
  order: number; // User-defined order for drag & drop
  completed: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  // 🆕 Phase 2.2a: 日付管理拡張
  targetDate: string; // YYYY-MM-DD format
  actualMinutes?: number; // Actual time spent
  completedAt?: Date; // Completion timestamp
}

export interface DailyMemo {
  date: string; // YYYY-MM-DD
  content: string; // Plain Markdown
  updatedAt: Date;
}

export interface TaskMemoData {
  taskId: string;
  content: string;
  lastUpdated: string; // ISO string
  taskSnapshot: {
    title: string;
    description?: string;
    tags: string[];
    estimatedMinutes: number;
    createdAt: Date;
  };
}

export interface FocusSession {
  id: string;
  duration: number; // minutes
  startTime: Date;
  endTime?: Date;
  taskId?: string;
  createdAt: Date;
}

// 🆕 Phase 2.2a: 日付フィルタ管理型
export interface TaskFilter {
  viewDate: string; // YYYY-MM-DD format
  mode: 'today' | 'date' | 'archive';
  showCompleted: boolean;
  showArchived: boolean;
}

// 🆕 Phase 2.2a: 日付統計情報型
export interface DateStatistics {
  date: string; // YYYY-MM-DD
  totalTasks: number;
  completedTasks: number;
  totalEstimatedMinutes: number;
  totalActualMinutes: number;
  completionPercentage: number; // 達成率 (0-100)
}

// 🆕 Phase 2.2a: タスク作成用入力型
export interface TaskCreateInput {
  title: string;
  description?: string;
  estimatedMinutes: number;
  targetDate: string;
  alarmTime?: string;
  tags: string[];
}

// App State Types
export interface AppState {
  tasks: Task[];
  focusMode: {
    isActive: boolean;
    currentSession?: FocusSession;
    remainingTime?: number;
  };
  ui: {
    selectedTask?: string;
    isAddingTask: boolean;
    showSettings: boolean;
    deleteConfirmDialog: {
      isOpen: boolean;
      taskId: string | null;
    };
    memoPanel: {
      isOpen: boolean;
      mode: 'task' | 'daily';
      selectedTaskId: string | null;
    };
  };
}

// Action Types for State Management
export type AppAction = 
  | { type: 'LOAD_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'REORDER_TASKS'; payload: { dragIndex: number; hoverIndex: number } }
  | { type: 'START_FOCUS'; payload: { duration: number; taskId?: string } }
  | { type: 'END_FOCUS' }
  | { type: 'SET_UI_STATE'; payload: Partial<AppState['ui']> }
  | { type: 'SHOW_DELETE_CONFIRM'; payload: string }
  | { type: 'HIDE_DELETE_CONFIRM' }
  | { type: 'OPEN_TASK_MEMO'; payload: { taskId: string } }
  | { type: 'OPEN_DAILY_MEMO' }
  | { type: 'CLOSE_MEMO_PANEL' }
  | { type: 'SWITCH_MEMO_MODE'; payload: { mode: 'task' | 'daily' } }
  | { type: 'QUOTE_TASK_TO_DAILY'; payload: { taskId: string } };
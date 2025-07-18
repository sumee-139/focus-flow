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
}

export interface DailyMemo {
  date: string; // YYYY-MM-DD
  content: string; // Plain Markdown
  updatedAt: Date;
}

export interface FocusSession {
  id: string;
  duration: number; // minutes
  startTime: Date;
  endTime?: Date;
  taskId?: string;
  createdAt: Date;
}

// App State Types
export interface AppState {
  tasks: Task[];
  focusMode: {
    isActive: boolean;
    currentSession?: FocusSession;
    remainingTime?: number;
  };
  dailyMemo: {
    date: string;
    content: string;
    lastSaved: Date;
  };
  ui: {
    selectedTask?: string;
    isAddingTask: boolean;
    showSettings: boolean;
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
  | { type: 'UPDATE_MEMO'; payload: { date: string; content: string } }
  | { type: 'SAVE_MEMO'; payload: { date: string; content: string } };
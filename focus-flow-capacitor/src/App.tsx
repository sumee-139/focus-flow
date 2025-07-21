import { useState, useEffect, useReducer, useCallback } from 'react'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'
import type { AppState, AppAction, Task } from './types/Task'
import { TaskItem } from './components/TaskItem'
import { AddTaskForm } from './components/AddTaskForm'
import { ConfirmDialog } from './components/ConfirmDialog'
import { DailyMemo } from './components/DailyMemo'
import { MemoPanel } from './components/MemoPanel'
import { TabArea, type TabInfo } from './components/TabArea'
import { TaskMemo } from './components/TaskMemo'
import { MobileAccordion } from './components/MobileAccordion'
import { MobileTaskMemoModal } from './components/MobileTaskMemoModal'
import { useLocalStorage } from './hooks/useLocalStorage'
import { MEDIA_QUERIES } from './constants/ui'
import './App.css'

// デフォルトタスク（localStorage が空の場合の初期値）
const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'FocusFlowプロトタイプを完成させる',
    description: 'Design Philosophyに準拠したUI実装',
    estimatedMinutes: 120,
    alarmTime: '14:00',
    order: 1,
    completed: false,
    tags: ['development'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'タスク管理機能をテストする',
    description: '基本的なCRUD操作の動作確認',
    estimatedMinutes: 30,
    order: 2,
    completed: false,
    tags: ['testing'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// App State Reducer (Design Philosophy準拠の状態管理)
const getInitialState = (tasks: Task[]): AppState => ({
  tasks,
  focusMode: {
    isActive: false
  },
  ui: {
    isAddingTask: false,
    showSettings: false,
    deleteConfirmDialog: {
      isOpen: false,
      taskId: null
    },
    memoPanel: {
      isOpen: false,
      mode: 'daily',
      selectedTaskId: null
    }
  }
})

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        ui: {
          ...state.ui,
          isAddingTask: false
        }
      }
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        ui: {
          ...state.ui,
          deleteConfirmDialog: {
            isOpen: false,
            taskId: null
          }
        }
      }
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, updatedAt: new Date() }
            : task
        )
      }
    case 'START_FOCUS':
      return {
        ...state,
        focusMode: {
          ...state.focusMode,
          isActive: true
        }
      }
    case 'END_FOCUS':
      return {
        ...state,
        focusMode: {
          ...state.focusMode,
          isActive: false
        }
      }
    case 'SET_UI_STATE':
      return {
        ...state,
        ui: {
          ...state.ui,
          ...action.payload
        }
      }
    case 'SHOW_DELETE_CONFIRM':
      return {
        ...state,
        ui: {
          ...state.ui,
          deleteConfirmDialog: {
            isOpen: true,
            taskId: action.payload
          }
        }
      }
    case 'HIDE_DELETE_CONFIRM':
      return {
        ...state,
        ui: {
          ...state.ui,
          deleteConfirmDialog: {
            isOpen: false,
            taskId: null
          }
        }
      }
    case 'OPEN_TASK_MEMO':
      return {
        ...state,
        ui: {
          ...state.ui,
          memoPanel: {
            isOpen: true,
            mode: 'task',
            selectedTaskId: action.payload.taskId
          }
        }
      }
    case 'OPEN_DAILY_MEMO':
      return {
        ...state,
        ui: {
          ...state.ui,
          memoPanel: {
            isOpen: true,
            mode: 'daily',
            selectedTaskId: null
          }
        }
      }
    case 'CLOSE_MEMO_PANEL':
      return {
        ...state,
        ui: {
          ...state.ui,
          memoPanel: {
            ...state.ui.memoPanel,
            isOpen: false
          }
        }
      }
    case 'SWITCH_MEMO_MODE':
      return {
        ...state,
        ui: {
          ...state.ui,
          memoPanel: {
            ...state.ui.memoPanel,
            mode: action.payload.mode
          }
        }
      }
    case 'QUOTE_TASK_TO_DAILY':
      // This action will be handled by the DailyMemo component
      return state
    default:
      return state
  }
}

// Date文字列をDateオブジェクトに変換するヘルパー関数
const parseTasks = (tasks: Task[]): Task[] => {
  return tasks.map(task => ({
    ...task,
    createdAt: typeof task.createdAt === 'string' ? new Date(task.createdAt) : task.createdAt,
    updatedAt: typeof task.updatedAt === 'string' ? new Date(task.updatedAt) : task.updatedAt
  }))
}

function App() {
  // LocalStorageからタスクを読み込み
  const [storedTasks, setStoredTasks] = useLocalStorage<Task[]>('focus-flow-tasks', defaultTasks)
  
  // 初期状態をlocalStorageのタスクで設定
  const [state, dispatch] = useReducer(appReducer, getInitialState(parseTasks(storedTasks)))
  
  const [platformInfo] = useState({
    platform: Capacitor.getPlatform(),
    isNativePlatform: Capacitor.isNativePlatform()
  })
  const [notificationPermission, setNotificationPermission] = useState<string>('unknown')
  const [statusMessage, setStatusMessage] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  
  // TabArea state management
  const [activeTabId, setActiveTabId] = useState<string>('daily')
  const [openTabs, setOpenTabs] = useState<TabInfo[]>([
    { id: 'daily', type: 'daily', title: 'デイリーメモ', closable: false }
  ])

  // Mobile UX state management (Phase 2.1d+ Final)
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(false)
  const [isTaskMemoModalOpen, setIsTaskMemoModalOpen] = useState(false)
  const [selectedTaskForMobile, setSelectedTaskForMobile] = useState<Task | null>(null)
  const [dailyMemoContent, setDailyMemoContent] = useState('')

  // タスクの変更をlocalStorageに保存
  useEffect(() => {
    setStoredTasks(state.tasks)
  }, [state.tasks, setStoredTasks])

  useEffect(() => {
    checkNotificationPermissions()
  }, [])

  // Load daily memo content for mobile accordion (Phase 2.1d+ Final)
  useEffect(() => {
    if (isMobile) {
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      const storageKey = `daily-memo-${today}`
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const memoData = JSON.parse(saved)
          setDailyMemoContent(memoData.content || '')
        }
      } catch (error) {
        console.warn('Failed to load daily memo:', error)
      }
    }
  }, [isMobile])

  // モバイル検出 (768px境界)
  useEffect(() => {
    const checkIsMobile = () => {
      try {
        setIsMobile(window.matchMedia(MEDIA_QUERIES.MOBILE).matches)
      } catch (error) {
        console.warn('matchMedia not supported:', error)
        setIsMobile(false) // デスクトップとして扱う
      }
    }
    
    checkIsMobile()
    
    let mediaQuery: MediaQueryList | null = null
    try {
      mediaQuery = window.matchMedia(MEDIA_QUERIES.MOBILE)
      mediaQuery.addEventListener('change', checkIsMobile)
    } catch (error) {
      console.warn('matchMedia event listener not supported:', error)
    }
    
    return () => {
      try {
        mediaQuery?.removeEventListener('change', checkIsMobile)
      } catch (error) {
        // cleanup error は無視
      }
    }
  }, [])

  const showMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setStatusMessage(`${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${message}`)
    setTimeout(() => setStatusMessage(''), 5000)
  }

  const checkNotificationPermissions = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const permission = await LocalNotifications.checkPermissions()
        setNotificationPermission(permission.display)
        
        if (permission.display === 'prompt') {
          await LocalNotifications.requestPermissions()
        }
      } else {
        if ('Notification' in window) {
          setNotificationPermission(Notification.permission)
          if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission()
            setNotificationPermission(permission)
          }
        }
      }
    } catch (error) {
      console.error('Permission check error:', error)
    }
  }

  const startFocusMode = useCallback(async () => {
    try {
      dispatch({ type: 'START_FOCUS', payload: { duration: 60 } })
      showMessage('Focus Mode Started - 通知がブロックされます', 'success')
      console.log('Focus mode activated')
    } catch (error) {
      console.error('Focus mode start error:', error)
      showMessage('Focus mode start failed', 'error')
    }
  }, [showMessage])

  const stopFocusMode = useCallback(async () => {
    try {
      dispatch({ type: 'END_FOCUS' })
      showMessage('Focus Mode Stopped - 通知が再開されます', 'info')
      console.log('Focus mode deactivated')
    } catch (error) {
      console.error('Focus mode stop error:', error)
      showMessage('Focus mode stop failed', 'error')
    }
  }, [showMessage])

  const testNotification = useCallback(async () => {
    try {
      console.log('Testing notification, focus mode:', state.focusMode.isActive)
      
      if (state.focusMode.isActive) {
        console.log('✅ Notification BLOCKED - Focus mode working correctly')
        showMessage('Focus Mode Working! 通知がブロックされました', 'success')
        return
      }

      if (Capacitor.isNativePlatform()) {
        // ネイティブ: Critical Alert機能を使用
        await LocalNotifications.schedule({
          notifications: [
            {
              title: "FocusFlow Test",
              body: "Critical Alert - DND回避テスト",
              id: 1,
              extra: {
                critical: 1,
                volume: 1.0
              }
            }
          ]
        })
        
        console.log('✅ Critical Alert sent (should bypass DND)')
        showMessage('Critical Alert Sent - DND回避通知を送信', 'success')
      } else {
        // Web環境: 標準通知
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('FocusFlow Test', {
            body: 'Web通知テスト - Capacitor統一アーキテクチャ',
            icon: '/vite.svg'
          })
          
          console.log('✅ Web notification sent')
          showMessage('Web Notification Sent - 通知を送信しました', 'success')
        } else {
          showMessage('通知権限が必要です - ブラウザの通知を有効にしてください', 'error')
        }
      }
    } catch (error) {
      console.error('Test notification error:', error)
      showMessage(`通知テスト失敗: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }, [state.focusMode.isActive, showMessage])

  // Task Handlers (useCallback最適化済み - ISS-001対応)
  const handleAddTask = useCallback((task: Task) => {
    dispatch({ type: 'ADD_TASK', payload: task })
  }, [])

  const handleToggleTask = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id })
  }, [])

  const handleEditTask = useCallback((id: string) => {
    console.log('Edit task:', id)
    // TODO: Implement edit functionality
  }, [])

  const handleDeleteTask = useCallback((id: string) => {
    dispatch({ type: 'SHOW_DELETE_CONFIRM', payload: id })
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (state.ui.deleteConfirmDialog.taskId) {
      dispatch({ type: 'DELETE_TASK', payload: state.ui.deleteConfirmDialog.taskId })
    }
  }, [state.ui.deleteConfirmDialog.taskId])

  const handleCancelDelete = useCallback(() => {
    dispatch({ type: 'HIDE_DELETE_CONFIRM' })
  }, [])

  const handleReorderTask = useCallback((dragIndex: number, hoverIndex: number) => {
    console.log('Reorder task:', dragIndex, hoverIndex)
    // TODO: Implement reorder functionality
  }, [])

  // MemoPanel Handlers (useCallback最適化済み - ISS-001対応)
  const handleOpenTaskMemo = useCallback((taskId: string) => {
    dispatch({ type: 'OPEN_TASK_MEMO', payload: { taskId } })
  }, [])
  // MemoPanel で使用されるが、モバイルでは非表示のため未使用警告が出る
  void handleOpenTaskMemo // 未使用警告を抑制

  const handleOpenDailyMemo = useCallback(() => {
    dispatch({ type: 'OPEN_DAILY_MEMO' })
  }, [])

  const handleCloseMemoPanel = useCallback(() => {
    dispatch({ type: 'CLOSE_MEMO_PANEL' })
  }, [])

  const handleSwitchMemoMode = useCallback((mode: 'task' | 'daily') => {
    dispatch({ type: 'SWITCH_MEMO_MODE', payload: { mode } })
  }, [])

  // TabArea Handlers
  const handleTabSelect = useCallback((tabId: string) => {
    setActiveTabId(tabId)
  }, [])

  const handleTabClose = useCallback((tabId: string) => {
    if (tabId === 'daily') return // デイリーメモタブは閉じられない
    
    setOpenTabs(prev => prev.filter(tab => tab.id !== tabId))
    
    // 閉じたタブがアクティブだった場合、デイリーメモに戻る
    if (activeTabId === tabId) {
      setActiveTabId('daily')
    }
  }, [activeTabId])

  const handleTaskClick = useCallback((taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) return

    // Mobile UX: モバイルではタスクメモモーダルを開く
    if (isMobile) {
      setSelectedTaskForMobile(task)
      setIsTaskMemoModalOpen(true)
      return
    }

    // Desktop UX: タブシステムを使用
    // タスクタブが既に開いているかチェック
    const existingTab = openTabs.find(tab => tab.id === taskId)
    
    if (!existingTab) {
      // 新しいタスクタブを追加
      const newTab: TabInfo = {
        id: taskId,
        type: 'task',
        title: task.title,
        taskId: taskId,
        closable: true
      }
      setOpenTabs(prev => [...prev, newTab])
    }
    
    // そのタブをアクティブにする
    setActiveTabId(taskId)
  }, [state.tasks, openTabs, isMobile])

  // Mobile UX handlers (Phase 2.1d+ Final)
  const handleAccordionToggle = useCallback(() => {
    setIsAccordionExpanded(prev => !prev)
  }, [])

  const handleTaskMemoModalClose = useCallback(() => {
    setIsTaskMemoModalOpen(false)
    setSelectedTaskForMobile(null)
  }, [])

  const handleSaveDailyMemo = useCallback((content: string) => {
    // DailyMemoコンポーネントと同じ保存ロジックを使用
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const storageKey = `daily-memo-${today}`
    const memoData = {
      date: today,
      content,
      lastUpdated: new Date().toISOString(),
      taskReferences: []
    }
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(memoData))
      // Mobile state も更新
      setDailyMemoContent(content)
    } catch (error) {
      console.warn('Failed to save daily memo:', error)
    }
  }, [])

  const handleTaskAction = useCallback((action: 'toggle' | 'delete' | 'focus', taskId: string) => {
    switch (action) {
      case 'toggle':
        handleToggleTask(taskId)
        break
      case 'delete':
        handleDeleteTask(taskId)
        break
      case 'focus':
        startFocusMode()
        break
    }
  }, [handleToggleTask, handleDeleteTask, startFocusMode])



  return (
    <div className="app">
      <div className="container">
        {/* Header with Focus Mode Toggle (Design Philosophy: 最小限のボタン配置) */}
        <header className="header">
          <div className="title-section">
            <h1>FocusFlow</h1>
            <p className="subtitle">今日必ず着手するタスクのみを管理</p>
          </div>
          <div className="focus-toggle">
            <button 
              className={`focus-btn ${state.focusMode.isActive ? 'active' : ''}`}
              onClick={state.focusMode.isActive ? stopFocusMode : startFocusMode}
            >
              Focus: {state.focusMode.isActive ? 'ON' : 'OFF'}
            </button>
          </div>
        </header>

        <div className="main-layout-grid" data-testid="main-layout-grid">
          {/* Tasks Area (30% - Design Philosophy準拠) */}
          <div className={`tasks-area-30 ${isMobile ? 'mobile-full-height' : ''}`} data-testid="tasks-area-30">
            <aside className="tasks-sidebar" data-testid="tasks-section">
              <h3>Today's Tasks</h3>
              
              {/* フォーム固定表示エリア */}
              <div className="form-fixed-area" data-testid="form-fixed-area">
                <AddTaskForm onAdd={handleAddTask} />
              </div>
              
              {/* スクロール可能なタスクリストエリア */}
              <div className="tasks-scrollable-area" data-testid="tasks-scrollable-area">
                <div className="tasks-list">
                  {state.tasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onReorder={handleReorderTask}
                      onMemoClick={handleTaskClick}
                    />
                  ))}
                </div>
              </div>
            </aside>
          </div>

          {/* Memo Area (45% - Design Philosophy必須) - モバイルでは非表示 */}
          {!isMobile && (
            <main className="memo-area-45" data-testid="memo-area-45">
              <div className="memo-header">
                <button 
                  onClick={handleOpenDailyMemo}
                  className="open-memo-panel-btn"
                  aria-label="Open memo panel"
                >
                  📝 メモパネルを開く
                </button>
              </div>
              {/* タブに応じたコンテンツ表示 */}
              {activeTabId === 'daily' ? (
                <DailyMemo />
              ) : (
                <TaskMemo 
                  key={activeTabId}
                  taskId={activeTabId} 
                  task={state.tasks.find(t => t.id === activeTabId)} 
                />
              )}
            </main>
          )}

          {/* Tab Area (25% - 新設) - モバイルでは非表示 */}
          {!isMobile && (
            <aside className="tab-area-25" data-testid="tab-area-25">
              <TabArea 
                tabs={openTabs}
                activeTabId={activeTabId}
                onTabSelect={handleTabSelect}
                onTabClose={handleTabClose}
              />
            </aside>
          )}
        </div>

        {/* Debug Info (開発中のみ表示) */}
        {process.env.NODE_ENV === 'development' && (
          <section className="debug-info">
            <details>
              <summary>Debug Information</summary>
              <div className="debug-content">
                <p><strong>Platform:</strong> {platformInfo.platform}</p>
                <p><strong>Native:</strong> {platformInfo.isNativePlatform ? 'Yes' : 'No'}</p>
                <p><strong>Notification Permission:</strong> {notificationPermission}</p>
                <button className="btn btn-test" onClick={testNotification}>
                  🔔 Test Notification
                </button>
              </div>
            </details>
          </section>
        )}

        {statusMessage && (
          <div className="status-message">
            {statusMessage}
          </div>
        )}

        {/* Memo Panel */}
        <MemoPanel
          isOpen={state.ui.memoPanel.isOpen}
          mode={state.ui.memoPanel.mode}
          selectedTaskId={state.ui.memoPanel.selectedTaskId || undefined}
          selectedTask={state.ui.memoPanel.selectedTaskId ? state.tasks.find(t => t.id === state.ui.memoPanel.selectedTaskId) : undefined}
          onClose={handleCloseMemoPanel}
          onModeChange={handleSwitchMemoMode}
          onTaskAction={handleTaskAction}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={state.ui.deleteConfirmDialog.isOpen}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />

        {/* Mobile UX Components (Phase 2.1d+ Final) - 768px以下でのみ表示 */}
        {isMobile && (
          <>
            {/* Mobile Daily Memo Accordion */}
            <MobileAccordion
              isExpanded={isAccordionExpanded}
              onToggle={handleAccordionToggle}
              dailyMemoContent={dailyMemoContent}
              onSave={handleSaveDailyMemo}
            />

            {/* Mobile Task Memo Modal */}
            {selectedTaskForMobile && (
              <MobileTaskMemoModal
                isOpen={isTaskMemoModalOpen}
                taskId={selectedTaskForMobile.id}
                taskTitle={selectedTaskForMobile.title}
                taskMemoContent="" // Task memo content will be loaded from localStorage
                onSave={(content) => {
                  // Save task memo using existing save logic
                  console.log(`Saving task memo for ${selectedTaskForMobile.id}:`, content)
                  // TODO: Integrate with existing task memo save logic
                }}
                onClose={handleTaskMemoModalClose}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App

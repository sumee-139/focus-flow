import { useState, useEffect, useReducer, useCallback, useMemo } from 'react'
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
import { DateNavigation } from './components/DateNavigation'
import { DatePicker } from './components/DatePicker'
import { TaskStatistics } from './components/TaskStatistics'
import { FocusModeProvider, useFocusMode } from './contexts/FocusModeContext'
import { FocusTimer } from './components/FocusTimer'
import { FocusModeLayout } from './components/FocusModeLayout'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTaskFilter } from './hooks/useTaskFilter'
import { MEDIA_QUERIES } from './constants/ui'
import { logger } from './utils/debugLogger'
import { getJSTTodayString } from './utils/dateUtils'
import './App.css'

// デフォルトタスク（localStorage が空の場合の初期値）
// 🔧 TEST FIX: getJSTTodayString()ではなく動的に今日の日付を取得する関数を使用
const getDefaultTasks = (): Task[] => {
  const todayString = getJSTTodayString() // 実行時の今日の日付を取得
  return [
    {
      id: '1',
      title: 'FocusFlowプロトタイプを完成させる',
      description: 'Design Philosophyに準拠したUI実装',
      estimatedMinutes: 120,
      alarmTime: '14:00',
      targetDate: todayString, // 実行時の今日の日付をデフォルト
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
      targetDate: todayString, // 実行時の今日の日付をデフォルト
      order: 2,
      completed: false, // 🔥 FIX: テスト用に未完了タスクを保持
      tags: ['testing'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
}

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

// JST基準での今日の日付を取得（YYYY-MM-DD形式）
// T006: UTC/JST時差問題修正のためgetJSTTodayStringを使用
const getLocalDateString = (): string => {
  return getJSTTodayString();
}

function AppContent() {
  // Focus Mode Context
  const { startFocus, isInFocusMode } = useFocusMode()
  
  // LocalStorageからタスクを読み込み
  // 🔧 TEST FIX: 動的にデフォルトタスクを生成してテスト時の日付モックに対応
  const [storedTasks, setStoredTasks] = useLocalStorage<Task[]>('focus-flow-tasks', getDefaultTasks())
  
  // 初期状態をlocalStorageのタスクで設定
  const [state, dispatch] = useReducer(appReducer, getInitialState(parseTasks(storedTasks)))
  
  // 🟢 Green Phase: Phase 2.2a Date Management Integration
  // タスクフィルタリング機能（日付管理も含む）
  const { filteredTasks, statistics, filter, updateFilter } = useTaskFilter(state.tasks)
  
  // DatePickerモーダル状態管理
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  
  // 🟢 循環依存バグ修正: アプリ起動時にフィルタを今日の日付に強制設定
  useEffect(() => {
    // 🟢 タイムゾーン対応: ローカル時刻を使用（UTCではなく）
    const actualToday = getLocalDateString()
    updateFilter({ viewDate: actualToday, mode: 'today' })
  }, [updateFilter]) // updateFilterを依存配列に追加（ESLint対応）
  
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
  const [taskMemoUpdateCounter, setTaskMemoUpdateCounter] = useState(0) // useMemo再計算トリガー
  
  // 🔧 T015 Fix: useMemoでタスクメモ内容を計算（useEffect避け + Reactルール遵守）
  const currentTaskMemoContent = useMemo(() => {
    if (!selectedTaskForMobile?.id) {
      return ''
    }
    
    const storageKey = `focus-flow-task-memo-${selectedTaskForMobile.id}`
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const memoData = JSON.parse(saved)
        return memoData.content || ''
      }
    } catch (error) {
      logger.warn('Failed to load task memo:', error)
    }
    
    return ''
  }, [selectedTaskForMobile?.id, taskMemoUpdateCounter])

  // タスクの変更をlocalStorageに保存
  useEffect(() => {
    setStoredTasks(state.tasks)
  }, [state.tasks, setStoredTasks])

  useEffect(() => {
    checkNotificationPermissions()
  }, [])

  // Load daily memo content for mobile accordion (Phase 2.1d+ Final)
  // T006: UTC/JST時差問題修正のためJST基準日付を使用
  useEffect(() => {
    if (isMobile) {
      const today = getJSTTodayString() // JST基準の今日の日付
      const storageKey = `daily-memo-${today}`
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const memoData = JSON.parse(saved)
          setDailyMemoContent(memoData.content || '')
        }
      } catch (error) {
        logger.warn('Failed to load daily memo:', error)
      }
    }
  }, [isMobile])

  // モバイル検出 (768px境界)
  useEffect(() => {
    const checkIsMobile = () => {
      try {
        setIsMobile(window.matchMedia(MEDIA_QUERIES.MOBILE).matches)
      } catch (error) {
        logger.warn('matchMedia not supported:', error)
        setIsMobile(false) // デスクトップとして扱う
      }
    }
    
    checkIsMobile()
    
    let mediaQuery: MediaQueryList | null = null
    try {
      mediaQuery = window.matchMedia(MEDIA_QUERIES.MOBILE)
      mediaQuery.addEventListener('change', checkIsMobile)
    } catch (error) {
      logger.warn('matchMedia event listener not supported:', error)
    }
    
    return () => {
      try {
        mediaQuery?.removeEventListener('change', checkIsMobile)
      } catch {
        // cleanup error は無視
      }
    }
  }, [])

  const showMessage = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setStatusMessage(`${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${message}`)
    setTimeout(() => setStatusMessage(''), 5000)
  }, [])

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
      logger.error('Permission check error:', error)
    }
  }

  const startFocusMode = useCallback(async () => {
    try {
      dispatch({ type: 'START_FOCUS', payload: { duration: 60 } })
      showMessage('Focus Mode Started - 通知がブロックされます', 'success')
      logger.info('Focus mode activated')
    } catch (error) {
      logger.error('Focus mode start error:', error)
      showMessage('Focus mode start failed', 'error')
    }
  }, [showMessage])

  const stopFocusMode = useCallback(async () => {
    try {
      dispatch({ type: 'END_FOCUS' })
      showMessage('Focus Mode Stopped - 通知が再開されます', 'info')
      logger.info('Focus mode deactivated')
    } catch (error) {
      logger.error('Focus mode stop error:', error)
      showMessage('Focus mode stop failed', 'error')
    }
  }, [showMessage])

  const testNotification = useCallback(async () => {
    try {
      logger.info('Testing notification, focus mode:', state.focusMode.isActive)
      
      if (state.focusMode.isActive) {
        logger.info('✅ Notification BLOCKED - Focus mode working correctly')
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
        
        logger.info('✅ Critical Alert sent (should bypass DND)')
        showMessage('Critical Alert Sent - DND回避通知を送信', 'success')
      } else {
        // Web環境: 標準通知
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('FocusFlow Test', {
            body: 'Web通知テスト - Capacitor統一アーキテクチャ',
            icon: '/vite.svg'
          })
          
          logger.info('✅ Web notification sent')
          showMessage('Web Notification Sent - 通知を送信しました', 'success')
        } else {
          showMessage('通知権限が必要です - ブラウザの通知を有効にしてください', 'error')
        }
      }
    } catch (error) {
      logger.error('Test notification error:', error)
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
    logger.info('Edit task:', id)
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
    logger.info('Reorder task:', dragIndex, hoverIndex)
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
    // 🟢 Green Phase: フィルタされたタスクから検索するように変更
    const task = filteredTasks.find(t => t.id === taskId) || state.tasks.find(t => t.id === taskId)
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
  }, [filteredTasks, state.tasks, openTabs, isMobile])

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
    // T006: UTC/JST時差問題修正のためJST基準日付を使用
    const today = getJSTTodayString() // JST基準の今日の日付
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
      logger.warn('Failed to save daily memo:', error)
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
  
  // 🟢 Green Phase: Phase 2.2a Date Management Integration Handlers
  const handleDatePickerClose = useCallback(() => {
    setIsDatePickerOpen(false)
  }, [])
  
  const handleDateSelect = useCallback((selectedDate: string) => {
    const isToday = selectedDate === getLocalDateString()
    updateFilter({ viewDate: selectedDate, mode: isToday ? 'today' : 'date' })
    setIsDatePickerOpen(false)
  }, [updateFilter])
  
  // 🟢 循環依存バグ修正: useEffectを削除してフィルタ更新を明示的に制御
  
  // DateNavigationコンポーネント用のhandler（直接日付文字列を受け取る）
  const handleDateChange = useCallback((dateString: string) => {
    // フィルタ更新のみ実行（useDateNavigationは使わない）
    const isToday = dateString === getLocalDateString()
    updateFilter({ viewDate: dateString, mode: isToday ? 'today' : 'date' })
  }, [updateFilter])

  // 🟢 Green Phase: showCompleted切り替えハンドラー
  const handleToggleShowCompleted = useCallback(() => {
    updateFilter({ showCompleted: !filter.showCompleted })
  }, [filter.showCompleted, updateFilter])

  // 🎯 Focus Mode Handler
  const handleStartFocus = useCallback(async (task: Task) => {
    try {
      // Default to moderate constraint level and 25 minutes for Green Phase
      await startFocus(task, 'moderate', 25)
      logger.info(`Focus mode started for task: ${task.title}`)
    } catch (error) {
      logger.error('Failed to start focus mode:', error)
    }
  }, [startFocus])

  // 🟢 Green Phase: Ctrl+H キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'h') {
        event.preventDefault()
        handleToggleShowCompleted()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleToggleShowCompleted])




  return (
    <div className="app">
      <div className="container">
        {/* Header with Focus Mode Toggle (Design Philosophy: 最小限のボタン配置) */}
        <header className="header">
          <div className="title-section">
            <h1>FocusFlow</h1>
            <p className="subtitle">今日必ず着手するタスクのみを管理</p>
          </div>
          
          {/* 🟢 Green Phase: DateNavigation統合 */}
          <DateNavigation
            currentDate={filter.viewDate}
            onDateChange={handleDateChange}
            onDatePickerOpen={() => setIsDatePickerOpen(true)}
            compact={false}
          />
          
          <div className="focus-toggle">
            <button 
              className={`focus-btn ${state.focusMode.isActive ? 'active' : ''}`}
              onClick={state.focusMode.isActive ? stopFocusMode : startFocusMode}
            >
              Focus: {state.focusMode.isActive ? 'ON' : 'OFF'}
            </button>
            
            {/* 🟢 Green Phase: showCompleted切り替えボタン */}
            <button
              data-testid="show-completed-toggle"
              className={`focus-btn ${filter.showCompleted ? 'active' : ''}`}
              onClick={handleToggleShowCompleted}
              aria-pressed={filter.showCompleted}
              aria-label={filter.showCompleted ? '完了タスクを非表示' : '完了タスクを表示'}
              title={`完了タスクを${filter.showCompleted ? '非表示' : '表示'} (Ctrl+H)`}
            >
              {filter.showCompleted ? '✅ 完了タスクを非表示' : '👁️ 完了タスクを表示'}
            </button>
          </div>
        </header>

        <div className="main-layout-grid" data-testid="main-layout-grid">
          {/* Tasks Area (30% - Design Philosophy準拠) */}
          <div className={`tasks-area-30 ${isMobile ? 'mobile-full-height' : ''}`} data-testid="tasks-area-30">
            <aside className="tasks-sidebar" data-testid="tasks-section">
              
              {/* フォーム固定表示エリア */}
              <div className="form-fixed-area" data-testid="form-fixed-area">
                <AddTaskForm 
                  onAdd={handleAddTask} 
                  currentDate={filter.viewDate} 
                />
              </div>
              
              {/* 🟢 Green Phase: TaskStatistics統合表示 */}
              <TaskStatistics date={filter.viewDate} statistics={statistics} />
              
              {/* スクロール可能なタスクリストエリア */}
              <div className="tasks-scrollable-area" data-testid="tasks-scrollable-area">
                <div className="tasks-list">
                  {filteredTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onReorder={handleReorderTask}
                      onMemoClick={handleTaskClick}
                      onStartFocus={handleStartFocus}
                      showFocusButton={!isInFocusMode && !task.completed}
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
                  task={filteredTasks.find(t => t.id === activeTabId) || state.tasks.find(t => t.id === activeTabId)} 
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
          selectedTask={state.ui.memoPanel.selectedTaskId ? 
            (filteredTasks.find(t => t.id === state.ui.memoPanel.selectedTaskId) || 
             state.tasks.find(t => t.id === state.ui.memoPanel.selectedTaskId)) : undefined}
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

        {/* 🟢 Green Phase: DatePicker Modal */}
        <DatePicker
          selectedDate={filter.viewDate}
          onDateSelect={handleDateSelect}
          onClose={handleDatePickerClose}
          isOpen={isDatePickerOpen}
          availableDates={[]} // 🔥 FIX: 全日付選択可能（制限なし）
          showStatistics={false} // 🔥 FIX: 統計表示を無効化（availableDatesが空のため意味がない）
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
                taskMemoContent={currentTaskMemoContent} // 🔧 T015 Fix: 手動管理のメモ内容
                onSave={(content) => {
                  // 🔧 T015 Fix: 手動でLocalStorageに保存
                  if (!selectedTaskForMobile) return
                  
                  const taskMemoData = {
                    taskId: selectedTaskForMobile.id,
                    content: content.trim(),
                    taskSnapshot: {
                      title: selectedTaskForMobile.title,
                      description: selectedTaskForMobile.description || '',
                      tags: selectedTaskForMobile.tags,
                      estimatedMinutes: selectedTaskForMobile.estimatedMinutes,
                      createdAt: selectedTaskForMobile.createdAt
                    },
                    lastUpdated: new Date().toISOString()
                  }
                  
                  try {
                    const storageKey = `focus-flow-task-memo-${selectedTaskForMobile.id}`
                    localStorage.setItem(storageKey, JSON.stringify(taskMemoData))
                    setTaskMemoUpdateCounter(prev => prev + 1) // useMemo再計算をトリガー
                    logger.info(`✅ Task memo saved for ${selectedTaskForMobile.id}:`, content)
                  } catch (error) {
                    logger.error('❌ Failed to save task memo:', error)
                    throw error // エラーをモーダルに伝える
                  }
                }}
                onClose={handleTaskMemoModalClose}
              />
            )}
          </>
        )}

        {/* Focus Mode Overlay - Phase 2.2b Integration */}
        {isInFocusMode ? (
          <div className="focus-mode-overlay">
            <FocusModeLayout currentTask={filteredTasks.find(task => !task.completed) || filteredTasks[0]} />
          </div>
        ) : (
          <FocusTimer />
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <FocusModeProvider>
      <AppContent />
    </FocusModeProvider>
  )
}

export default App

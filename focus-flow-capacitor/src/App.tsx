import { useState, useEffect, useReducer } from 'react'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'
import type { AppState, AppAction } from './types/Task'
import { TaskItem } from './components/TaskItem'
import './App.css'

// App State Reducer (Design Philosophy準拠の状態管理)
const initialState: AppState = {
  tasks: [
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
  ],
  focusMode: {
    isActive: false
  },
  dailyMemo: {
    date: new Date().toISOString().split('T')[0],
    content: '# 今日の集中ポイント\n\n- フォーカスモードでの作業に集中\n- 通知を最小限に抑える\n\n## 気づき\n\n集中できる環境作りの重要性を実感',
    lastSaved: new Date()
  },
  ui: {
    isAddingTask: false,
    showSettings: false
  }
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
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
    case 'UPDATE_MEMO':
      return {
        ...state,
        dailyMemo: {
          ...state.dailyMemo,
          content: action.payload.content,
          lastSaved: new Date()
        }
      }
    default:
      return state
  }
}

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const [platformInfo] = useState({
    platform: Capacitor.getPlatform(),
    isNativePlatform: Capacitor.isNativePlatform()
  })
  const [notificationPermission, setNotificationPermission] = useState<string>('unknown')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    checkNotificationPermissions()
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

  const startFocusMode = async () => {
    try {
      dispatch({ type: 'START_FOCUS', payload: { duration: 60 } })
      showMessage('Focus Mode Started - 通知がブロックされます', 'success')
      console.log('Focus mode activated')
    } catch (error) {
      console.error('Focus mode start error:', error)
      showMessage('Focus mode start failed', 'error')
    }
  }

  const stopFocusMode = async () => {
    try {
      dispatch({ type: 'END_FOCUS' })
      showMessage('Focus Mode Stopped - 通知が再開されます', 'info')
      console.log('Focus mode deactivated')
    } catch (error) {
      console.error('Focus mode stop error:', error)
      showMessage('Focus mode stop failed', 'error')
    }
  }

  const testNotification = async () => {
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
  }

  // Task Handlers
  const handleToggleTask = (id: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id })
  }

  const handleEditTask = (id: string) => {
    console.log('Edit task:', id)
    // TODO: Implement edit functionality
  }

  const handleDeleteTask = (id: string) => {
    console.log('Delete task:', id)
    // TODO: Implement delete functionality
  }

  const handleReorderTask = (dragIndex: number, hoverIndex: number) => {
    console.log('Reorder task:', dragIndex, hoverIndex)
    // TODO: Implement reorder functionality
  }

  const handleMemoChange = (content: string) => {
    dispatch({ type: 'UPDATE_MEMO', payload: { date: state.dailyMemo.date, content } })
  }

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

        <div className="main-layout">
          {/* Tasks Sidebar (30% - Design Philosophy準拠) */}
          <aside className="tasks-sidebar">
            <h3>Today's Tasks</h3>
            <div className="tasks-list">
              {state.tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onReorder={handleReorderTask}
                />
              ))}
            </div>
            <button className="add-task-btn">
              + Add Task
            </button>
          </aside>

          {/* Daily Memo Editor (70% - Design Philosophy必須) */}
          <main className="memo-editor">
            <h3>Daily Memo</h3>
            <textarea
              className="markdown-editor"
              value={state.dailyMemo.content}
              onChange={(e) => handleMemoChange(e.target.value)}
              placeholder="# 今日の集中ポイント\n\n思考を自由に記録してください...\n\nMarkdown形式で書けます。"
            />
            <div className="memo-info">
              最終保存: {state.dailyMemo.lastSaved.toLocaleTimeString()}
            </div>
          </main>
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
      </div>
    </div>
  )
}

export default App

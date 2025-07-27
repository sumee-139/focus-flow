# Phase 2.2b: フォーカスモード技術要件定義書

## 📋 技術仕様メタデータ
- **作成日**: 2025-07-27
- **作成者**: Planner Agent
- **対象**: Phase 2.2b革新的フォーカスモード
- **技術スタック**: PWA (React + TypeScript + Vite)
- **対象環境**: Desktop/Tablet/Mobile全対応

---

## 🎯 技術実現要件

### PWA環境での制約実現
**課題**: ブラウザー環境での画面制約技術的実現
**解決方針**: CSS Transform + DOM操作 + Event制御の組み合わせ

#### 1. 視覚制約技術
```typescript
// CSS-in-JS による動的制約適用
interface ConstraintCSS {
  minimal: {
    opacity: '0.3'           // 非対象要素の透明化
    pointerEvents: 'none'    // インタラクション無効化
    filter: 'grayscale(0.8)' // 視覚的な注意力削減
  }
  moderate: {
    position: 'fixed'
    top: '50%'
    left: '50%'
    transform: 'translate(-50%, -50%)'
    zIndex: '9999'
    backdropFilter: 'blur(10px)' // 背景ブラー
  }
  intensive: {
    position: 'fixed'
    top: '0'
    left: '0'
    width: '100vw'
    height: '100vh'
    backgroundColor: '#1a1a1a'    // ダークモード強制
    zIndex: '9999'
  }
}
```

#### 2. DOM操作最適化
```typescript
// パフォーマンス重視のDOM制御
class DOMConstraintController {
  private hiddenElements: Element[] = []
  private originalStyles: Map<Element, CSSStyleDeclaration> = new Map()
  
  applyConstraint(level: ConstraintLevel): void {
    // RequestAnimationFrame使用でレンダリング最適化
    requestAnimationFrame(() => {
      this.hideNonTargetElements()
      this.applyVisualEffects(level)
      this.blockUserInteractions()
    })
  }
  
  private hideNonTargetElements(): void {
    // Intersection Observer使用で効率的要素検出
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          // 画面外要素は処理対象外
          return
        }
        // 対象要素以外を非表示
      })
    })
  }
}
```

### Capacitor環境対応

#### 1. モバイル特有制約
```typescript
// Capacitor Plugin活用によるネイティブ機能制御
import { StatusBar } from '@capacitor/status-bar'
import { ScreenOrientation } from '@capacitor/screen-orientation'

class MobileFocusController {
  async enterFocusMode(): Promise<void> {
    // ステータスバー非表示（没入感向上）
    await StatusBar.hide()
    
    // 画面回転ロック
    await ScreenOrientation.lock({ orientation: 'portrait' })
    
    // セーフエリア対応
    this.applySafeAreaConstraints()
  }
  
  private applySafeAreaConstraints(): void {
    // CSS env()使用でセーフエリア対応
    const rootElement = document.documentElement
    rootElement.style.setProperty('--focus-top', 'env(safe-area-inset-top)')
    rootElement.style.setProperty('--focus-bottom', 'env(safe-area-inset-bottom)')
  }
}
```

#### 2. PWA制約下での通知制御
```typescript
// Service Worker連携による通知制御
class PWANotificationController {
  private originalPermission: NotificationPermission | null = null
  
  async suppressNotifications(): Promise<void> {
    // 現在の通知設定を保存
    this.originalPermission = Notification.permission
    
    // Service Workerで通知をキュー管理
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      await registration.active?.postMessage({
        action: 'suppress-notifications',
        duration: this.focusDuration
      })
    }
  }
  
  async restoreNotifications(): Promise<void> {
    // 抑制した通知を復元
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      await registration.active?.postMessage({
        action: 'restore-notifications'
      })
    }
  }
}
```

---

## 🏗️ アーキテクチャ技術仕様

### 状態管理アーキテクチャ
```typescript
// Context + useReducer混合型（既存useState方式維持）
interface FocusModeState {
  // 基本状態
  isActive: boolean
  currentTask: Task | null
  constraintLevel: ConstraintLevel
  
  // タイマー状態
  startTime: Date | null
  plannedDuration: number
  timeRemaining: number
  isPaused: boolean
  
  // セッション管理
  sessionId: string | null
  interruptions: Interruption[]
  
  // UI制約状態
  hiddenElements: string[]
  appliedConstraints: ConstraintCSS
}

// Action Types
type FocusModeAction = 
  | { type: 'START_FOCUS'; payload: { task: Task; level: ConstraintLevel; duration: number } }
  | { type: 'END_FOCUS'; payload: { reason: 'completed' | 'interrupted' } }
  | { type: 'PAUSE_FOCUS' }
  | { type: 'RESUME_FOCUS' }
  | { type: 'UPDATE_TIMER'; payload: { timeRemaining: number } }
  | { type: 'LOG_INTERRUPTION'; payload: { reason: string } }
  | { type: 'UPDATE_CONSTRAINT_LEVEL'; payload: { level: ConstraintLevel } }
```

### LocalStorage拡張仕様
```typescript
// 既存LocalStorageシステム拡張
interface FocusFlowData {
  // 既存データ構造維持
  tasks: Task[]
  dailyMemos: Record<string, DailyMemo>
  taskMemos: Record<string, TaskMemo>
  
  // 新規追加: フォーカスセッション管理
  focusSessions: Record<string, FocusSession>  // sessionId -> FocusSession
  focusSettings: FocusSettings
}

interface FocusSession {
  sessionId: string
  taskId: string
  constraintLevel: ConstraintLevel
  startTime: string        // ISO 8601
  endTime: string | null   // ISO 8601
  plannedDuration: number  // 分
  actualDuration: number   // 分
  interruptions: Interruption[]
  completionStatus: 'completed' | 'interrupted' | 'extended'
  metrics: {
    focusScore: number     // 0-100の集中度スコア
    interruptionCount: number
    resumeCount: number
  }
}

interface FocusSettings {
  defaultConstraintLevel: ConstraintLevel
  defaultDuration: number          // 分
  enableSoundEffects: boolean
  enableVisualEffects: boolean
  autoStartOnTaskSelect: boolean
}
```

### パフォーマンス最適化仕様
```typescript
// メモリリーク防止・パフォーマンス最適化
class FocusModeOptimizer {
  private animationFrameId: number | null = null
  private timerId: NodeJS.Timeout | null = null
  private observers: IntersectionObserver[] = []
  
  startOptimizedTimer(callback: () => void): void {
    // requestAnimationFrameベースの高精度タイマー
    const startTime = performance.now()
    
    const tick = (currentTime: number) => {
      const elapsed = currentTime - startTime
      callback()
      
      if (this.shouldContinue) {
        this.animationFrameId = requestAnimationFrame(tick)
      }
    }
    
    this.animationFrameId = requestAnimationFrame(tick)
  }
  
  cleanup(): void {
    // メモリリーク防止の確実なクリーンアップ
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    if (this.timerId) {
      clearTimeout(this.timerId)
    }
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}
```

---

## 🎨 UI技術実装仕様

### CSS Transform Engine
```css
/* GPU加速を活用した高性能アニメーション */
.focus-constraint-minimal {
  will-change: opacity, filter;
  transition: opacity 0.3s ease-out, filter 0.3s ease-out;
  opacity: 0.3;
  filter: grayscale(0.8);
  pointer-events: none;
}

.focus-constraint-moderate {
  will-change: transform, backdrop-filter;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1.05);
  z-index: 9999;
  backdrop-filter: blur(10px);
  animation: focusEnter 0.5s ease-out;
}

.focus-constraint-intensive {
  will-change: background-color;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  z-index: 9999;
  animation: fullscreenEnter 0.7s ease-out;
}

@keyframes focusEnter {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.05);
  }
}

@keyframes fullscreenEnter {
  from {
    opacity: 0;
    background: #000;
  }
  to {
    opacity: 1;
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  }
}
```

### レスポンシブ制約仕様
```css
/* デスクトップ特化制約 */
@media (min-width: 1024px) {
  .focus-mode-intensive {
    /* 複数ディスプレイ対応 */
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
  }
}

/* タブレット対応制約 */
@media (min-width: 769px) and (max-width: 1023px) {
  .focus-mode-moderate {
    /* タブレット最適化レイアウト */
    position: fixed;
    top: 10vh;
    left: 10vw;
    width: 80vw;
    height: 80vh;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
}

/* モバイル特化制約 */
@media (max-width: 768px) {
  .focus-mode-intensive {
    /* セーフエリア対応 */
    position: fixed;
    top: env(safe-area-inset-top);
    left: env(safe-area-inset-left);
    right: env(safe-area-inset-right);
    bottom: env(safe-area-inset-bottom);
    z-index: 9999;
  }
}
```

---

## 🧪 技術テスト仕様

### パフォーマンステスト
```typescript
// パフォーマンス測定用テストスイート
describe('FocusMode Performance Tests', () => {
  test('constraint application should complete within 500ms', async () => {
    const startTime = performance.now()
    
    await focusModeController.applyConstraint('intensive')
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    expect(duration).toBeLessThan(500) // 500ms以内
  })
  
  test('should not cause memory leaks during long sessions', async () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize
    
    // 60分間のフォーカスセッション シミュレーション
    await simulateLongFocusSession(60 * 60 * 1000)
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize
    const memoryIncrease = finalMemory - initialMemory
    
    // メモリ使用量増加10MB以内
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
  })
})
```

### ブラウザー互換性テスト
```typescript
// クロスブラウザー機能テスト
describe('Cross-Browser Compatibility', () => {
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge']
  
  browsers.forEach(browser => {
    test(`focus mode should work correctly in ${browser}`, async () => {
      // ブラウザー固有のテスト実行
      await testFocusModeInBrowser(browser)
      
      // 基本機能確認
      expect(await isConstraintApplied()).toBe(true)
      expect(await isTimerRunning()).toBe(true)
      expect(await isUIBlocked()).toBe(true)
    })
  })
})
```

### モバイル特化テスト
```typescript
// Capacitor環境テスト
describe('Mobile-Specific Features', () => {
  test('should hide status bar in intensive mode', async () => {
    await focusModeController.enterIntensiveMode()
    
    // Capacitor StatusBar plugin確認
    const isHidden = await StatusBar.isHidden()
    expect(isHidden).toBe(true)
  })
  
  test('should handle safe area constraints correctly', async () => {
    await focusModeController.applyMobileConstraints()
    
    const rootStyles = getComputedStyle(document.documentElement)
    expect(rootStyles.getPropertyValue('--focus-top')).toBeTruthy()
    expect(rootStyles.getPropertyValue('--focus-bottom')).toBeTruthy()
  })
})
```

---

## 🔧 実装技術詳細

### 1. フォーカスモード Context Provider
```typescript
// src/contexts/FocusModeContext.tsx
interface FocusModeContextType {
  // 状態
  focusMode: FocusModeState
  
  // アクション
  startFocus: (task: Task, level: ConstraintLevel, duration: number) => Promise<void>
  endFocus: (reason: 'completed' | 'interrupted') => Promise<void>
  pauseFocus: () => void
  resumeFocus: () => void
  updateConstraintLevel: (level: ConstraintLevel) => void
  
  // ユーティリティ
  isInFocusMode: boolean
  currentSession: FocusSession | null
  focusProgress: number // 0-100の進捗率
}

export const FocusModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // useState + useReducer混合型（既存パターン維持）
  const [focusMode, dispatch] = useReducer(focusModeReducer, initialState)
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null)
  
  // LocalStorage統合
  const { saveData, loadData } = useLocalStorage<FocusFlowData>('focus-flow-data')
  
  // 副作用管理
  useEffect(() => {
    // タイマー管理
    // DOM制約適用
    // セッション記録
    
    return () => {
      // クリーンアップ
      if (timerId) clearTimeout(timerId)
    }
  }, [focusMode.isActive])
  
  const contextValue: FocusModeContextType = {
    // 実装詳細
  }
  
  return (
    <FocusModeContext.Provider value={contextValue}>
      {children}
    </FocusModeContext.Provider>
  )
}
```

### 2. Screen Constraint Engine
```typescript
// src/utils/screenConstraintEngine.ts
export class ScreenConstraintEngine {
  private constraintLevel: ConstraintLevel = 'minimal'
  private hiddenElements: Element[] = []
  private styleBackups: Map<Element, string> = new Map()
  private cleanup: (() => void)[] = []
  
  async applyConstraint(level: ConstraintLevel, targetElement: Element): Promise<void> {
    this.constraintLevel = level
    
    // 既存制約をクリア
    this.removeConstraint()
    
    switch (level) {
      case 'minimal':
        await this.applyMinimalConstraint(targetElement)
        break
      case 'moderate':
        await this.applyModerateConstraint(targetElement)
        break
      case 'intensive':
        await this.applyIntensiveConstraint(targetElement)
        break
    }
  }
  
  private async applyMinimalConstraint(target: Element): Promise<void> {
    // 対象要素以外を透明化
    const allElements = document.querySelectorAll('*')
    
    allElements.forEach(element => {
      if (!target.contains(element) && element !== target) {
        // 元のスタイルをバックアップ
        this.styleBackups.set(element, element.getAttribute('style') || '')
        
        // 制約スタイル適用
        element.classList.add('focus-constraint-minimal')
        this.hiddenElements.push(element)
      }
    })
  }
  
  private async applyModerateConstraint(target: Element): Promise<void> {
    // 中央集中表示 + 背景ブラー
    const overlay = document.createElement('div')
    overlay.className = 'focus-overlay-moderate'
    
    // 対象要素を中央に配置
    target.classList.add('focus-constraint-moderate')
    
    document.body.appendChild(overlay)
    this.cleanup.push(() => document.body.removeChild(overlay))
  }
  
  private async applyIntensiveConstraint(target: Element): Promise<void> {
    // フルスクリーン + ダークモード
    const fullscreenContainer = document.createElement('div')
    fullscreenContainer.className = 'focus-fullscreen-container'
    
    // 対象要素をフルスクリーンコンテナに移動
    const targetClone = target.cloneNode(true) as Element
    fullscreenContainer.appendChild(targetClone)
    
    document.body.appendChild(fullscreenContainer)
    this.cleanup.push(() => document.body.removeChild(fullscreenContainer))
  }
  
  removeConstraint(): void {
    // すべての制約を解除
    this.hiddenElements.forEach(element => {
      element.classList.remove(
        'focus-constraint-minimal',
        'focus-constraint-moderate',
        'focus-constraint-intensive'
      )
      
      // 元のスタイルを復元
      const originalStyle = this.styleBackups.get(element)
      if (originalStyle !== undefined) {
        element.setAttribute('style', originalStyle)
      }
    })
    
    // クリーンアップ実行
    this.cleanup.forEach(cleanupFn => cleanupFn())
    
    // リセット
    this.hiddenElements = []
    this.styleBackups.clear()
    this.cleanup = []
  }
}
```

### 3. Focus Timer Hook
```typescript
// src/hooks/useFocusTimer.ts
export const useFocusTimer = (initialDuration: number) => {
  const [timeRemaining, setTimeRemaining] = useState(initialDuration)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  
  const animationFrameRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(0)
  
  // 高精度タイマー（requestAnimationFrame使用）
  const updateTimer = useCallback((currentTime: number) => {
    if (!isRunning || isPaused) return
    
    if (lastUpdateRef.current === 0) {
      lastUpdateRef.current = currentTime
    }
    
    const elapsed = currentTime - lastUpdateRef.current
    
    // 1秒ごとに更新
    if (elapsed >= 1000) {
      setTimeRemaining(prev => {
        const newTime = prev - 1
        if (newTime <= 0) {
          setIsRunning(false)
          onComplete?.()
          return 0
        }
        return newTime
      })
      
      lastUpdateRef.current = currentTime
    }
    
    if (isRunning && !isPaused) {
      animationFrameRef.current = requestAnimationFrame(updateTimer)
    }
  }, [isRunning, isPaused])
  
  useEffect(() => {
    if (isRunning && !isPaused) {
      animationFrameRef.current = requestAnimationFrame(updateTimer)
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isRunning, isPaused, updateTimer])
  
  const start = useCallback(() => {
    setIsRunning(true)
    setIsPaused(false)
    setStartTime(new Date())
    lastUpdateRef.current = 0
  }, [])
  
  const pause = useCallback(() => {
    setIsPaused(true)
  }, [])
  
  const resume = useCallback(() => {
    setIsPaused(false)
    lastUpdateRef.current = 0
  }, [])
  
  const stop = useCallback(() => {
    setIsRunning(false)
    setIsPaused(false)
    setTimeRemaining(initialDuration)
    lastUpdateRef.current = 0
  }, [initialDuration])
  
  return {
    timeRemaining,
    isRunning,
    isPaused,
    startTime,
    start,
    pause,
    resume,
    stop,
    progress: ((initialDuration - timeRemaining) / initialDuration) * 100
  }
}
```

---

## 📊 パフォーマンス要件

### レスポンス時間要件
- **制約適用**: 500ms以内
- **制約解除**: 300ms以内
- **制約レベル変更**: 400ms以内
- **タイマー更新**: 16.67ms以内（60fps）

### メモリ使用量要件
- **ベースライン**: 既存アプリケーション使用量
- **フォーカスモード追加**: +10%以内
- **長時間セッション**: メモリリークなし
- **ガベージコレクション**: 定期的なクリーンアップ

### バッテリー使用効率
- **タイマー処理**: requestAnimationFrameで最適化
- **DOM更新**: 必要最小限に制限
- **CPU使用率**: バックグラウンド時は最小化

---

## 🔗 既存システム統合

### 1. 既存Task型との統合
```typescript
// 既存Task型を拡張せず、関連データとして管理
interface Task {
  // 既存フィールドはそのまま維持
  id: string
  title: string
  description: string
  completed: boolean
  dueDate: string
  // ...その他既存フィールド
}

// フォーカスモード用の関連データ
interface TaskFocusData {
  taskId: string
  focusHistory: FocusSession[]
  totalFocusTime: number        // 累計集中時間（分）
  averageSessionLength: number  // 平均セッション時間（分）
  lastFocusDate: string        // 最終集中日（ISO 8601）
  focusStreak: number          // 連続集中日数
}
```

### 2. 既存UI Components統合
```typescript
// 既存コンポーネントの拡張（非破壊的）
interface TaskItemProps {
  task: Task
  onComplete: (taskId: string) => void
  onEdit?: (task: Task) => void
  
  // 新規追加: フォーカスモード関連
  onStartFocus?: (task: Task) => void
  focusData?: TaskFocusData
  showFocusButton?: boolean
}

// TaskItem.tsx の拡張
export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onComplete,
  onEdit,
  onStartFocus,
  focusData,
  showFocusButton = true
}) => {
  // 既存のレンダリングロジックは変更なし
  
  return (
    <div className="task-item">
      {/* 既存UI */}
      <span>{task.title}</span>
      <button onClick={() => onComplete(task.id)}>✅</button>
      
      {/* 新規追加: フォーカスボタン */}
      {showFocusButton && (
        <button 
          onClick={() => onStartFocus?.(task)}
          className="focus-button"
          aria-label={`${task.title}に集中する`}
        >
          🎯
        </button>
      )}
    </div>
  )
}
```

### 3. LocalStorage Schema拡張
```typescript
// 既存スキーマの非破壊的拡張
interface FocusFlowData {
  // 既存データ（変更なし）
  tasks: Task[]
  dailyMemos: Record<string, DailyMemo>
  taskMemos: Record<string, TaskMemo>
  
  // Version 2.2b新規追加
  focusSessions?: Record<string, FocusSession>  // Optional for backward compatibility
  focusSettings?: FocusSettings                 // Optional for backward compatibility
  taskFocusData?: Record<string, TaskFocusData> // Optional for backward compatibility
}

// データマイグレーション関数
const migrateFocusFlowData = (data: any): FocusFlowData => {
  return {
    // 既存データはそのまま
    tasks: data.tasks || [],
    dailyMemos: data.dailyMemos || {},
    taskMemos: data.taskMemos || {},
    
    // 新規データはデフォルト値で初期化
    focusSessions: data.focusSessions || {},
    focusSettings: data.focusSettings || {
      defaultConstraintLevel: 'moderate',
      defaultDuration: 25,
      enableSoundEffects: true,
      enableVisualEffects: true,
      autoStartOnTaskSelect: false
    },
    taskFocusData: data.taskFocusData || {}
  }
}
```

---

## 🚀 実装優先度・依存関係

### Phase 1: 核心機能（High Priority）
1. **FocusModeContext**: 状態管理基盤
2. **ScreenConstraintEngine**: 視覚制約制御
3. **useFocusTimer**: タイマー機能
4. **LocalStorage統合**: データ永続化

### Phase 2: UI統合（High Priority）
1. **App.tsx統合**: Context Provider配置
2. **TaskItem拡張**: フォーカスボタン追加
3. **制約UI実装**: 3段階制約レベル
4. **フォーカスモーダル**: 設定・制御UI

### Phase 3: UX最適化（Medium Priority）
1. **アニメーション**: 制約適用・解除エフェクト
2. **音響効果**: フォーカス開始・終了音
3. **ショートカット**: キーボード操作対応
4. **アクセシビリティ**: WCAG 2.1準拠

### Phase 4: モバイル最適化（Medium Priority）
1. **Capacitor統合**: StatusBar/ScreenOrientation
2. **セーフエリア対応**: iOS/Android対応
3. **タッチ操作**: モバイル固有の操作対応
4. **パフォーマンス**: モバイル端末最適化

---

*2025-07-27 Planner Agent - Phase 2.2b技術要件定義書*  
*PWA/Capacitor環境での画面制約実現・既存システム非破壊統合仕様*
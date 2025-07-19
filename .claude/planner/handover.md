# Builder実装指示書 - Phase 2.1b v4.0 最終版

## 対象エージェント: Builder
## 実装モード: TDD（完全遵守）
## 優先度: 最高（MVP核心機能）
## 開発期間: 速度重視（3-4日完成目標）

## 🎯 実装目標

### Phase 2.1b: タスクメモ・デイリーメモ連携システム
**目的**: タスク個別メモとデイリーメモ間の情報流通を実現し、知的生産性を向上させる

### 確定仕様（プロダクトオーナー決定済み）
1. **既存DailyMemo改修方式**（開発効率重視）
2. **全画面モーダル + タスク個別表示**（モバイル対応）
3. **タスク個別LocalStorageキー**（パフォーマンス重視）
4. **速度重視実装**（3-4日完成）

## 🔴 TDD実装指示（完全遵守）

### Phase 1: Red（失敗するテストを書く）
```typescript
// TaskMemo.test.tsx - 7つの基本テストケース
describe('TaskMemo - タスク個別メモ', () => {
  test('should auto-save task memo after 3 seconds of inactivity')
  test('should restore memo for specific task on component reload')
  test('should handle task deletion gracefully')
  test('should support task information quotation')
  test('should handle localStorage errors gracefully')
  test('should clear auto-save timer when component unmounts')
  test('should display task context in memo header')
})

// MemoPanel.test.tsx - サイドパネル・全画面切り替えテスト
describe('MemoPanel - レスポンシブ切り替え', () => {
  test('should display as 70% side panel on desktop (>1200px)')
  test('should display as fullscreen modal on mobile (≤1200px)')
  test('should toggle between TaskMemo and DailyMemo views')
  test('should preserve memo content during view switching')
  test('should show task actions in mobile TaskMemo mode')
})

// TaskMemoStorage.test.tsx - LocalStorage個別キーテスト
describe('TaskMemoStorage - 個別キー管理', () => {
  test('should save task memo with individual key pattern')
  test('should load correct task memo by taskId')
  test('should handle multiple task memos independently')
})
```

### Phase 2: Green（最小限の実装）

#### 2.1 TaskMemoコンポーネント
```typescript
interface TaskMemoData {
  taskId: string
  content: string
  lastUpdated: string  // ISO string
  taskSnapshot: {
    title: string
    description?: string
    tags: string[]
    estimatedMinutes: number
    createdAt: Date
  }
}

export const TaskMemo: React.FC<{
  taskId: string
  task: Task
  onTaskAction?: (action: 'toggle' | 'delete' | 'focus', taskId: string) => void
}> = ({ taskId, task, onTaskAction }) => {
  // DailyMemoと同じ3秒自動保存パターン
  // LocalStorageキー: `focus-flow-task-memo-${taskId}`
}
```

#### 2.2 DailyMemo改修（embedded対応）
```typescript
interface DailyMemoProps {
  embedded?: boolean  // パネル内表示時はtrue
  onQuoteRequest?: (content: string) => void
}

export const DailyMemo: React.FC<DailyMemoProps> = ({ 
  embedded = false, 
  onQuoteRequest 
}) => {
  // 既存ロジック維持 + embedded時のスタイル調整
}
```

#### 2.3 MemoPanel統合コンポーネント
```typescript
interface MemoPanelProps {
  isOpen: boolean
  mode: 'task' | 'daily'
  selectedTaskId?: string
  selectedTask?: Task
  onClose: () => void
  onModeChange: (mode: 'task' | 'daily') => void
  onTaskAction?: (action: 'toggle' | 'delete' | 'focus', taskId: string) => void
}
```

### Phase 3: Blue（リファクタリング）
- コードの分離とモジュール化
- 型安全性の向上
- パフォーマンス最適化

## 🎨 UI/UX仕様（確定版）

### 1. デスクトップ版（1201px以上）
```css
.memo-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 70%;
  height: 100vh;
  background: white;
  z-index: 1000;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.memo-panel.open {
  transform: translateX(0);
}

.app-overlay {
  position: fixed;
  left: 0;
  top: 0;
  width: 30%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}
```

### 2. モバイル版（1200px以下）- 特殊仕様
```css
@media (max-width: 1200px) {
  .memo-panel {
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 2000;
  }
  
  /* タスクメモモード専用レイアウト */
  .memo-panel.task-mode .task-header {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .memo-panel.task-mode .task-actions {
    display: flex;
    gap: 0.5rem;
  }
}
```

#### モバイル・タスクメモモードのレイアウト
```
┌─────────────────────────────┐
│ [← 戻る] タスクタイトル ⚙️   │ ← ヘッダー
├─────────────────────────────┤
│ ✅ 📝 30分 🎯 | work,urgent │ ← タスクアクション行
├─────────────────────────────┤
│                             │
│ [タスクメモエリア]           │ ← メインコンテンツ
│ (3秒自動保存)               │
│                             │
└─────────────────────────────┘
```

**タスクアクション**:
- ✅ 完了切り替え (`onTaskAction('toggle', taskId)`)
- 📝 削除 (`onTaskAction('delete', taskId)`)  
- 🎯 フォーカスモード開始 (`onTaskAction('focus', taskId)`)

## 🔧 技術仕様（確定版）

### 1. LocalStorage設計（方式A：個別キー）
```typescript
// キーパターン
const getTaskMemoKey = (taskId: string) => `focus-flow-task-memo-${taskId}`

// カスタムhook
const useTaskMemoStorage = (taskId: string) => {
  const [taskMemo, setTaskMemo] = useLocalStorage<TaskMemoData | null>(
    getTaskMemoKey(taskId), 
    null
  )
  return [taskMemo, setTaskMemo] as const
}
```

### 2. 自動引用機能の詳細
```typescript
const generateTaskQuote = (task: Task): string => {
  return `### 📋 タスク: ${task.title}
- **見積時間**: ${task.estimatedMinutes}分
- **説明**: ${task.description || 'なし'}
- **タグ**: ${task.tags.join(', ') || 'なし'}
- **作成日**: ${task.createdAt.toLocaleDateString()}

---
`
}

// 引用挿入のヘルパー関数
const insertAtCursor = (
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  content: string,
  insertText: string
): string => {
  const textarea = textareaRef.current
  if (!textarea) return content + '\n' + insertText
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  
  return content.slice(0, start) + insertText + content.slice(end)
}
```

### 3. 状態管理設計（App.tsx拡張）
```typescript
interface AppState {
  // 既存
  tasks: Task[]
  focusMode: { isActive: boolean }
  ui: {
    isAddingTask: boolean
    showSettings: boolean
    deleteConfirmDialog: { isOpen: boolean, taskId: string | null }
    // 新規追加
    memoPanel: {
      isOpen: boolean
      mode: 'task' | 'daily'
      selectedTaskId: string | null
    }
  }
}

// 新アクション
type AppAction = 
  | { type: 'OPEN_TASK_MEMO', payload: { taskId: string } }
  | { type: 'OPEN_DAILY_MEMO' }
  | { type: 'CLOSE_MEMO_PANEL' }
  | { type: 'SWITCH_MEMO_MODE', payload: { mode: 'task' | 'daily' } }
  | { type: 'QUOTE_TASK_TO_DAILY', payload: { taskId: string } }
  | 既存のアクション...
```

## 🧪 テスト仕様（速度重視）

### 必須テスト（15テスト）
1. **TaskMemoコンポーネント**: 7テスト（基本機能）
2. **MemoPanel統合**: 5テスト（切り替え・レスポンシブ）
3. **LocalStorage個別キー**: 3テスト（保存・読込・削除）

### 統合テスト（5テスト）
1. **タスクカードからメモパネル開閉**
2. **メモ間の切り替え**
3. **引用機能の全体動作**
4. **モバイル・デスクトップ切り替え**
5. **タスクアクション統合**

## ⚠️ 重要な実装上の注意事項

### Design Philosophy遵守
- **シンプルさ優先**: 複雑な設定画面は避ける
- **統一アイコン**: 📝（メモ）、🔗（引用）、✅（完了）、🎯（フォーカス）
- **色による区別禁止**: アクションは形状・テキストで判別

### パフォーマンス要件（速度重視）
- **メモパネル開閉**: 300ms以内
- **引用機能**: 100ms以内
- **自動保存**: 3秒遅延（DailyMemoと統一）
- **LocalStorage**: 個別キーアクセスで高速化

### セキュリティ要件
- **XSS対策**: プレーンテキストのみ、Markdown解析なし
- **データ量制限**: メモ1件あたり10KB以内

## 🎯 完成の定義（DoD）

### 機能要件
- [ ] タスクカードクリックでTaskMemoパネルが開く（デスクトップ・モバイル）
- [ ] DailyMemoボタンでDailyMemoパネルが開く
- [ ] パネル内でタスクメモ↔デイリーメモ切り替え可能
- [ ] タスク情報の引用機能が動作（デイリーメモへの挿入）
- [ ] 3秒自動保存が動作（両メモタイプ）
- [ ] モバイルでタスクアクション（完了・削除・フォーカス）動作
- [ ] LocalStorage個別キーで保存・復元

### 品質要件
- [ ] 全テスト通過（20テスト目標）
- [ ] プロダクションビルド成功
- [ ] TypeScriptエラーなし
- [ ] ESLintエラーなし
- [ ] 既存70テスト継続通過

### UX要件
- [ ] スムーズなアニメーション（300ms以内）
- [ ] 直感的な操作性
- [ ] デスクトップ・モバイル両対応
- [ ] エラー時のグレースフル処理

## 🚀 実装順序（速度重視3-4日）

### Day 1: 基盤実装
1. **TaskMemoコンポーネント作成**（DailyMemoパターン流用）
2. **useTaskMemoStorage hook実装**
3. **基本テスト作成・通過確認**

### Day 2: パネル統合
1. **MemoPanel統合コンポーネント**
2. **DailyMemo改修（embedded対応）**
3. **App.tsx状態管理拡張**

### Day 3: モバイル対応
1. **レスポンシブCSS実装**
2. **モバイル専用タスクアクション**
3. **デスクトップ・モバイル切り替えテスト**

### Day 4: 引用機能・仕上げ
1. **引用ボタンとロジック実装**
2. **カーソル位置挿入機能**
3. **統合テスト・品質確認**

## 🔗 必要な依存関係

### 新規追加なし
既存の技術スタックで実装可能:
- React 19.1.0
- TypeScript 5.8.3
- 既存のuseLocalStorage hook
- 既存のCSS設計システム

## 📋 引き継ぎ事項

### Plannerへの報告項目
- [ ] Day1完了時：基盤実装状況
- [ ] Day2完了時：パネル統合状況
- [ ] Day3完了時：モバイル対応状況
- [ ] Day4完了時：全機能完成報告
- [ ] 技術的課題があれば即座に相談

## 🆕 記録済み将来機能

### 自動保存トーストUI（低優先度）
- **要望**: 保存時に「auto saved」表示
- **実装時期**: Phase 2.1完了後

### ポモドーロタイマー（低優先度）
- **要望**: フォーカスモード統合
- **実装時期**: Phase 2.2以降

---

**Planner総評**: 全仕様が確定し、実装可能な状態です。速度重視3-4日で、MVP核心機能「タスクとデイリーメモの情報流通」を実現してください。プロダクトオーナー様のご判断により、開発効率とユーザビリティのバランスが取れた設計になりました。

*2025-07-19 Planner Agent - Phase 2.1b実装指示書v4.0最終版*
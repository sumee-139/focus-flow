# Phase 1 アプリケーション設計書

## 設計概要

### 目的
技術検証で実証されたOSレベル通知制御を基盤とし、Design Philosophyに完全準拠した実際のFocusFlowアプリケーションを設計する。

### 設計原則
1. **「その日必ず着手するタスク」のみを管理**
2. **統一アイコン（📝）使用・色による区別排除**
3. **画面の70%以上をMarkdownエディタが占有**
4. **段階的情報開示・最小限の選択肢**

## 機能仕様

### 1. フォーカスモード（核心機能）

#### 1.1 OSレベル通知制御
- **技術基盤**: 既存のCapacitorプロトタイプを活用
- **Critical Alert**: Do Not Disturb中でも通知表示
- **Focus Mode ON**: 全通知をブロック
- **Focus Mode OFF**: 通知を許可

#### 1.2 集中時間設定
```typescript
interface FocusSession {
  duration: number; // 分（15, 30, 60, カスタム）
  startTime: Date;
  endTime?: Date;
  taskId?: string;
}
```

#### 1.3 集中バリア機能
- **アラーム時間設定**: HH:MM形式でタスクにアラーム設定
- **緊急連絡先**: 最大3件の例外設定
- **集中状態表示**: 現在の集中状態を視覚的に表示

### 2. 基本タスク管理

#### 2.1 タスクデータ構造
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  alarmTime?: string; // HH:MM format
  order: number; // ドラッグ&ドロップ用
  completed: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2.2 タスク管理機能
- **作成**: シンプルなタスク入力フォーム
- **編集**: インライン編集またはモーダル
- **削除**: 確認ダイアログ付き削除
- **並び替え**: ⋮⋮ハンドルによるドラッグ&ドロップ
- **完了**: チェックボックスによる完了切り替え

#### 2.3 禁止事項（Design Philosophy準拠）
- ❌ 重要度・優先度フィールド
- ❌ 期限・締切フィールド
- ❌ 進捗率・パーセンテージ
- ❌ 色による区別

### 3. デイリーメモ

#### 3.1 メモデータ構造
```typescript
interface DailyMemo {
  date: string; // YYYY-MM-DD
  content: string; // Plain Markdown
  updatedAt: Date;
}
```

#### 3.2 メモ機能
- **プレーンMarkdown**: 構造化なし、フリーフォーマット
- **日付自動管理**: 今日の日付で自動保存
- **リアルタイム保存**: 入力中自動保存
- **全文検索**: 後のPhaseで実装

## UI/UX設計

### 1. 画面構成

#### 1.1 メイン画面レイアウト
```
┌─────────────────────────────────────────────────┐
│ FocusFlow                    [Focus: OFF] [⚙️]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐  ┌─────────────────────────────┐│
│  │  Today's    │  │                             ││
│  │  Tasks      │  │        Daily Memo           ││
│  │  (30%)      │  │        (70%)                ││
│  │             │  │                             ││
│  │ 📝 Task 1   │  │  # 今日の集中ポイント        ││
│  │ 📝 Task 2   │  │                             ││
│  │ 📝 Task 3   │  │  - 朝一番でタスク1に着手     ││
│  │             │  │  - 昼食後にタスク2を集中     ││
│  │ [+ Add]     │  │                             ││
│  │             │  │  ## 気づき                  ││
│  │             │  │  集中できる時間帯を発見      ││
│  │             │  │                             ││
│  └─────────────┘  └─────────────────────────────┘│
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 1.2 モバイル画面レイアウト
```
┌─────────────────────┐
│ FocusFlow [Focus:OFF]│
├─────────────────────┤
│                     │
│ 📝 Task 1    [⋮⋮]  │
│ 📝 Task 2    [⋮⋮]  │
│ 📝 Task 3    [⋮⋮]  │
│                     │
│ [+ Add Task]        │
│                     │
│ ───────────────────── │
│                     │
│ Daily Memo:         │
│ [Markdown Editor]   │
│                     │
│                     │
└─────────────────────┘
```

### 2. UI コンポーネント設計

#### 2.1 TaskItem コンポーネント
```typescript
interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}
```

#### 2.2 FocusMode コンポーネント
```typescript
interface FocusModeProps {
  isActive: boolean;
  onToggle: () => void;
  remainingTime?: number;
  currentTask?: Task;
}
```

#### 2.3 MarkdownEditor コンポーネント
```typescript
interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoSave?: boolean;
}
```

### 3. 色彩設計（Design Philosophy準拠）

#### 3.1 カラーパレット
- **Primary**: #333333 (テキスト)
- **Secondary**: #666666 (サブテキスト)
- **Background**: #FFFFFF (背景)
- **Border**: #E0E0E0 (境界線)
- **Focus**: #0066CC (フォーカス状態のみ)

#### 3.2 禁止カラー
- ❌ 優先度を示す色（赤・黄・緑）
- ❌ 進捗を示す色（グラデーション）
- ❌ 警告色（オレンジ系）

## 技術実装仕様

### 1. プロジェクト構成

#### 1.1 既存Capacitorプロジェクトの活用
- **ベース**: `focus-flow-capacitor/` プロジェクト
- **通知制御**: 既存のOSレベル通知制御コードを活用
- **プラットフォーム**: Web、Android、iOS対応

#### 1.2 新規実装部分
- **状態管理**: React Context + useReducer
- **データ永続化**: IndexedDB (Dexie.js)
- **UI**: Chakra UIからVanilla CSS（軽量化）

### 2. データベース設計

#### 2.1 IndexedDB テーブル設計
```typescript
// tasks テーブル
interface TasksTable {
  id: string; // Primary Key
  title: string;
  description?: string;
  estimatedMinutes: number;
  alarmTime?: string;
  order: number;
  completed: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// dailyMemos テーブル
interface DailyMemosTable {
  date: string; // Primary Key (YYYY-MM-DD)
  content: string;
  updatedAt: Date;
}

// focusSessions テーブル
interface FocusSessionsTable {
  id: string; // Primary Key
  duration: number;
  startTime: Date;
  endTime?: Date;
  taskId?: string;
  createdAt: Date;
}
```

#### 2.2 データベース操作設計
```typescript
class FocusFlowDB {
  // タスク管理
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>
  async updateTask(id: string, updates: Partial<Task>): Promise<void>
  async deleteTask(id: string): Promise<void>
  async getTasks(): Promise<Task[]>
  async toggleTask(id: string): Promise<void>
  
  // デイリーメモ
  async getDailyMemo(date: string): Promise<DailyMemo | null>
  async saveDailyMemo(date: string, content: string): Promise<void>
  
  // フォーカスセッション
  async startFocusSession(duration: number, taskId?: string): Promise<FocusSession>
  async endFocusSession(sessionId: string): Promise<void>
  async getFocusHistory(): Promise<FocusSession[]>
}
```

### 3. 状態管理設計

#### 3.1 アプリケーション状態
```typescript
interface AppState {
  // タスク状態
  tasks: Task[];
  
  // フォーカス状態
  focusMode: {
    isActive: boolean;
    currentSession?: FocusSession;
    remainingTime?: number;
  };
  
  // メモ状態
  dailyMemo: {
    date: string;
    content: string;
    lastSaved: Date;
  };
  
  // UI状態
  ui: {
    selectedTask?: string;
    isAddingTask: boolean;
    showSettings: boolean;
  };
}
```

#### 3.2 アクション設計
```typescript
type AppAction = 
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
```

## 実装計画

### 1. 開発順序

#### Phase 1.1: 基本UI実装（2時間）
1. **プロジェクト構成整理**: 既存Capacitorプロジェクトをベースに整理
2. **レイアウト実装**: メイン画面の基本レイアウト
3. **コンポーネント作成**: TaskItem、FocusMode、MarkdownEditor

#### Phase 1.2: タスク管理機能（3時間）
1. **データベース実装**: IndexedDB + Dexie.js設定
2. **CRUD操作**: タスクの作成・読込・更新・削除
3. **ドラッグ&ドロップ**: 並び順変更機能

#### Phase 1.3: フォーカスモード統合（2時間）
1. **通知制御統合**: 既存のOSレベル通知制御を統合
2. **集中セッション管理**: 開始・終了・時間管理
3. **UI統合**: フォーカス状態の視覚的表示

#### Phase 1.4: デイリーメモ実装（1時間）
1. **Markdownエディタ**: プレーンMarkdownエディタ
2. **自動保存**: リアルタイム保存機能
3. **日付管理**: 今日の日付で自動保存

### 2. 品質保証

#### 2.1 TDD実装
- **テストファースト**: 各機能の実装前にテスト作成
- **Red-Green-Refactor**: t-wadaスタイルのTDDサイクル
- **カバレッジ目標**: 80%以上

#### 2.2 Design Philosophy準拠チェック
- [ ] 統一アイコン（📝）使用
- [ ] 色による区別排除
- [ ] 画面の70%以上をMarkdownエディタが占有
- [ ] 段階的情報開示実装
- [ ] Calm Technology原則準拠

### 3. 成功基準

#### 3.1 機能的成功基準
- [ ] タスクの作成・編集・削除が正常動作
- [ ] ドラッグ&ドロップによる並び替えが動作
- [ ] フォーカスモードON/OFFが正常動作
- [ ] OSレベル通知制御が正常動作
- [ ] デイリーメモの保存・読込が正常動作

#### 3.2 非機能的成功基準
- [ ] モバイルファーストのレスポンシブ対応
- [ ] First Contentful Paint < 1.5秒
- [ ] IndexedDB操作 < 100ms
- [ ] 統一性のあるUI実装

## 技術的制約・注意点

### 1. 既存プロトタイプとの整合性
- **通知制御**: 既存のCapacitorプロトタイプのコードを活用
- **プラットフォーム検出**: 既存のプラットフォーム判定ロジックを活用
- **ビルド環境**: 既存のAndroid/iOS対応環境を維持

### 2. Design Philosophy厳守
- **統一アイコン**: 全タスクに📝アイコン必須
- **色による区別禁止**: 優先度表示に色使用禁止
- **進捗率禁止**: 完了/未完了の二値のみ
- **複雑性排除**: 迷いを生む選択肢を最小化

### 3. パフォーマンス要件
- **PWA対応**: Service Worker + Cache API
- **IndexedDB最適化**: 適切なインデックス設定
- **レスポンシブ**: Mobile First設計
- **バンドルサイズ**: 軽量化（Chakra UI → Vanilla CSS）

## 次のステップ

### 1. 実装準備
1. **プロジェクト構成整理**: 既存Capacitorプロジェクトベースの新規開発環境準備
2. **依存関係追加**: Dexie.js、必要なReactライブラリ追加
3. **モックアップ作成**: `mockup/component-sandbox.html`に基本画面モックアップ

### 2. 実装開始
1. **TDD開始**: 基本機能のテスト作成
2. **UI実装**: Design Philosophy準拠のUI実装
3. **機能統合**: 既存の通知制御機能と統合

---

**作成日**: 2025-07-17
**設計者**: Claude (自律型エージェント)
**レビュー**: 実装前にDesign Philosophy準拠性を再確認
**更新**: 実装進捗に応じて更新
# FocusFlow Development Best Practices

## Overview
このドキュメントは、FocusFlowプロジェクトにおける開発ベストプラクティスを定義します。技術スタック固有の推奨事項と汎用的な開発スタイルを含みます。

## Technology Stack & Architecture

### Core Technologies
- **Frontend**: React v18+ + TypeScript v5+ + Chakra UI v2+
- **Build Tool**: Vite v5+
- **PWA**: Workbox v7+
- **Database**: IndexedDB (Dexie.js)
- **State Management**: React Context + useReducer
- **Package Manager**: npm (統一)

### Phase Architecture
```
Phase 1-3: Full Client-Side
├── PWA (React + TypeScript)
├── IndexedDB (Dexie.js)
└── Service Worker (Workbox)

Phase 4-5: Serverless Integration
├── Firebase (Auth/Firestore)
├── AWS Lambda (OAuth仲介)
└── External APIs (Jira/Notion/Google)
```

## Development Best Practices

### 1. Code Quality Standards

#### Type Safety
```typescript
// ✅ Good: 明示的な型定義
interface Task {
  id: string;
  title: string;
  estimatedTime: number;
  completed: boolean;
}

// ❌ Bad: any型の使用
const task: any = { id: 1, title: "Task" };
```

#### Component Design
```typescript
// ✅ Good: 単一責任の原則
interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle }) => {
  return (
    <Box>
      <Text>{task.title}</Text>
      <Button onClick={() => onToggle(task.id)}>
        {task.completed ? '完了' : '未完了'}
      </Button>
    </Box>
  );
};

// ❌ Bad: 複数の責任を持つコンポーネント
const TaskManager = () => {
  // タスク管理、UI表示、API通信など複数の責任
};
```

#### State Management
```typescript
// ✅ Good: Context + useReducer
interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

type TaskAction = 
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, completed: !task.completed }
            : task
        )
      };
    default:
      return state;
  }
};
```

### 2. PWA Development

#### Performance Requirements
- **First Contentful Paint**: < 1.5秒
- **Largest Contentful Paint**: < 2.5秒
- **PWA Lighthouse Score**: 90+点
- **Mobile Widget Update**: < 500ms

#### Service Worker Setup
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
});
```

#### IndexedDB Best Practices
```typescript
// database.ts
import Dexie, { Table } from 'dexie';

interface Task {
  id?: number;
  title: string;
  estimatedTime: number;
  completed: boolean;
  createdAt: Date;
}

class FocusFlowDB extends Dexie {
  tasks!: Table<Task>;
  sessions!: Table<Session>;
  notes!: Table<Note>;

  constructor() {
    super('FocusFlowDB');
    this.version(1).stores({
      tasks: '++id, title, completed, createdAt',
      sessions: '++id, taskId, startTime, endTime',
      notes: '++id, content, createdAt, tags'
    });
  }
}

export const db = new FocusFlowDB();
```

### 3. Package Management

#### npm Commands
```bash
# 基本的な開発フロー
npm install                  # 依存関係インストール
npm run dev                  # 開発サーバー起動
npm run build               # プロダクションビルド
npm run preview             # PWAプレビュー

# 品質チェック
npm run format              # Prettier実行
npm run lint                # ESLint実行
npm run typecheck           # TypeScript型チェック
npm run test                # テスト実行
npm run test:watch          # テストwatch mode

# 総合チェック
npm run check               # 全品質チェック実行
```

#### Dependency Management
```bash
# ✅ Good: 具体的バージョン指定
npm install react@^18.2.0
npm install @types/react@^18.0.0

# ❌ Bad: @latest使用
npm install react@latest
```

### 4. Security & Quality

#### Security Considerations
- **CSP**: Content Security Policy実装
- **HTTPS**: PWA要件のため必須
- **XSS防御**: React標準機能 + サニタイゼーション
- **Claude Code Hooks**: 危険コマンド自動ブロック

#### Code Quality Gates
```bash
# Pre-commit Checklist
[ ] npm run format      # コードフォーマット
[ ] npm run lint        # Lint警告解決
[ ] npm run typecheck   # 型エラー解決
[ ] npm run test        # テスト通過
[ ] git status          # 意図しないファイル変更確認
```

## Development Workflow

### Daily Workflow
```bash
# 1. 作業開始前
git pull origin main
npm install                 # 依存関係更新確認
npm run dev                 # 開発サーバー起動

# 2. 開発中（定期実行）
npm run typecheck          # 型チェック
npm run test:watch         # テスト連続実行

# 3. 機能完成時
npm run format             # フォーマット
npm run lint               # Lint修正
npm run test               # 全テスト実行
npm run build              # ビルド確認

# 4. コミット前
npm run check              # 総合チェック
git add .
git commit -m "feat: add focus mode functionality"
```

### Weekly Quality Review
```bash
# 毎週実行推奨
npm audit                  # セキュリティ脆弱性チェック
npm outdated              # 依存関係更新確認
npm run build             # プロダクションビルド確認

# Lighthouse監査
npm run preview           # PWAプレビュー起動
# Chrome DevToolsでLighthouse実行
```

### Feature Development Workflow
```bash
# 1. 新機能開発開始
git checkout -b feature/focus-mode
npm run dev

# 2. 開発・テストサイクル
# - 機能実装
# - 単体テスト作成
# - 統合テスト実行
npm run test

# 3. 品質チェック
npm run check
npm run build

# 4. コミット・PR作成
git add .
git commit -m "feat: implement focus mode with notification control"
git push origin feature/focus-mode
# GitHub PR作成
```

## Phase-Specific Guidelines

### Phase 1: Core Focus Features
- **Focus**: 基本集中機能（フォーカスモード + タスク入力）
- **Technologies**: React + TypeScript + IndexedDB
- **Key Features**: 
  - OSレベル通知制御
  - タスク作成・管理
  - 集中セッション記録

### Phase 2: Enhanced Features
- **Focus**: 思考支援機能（クイックメモ + 検索）
- **Additional**: Flutter mobile widgets
- **Key Features**:
  - クイックメモ機能
  - 検索・フィルタリング
  - モバイルウィジェット

### Phase 3: Time Management
- **Focus**: 時間管理機能（見積もり + レポート）
- **Key Features**:
  - 時間見積もり
  - 実績記録
  - レポート生成

### Phase 4-5: Integration
- **Focus**: サーバーレス連携（外部API連携）
- **Additional**: Firebase + AWS Lambda
- **Key Features**:
  - 外部ツール連携
  - データ同期
  - 認証システム

## Error Handling & Troubleshooting

### Common Issues Resolution Order
1. **Format Errors** → `npm run format`
2. **Type Errors** → `npm run typecheck`
3. **Lint Errors** → `npm run lint`
4. **Test Errors** → `npm run test`
5. **Build Errors** → `npm run build`

### IndexedDB Error Handling
```typescript
// ✅ Good: 適切なエラーハンドリング
try {
  const task = await db.tasks.add(newTask);
  console.log('Task added:', task);
} catch (error) {
  console.error('Failed to add task:', error);
  // ユーザーに適切なエラーメッセージ表示
}

// ❌ Bad: エラーハンドリングなし
const task = await db.tasks.add(newTask);
```

### PWA Cache Issues
```typescript
// キャッシュクリア（開発時）
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
  });
}
```

## Performance Optimization

### React Performance
```typescript
// ✅ Good: React.memo使用
const TaskItem = React.memo<TaskItemProps>(({ task, onToggle }) => {
  return (
    <Box>
      <Text>{task.title}</Text>
      <Button onClick={() => onToggle(task.id)}>
        {task.completed ? '完了' : '未完了'}
      </Button>
    </Box>
  );
});

// ✅ Good: useMemo, useCallback使用
const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle }) => {
  const completedTasks = useMemo(
    () => tasks.filter(task => task.completed),
    [tasks]
  );

  const handleToggle = useCallback((id: string) => {
    onToggle(id);
  }, [onToggle]);

  return (
    <VStack>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onToggle={handleToggle} />
      ))}
    </VStack>
  );
};
```

### Vite Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@chakra-ui/react'],
          db: ['dexie']
        }
      }
    }
  }
});
```

## Testing Strategy

### Unit Testing
```typescript
// TaskItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from './TaskItem';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  estimatedTime: 30,
  completed: false
};

test('renders task title', () => {
  render(<TaskItem task={mockTask} onToggle={jest.fn()} />);
  expect(screen.getByText('Test Task')).toBeInTheDocument();
});

test('calls onToggle when button clicked', () => {
  const mockOnToggle = jest.fn();
  render(<TaskItem task={mockTask} onToggle={mockOnToggle} />);
  
  fireEvent.click(screen.getByText('未完了'));
  expect(mockOnToggle).toHaveBeenCalledWith('1');
});
```

### Integration Testing
```typescript
// App.test.tsx
import { render, screen } from '@testing-library/react';
import { App } from './App';

test('full app integration', async () => {
  render(<App />);
  
  // タスク追加
  const input = screen.getByPlaceholderText('新しいタスク');
  fireEvent.change(input, { target: { value: 'Test Task' } });
  fireEvent.click(screen.getByText('追加'));
  
  // タスク表示確認
  expect(await screen.findByText('Test Task')).toBeInTheDocument();
});
```

## Deployment & DevOps

### Build Process
```bash
# プロダクションビルド
npm run build

# PWA機能確認
npm run preview

# 静的ファイル配信テスト
npx serve dist
```

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run check
      - run: npm run build
```

## Documentation & Knowledge Management

### Code Documentation
```typescript
/**
 * フォーカスモードを管理するコンポーネント
 * OSレベルの通知制御とタスク実行を統合管理
 */
interface FocusModeProps {
  /** 現在のタスク */
  currentTask: Task | null;
  /** フォーカスモード開始時のコールバック */
  onStartFocus: (taskId: string) => void;
  /** フォーカスモード終了時のコールバック */
  onEndFocus: (sessionData: SessionData) => void;
}
```

### ADR (Architecture Decision Records)
重要な技術選択は `docs/adr/` にADRとして記録：
- ADR-001: React + TypeScript選択理由
- ADR-002: IndexedDB vs LocalStorage選択理由
- ADR-003: PWA vs Native App選択理由

## Known Constraints & Limitations

### Current Limitations
- **iOS PWA通知**: iOSでの通知制御制限 → Phase 2で段階的対応
- **Flutter連携**: データ同期の複雑性 → Phase 2で解決
- **オフライン機能**: 初期実装では限定的 → 段階的拡張

### Technical Debt Management
- **月次レビュー**: 技術的負債の棚卸し
- **優先度管理**: 高🔥 / 中⚠️ / 低📝
- **計画的解決**: スプリント終了時の負債解消

---

**最終更新**: 2025-07-14  
**Version**: 1.0.0  
**メンテナンス**: 月次更新推奨
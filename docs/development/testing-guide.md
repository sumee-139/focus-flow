# Testing Guide - FocusFlow

## 🎯 TDD実践ガイド

### t-wada TDDスタイルの実践

#### 基本原則
```
Red → Green → Refactor
```

1. **Red**: 失敗するテストを先に書く
2. **Green**: テストが通る最小限のコードを書く
3. **Refactor**: コードの品質を向上させる

#### 実践例

##### 1. タスク作成機能のTDD
```typescript
// 1. Red: 失敗するテストを書く
describe('TaskService', () => {
  it('should create task with valid data', () => {
    // Arrange
    const taskData = {
      title: 'React コンポーネント設計',
      estimatedTime: 60,
      description: 'UIライブラリの選定と基本設計'
    };
    
    // Act
    const result = TaskService.createTask(taskData);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.title).toBe(taskData.title);
    expect(result.completed).toBe(false);
    expect(result.createdAt).toBeInstanceOf(Date);
  });
});
```

```typescript
// 2. Green: テストが通る最小限の実装
export class TaskService {
  static createTask(taskData: CreateTaskData): Task {
    return {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description,
      estimatedTime: taskData.estimatedTime,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
```

```typescript
// 3. Refactor: コードの品質向上
export class TaskService {
  static createTask(taskData: CreateTaskData): Task {
    this.validateTaskData(taskData);
    
    return {
      id: this.generateId(),
      title: taskData.title.trim(),
      description: taskData.description?.trim(),
      estimatedTime: taskData.estimatedTime,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  private static validateTaskData(data: CreateTaskData): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Task title is required');
    }
    if (data.estimatedTime < 1 || data.estimatedTime > 480) {
      throw new Error('Estimated time must be between 1 and 480 minutes');
    }
  }
  
  private static generateId(): string {
    return crypto.randomUUID();
  }
}
```

## 🧪 テストパターン

### 1. 単体テスト (Unit Tests)
```typescript
// ビジネスロジックの単体テスト
describe('FocusTimer', () => {
  let timer: FocusTimer;
  
  beforeEach(() => {
    timer = new FocusTimer();
  });
  
  it('should start timer with specified duration', () => {
    timer.start(25 * 60); // 25分
    
    expect(timer.isRunning).toBe(true);
    expect(timer.duration).toBe(25 * 60);
    expect(timer.remainingTime).toBe(25 * 60);
  });
  
  it('should pause and resume timer', () => {
    timer.start(25 * 60);
    timer.pause();
    
    expect(timer.isRunning).toBe(false);
    expect(timer.isPaused).toBe(true);
    
    timer.resume();
    expect(timer.isRunning).toBe(true);
    expect(timer.isPaused).toBe(false);
  });
});
```

### 2. 統合テスト (Integration Tests)
```typescript
// コンポーネントと外部依存関係の統合テスト
describe('TaskList Integration', () => {
  let taskService: TaskService;
  let render: RenderResult;
  
  beforeEach(() => {
    taskService = new TaskService();
    render = renderWithProviders(<TaskList taskService={taskService} />);
  });
  
  it('should display tasks from service', async () => {
    // Arrange
    const mockTasks = [
      { id: '1', title: 'Task 1', completed: false },
      { id: '2', title: 'Task 2', completed: true }
    ];
    jest.spyOn(taskService, 'getTasks').mockResolvedValue(mockTasks);
    
    // Act
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
    
    // Assert
    expect(taskService.getTasks).toHaveBeenCalledTimes(1);
  });
});
```

### 3. E2E テスト (End-to-End Tests)
```typescript
// ユーザーフローの E2E テスト
describe('Focus Mode E2E', () => {
  it('should complete full focus session', async () => {
    // Arrange
    const { user } = setup();
    render(<App />);
    
    // Act - タスク作成
    await user.click(screen.getByText('タスク作成'));
    await user.type(screen.getByPlaceholderText('タスク名'), 'React実装');
    await user.type(screen.getByPlaceholderText('見積もり時間'), '60');
    await user.click(screen.getByText('作成'));
    
    // Act - フォーカスモード開始
    await user.click(screen.getByText('集中開始'));
    
    // Assert - フォーカスモード画面
    expect(screen.getByText('React実装')).toBeInTheDocument();
    expect(screen.getByText('60:00')).toBeInTheDocument();
    expect(screen.getByText('一時停止')).toBeInTheDocument();
  });
});
```

## 🎯 テストカバレッジ目標

### カバレッジ基準
- **ビジネスロジック**: 95%+
- **UI コンポーネント**: 80%+
- **統合テスト**: 主要フロー 100%
- **E2E テスト**: 重要なユーザーフロー 100%

### 測定コマンド
```bash
# カバレッジ測定
npm run test:coverage

# カバレッジレポート生成
npm run test:coverage:report
```

## 🔧 テストツール設定

### Jest 設定
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/**/*.stories.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Testing Library 設定
```typescript
// src/test/setupTests.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// テスト後のクリーンアップ
afterEach(() => {
  cleanup();
});
```

## 📋 テストチェックリスト

### コンポーネントテスト
- [ ] レンダリングが正しく行われる
- [ ] props が正しく渡される
- [ ] イベントハンドラが正しく動作する
- [ ] 条件分岐が正しく動作する
- [ ] エラーハンドリングが適切

### ビジネスロジックテスト
- [ ] 正常系のテスト
- [ ] 異常系のテスト
- [ ] 境界値のテスト
- [ ] エラーハンドリングのテスト
- [ ] パフォーマンスのテスト

### 統合テスト
- [ ] 外部依存関係との連携
- [ ] データフローの確認
- [ ] API通信のテスト
- [ ] 状態管理の確認

## 🚀 実践的なTDD開発フロー

### 1. 機能設計 (5分)
```
要件 → 受入基準 → テストケース設計
```

### 2. TDDサイクル (15分 x N回)
```
Red (2分) → Green (8分) → Refactor (5分)
```

### 3. 統合 (10分)
```
統合テスト → E2Eテスト → カバレッジ確認
```

### 4. 品質確認 (5分)
```
npm run test → npm run lint → npm run typecheck
```

## 📚 参考資料

### 書籍
- 「テスト駆動開発」by Kent Beck
- 「実践テスト駆動開発」by Steve Freeman & Nat Pryce

### オンラインリソース
- [t-wada テスト駆動開発](https://github.com/twada/tdd-kata)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [Jest Best Practices](https://jestjs.io/docs/jest-best-practices)

---

**更新日**: 2025-07-15  
**次回レビュー**: 実装開始時
---
cache_control: {"type": "ephemeral"}
---
# FocusFlow Requirements Specification

## 1. Project Overview

### 1.1 Purpose
個人の集中と知的生産性を最大化するデジタル伴走者として、フロー状態の日常化と段階的習慣化を実現する。

### 1.2 Scope
- **Users**: 集中力向上を求める知的労働者・学習者
- **Environment**: PWA（Progressive Web App）によるクロスプラットフォーム対応
- **Constraints**: 
  - 個人利用に特化（チーム機能は外部連携で対応）
  - 段階的機能解放による複雑性管理
  - 既存ツールとの協調（競合回避）

### 1.3 Technology Stack
- **Frontend**: React v18+ + TypeScript v5+ + Chakra UI v2+
- **Build Tool**: Vite v5+ + PWA Plugin
- **Database**: IndexedDB (Dexie.js)
- **State Management**: React Context + useReducer
- **PWA**: Workbox v7+ (Service Worker)
- **Package Manager**: npm
- **Mobile Extension**: Flutter v3+ (Phase 2)

## 2. Functional Requirements

### 2.1 フォーカスモード（Phase 1）
#### 2.1.1 OSレベル通知制御
- PWA通知APIを使用した通知バリア機能
- 集中時間の設定（15分, 30分, 60分, カスタム）
- 緊急連絡先の例外設定
- **制約**: iOS PWAでは制限あり（段階的対応）

#### 2.1.2 タスク管理
- シンプルなタスク作成・編集・削除
- 見積もり時間の設定
- 進捗状況の記録
- IndexedDBでのローカル保存

### 2.2 クイックメモ（Phase 2）
#### 2.2.1 瞬時メモ機能
- 思考中断を防ぐ軽量なメモ入力
- Markdownサポート
- タグ機能による分類
- 全文検索機能

#### 2.2.2 知識の可視化
- メモ間の関連性表示
- タグクラウド表示
- 時系列での思考の流れ可視化

### 2.3 時間管理（Phase 3）
#### 2.3.1 見積もり精度向上
- 実績データに基づく見積もり提案
- 見積もり vs 実績の分析
- 改善提案の自動生成

#### 2.3.2 レポート機能
- 日次・週次・月次レポート
- 集中時間の統計
- 生産性トレンドの可視化

## 3. Non-Functional Requirements

### 3.1 Performance Requirements
- **First Contentful Paint**: < 1.5秒
- **Largest Contentful Paint**: < 2.5秒
- **PWA Lighthouse Score**: 90+点
- **モバイルウィジェット更新**: < 500ms
- **IndexedDB操作**: < 100ms（通常操作）
- **全文検索**: < 200ms（10,000件以下）

### 3.2 Usability Requirements
- **UI/UX**: Chakra UIによる直感的なインターフェース
- **Accessibility**: WAI-ARIA準拠、キーボードナビゲーション対応
- **Multi-language**: 日本語優先、英語対応（Phase 4）
- **Responsive**: デスクトップ・タブレット・スマートフォン対応
- **Progressive Enhancement**: 段階的機能解放によるUX向上

### 3.3 Security Requirements

#### 3.3.1 Command Execution Security
- **Dangerous Command Blocking**: Automatic detection and blocking of system-destructive commands
- **Allow List Management**: Pre-approval of safe commands necessary for development
- **Real-time Monitoring**: Command execution monitoring using Claude Code hooks
- **Security Logging**: Recording and auditing of executed commands

#### 3.3.2 Blocked Commands
- System destruction: `rm -rf /`, `chmod 777 /`, `mv /usr`, etc.
- External code execution: `curl | sh`, `wget | bash`, etc.
- Configuration changes: `git config --global`, `npm config set`, etc.
- Privilege escalation: `sudo`, `su`, `sudo -i`, etc.
- Data erasure: `shred`, `dd if=/dev/zero`, etc.

#### 3.3.3 Allowed Commands
- File operations: `ls`, `cat`, `mkdir`, `touch`, `cp`, `mv`, etc.
- Git operations: `git status`, `git add`, `git commit`, `git push`, etc.
- Development tools: `npm run`, `python`, `pip install`, etc.
- Modern CLI: `eza`, `batcat`, `rg`, `fd`, `dust`, etc.

#### 3.3.4 Security Testing
- Automated test suite: `.claude/scripts/test-security.sh`
- Test coverage: Comprehensive testing of safe commands, dangerous commands, and allow lists
- Test frequency: Required when settings change and at project start

#### 3.3.5 Access Control
- File access: Limited to project directory and below
- Log access: Read-only access to `~/.claude/security.log`
- Configuration changes: Administrator privileges required

#### 3.3.6 Incident Response
- Block events: Immediate user notification and log recording
- Emergency stop: Temporary disabling of security settings procedures
- Recovery procedures: Settings recovery from backup procedures

#### 3.3.7 Security Documentation
- Configuration manual: `.claude/security-README.md`
- Content: Configuration methods, emergency response, troubleshooting
- Update frequency: Required when security settings change

#### 3.3.8 General Security Requirements
- **Data Encryption**: IndexedDBの機密データ暗号化
- **CSP**: Content Security Policy実装
- **HTTPS**: PWA要件のため必須
- **XSS Prevention**: React標準機能 + サニタイゼーション
- **Privacy**: ローカルファーストデータ処理

### 3.4 Development and Operation Requirements
- **Version Control**: Git + GitHub
- **Development Environment**: Vite + TypeScript + ESLint + Prettier
- **Testing**: Jest + React Testing Library + 80%+ カバレッジ
- **Deployment**: GitHub Pages + PWA Service Worker
- **CI/CD**: GitHub Actions + Lighthouse CI
- **Monitoring**: PWA Analytics + Error Tracking

## 4. Database Design (IndexedDB)

### 4.1 Table Structure

#### tasks (タスク管理)
```typescript
interface Task {
  id?: number;
  title: string;
  description?: string;
  estimatedTime: number; // 分
  actualTime?: number; // 分
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}
```

#### sessions (集中セッション)
```typescript
interface Session {
  id?: number;
  taskId: number;
  startTime: Date;
  endTime?: Date;
  duration?: number; // 分
  interruptions: number;
  notes?: string;
  createdAt: Date;
}
```

#### notes (クイックメモ)
```typescript
interface Note {
  id?: number;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  linkedTasks?: number[];
  linkedNotes?: number[];
}
```

#### settings (ユーザー設定)
```typescript
interface Settings {
  id?: number;
  theme: 'light' | 'dark';
  language: 'ja' | 'en';
  notifications: boolean;
  focusTime: number; // デフォルト集中時間
  features: string[]; // 解放済み機能
  updatedAt: Date;
}
```

## 5. API Design (Local Storage)

### 5.1 Database Operations

#### Task Operations
```typescript
// タスク関連
db.tasks.add(task: Task): Promise<number>
db.tasks.update(id: number, changes: Partial<Task>): Promise<number>
db.tasks.delete(id: number): Promise<void>
db.tasks.where('completed').equals(false).toArray(): Promise<Task[]>

// セッション関連
db.sessions.add(session: Session): Promise<number>
db.sessions.where('taskId').equals(taskId).toArray(): Promise<Session[]>

// メモ関連
db.notes.add(note: Note): Promise<number>
db.notes.where('content').startsWithIgnoreCase(query).toArray(): Promise<Note[]>
```

### 5.2 PWA Service Worker APIs
- **Push API**: 通知機能
- **Background Sync**: オフライン同期
- **Cache API**: 高速ローディング
- **IndexedDB**: ローカルデータ永続化

## 6. Directory Structure

```
focus-flow/
├── .claude/           # Memory Bank
├── docs/              # Documentation
├── src/               # Source code
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks
│   ├── services/      # Business logic
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── public/            # Static assets
├── tests/             # Test code
├── vite.config.ts     # Vite configuration
├── package.json       # Dependencies
└── README.md          # Project description
```

## 7. Development Schedule

### Phase 1: 基本集中機能 (2025-07-21 - 2025-08-04)
- フォーカスモード（PWA通知制御）
- シンプルなタスク管理
- IndexedDBデータベース設計
- 基本的なPWA機能

### Phase 2: 思考支援機能 (2025-08-05 - 2025-08-18)
- クイックメモ機能
- 全文検索機能
- Flutter モバイルウィジェット
- 開発向け端末間同期

### Phase 3: 時間管理機能 (2025-08-19 - 2025-09-01)
- 見積もり精度向上
- レポート機能
- 生産性分析
- パフォーマンス最適化

### Phase 4-5: 拡張機能 (2025-09-02 - 2025-09-14)
- サーバーレス連携
- 外部API連携
- 多言語対応
- 最終調整

## 8. Success Criteria

- [ ] PWA Lighthouse Score 90+点達成
- [ ] 基本的な集中機能の動作確認
- [ ] クロスプラットフォーム対応
- [ ] IndexedDBでのローカルデータ管理
- [ ] 段階的機能解放の実装
- [ ] ユーザビリティテストの実施

## 9. Risks and Countermeasures

| Risk | Impact | Probability | Countermeasure |
|------|--------|-------------|----------------|
| PWA通知制御の制限 | High | High | 段階的対応・代替UI提供 |
| IndexedDBの性能問題 | Medium | Medium | データ設計見直し・最適化 |
| 開発期間の不足 | High | Medium | フェーズ分割・優先機能絞り込み |
| PWAの採用障壁 | Medium | Low | 詳細な導入ガイド作成 |

## 10. Notes

### 重要な技術的制約
- iOS PWAでの通知制御制限: Phase 2で段階的対応
- IndexedDBのストレージ制限: ユーザーへの事前通知
- Service Workerの更新タイミング: 適切なキャッシュ戦略

### 開発上の注意点
- React Context の適切な分割によるパフォーマンス最適化
- TypeScript strict mode での型安全性確保
- PWA要件（HTTPS、Service Worker、Manifest）の遵守

**最終更新**: 2025-07-14  
**Version**: 1.0.0
---
cache_control: {"type": "ephemeral"}
---
# Technical Context

## Architecture Overview
```
FocusFlow ハイブリッドアーキテクチャ

フェーズ1-3: フルクライアントサイド
┌─────────────────────┐    ┌─────────────────────┐
│   PWA (React)       │    │  Flutter App        │
│   ┌─────────────┐   │    │   ┌─────────────┐   │
│   │  Chakra UI  │   │    │   │   SQLite    │   │
│   │   (Main)    │   │    │   │(Local DB)  │   │
│   └─────────────┘   │    │   └─────────────┘   │
│   ┌─────────────┐   │    │   ┌─────────────┐   │
│   │  IndexedDB  │   │    │   │home_widget │   │
│   │ (Dexie.js)  │   │    │   │   (Phase2)  │   │
│   └─────────────┘   │    │   └─────────────┘   │
└─────────────────────┘    └─────────────────────┘
         │                           │
         └─────────── Local ─────────┘

フェーズ4-5: サーバーレス連携
┌─────────────────────┐    ┌─────────────────────┐
│   Client Apps       │    │  Serverless Stack   │
│   ┌─────────────┐   │    │   ┌─────────────┐   │
│   │ Local Data  │◄──┼────┤►  │Firebase     │   │
│   │             │   │    │   │Auth/Store   │   │
│   └─────────────┘   │    │   └─────────────┘   │
│   ┌─────────────┐   │    │   ┌─────────────┐   │
│   │ Sync Engine │◄──┼────┤►  │AWS Lambda   │   │
│   │             │   │    │   │(OAuth仲介)  │   │
│   └─────────────┘   │    │   └─────────────┘   │
└─────────────────────┘    └─────────────────────┘
                                      │
                            ┌─────────▼─────────┐
                            │   External APIs   │
                            │ (Jira/Notion/   │
                            │  Google等)       │
                            └───────────────────┘
```

## Technology Stack Details
### Frontend (PWA)
- React v18+ - メインフレームワーク
- TypeScript v5+ - 型安全性
- Chakra UI v2+ - UI コンポーネント
- Vite v5+ - ビルドツール
- Workbox v7+ - PWA機能

### Mobile Widgets (Phase 2)
- Flutter v3+ - モバイルウィジェット
- home_widget - ホーム画面ウィジェット
- Dart v3+ - Flutter開発言語

### State Management & Storage
- React Context + useReducer - 状態管理
- IndexedDB (Dexie.js) - ローカルストレージ
- Service Worker - オフライン対応

### Backend (Phase 4-5のみ)
- Firebase Authentication - 軽量認証
- Firebase Firestore - 同期データ保存
- AWS Lambda - OAuth仲介・API連携
- Serverless Framework - インフラ管理

## Development Environment
```bash
# PWA Setup
npm create vite@latest focus-flow -- --template react-ts
cd focus-flow
npm install @chakra-ui/react @emotion/react @emotion/styled
npm install dexie workbox-window firebase

# Flutter Setup (Phase 2 + 開発向け同期)
flutter create mobile_widgets
cd mobile_widgets
flutter pub add home_widget firebase_core cloud_firestore

# 開発向け同期セットアップ
firebase init firestore
```

## 開発向け端末間同期（PC-Android）
### 目的
早期フィードバック取得のための簡素な同期システム

### 技術選択
- **Firebase Firestore**: リアルタイム同期
- **実装工数**: 1日（基本機能）
- **対象データ**: タスク、メモ、集中セッション、デイリーメモ

### 実装概要
```typescript
// PWA側: 簡単な同期クラス
class DevSync {
  private db = getFirestore();
  
  async syncTask(task: Task) {
    await setDoc(doc(this.db, 'tasks', task.id), task);
  }
  
  subscribeToTasks(callback: (tasks: Task[]) => void) {
    return onSnapshot(collection(this.db, 'tasks'), callback);
  }
}
```

```dart
// Flutter側: 対応するクラス
class DevSync {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  
  Future<void> syncTask(Task task) async {
    await _db.collection('tasks').doc(task.id).set(task.toJson());
  }
  
  Stream<List<Task>> tasksStream() {
    return _db.collection('tasks').snapshots().map(...);
  }
}
```

### 開発フロー
1. PC（PWA）でタスク作成
2. Firestore経由でAndroidに同期
3. 実際の使用体験でフィードバック取得
4. 改善点を即座に反映

## Startup Procedures
```bash
# Development environment
npm run dev

# Production build
npm run build

# PWA Preview
npm run preview
```

## API Design
### Local Storage API (IndexedDB)
- `tasks` - タスク管理（アラーム時間、並び順含む）
- `sessions` - 集中セッション記録
- `settings` - ユーザー設定
- `notes` - クイックメモ
- `dailyMemos` - デイリーメモ（プレーンMarkdown）

### PWA Service Worker APIs
- Push API - 通知機能
- Background Sync - オフライン同期
- Cache API - 高速ローディング

## Database Design
### IndexedDB Tables
- `tasks`: タスク情報（ID, タイトル, 見積もり時間, 完了状態, アラーム時間, 並び順）
- `sessions`: 集中セッション（ID, タスクID, 開始時間, 終了時間）
- `notes`: クイックメモ（ID, 内容, 作成日時, タグ）
- `dailyMemos`: デイリーメモ（日付, Markdown内容）
- `settings`: ユーザー設定（テーマ, 通知設定, 機能解放レベル）

## Configuration Files
- `package.json`: NPM依存関係とスクリプト
- `vite.config.ts`: Vite設定とPWA設定
- `tsconfig.json`: TypeScript設定
- `tailwind.config.js`: Tailwind CSS設定（サブ）

## Performance Requirements
- First Contentful Paint: < 1.5秒
- Largest Contentful Paint: < 2.5秒
- PWA Lighthouse Score: 90+点
- モバイルウィジェット更新: < 500ms

## Security Considerations
- Content Security Policy (CSP)
- HTTPS必須（PWA要件）
- XSS防御（React標準機能）
- Claude Code Hooks（危険コマンド自動ブロック）

## Known Constraints & Issues
- PWA通知制御: iOSでの制限あり → 段階的対応
- Flutter連携: データ同期の複雑性 → Phase 2で解決
- オフライン機能: 初期実装では限定的 → 段階的拡張
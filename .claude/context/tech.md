---
cache_control: {"type": "ephemeral"}
---
# Technical Context

## Architecture Overview
```
[Architecture diagram in ASCII art as needed]
```

## Technology Stack Details
### Frontend
- React v19.1.0 - UI framework (Capacitor版)
- Chakra UI v3.22.0 - Component library
- Framer Motion v12.23.6 - Animation library
- TypeScript v5.8.3 - Type safety
- Vite v7.0.4 - Build tool
- Electron v37.2.2 - Desktop application framework

### Backend
- ローカルストレージ中心のアーキテクチャ
- LocalStorage/IndexedDB - データ永続化
- 将来的にSQLite対応予定

### Infrastructure & Tools
- Capacitor v7.4.2 - Cross-platform development
- ESLint v9.30.1 - Code linting
- Electron Forge v7.8.1 - Desktop app packaging

## Development Environment
```bash
# Capacitor版のセットアップ
cd focus-flow-capacitor
npm install
npm run dev

# Electron版のセットアップ
cd focus-flow-app
npm install
npm start
```

## Startup Procedures
```bash
# Development environment (Capacitor版)
npm run dev

# Development environment (Electron版)
npm start

# Production build (Capacitor版)
npm run build

# Production build (Electron版)
npm run make
```

## API Design
### Local Storage Schema
- `focus-sessions` - 集中セッション履歴
- `quick-memos` - クイックメモデータ
- `user-preferences` - ユーザー設定
- `growth-tree-data` - 成長の木の進捗データ

## Database Design
### Main Data Structures
- `FocusSession`: 集中セッション情報（開始時刻、終了時刻、中断理由）
- `QuickMemo`: メモ情報（内容、作成日時、タグ、添付ファイル）
- `ProjectTemplate`: プロジェクトテンプレート情報

## Configuration Files
- `capacitor.config.ts`: Capacitor設定（プラットフォーム固有設定）
- `forge.config.js`: Electron Forge設定（パッケージング設定）
- `vite.config.ts`: Vite設定（ビルド最適化）
- `eslint.config.js`: ESLint設定（コード品質）

## Performance Requirements
- クイックメモの記録時間: 3秒以内
- フォーカスモードの起動時間: 2秒以内
- 全文検索の応答時間: 1秒以内

## Security Considerations
- ローカルストレージ中心でプライバシーを保護
- ファイル添付機能におけるセキュリティスキャン
- 将来的なクラウド同期での暗号化

## Known Constraints & Issues
- Capacitor版とElectron版の機能差異: 通知API、ファイルアクセス権限の違い
- モバイルでの音声入力精度: デバイス依存、ネットワーク接続が必要
- 成長の木の視覚化: パフォーマンス最適化が必要
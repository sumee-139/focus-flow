# FocusFlow

**個人の集中と知的生産性を最大化するデジタル伴走者**

## 🎯 プロジェクト概要

FocusFlowは、「その日必ず着手するタスク」のみを管理し、集中を妨げる全ての要素を徹底的に排除したタスク管理アプリケーションです。

### Core Concept
- **「今日やる」ことのみ管理** - 期限という概念を排除
- **集中力への献身** - 通知の完全遮断と視覚的ノイズの最小化
- **Calm Technology** - 背景に徹し、ユーザーが意識しない技術

## 🚀 主要機能

### Phase 1: 基本集中機能
- **フォーカスモード**: OSレベル通知制御による集中バリア
- **シンプルタスク管理**: 統一アイコン・色区別排除
- **デイリーメモ**: プレーンMarkdown形式

### Phase 2: 思考支援機能
- **クイックメモ**: 思考中断を防ぐ瞬時メモ
- **知識可視化**: メモ間の関連性発見
- **モバイルウィジェット**: Flutter製ホーム画面ウィジェット

### Phase 3: 時間管理機能
- **見積もり精度向上**: 実績データに基づく提案
- **生産性レポート**: 集中時間の統計と分析

## 🏗️ 技術スタック

- **Frontend**: React 18+ + TypeScript 5+ + Chakra UI 2+
- **Build**: Vite 5+ + PWA Plugin
- **Database**: IndexedDB (Dexie.js)
- **State**: React Context + useReducer
- **PWA**: Workbox 7+ (Service Worker)
- **Mobile**: Flutter 3+ (Phase 2)

## 📋 開発ルール

### TDD & Component Development
- **TDD必須**: ビジネスロジック開発時は必ずt-wadaのTDDスタイル
- **モックアップ必須**: コンポーネント作成時は`mockup/component-sandbox.html`に配置
- **開発フロー**: モックアップ → コンポーネント実装 → 統合テスト

### 品質基準
- **TypeScript**: 全関数・変数に型注釈必須
- **テストカバレッジ**: 80%+ (重要機能)
- **PWA Lighthouse**: 90+点維持

## 🎨 設計原則

### 必須要件
- **統一アイコン**: 全タスクに📝アイコン使用
- **色区別禁止**: 🔴🟡🟢などの優先度表示排除
- **進捗率禁止**: 完了/未完了の二値のみ
- **UI優先度**: タブレット・PCでは70%以上をMarkdownエディタが占有

### 禁止事項
- 重要度・優先度フィールドの追加
- 期限・締切フィールドの追加
- 進捗率・パーセンテージの追加
- 色による情報区別

## 🚀 開発開始

### 1. 設計哲学の理解
```bash
# 必須読書
docs/design-philosophy.md
```

### 2. 開発環境セットアップ
```bash
git clone [repository-url]
cd focus-flow
npm install
npm run dev
```

### 3. 開発フロー
```bash
# 1. TDD開発 (ビジネスロジック)
npm run test:watch

# 2. コンポーネント開発
# mockup/component-sandbox.html でモックアップ作成
npm run dev

# 3. 品質チェック
npm run check
```

## 📚 ドキュメント

### 📖 必読ドキュメント
- **[Design Philosophy](docs/design-philosophy.md)** ⭐️ - 設計哲学
- **[Requirements](docs/requirements.md)** - 要件定義
- **[Development Rules](docs/development-rules.md)** - 開発ルール

### 🏗️ 設計・実装
- **[Design System](docs/design-system-specs.md)** - デザインシステム
- **[UI Flow](docs/ui-screen-flow.md)** - 画面遷移
- **[User Stories](docs/user-stories.md)** - ユーザーストーリー

### 🔧 開発支援
- **[Best Practices](docs/best-practices.md)** - ベストプラクティス
- **[ADR Template](docs/adr/template.md)** - アーキテクチャ決定記録

## 🎯 プロジェクト状況

### 現在のフェーズ
- **Phase**: 計画・基盤整備段階
- **Progress**: 0% (設計・ドキュメント完了)
- **Next Milestone**: 2025-07-21 フェーズ1プロトタイプ完成

### 今週の重点
- 技術スタック調査完了
- 開発環境セットアップ
- フェーズ1アーキテクチャ設計

## 🤝 コントリビューション

### 開発参加
1. **Design Philosophy** を熟読
2. **Development Rules** を確認
3. **Issue** から作業を選択
4. **TDD** でビジネスロジック実装
5. **モックアップ** でコンポーネント設計

### 品質基準
- [ ] Design Philosophy に矛盾しない
- [ ] 集中力向上に寄与する
- [ ] アクセシビリティを損なわない
- [ ] 既存パターンに従う

## 📄 ライセンス

[MIT License](LICENSE)

---

**開発チーム**: Focus & Flow Contributors  
**最終更新**: 2025-07-15  
**バージョン**: 0.1.0-alpha
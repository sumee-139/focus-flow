# FocusFlow Documentation

## 📋 ドキュメント構造

### 🎯 Core Documents (必須読書)
- **[Design Philosophy](design-philosophy.md)** ⭐️ - 設計哲学・開発前必読
- **[Requirements](requirements.md)** - 要件定義・技術仕様
- **[Development Rules](development-rules.md)** - 開発ルール・品質基準

### 🏗️ Architecture & Design
- **[Design System Specs](design-system-specs.md)** - デザインシステム仕様
- **[UI Screen Flow](ui-screen-flow.md)** - 画面遷移・ユーザーフロー
- **[Responsive Design Specs](responsive-design-specs.md)** - レスポンシブデザイン

### 📐 Design Details
- **[Desktop Layout Detailed](desktop-layout-detailed.md)** - デスクトップレイアウト詳細
- **[Wireframes Focus Mode](wireframes-focus-mode.md)** - フォーカスモード画面設計
- **[Wireframes Task Management](wireframes-task-management.md)** - タスク管理画面設計

### 👥 User Experience
- **[User Stories](user-stories.md)** - ユーザーストーリー
- **[Acceptance Criteria](acceptance-criteria.md)** - 受入基準

### 🔧 Development Process
- **[Best Practices](best-practices.md)** - 開発ベストプラクティス
- **[Requirements Status](requirements-status.md)** - 要件実装状況

### 📚 Decision Records
- **[ADR Template](adr/template.md)** - アーキテクチャ決定記録テンプレート

## 🚀 開発者向けクイックスタート

### 1. 必読ドキュメント (5分)
```bash
# 必ず最初に読む
docs/design-philosophy.md    # 設計哲学
docs/requirements.md         # 要件定義
docs/development-rules.md    # 開発ルール
```

### 2. 実装前確認 (3分)
```bash
# UI実装時
docs/design-system-specs.md
docs/ui-screen-flow.md

# 新機能実装時
docs/user-stories.md
docs/acceptance-criteria.md
```

### 3. 開発中参照
```bash
# 品質確認
docs/best-practices.md
docs/requirements-status.md

# 設計判断
docs/adr/template.md
```

## 📖 読書順序

### 🚀 新規参加者
1. **Design Philosophy** (必須) - プロジェクトの魂を理解
2. **Requirements** - 何を作るかを理解
3. **Development Rules** - どう作るかを理解
4. **UI Screen Flow** - 画面構成を理解

### 🎨 デザイン実装者
1. **Design Philosophy** (必須)
2. **Design System Specs** - デザインシステム
3. **Responsive Design Specs** - レスポンシブ対応
4. **Desktop Layout Detailed** - 詳細レイアウト

### 🔧 機能実装者
1. **Design Philosophy** (必須)
2. **Requirements** - 技術要件
3. **User Stories** - ユーザー要求
4. **Acceptance Criteria** - 完成基準

## 🔄 ドキュメント更新ルール

### 更新頻度
- **Design Philosophy**: 重要な設計変更時のみ
- **Requirements**: 仕様変更時
- **Development Rules**: 開発プロセス改善時
- **Status類**: 実装進捗に合わせて随時

### 更新責任
- **Core Documents**: チーム全体での合意必須
- **Design系**: デザイン担当者
- **Development系**: 開発リーダー
- **Status系**: 実装担当者

## 🎯 品質基準

### 必須チェック項目
- [ ] Design Philosophyに矛盾していないか
- [ ] 既存要件との整合性
- [ ] 実装可能性の検証
- [ ] ユーザビリティの確認

### ドキュメント品質
- [ ] 目的と対象読者が明確
- [ ] 具体的で実行可能な内容
- [ ] 他ドキュメントとの重複回避
- [ ] 定期的な見直しと更新

---

**更新日**: 2025-07-15  
**管理者**: Development Team  
**次回レビュー**: 主要機能実装完了時
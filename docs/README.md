# FocusFlow Documentation

## 🎯 必読ドキュメント（開発前必須）

### 📚 Core Documents
**開発参加前に必ず読む** - 所要時間: 15分

1. **[Design Philosophy](core/design-philosophy.md)** ⭐️ **最重要** - 設計哲学・判断基準
2. **[Requirements](core/requirements.md)** - 要件定義・技術仕様
3. **[Development Rules](core/development-rules.md)** - TDD・品質基準

## 📋 カテゴリ別ドキュメント

### 🎨 Design / デザイン
**UI・UX実装時に参照**
- **[Design System Specs](design/design-system-specs.md)** - デザインシステム仕様
- **[UI Screen Flow](design/ui-screen-flow.md)** - 画面遷移・ユーザーフロー
- **[Responsive Design Specs](design/responsive-design-specs.md)** - レスポンシブデザイン
- **[Desktop Layout Detailed](design/desktop-layout-detailed.md)** - デスクトップレイアウト詳細
- **[Wireframes Focus Mode](design/wireframes-focus-mode.md)** - フォーカスモード画面設計
- **[Wireframes Task Management](design/wireframes-task-management.md)** - タスク管理画面設計

### 🔧 Development / 開発
**実装・品質管理時に参照**
- **[Best Practices](development/best-practices.md)** - 開発ベストプラクティス
- **[Testing Guide](development/testing-guide.md)** - TDD実践ガイド
- **[Requirements Status](development/requirements-status.md)** - 要件実装状況

### 📋 Planning / 計画
**機能設計・要件定義時に参照**
- **[User Stories](planning/user-stories.md)** - ユーザーストーリー
- **[Acceptance Criteria](planning/acceptance-criteria.md)** - 受入基準

### 📚 Decision Records / 意思決定記録
**技術選択・アーキテクチャ決定時に参照**
- **[ADR Template](adr/template.md)** - アーキテクチャ決定記録テンプレート

## 🚀 開発者向けクイックスタート

### 1. 必読ドキュメント (15分)
```bash
# 必ず最初に読む - 優先順位順
docs/core/design-philosophy.md    # ⭐️ 最重要: 設計哲学
docs/core/requirements.md         # 要件定義
docs/core/development-rules.md    # TDD・品質基準
```

### 2. 役割別参照ドキュメント
```bash
# UI・デザイン実装時
docs/design/design-system-specs.md
docs/design/ui-screen-flow.md

# 新機能実装時
docs/planning/user-stories.md
docs/planning/acceptance-criteria.md

# 品質・運用管理時
docs/development/best-practices.md
docs/development/requirements-status.md
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
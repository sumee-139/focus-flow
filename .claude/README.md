# Claude Code Memory Bank

## 📋 Memory Bank 構造

### 🎯 Core (常時参照)
- **[Overview](core/overview.md)** - プロジェクト概要
- **[Current](core/current.md)** - 現在の状況
- **[Next](core/next.md)** - 次のアクション
- **[Templates](core/templates.md)** - クイックテンプレート

### 📚 Context (必要時参照)
- **[Tech](context/tech.md)** - 技術詳細
- **[History](context/history.md)** - 履歴・意思決定
- **[Debt](context/debt.md)** - 技術的負債

### 🔧 Guidelines (開発ガイド)
- **[Development](guidelines/development.md)** - 開発ガイドライン
- **[Git Workflow](guidelines/git-workflow.md)** - Git運用方法
- **[Testing Quality](guidelines/testing-quality.md)** - テスト・品質管理

### 🎮 Commands (カスタムコマンド)
- **[Plan](commands/plan.md)** - 作業計画
- **[Daily](commands/daily.md)** - 日次振り返り
- **[Focus](commands/focus.md)** - 集中モード
- **[Feature Plan](commands/feature-plan.md)** - 機能設計
- **[Debug Start](commands/debug-start.md)** - デバッグモード
- **[Review Check](commands/review-check.md)** - レビューモード

### 🔍 Debug (デバッグ情報)
- **[Latest](debug/latest.md)** - 最新デバッグセッション

### 🏛️ Archive (アーカイブ)
- **[README](archive/README.md)** - アーカイブ管理

## 🚀 使用方法

### 日常的な使用
```bash
# 現在の状況確認
@.claude/core/current.md

# 次のアクション確認
@.claude/core/next.md

# 技術詳細が必要な時
@.claude/context/tech.md
```

### カスタムコマンド
```bash
# 計画立案
/project:plan

# 日次振り返り
/project:daily

# 集中モード
/project:focus

# 機能設計
/feature:plan

# デバッグ開始
/debug:start
```

### 開発時の参照順序
1. **Core**: overview.md → current.md → next.md
2. **Context**: tech.md (技術詳細必要時)
3. **Guidelines**: development.md (開発ルール確認)
4. **Commands**: 必要なコマンド実行

## 🔄 更新ルール

### 更新頻度
- **Core**: 毎日〜週次
- **Context**: 技術変更時・重要決定時
- **Guidelines**: 開発プロセス改善時
- **Commands**: 新機能追加時
- **Debug**: 問題発生時

### 更新責任
- **Current/Next**: 日次更新
- **Tech/History**: 技術変更時
- **Debt**: 負債発生・解決時

## 📊 Memory Bank メトリクス

### 効果測定
- **参照頻度**: よく使われるファイルの特定
- **更新頻度**: 情報の鮮度管理
- **問題解決時間**: デバッグ効率の測定

### 最適化
- **Cache Control**: 長期安定情報への適用
- **情報整理**: 重複・古い情報の整理
- **アーカイブ**: 使用頻度の低い情報の移動

## 🎯 品質基準

### 情報品質
- [ ] 目的と対象が明確
- [ ] 実行可能で具体的
- [ ] 他ファイルとの重複回避
- [ ] 定期的な更新

### 構造品質
- [ ] 階層構造の一貫性
- [ ] ファイル名の規則性
- [ ] 相互参照の正確性
- [ ] アーカイブルールの遵守

---

**更新日**: 2025-07-15  
**管理者**: Development Team  
**次回レビュー**: 月次
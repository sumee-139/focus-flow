# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-07-10

### Added
- **AI-Friendly Logger**: Vibe Logger概念を採用した構造化JSONログシステム
- **AIログ解析ツール**: `analyze-ai-logs.py`によるパターン分析・洞察生成機能
- **豊富なコンテキスト**: プロジェクト・環境・Git情報を自動収集
- **AIメタデータ**: デバッグヒント・優先度・推奨アクションの自動付与
- **エラー分析機能**: エラーパターンの検出と改善提案

### Enhanced
- 既存の活動ログシステムと並行動作による段階的移行サポート
- AI駆動開発（VibeCoding）の効率を大幅に向上
- デバッグプロセスの「推測と確認」から「分析と解決」への転換

### Documentation
- `.claude/ai-logger-README.md`: AI Logger システムの詳細説明
- `CLAUDE.md`: AI-Friendly Logger機能の統合

## [1.1.0] - 2025-07-09

### Added
- **セキュリティ機能**: Claude Code hooks による危険なコマンドブロック機能
- **Deny List**: システム破壊的コマンド・外部コード実行・権限昇格の自動ブロック
- **Allow List**: 開発に必要な安全なコマンドの事前許可システム
- **セキュリティスクリプト**: `.claude/scripts/deny-check.sh` と `.claude/scripts/allow-check.sh`
- **セキュリティテスト**: 自動テストスクリプト `.claude/scripts/test-security.sh`
- **セキュリティログ**: 実行コマンドの監査ログ機能
- **ドキュメント**: セキュリティ設定の詳細説明 `.claude/security-README.md`

### Security
- 危険なコマンドパターン（`rm -rf /`, `chmod 777`, `curl | sh`等）の自動検知・ブロック
- 開発用コマンド（`git`, `npm`, `python`, `eza`等）の安全な許可設定
- hooks設定による PreToolUse イベントでのリアルタイム監視
- セキュリティログによる実行履歴追跡

### Enhanced
- `.claude/settings.json` にセキュリティ設定を統合
- プロジェクトテンプレートのセキュリティ強化
- 開発効率を保ちながらセキュリティを向上

## [1.0.0] - 2025-06-22

### Added
- 汎用的開発テンプレート（言語・技術スタック非依存）
- Anthropicベストプラクティス統合
- 階層化Memory Bankシステム（core/context/archive構造）
- 軽量コマンドセット（基本4個+専門化3個）
- 開発規約（パッケージ管理・コード品質・Git/PR規約）
- 実行コマンド一覧（`[tool]`記法で言語非依存）
- エラー対応ガイド（問題解決順序・ベストプラクティス）
- 品質ゲート（段階別チェックリスト・自動化レベル分類）
- Git操作パターン・学習ログテンプレート
- タグ検索システム（#urgent #bug #feature #completed）

### Features
- 日次3分更新でMemory Bank維持
- コンテキスト使用量最小化
- 個人開発〜中規模プロジェクト対応
- AI主導開発フロー支援

### Initial Release
個人開発者向けの効率的なClaude Code開発テンプレートとして初回リリース
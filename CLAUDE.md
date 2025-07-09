# [プロジェクト名]

## プロジェクト概要
[プロジェクトの簡潔な説明をここに記載]

## プロンプトキャッシュ最適化設定

### 環境設定
- **CLAUDE_CACHE**: `./.ccache` - プロジェクト固有キャッシュで90%コスト削減・85%レイテンシ短縮
- **cache_control**: 長期安定情報（overview.md, templates.md, tech.md, debt.md, requirements.md）に適用済み
- **キャッシュ効果**: 同一プロンプト再利用時のトークン課金大幅削減

### 設定ファイル
```json
// .claude/settings.json
{
  "env": {
    "CLAUDE_CACHE": "./.ccache"
  }
}
```

### .gitignore設定
```gitignore
.ccache/**
*.cache
```

## Memory Bank構造（軽量化済み）
このプロジェクトでは効率的な階層化Memory Bankシステムを使用しています：

### コア（常時参照）
- 現在の状況: @.claude/core/current.md
- 次のアクション: @.claude/core/next.md
- プロジェクト概要: @.claude/core/overview.md
- クイックテンプレート: @.claude/core/templates.md

### コンテキスト（必要時参照）
- 技術詳細: @.claude/context/tech.md
- 履歴・決定事項: @.claude/context/history.md
- 技術負債トラッキング: @.claude/context/debt.md

### その他
- デバッグ情報: @.claude/debug/latest.md
- カスタムコマンド: @.claude/commands/
- セキュリティスクリプト: @.claude/scripts/
- アーカイブ: @.claude/archive/

## カスタムコマンド

### 基本コマンド
| コマンド | 用途 | 所要時間 |
|---------|----- |-----------|
| `/project:plan` | 作業計画立案 | 5分 |
| `/project:act` | 計画に基づく実装実行 | 実装時間 |
| `/project:focus` | 現在タスクに集中 | 即座 |
| `/project:daily` | 日次振り返り | 3分 |

### 専門化モード
| コマンド | 用途 | 参照ファイル |
|---------|----- |-------------|
| `/debug:start` | デバッグ特化モード | current.md + tech.md + debug/latest.md |
| `/feature:plan` | 新機能設計モード | overview.md + next.md + 要件定義 |
| `/review:check` | コードレビューモード | history.md + チェックリスト |

### タグ検索
- タグ形式: `#tag_name` でMemory Bank内検索
- 主要タグ: #urgent #bug #feature #completed

## Hooks システム

### セキュリティ・品質向上・活動追跡の自動化
- **セキュリティ**: 危険コマンド（`rm -rf /`, `chmod 777`等）の自動ブロック
- **自動フォーマット**: ファイル編集後のコード整形（Python/JS/TS/Rust/Go/JSON対応）
- **活動ログ**: 開発活動の自動記録・メトリクス収集
- **セッション管理**: 作業終了時の自動サマリー・Git状況記録

### Hooks確認・テスト
```bash
# 全hooks機能テスト
.claude/scripts/test-hooks.sh

# セキュリティ機能のみテスト
.claude/scripts/test-security.sh

# 活動ログ確認
tail -f ~/.claude/activity.log
```

詳細設定: @.claude/hooks-README.md | @.claude/security-README.md

## 開発規約（要点）

### パッケージ管理
- **統一原則**: プロジェクトごとに1つのツール（npm/yarn/pnpm, pip/poetry/uv等）
- **基本コマンド**: `[tool] add/remove/run` 形式を使用
- **禁止事項**: 混在使用、`@latest`構文、グローバルインストール

### コード品質
- **型注釈**: 全関数・変数に必須
- **テスト**: 重要機能は80%以上カバレッジ、TDD推奨（段階的習得可）
- **フォーマット**: `[tool] run format/lint/typecheck` で品質チェック

### Git規約
- **コミット形式**: `[prefix]: [変更内容]` （feat/fix/docs/test等）
- **品質ゲート**: コミット前に `[tool] run check` 実行必須
- **PR**: セルフレビュー→レビュアー指定→マージ

詳細規約: @docs/development-rules.md

## ADR・技術負債システム

### ADR（Architecture Decision Record）
- **テンプレート**: @docs/adr/template.md
- **運用**: 技術選択・アーキテクチャ決定時に記録
- **連携**: 負債ログ・履歴管理と統合

### 技術負債トラッキング
- **負債ログ**: @.claude/context/debt.md
- **優先度管理**: 高🔥 / 中⚠️ / 低📝
- **運用**: 新機能開発時の事前予測、スプリント終了時の整理

## データファイル
[プロジェクトで使用するデータファイルのパスを記載]
- 例: `data/input.csv` - 入力データ
- 例: `config/settings.json` - 設定ファイル

## 要求仕様書
詳細な要求仕様は以下を参照：
@docs/requirements.md

## プロジェクト固有の学習
プロジェクト固有の知見は`.clauderules`ファイルに記録されます。

## Memory Bank使用方針
- **通常時**: coreファイルのみ参照でコンテキスト使用量を最小化
- **詳細必要時**: contextファイルを明示的に指定
- **定期整理**: 古い情報をarchiveに移動してパフォーマンス維持

## 関連ドキュメント
- 開発規約詳細: @docs/development-rules.md
- Hooksシステム: @.claude/hooks-README.md
- セキュリティ設定: @.claude/security-README.md
- 要求仕様書: @docs/requirements.md
- ADRテンプレート: @docs/adr/template.md
- 移行ガイド: @memo/migration-guide.md
- 導入手順書: @memo/zero-to-memory-bank.md
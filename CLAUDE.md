# [プロジェクト名]

## プロジェクト概要
[プロジェクトの簡潔な説明をここに記載]

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

### アーカイブ（定期整理）
- 完了済み情報: @.claude/archive/

## カスタムコマンド

### 基本コマンド
- `/project:plan` - 効率的な作業計画立案
- `/project:act` - 計画に基づいて実装を実行
- `/project:update-memory` - Memory Bank差分更新
- `/project:focus` - 現在のタスクのみ表示（軽量）
- `/project:daily` - 日次軽量更新（3分以内）
- `/project:compress` - Memory Bank圧縮・アーカイブ

### Quick Modes（専門化モード）
- `/debug:start` - デバッグ特化モード（current.md + tech.md + エラー調査）
- `/feature:plan` - 新機能設計モード（overview.md + next.md + 要件定義）
- `/review:check` - コードレビューモード（history.md + チェックリスト）
- `/deploy:prep` - デプロイ準備モード（tech.md + リリース確認）

### タグ検索
- タグ形式: `#tag_name` でメモリバンク内検索
- 主要タグ: #urgent #bug #feature #tech #completed #blocked

## 開発規約
[プロジェクト固有の開発規約をここに記載]
- 例: コーディング規約
- 例: コミットメッセージ規約
- 例: レビュープロセス

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
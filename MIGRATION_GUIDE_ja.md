# Claude File Template v1.2.0 移行ガイド

このガイドは、以前のバージョンから v1.2.0 への移行方法を説明します。

## 🚨 破壊的変更

### 1. CLAUDE.md の大幅な簡素化
- **変更前**: 367行の詳細な設定
- **変更後**: 65行のコンパクトな設定
- **対応**: 詳細情報は `@.claude/guidelines/` に移動しました

### 2. 削除されたファイル/ディレクトリ
以下の要素が削除されました：

#### 削除されたコマンド
- `.claude/commands/compress.md` → 不要（一時的用途）
- `.claude/commands/deploy-prep.md` → CI/CDで自動化推奨
- `.claude/commands/monthly.md` → 使用頻度が低い
- `.claude/commands/update-memory.md` → 自動化推奨
- `.claude/commands/health.md` → `/project:daily` に統合

#### 削除された構造
- `PROJECT_MEMORY.md` → `.claude/context/history.md` で代替
- `.claude/evolution/` → 過度な構造化のため削除
- `.claude/agents/` → 時期尚早のため削除

### 3. ガイドラインの統合
旧ファイル → 新ファイルのマッピング：

| 旧ファイル | 新ファイル |
|-----------|-----------|
| `development.md` | `development.md` |
| `error-handling.md` | `development.md` に統合 |
| `quality-gates.md` | `development.md` に統合 |
| `git-conventions.md` | `git-workflow.md` に統合 |
| `adr-system.md` | `git-workflow.md` に統合 |
| `testing.md` | `testing-quality.md` に統合 |
| `debt-tracking.md` | `testing-quality.md` に統合 |

## 🔧 移行手順

### ステップ 1: バックアップ
```bash
# 現在の設定をバックアップ
cp -r .claude .claude_backup
cp CLAUDE.md CLAUDE_backup.md
```

### ステップ 2: 新バージョンの適用
```bash
# 最新バージョンを取得
git pull origin main

# または手動でファイルを更新
```

### ステップ 3: カスタマイズの移行

#### PROJECT_MEMORY.md を使用していた場合
1. 内容を `.claude/context/history.md` に移動
2. 「設計の理由」セクションを history.md の「重要な決定事項」に追加
3. 「学習ログ」を history.md の「振り返りログ」に追加

#### hooks.yaml のカスタマイズ
evolution/ ディレクトリへの参照を更新：
```yaml
# 変更前
echo "..." >> .claude/evolution/changes.log

# 変更後（必要な場合）
echo "..." >> .claude/logs/changes.log  # logsディレクトリを作成
```

### ステップ 4: AI Logger の有効化（オプション）
```bash
# 設定ファイルの確認
cat .claude/settings.json

# AI Logger が hooks に含まれていることを確認
# "command": ".claude/scripts/ai-logger.sh" が存在するか確認

# テスト実行
echo "Test file" > test.txt
rm test.txt

# AI ログの確認
ls -la ~/.claude/ai-activity.jsonl
```

### ステップ 5: 検証
```bash
# ファイル構造の確認
find .claude -type f -name "*.md" | sort

# CLAUDE.md の確認
cat CLAUDE.md
```

## 📋 チェックリスト

移行完了の確認：
- [ ] CLAUDE.md が新しい簡素化版になっている
- [ ] `.claude/guidelines/` に3つのファイルがある
- [ ] `.claude/commands/` に7つのファイルがある
- [ ] カスタムコマンドが正常に動作する
- [ ] hooks.yaml のパスが更新されている

## 🆕 新機能

### AI-Friendly Logger（v1.2.0 - Vibe Logger概念採用）
**新規追加ファイル**:
- `.claude/scripts/ai-logger.sh` - 構造化ログ生成スクリプト
- `.claude/scripts/analyze-ai-logs.py` - AIログ解析ツール
- `.claude/ai-logger-README.md` - 詳細ドキュメント

**主な機能**:
- 構造化JSON形式でAI分析に最適化されたログ
- プロジェクト・環境・Git情報の自動収集
- AIメタデータ（デバッグヒント・優先度・推奨アクション）
- エラーパターン分析とAI向け洞察生成
- 既存の活動ログシステムと並行動作

**インスピレーション**: [Vibe Logger](https://github.com/fladdict/vibe-logger) by @fladdict

### セキュアな Bash 設定
`.claude/settings.local.json` に安全な実行権限が追加されました：
- 危険なコマンドの拒否リスト
- 許可されたコマンドのホワイトリスト
- 実行前のセキュリティチェック

### 統合されたガイドライン
- 開発に関する情報が1ファイルに集約
- Git/ADR関連が1ファイルに統合
- テスト/品質/技術負債が1ファイルに統合

## ❓ トラブルシューティング

### Q: 以前のコマンドが見つからない
A: 以下の対応表を確認してください：
- `/health` → `/project:daily` の健康診断機能を使用
- 月次タスク → 手動で実行するか、カレンダーリマインダーを設定

### Q: PROJECT_MEMORY.md への参照エラー
A: すべての参照を `.claude/context/history.md` に更新してください

### Q: ファイルが多すぎて混乱している
A: 不要なバックアップファイルを削除：
```bash
rm -rf .claude_backup CLAUDE_backup.md
```

## 📞 サポート

問題が発生した場合は、GitHubのIssueで報告してください：
https://github.com/sougetuOte/claude-file-template/issues

---

**注意**: この移行により、プロジェクトの管理がよりシンプルで効率的になります。一時的な手間はありますが、長期的なメリットは大きいです。
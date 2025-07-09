# Claude Code セキュリティ設定

このプロジェクトには、Claude Codeの安全な利用のためのセキュリティ設定が実装されています。

## 実装内容

### 1. Deny List（拒否リスト）
危険なコマンドを自動的にブロックする仕組みです。

**ブロック対象のコマンド:**
- システム破壊的コマンド（`rm -rf /`, `chmod 777`等）
- 外部コードの実行（`curl | sh`, `wget | bash`等）
- 設定変更（`git config --global`, `npm config set`等）
- 権限昇格（`sudo`, `su`等）
- 危険なファイル操作（`shred`, `dd if=/dev/zero`等）

### 2. Allow List（許可リスト）
頻繁に使用される安全なコマンドを事前に許可する仕組みです。

**許可対象のコマンド:**
- 基本的なファイル操作（`ls`, `cat`, `mkdir`等）
- Git操作（`git status`, `git add`, `git commit`等）
- 開発ツール（`npm run`, `python`, `pip install`等）
- 現代的CLIツール（`eza`, `batcat`, `rg`, `fd`等）

### 3. ファイル構成

```
.claude/
├── settings.json          # メインの設定ファイル
├── scripts/
│   ├── deny-check.sh     # 拒否リストチェッカー
│   └── allow-check.sh    # 許可リストチェッカー
└── security-README.md    # このファイル
```

## セキュリティログ

実行されたコマンドは `~/.claude/security.log` に記録されます：

```
[2024-01-01 12:00:00] BLOCKED: rm -rf / (matched: rm -rf /)
[2024-01-01 12:01:00] ALLOWED: git status
[2024-01-01 12:02:00] DENIED: custom-command (no matching allow pattern)
```

## 設定の修正

### 許可リストに追加する場合
1. `.claude/scripts/allow-check.sh` の `ALLOWED_PATTERNS` に追加
2. 必要に応じて `.claude/settings.json` の `permissions.allow` に追加

### 拒否リストに追加する場合
1. `.claude/scripts/deny-check.sh` の `DANGEROUS_PATTERNS` に追加
2. 必要に応じて `.claude/settings.json` の `permissions.deny` に追加

## 緊急時の対応

セキュリティ設定が問題を起こした場合：

1. **一時的に無効化**
   ```bash
   mv .claude/settings.json .claude/settings.json.backup
   ```

2. **ログを確認**
   ```bash
   tail -f ~/.claude/security.log
   ```

3. **設定を復元**
   ```bash
   mv .claude/settings.json.backup .claude/settings.json
   ```

## 注意事項

- **設定変更前**: 必ずバックアップを取ること
- **テスト**: 本番環境で使用前に十分なテストを行うこと
- **監視**: セキュリティログを定期的に確認すること
- **更新**: 脅威情報に応じて定期的に設定を更新すること

## サポート

設定に問題がある場合は、プロジェクトの管理者に連絡してください。

---

**最終更新**: 2024-07-09  
**バージョン**: 1.0.0
# Git ワークフロー & ADR

## Git/PR規約

### コミットメッセージ

#### 基本形式
`[prefix]: [変更内容]`

#### prefix一覧
- `feat`: 新機能追加
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `style`: フォーマット・空白等（動作変更なし）
- `refactor`: リファクタリング（機能変更なし）
- `test`: テスト追加・修正
- `chore`: ビルド・依存関係・設定変更

#### 必須トレーラー
```bash
# バグ報告ベースの修正
git commit -m "fix: resolve memory leak in data processor" --trailer "Reported-by: Username"

# GitHub Issue関連
git commit -m "feat: add user authentication" --trailer "Github-Issue: #123"
```

### Pull Request規約
- **タイトル**: コミットメッセージと同様の形式
- **説明要件**:
  - **背景**: なぜこの変更が必要か
  - **変更内容**: 何を変更したか（高レベル）
  - **影響範囲**: どこに影響するか
  - **テスト**: どのようにテストしたか

### レビュー
- 適切なレビュアーを指定
- セルフレビューを先に実施
- `Co-authored-by` 等のツール言及禁止

## ADR（Architecture Decision Record）

### 基本運用
- **テンプレート**: @docs/adr/template.md
- **新規ADR作成**: `claude adr new "決定内容"`で雛形生成
- **連番**: ADR-001, ADR-002...で管理
- **ステータス**: Proposed → Accepted → Deprecated/Superseded

### 記録すべき決定
- 技術スタック選択（フレームワーク、ライブラリ等）
- アーキテクチャ設計（データベース、API設計等）
- セキュリティ方針（認証、暗号化等）
- パフォーマンス最適化手法
- デプロイメント戦略

### 連携システム
- **負債ログ**: @.claude/context/debt.mdで技術的影響追跡
- **履歴管理**: @.claude/context/history.mdで決定経緯記録
- **GitHub Integration**: Issue番号と連携したPR作成
# Development Guidelines

## 1. Package Management
- **Unified Tool**: npm統一使用（FocusFlowプロジェクト）
- **Installation**: `npm install package-name` 形式
- **Execution**: `npm run command` 形式
- **Prohibited Practices**: 
  - Mixed usage (using multiple package managers together)
  - Using `@latest` syntax (version pinning recommended)
  - Global installation (keep everything within project)

## 2. Code Quality Standards
- **Type Annotations**: 全ての関数・変数に型情報を追加（TypeScript）
- **Documentation**: パブリックAPIと複雑な処理に必須
- **Function Design**: 単一責任の原則、小さな関数を目指す
- **Existing Patterns**: 既存のコードパターンに従う
- **Line Length**: 80-120文字（言語・チーム統一）

## 2.1 TDD (Test-Driven Development)
- **ビジネスロジック開発**: 必ずt-wadaのTDDスタイルで進行
- **TDDサイクル**: Red（失敗テスト作成） → Green（実装） → Refactor（リファクタリング）
- **テストファースト**: 実装前に必ずテストを作成
- **単体テスト**: Jest + React Testing Library使用

## 2.2 コンポーネント開発
- **モックアップ必須**: コンポーネント作成時は必ず`mockup/component-sandbox.html`にモックアップ配置
- **段階的開発**: モックアップ → コンポーネント実装 → 統合テスト
- **視覚確認**: 実装前にモックアップで視覚的確認

## 3. FocusFlow Command List

### Daily Development Flow
```bash
# 作業開始
git pull origin main
npm install                      # 依存関係更新確認
npm run dev                      # 開発サーバー起動

# 開発中（定期実行）
npm run typecheck               # TypeScript型チェック
npm run test:watch              # テスト連続実行

# 機能完成時
npm run format                  # Prettier実行
npm run lint                    # ESLint実行
npm run test                    # 全テスト実行
npm run build                   # プロダクションビルド確認

# コミット前
npm run check                   # 総合品質チェック
```

### Weekly Quality Review
```bash
# 毎週実行推奨
npm audit                       # セキュリティ脆弱性チェック
npm outdated                    # 依存関係更新確認
npm run preview                 # PWAプレビュー起動
```

### PWA Specific Commands
```bash
# PWA関連
npm run build                   # PWAビルド
npm run preview                 # PWAプレビュー
npm run lighthouse              # Lighthouse監査（追加予定）
```

### Package Management
```bash
npm install package-name         # 依存関係追加
npm uninstall package-name      # 依存関係削除
npm update                      # 全依存関係更新
```

## 4. Error Handling Guide

### Standard Problem-Solving Order（FocusFlow）
1. **Format Errors** → `npm run format`
2. **Type Errors** → `npm run typecheck`
3. **Lint Errors** → `npm run lint`
4. **Test Errors** → `npm run test`
5. **Build Errors** → `npm run build`

### Common Problems and Solutions
- **Line length errors**: 適切な場所で改行
- **Import order**: ESLintの自動修正を使用
- **Type errors**: 明示的な型注釈を追加
- **PWA build errors**: Service Worker設定確認

## 5. Quality Gates

### Pre-commit Checklist（FocusFlow）
- [ ] `npm run format` - Prettierフォーマット適用
- [ ] `npm run lint` - ESLint警告解決
- [ ] `npm run typecheck` - TypeScript型チェック通過
- [ ] `npm run test` - 全テスト通過
- [ ] `git status` - 意図しないファイル変更確認

### Weekly Quality Review Checklist
- [ ] `npm audit` - セキュリティ脆弱性チェック
- [ ] `npm outdated` - 依存関係更新確認
- [ ] `npm run build` - プロダクションビルド確認
- [ ] Chrome DevTools Lighthouse監査（90+点維持）

### CI/CD Automation
- Code formatting (Prettier)
- Lint checks (ESLint)
- Type checks (TypeScript)
- Unit test execution (Jest/React Testing Library)
- PWA build verification

## 6. Development Workflow Integration

### Feature Development Process
```bash
# 1. 新機能開発開始
git checkout -b feature/focus-mode
npm run dev

# 2. TDD開発サイクル（ビジネスロジック）
# - Red: 失敗テスト作成
# - Green: 最小限の実装
# - Refactor: コード改善
npm run test:watch

# 3. コンポーネント開発サイクル
# - mockup/component-sandbox.htmlにモックアップ作成
# - コンポーネント実装
# - 統合テスト実行

# 4. 品質チェック
npm run check

# 5. コミット・PR作成
git add .
git commit -m "feat: implement focus mode with notification control"
git push origin feature/focus-mode
```

### Performance Monitoring
```bash
# 定期実行推奨
npm run build                   # バンドルサイズ確認
npm run preview                 # PWAプレビュー
# Chrome DevToolsでLighthouse実行
```

**詳細なベストプラクティス**: @docs/best-practices.md参照

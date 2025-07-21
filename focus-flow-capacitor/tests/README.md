# Playwright レイアウト回帰テストシステム

Focus-Flowの視覚的レイアウトバグを自動検出するためのPlaywrightベースのテストシステムです。

## 🎯 目的

- **レイアウトバグの早期発見**: はみ出し、色異常、重なり、アライメント等
- **レスポンシブ対応の検証**: デスクトップ・タブレット・モバイル対応
- **視覚回帰の防止**: コード変更によるUI崩れの自動検出
- **開発効率向上**: 手動テストの自動化

## 📦 セットアップ

### 1. 依存関係インストール

```bash
# Playwright本体
npm install --save-dev @playwright/test

# ブラウザインストール
npx playwright install chromium
```

### 2. 開発サーバー起動

```bash
# テスト実行前に必須
npm run dev
```

## 🚀 テスト実行

### 基本コマンド

```bash
# 全てのレイアウトテスト実行
npm run test:e2e

# ビジュアル回帰テストのみ
npm run test:visual

# ヘッド付きモード（ブラウザ表示）
npm run test:e2e:headed

# テストUI（推奨：初回確認時）
npm run test:e2e:ui
```

### スクリーンショット管理

```bash
# 新しいベースライン作成（初回または意図的な変更時）
npm run test:visual:update

# 特定のテストのスクリーンショット更新
npx playwright test tests/layout-basic.spec.ts --update-snapshots
```

## 📁 テストファイル構成

```
tests/
├── layout-basic.spec.ts          # 基本レイアウト回帰テスト
├── layout-visual-regression.spec.ts  # 詳細ビジュアル検証
├── README.md                     # このファイル
└── layout-basic.spec.ts-snapshots/   # スクリーンショットベースライン
    ├── baseline-desktop-linux.png
    ├── baseline-tablet-linux.png
    ├── baseline-mobile-linux.png
    ├── task-creation-01-initial-linux.png
    ├── task-creation-02-input-linux.png
    ├── task-creation-03-added-linux.png
    └── overflow-test-long-title-linux.png
```

## 🔍 テストカテゴリ

### 📸 ベースラインスクリーンショット
各ブレークポイントでの基本レイアウトキャプチャ
- デスクトップ (1200×800): 30%-45%-25% CSS Grid
- タブレット (900×600): 30%-70% Flexbox
- モバイル (375×667): 縦積みレイアウト

### 🔍 主要エリア個別キャプチャ
- Tasks Sidebar
- Memo Area  
- Tab Area (デスクトップのみ)

### 🎯 インタラクション時のキャプチャ
- タスク作成フロー（初期状態→入力中→追加完了）
- タスク操作（通常→完了）
- ConfirmDialog表示

### 🚨 レイアウト異常検出
- オーバーフロー問題（長いタイトル）
- 色・スタイル異常
- ブレークポイント境界での動作

### 📱 レスポンシブ変化
- デスクトップ→タブレット→モバイルの遷移
- ブレークポイント境界値での動作確認

## ⚙️ 設定ファイル

### playwright.config.ts
- ブラウザ設定: Chromium（デスクトップ・タブレット・モバイル）
- スクリーンショット比較閾値: 0.2%（厳格）
- アニメーション無効化: 一貫性確保
- 開発サーバー自動起動

### package.json scripts
- `test:e2e`: 全E2Eテスト
- `test:visual`: ビジュアル回帰のみ
- `test:visual:update`: ベースライン更新

## 🐛 トラブルシューティング

### よくある問題

#### 1. スクリーンショット差異エラー
```bash
# 意図的な変更の場合
npm run test:visual:update

# 差分確認
npx playwright show-report
```

#### 2. 開発サーバー接続エラー
```bash
# サーバー起動確認
npm run dev

# ポート確認
lsof -i :5174
```

#### 3. テスト実行速度が遅い
```bash
# 並列実行無効の場合（スクリーンショット一貫性のため）
# workers: 1 設定を確認
```

### データ-testid要素が見つからない
以下の要素に適切なdata-testid属性が設定されているか確認：
- `[data-testid="task-form"]` - AddTaskForm
- `[data-testid="task-title-input"]` - タスクタイトル入力
- `[data-testid="add-task-button"]` - 追加ボタン
- `[data-testid="daily-memo"]` - DailyMemoコンポーネント
- `[data-testid^="task-item-"]` - TaskItem（動的ID）

## 📊 CI/CD統合

### GitHub Actions例

```yaml
name: Visual Regression Tests

on: [push, pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install chromium
      
      - name: Run visual regression tests
        run: npm run test:visual
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🎯 ベストプラクティス

### テスト作成時
1. **data-testid使用**: CSS classではなくdata-testid属性を使用
2. **アニメーション無効化**: 一貫性のあるスクリーンショットのため
3. **待機時間設定**: DOM更新やレイアウト安定化の適切な待機
4. **ビューポート固定**: テスト間でのビューポート一貫性

### ベースライン管理
1. **意図的な変更時のみ更新**: デザイン変更時にのみ`--update-snapshots`実行
2. **レビュー必須**: スクリーンショット変更は必ずレビュー
3. **バージョン管理**: ベースラインファイルもGitで管理

### パフォーマンス
1. **並列実行制限**: スクリーンショット一貫性のためworkers=1
2. **ヘッドレス実行**: CI環境ではheadless: true
3. **必要最小限のテスト**: レイアウト変更時のみ実行

## 🔄 運用フロー

### 1. 開発時
```bash
# UI変更を実装
# ↓
npm run test:visual
# ↓
# 差異がある場合: 意図的な変更かチェック
# ↓
# 意図的な場合: npm run test:visual:update
```

### 2. PR時
```bash
# CI/CDで自動実行
# ↓
# 失敗時: レイアウト回帰の可能性
# ↓
# スクリーンショット差分を確認
# ↓
# 修正またはベースライン更新
```

### 3. 本番デプロイ前
```bash
# 全テスト実行
npm run test:all
# ↓
# レイアウト品質確認完了
# ↓
# デプロイ実行
```

これで、レイアウトバグを見逃すリスクを大幅に削減し、安定したUI品質を維持できます。
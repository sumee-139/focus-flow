# 開発ノウハウ (Development Know-How)

このディレクトリは、本プロジェクトにおける開発上のベストプラクティス、アンチパターン、トラブルシューティングなどのノウハウを集約する場所です。

## 1. ベストプラクティス (Best Practices)

開発を進める上での推奨事項やコーディングスタイルです。

- **[Development Best Practices](../../../docs/development/best-practices.md)**

## 2. アンチパターン (Anti-Patterns)

避けるべき設計やコードの例です。現在、このセクションは [Development Best Practices](../../../docs/development/best-practices.md) の中に含まれています。

## 3. トラブルシューティング (Troubleshooting)

### 3.1. トラブルシューティングガイド (Official Guide)

比較的安定した、公式のトラブルシューティング情報です。

- **[Capacitor Troubleshooting Guide](../../../focus-flow-capacitor/TROUBLESHOOTING.md)**

### 3.2. 開発バグメモ (Live Bug Memos)

開発中に遭遇した個別のバグやエラーを記録する、日々更新されるメモです。

- **[Bug Memos](./troubleshooting/bug-memos.md)**

## 4. Builder実装ガイド (Implementation Guides)

Builderエージェントが実際の開発で発見したベストプラクティスと解決手法です。

### 4.1. タイムゾーン・日付処理
- **[T006 UTC/JST時差問題修正 - ベストプラクティス](./t006-timezone-best-practices.md)**
  - TDD手法によるタイムゾーン処理の確実な実装
  - 境界条件テストの重要性とテクニック
  - E2Eテストでの日付検証手法

### 4.2. プロダクション品質管理
- **[プロダクション環境でのログ制御](./troubleshooting/console-log-production-fix.md)**
  - デバッグログ残存問題の特定と解決
  - 環境別ログレベル制御の実装パターン
  - ESLint rule活用によるログ品質管理

### 4.3. React Hooks
- **[React `useEffect` 利用ガイドライン](./useEffect_guide.md)**
  - `useEffect`の機能、副作用の適切な管理方法
  - `useEffect`を避けるべきケースと代替アプローチ

## 5. コード例 (Code Examples)

具体的な実装の参考となるコードスニペットです。

- **タイムゾーン処理**: [t006-timezone-best-practices.md](./t006-timezone-best-practices.md)内に実装例あり
- **ログ制御システム**: [console-log-production-fix.md](./troubleshooting/console-log-production-fix.md)内に実装例あり

---

*新しいノウハウを追加する場合は、この`README.md`を更新し、関連ドキュメントへのリンクを追加するか、新しいファイルを作成してください。*

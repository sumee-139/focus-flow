# ADR-0001: Capacitor統一アーキテクチャの採用

Date: 2025-07-18  
Status: Accepted  
Deciders: Development Team

## Context and Background

FocusFlowプロジェクトにおいて、**OSレベル通知制御**がPhase 1の最重要要件として定義された。特に「通知を制御できなければFocusFlowの優位性はほぼない」という判断のもと、以下の技術的課題を解決する必要があった：

1. **クロスプラットフォーム対応**: Web、Desktop、Mobileの統一体験
2. **OSレベル通知制御**: Do Not Disturb/Focus Mode設定中でも通知表示
3. **開発効率**: 複数プラットフォーム向け重複実装の回避
4. **保守性**: 単一コードベースでの長期保守

## Options Considered

### Option 1: PWA（Progressive Web App）
- **Overview**: Pure Web技術によるクロスプラットフォーム対応
- **Pros**: 
  - 開発効率が高い
  - 単一コードベースで全プラットフォーム対応
  - 軽量で高速な開発サイクル
- **Cons**: 
  - OSレベル通知制御が不可能
  - ネイティブAPI制限が多い
  - iOSでのPWA制限

### Option 2: Electron + Flutter別開発
- **Overview**: Desktop用Electron、Mobile用Flutter別々開発
- **Pros**: 
  - 各プラットフォーム最適化
  - 豊富なネイティブAPI対応
  - 高いパフォーマンス
- **Cons**: 
  - 重複実装によるコスト増
  - 保守性の問題
  - UI/UX統一の困難

### Option 3: Flutter Desktop統一
- **Overview**: Flutter DesktopとFlutter Mobileによる統一
- **Pros**: 
  - 単一コードベースで全プラットフォーム
  - 高いパフォーマンス
  - 豊富なネイティブAPI
- **Cons**: 
  - Dart言語学習コスト
  - Web対応の困難
  - エコシステムの制限

### Option 4: Capacitor統一アーキテクチャ
- **Overview**: Web Core + Native Platform Wrappersによる統一
- **Pros**: 
  - 単一コードベースでWeb/Desktop/Mobile対応
  - 既存Web技術（React/TypeScript）活用
  - ネイティブAPI（通知制御）にアクセス可能
  - 段階的ネイティブ化が可能
- **Cons**: 
  - WebViewベースのパフォーマンス制限
  - プラットフォーム固有の最適化困難
  - Capacitorエコシステムへの依存

## Decision

**Choice**: Capacitor統一アーキテクチャ

**Reasons**: 
- **OSレベル通知制御の実証**: Android 16 Pixel 6aでのCritical Alert機能動作確認
- **開発効率の最大化**: React + TypeScriptの既存スキルを活用
- **段階的進化**: Web → Native機能の段階的追加が可能
- **技術的実現性**: 実機テストで通知制御機能の完全動作を確認

## Consequences

### Positive Consequences
- **単一コードベース**: 開発・保守コストの大幅削減
- **既存スキル活用**: React/TypeScript経験を最大化
- **段階的実装**: Web版 → Desktop版 → Mobile版の順次展開
- **通知制御実証**: FocusFlowの優位性核心機能が動作確認済み

### Negative Consequences/Risks
- **パフォーマンス制限**: WebViewベースによる潜在的な性能問題
- **プラットフォーム制約**: 一部ネイティブ機能への制限
- **Capacitor依存**: エコシステムの変更リスク

### Technical Impact
- **技術スタック**: React + TypeScript + Capacitor + Vite
- **ビルドシステム**: Web（Vite）→ Android（Gradle）→ iOS（Xcode）
- **パフォーマンス**: Web級の応答性、ネイティブ級の通知制御

## Implementation Plan

- [x] Capacitor開発環境構築
- [x] Android APKビルド成功
- [x] OSレベル通知制御実証（Android 16 Pixel 6a）
- [x] 実機テスト完了
- [ ] iOS版実装と検証
- [ ] Desktop版実装（Electron Capacitor）
- [ ] UI/UX最適化とレスポンシブ対応

## Follow-up

- **Review Schedule**: Phase 2完了時（2025-08-18）
- **Success Metrics**: 
  - 通知制御機能の全プラットフォーム動作
  - 開発効率30%向上（単一コードベース効果）
  - Lighthouse Score 90+点維持
- **Related Issues**: OS-level notification control requirement

## References

- [Capacitor Official Documentation](https://capacitorjs.com/)
- [Local Notifications Plugin](https://capacitorjs.com/docs/apis/local-notifications)
- Android Critical Notifications Implementation
- FocusFlow Design Philosophy: 通知制御の重要性
- 実機検証結果: Android 16 Pixel 6a完全動作確認

---

**Note**: この決定はFocusFlowの技術的実現可能性を実証した重要な選択である。通知制御機能の完全動作により、プロジェクトの核心価値が技術的に保証された。
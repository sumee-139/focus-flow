# ADR-001: デスクトップアプリフレームワーク選定

Date: 2025-07-15  
Status: Accepted  
Deciders: Development Team

## Context and Background

FocusFlowのPhase1では、OSレベル通知制御機能が必須要件となっている。「その日必ず着手するタスク」に集中するため、フォーカスモード中はシステム通知を完全に遮断する必要がある。

## Options Considered

### Option 1: Electron
- **Overview**: Chromium + Node.js ベースのデスクトップアプリフレームワーク
- **Pros**: 
  - OSレベル通知制御の完全対応
  - Windows/macOS/Linux全対応
  - TypeScript + React完全統合
  - 豊富なドキュメント・コミュニティ
- **Cons**: 
  - 重い・メモリ消費大
  - パフォーマンス劣化
  - 配布サイズ大

### Option 2: Tauri
- **Overview**: Rust + WebView ベースの軽量デスクトップアプリフレームワーク
- **Pros**: 
  - 軽量・高パフォーマンス
  - 小さい配布サイズ
  - セキュリティ重視
- **Cons**: 
  - 通知制御APIが限定的
  - 新しい技術・学習コスト高
  - ドキュメント不足

### Option 3: PWA + 代替手段
- **Overview**: Progressive Web App + ブラウザ通知制御
- **Pros**: 
  - 開発効率・保守性最高
  - クロスプラットフォーム対応
  - 配布・更新が簡単
- **Cons**: 
  - OSレベル通知制御不可
  - Phase1必須要件を満たさない
  - ブラウザ制限あり

## Decision

**Choice**: Electron

**Reasons**: 
- OSレベル通知制御の完全対応が最優先
- Phase1必須要件を確実に満たす
- TypeScript + React統合による開発効率
- 実装工数3-4日で現実的

## Consequences

### Positive Consequences
- フォーカスモード中の完全な通知遮断実現
- Windows/macOS/Linux対応による幅広いユーザー獲得
- 豊富なドキュメントによる開発効率向上

### Negative Consequences/Risks
- メモリ消費・パフォーマンス影響
- 配布サイズ増加
- 軽量性というFocusFlowの理念との乖離

### Technical Impact
- デスクトップアプリとしての配布必要
- PWA要件の見直し必要
- パフォーマンス最適化の継続的対応

## Implementation Plan

- [x] Electron技術選定完了
- [ ] Electron開発環境セットアップ
- [ ] OSレベル通知制御プロトタイプ作成
- [ ] TypeScript + React統合確認
- [ ] フォーカスモード基本機能実装

## Follow-up

- **Review Schedule**: Phase1完了時（2025-07-21）
- **Success Metrics**: OSレベル通知制御機能の動作確認
- **Related Issues**: パフォーマンス最適化、配布戦略

## References

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Notification API](https://www.electronjs.org/docs/api/notification)
- [FocusFlow Design Philosophy](../core/design-philosophy.md)

---

**Note**: この決定はPhase1の必須要件であるOSレベル通知制御を実現するために行われた。パフォーマンス問題については継続的な最適化で対応する。
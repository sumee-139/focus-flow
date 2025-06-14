# Quick Templates
tags: #templates #quick #modes

## Quick Modes (GitHub Copilot Agents風)
### `/debug:start` - デバッグ特化モード
**参照ファイル**: current.md + tech.md + issue テンプレート
**使用場面**: バグ調査、エラー解析、問題解決時
```
問題: [何が起きているか] #bug #error
再現手順: [手順] #reproduce
期待値: [期待される動作] #expected
実際: [実際の動作] #actual
環境: [OS/バージョン] #environment
```

### `/feature:plan` - 新機能設計モード  
**参照ファイル**: overview.md + next.md + 設計テンプレート
**使用場面**: 新機能企画、要件定義、設計時
```
機能名: [機能名] #feature #new
目的: [解決したい課題] #purpose
ユーザーストーリー: [As a... I want... So that...] #story
受け入れ条件: [完了の定義] #acceptance
```

### `/review:check` - コードレビューモード
**参照ファイル**: history.md + templates.md + チェックリスト
**使用場面**: コードレビュー、品質チェック、リファクタリング時
```
レビュー対象: [ファイル/機能] #review #code
チェック項目: [確認すべき点] #checklist
改善提案: [提案内容] #improvement
```

### `/deploy:prep` - デプロイ準備モード
**参照ファイル**: tech.md + current.md + デプロイチェックリスト
**使用場面**: リリース準備、デプロイ前確認時
```
リリース内容: [変更内容] #release #changes
テスト状況: [テスト結果] #testing
デプロイ手順: [手順確認] #deployment
ロールバック: [戻し方] #rollback
```

## Daily Standup
```
昨日: [完了したタスク - 簡潔に] #yesterday #completed
今日: [予定しているタスク - 簡潔に] #today #planned
ブロッカー: [あれば記載/なければ「なし」] #blocker #impediment
```

## Decision Log
```
[日付] [決定内容] → [理由一行] #decision #rationale
```

## 問題解決テンプレート
```
問題: [何が起きているか] #problem #issue
影響: [誰に/何に影響するか] #impact #scope
原因: [推定される原因] #cause #root
解決策: [試すこと] #solution #action
結果: [実施後の結果] #result #outcome
```

## 学習ログ
```
技術: [学んだ技術] → [どう使えるか] #tech #learning
ツール: [試したツール] → [評価と使用感] #tool #evaluation
プロセス: [改善したプロセス] → [効果] #process #improvement
```

## コードレビューチェックリスト
- [ ] 動作確認 #functionality #testing
- [ ] エラーハンドリング #error #exception
- [ ] パフォーマンス #performance #optimization
- [ ] セキュリティ #security #vulnerability
- [ ] テスト #testing #coverage

## Weekly Review
```
## 今週の成果
- [成果1]
- [成果2]

## 課題・改善点
- [課題1] → [対策]
- [課題2] → [対策]

## 来週の重点
- [重点1]
- [重点2]
```
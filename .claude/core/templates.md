---
cache_control: {"type": "ephemeral"}
---
# Quick Templates
tags: #templates #quick

## Quick Modes
### `/debug:start` - Debug-focused mode
```
Problem: [What is happening] #bug
Reproduction steps: [Steps] #reproduce
Expected: [Expected behavior] #expected
Actual: [Actual behavior] #actual
Environment: [OS/Version] #environment
```

### `/feature:plan` - New feature design mode
```
Feature name: [Feature name] #feature
Purpose: [Problem to solve] #purpose
User story: [As a... I want... So that...] #story
Acceptance criteria: [Definition of done] #acceptance
```

### `/review:check` - Code review mode
```
Review target: [File/Function] #review
Check items:
- [ ] Functionality check #functionality
- [ ] Error handling #error  
- [ ] Performance #performance
- [ ] Security #security
- [ ] Testing #testing
Improvement suggestions: [Suggestions] #improvement
```

## Basic Templates

### Decision Log (Record in @.claude/context/history.md)
```
[Date] [Decision] → [Reason] #decision
```

### Learning Log (Record in @.claude/core/current.md)
```
Technology: [Technology learned] → [How to use it] #tech
Tool: [Tool tried] → [Evaluation and usage experience] #tool
Process: [Improved process] → [Effect] #process
```

## Builder実装指示書テンプレート

### 実装指示書の構成
```markdown
# Builder実装指示書 - [機能名] v[版数]

## 対象エージェント: Builder
## 実装モード: [TDD/通常/デバッグ]
## 優先度: [最高/高/中/低]

## 🎯 実装目標
### 目的
[なぜこの機能を実装するのか]

### 実装スコープ
[実装する機能の一覧]

## 🔴 TDD実装指示（TDDの場合）
### Phase 1: Red（失敗するテストを書く）
[具体的なテストコード]

### Phase 2: Green（最小限の実装）
[テストを通す最小限の実装]

### Phase 3: Blue（リファクタリング）
[品質向上のための改善]

## 🎨 UI/UX仕様
[インターフェース設計]

## 🔧 技術仕様
[実装の技術的詳細]

## 🧪 テスト仕様
[ホワイトボックス・ブラックボックステスト]

## ⚠️ 重要な実装上の注意事項
[Design Philosophy、制約、禁止事項]

## 🎯 完成の定義（DoD）
[機能要件、品質要件、UX要件]

## 🚀 実装順序
[段階的な実装手順]

## 🔗 必要な依存関係
[追加パッケージ、設定変更]

## 📋 引き継ぎ事項
[Plannerへの報告項目]
```

### ConfirmDialog使用指針テンプレート
```markdown
## ConfirmDialog使用指針

### ✅ 使用すべき場面（不可逆的操作のみ）
- データの完全削除
- 設定の完全リセット
- 復元不可能な操作

### ❌ 使用禁止場面（可逆的操作）
- 状態の切り替え
- 編集可能な変更
- 元に戻せる操作

### コード例
```typescript
// ❌ 悪い例: 可逆的操作
const handleToggle = () => showConfirm("完了しますか？");

// ✅ 良い例: 不可逆的操作
const handleDelete = () => showConfirm("削除しますか？");
```

### TDD実装パターン
```typescript
// 1. Red: 失敗するテストを書く
test('should do something', () => {
  expect(notImplementedFunction()).toBe(expectedResult);
});

// 2. Green: 最小限の実装
const notImplementedFunction = () => expectedResult;

// 3. Blue: リファクタリング
const notImplementedFunction = () => {
  // 適切な実装
  return computeResult();
};
```

## Common Patterns

### Git Operation Patterns
```bash
# Update before work
git pull origin main && git status

# Create feature branch
git checkout -b feature/[feature-name]

# Check changes and commit
git diff && git add -A && git commit -m "[prefix]: [changes]"

# Resolve conflicts
git stash && git pull origin main && git stash pop
```
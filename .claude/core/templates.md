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

### FocusFlow Development Patterns

#### Daily Development Workflow
```bash
# 作業開始
git pull origin main
npm install
npm run dev

# 開発中
npm run typecheck
npm run test:watch

# 機能完成時
npm run check
git add . && git commit -m "feat: [feature description]"
```

#### Weekly Quality Review
```bash
# 品質チェック
npm audit
npm outdated
npm run build
npm run preview
# Chrome DevTools Lighthouse実行
```

#### PWA Development Pattern
```bash
# PWA確認
npm run build          # PWAビルド
npm run preview        # PWAプレビュー
# Service Worker確認
# Lighthouse監査（90+点維持）
```

#### Phase-based Development
```bash
# Phase 1: 基本機能
feature/focus-mode
feature/task-input

# Phase 2: 思考支援
feature/quick-memo
feature/search-filter

# Phase 3: 時間管理
feature/time-estimation
feature/session-report
```

### Code Quality Templates

#### TypeScript Component Template
```typescript
// ComponentName.tsx
import React from 'react';
import { Box, Text, Button } from '@chakra-ui/react';

interface ComponentNameProps {
  // 型定義
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  // props 
}) => {
  return (
    <Box>
      {/* JSX */}
    </Box>
  );
};
```

#### IndexedDB Operation Template
```typescript
// database operations
try {
  const result = await db.table.operation();
  // 成功処理
} catch (error) {
  console.error('DB operation failed:', error);
  // エラーハンドリング
}
```

#### Test Template
```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

test('should render correctly', () => {
  render(<ComponentName />);
  expect(screen.getByText('text')).toBeInTheDocument();
});
```
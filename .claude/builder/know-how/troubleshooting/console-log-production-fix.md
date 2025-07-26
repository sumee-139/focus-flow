# プロダクション環境でのログ制御 - Builderトラブルシューティング

**作成日**: 2025-07-26  
**発見者**: Builder Agent  
**緊急度**: High Priority 🔥

## 問題の概要

T006修正後、プロダクションビルドに大量のデバッグログが残存している問題を発見。パフォーマンス・セキュリティ・保守性の観点で重大な技術的負債。

## 現在の問題

### 発見されたログ残存箇所
```typescript
// DailyMemo.tsx - 4箇所
console.log('[DEBUG] saveWithStatus called, setting status to saving')
console.log('[DEBUG] scheduleAutoSave called, setting timer for', AUTO_SAVE_DELAY, 'ms')
console.log('[DEBUG] Timer fired, calling saveWithStatus')
console.log('[DEBUG] SaveStatusIndicator render, status:', status.status)

// App.tsx - 10+箇所
console.log('Focus mode activated')
console.log('Testing notification, focus mode:', state.focusMode.isActive)
console.warn('Failed to load daily memo:', error)

// E2E Tests - 4箇所
console.log('Final date display:', dateDisplay.textContent)
console.log('LocalStorage keys:', storageKeys)
```

### 影響範囲
- **パフォーマンス**: 不要なログ出力によるオーバーヘッド
- **セキュリティ**: デバッグ情報の漏洩リスク
- **ユーザー体験**: ブラウザコンソールの汚染
- **保守性**: プロダクション環境での問題特定困難

## Builder提案の解決策

### 1. **環境別ログレベル制御システム**

#### 実装パターン A: 環境変数ベース
```typescript
// utils/logger.ts
const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'error' : 'debug'

export const logger = {
  debug: (...args: any[]) => {
    if (LOG_LEVEL === 'debug') {
      console.log('[DEBUG]', ...args)
    }
  },
  info: (...args: any[]) => {
    if (['debug', 'info'].includes(LOG_LEVEL)) {
      console.info('[INFO]', ...args)
    }
  },
  warn: (...args: any[]) => {
    if (['debug', 'info', 'warn'].includes(LOG_LEVEL)) {
      console.warn('[WARN]', ...args)
    }
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args)
  }
}

// 使用例
import { logger } from '../utils/logger'

// Before
console.log('[DEBUG] saveWithStatus called')

// After
logger.debug('saveWithStatus called')
```

#### 実装パターン B: Vite DefinePlugin活用
```typescript
// vite.config.ts
export default defineConfig({
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
})

// utils/logger.ts
declare const __DEV__: boolean

export const logger = {
  debug: (...args: any[]) => {
    if (__DEV__) {
      console.log('[DEBUG]', ...args)
    }
  }
}
```

### 2. **段階的な移行戦略**

#### Phase 1: ログユーティリティ作成（30分）
```bash
# 1. logger.ts作成
# 2. 基本的なログレベル制御実装
# 3. TypeScript型定義
```

#### Phase 2: 既存ログの段階的置換（1時間）
```typescript
// 優先度別の置換
// 1. 機密情報を含むログ（即座に対応）
// 2. パフォーマンス影響の大きいログ
// 3. その他のデバッグログ
```

#### Phase 3: ESLint Rule追加（30分）
```javascript
// .eslintrc.js
rules: {
  'no-console': ['error', { allow: ['warn', 'error'] }],
  'no-restricted-syntax': [
    'error',
    {
      selector: 'CallExpression[callee.object.name="console"][callee.property.name!=/^(warn|error)$/]',
      message: 'Unexpected console statement. Use logger utility instead.'
    }
  ]
}
```

### 3. **改善されたログ設計**

#### カテゴリ別ログ管理
```typescript
// utils/logger.ts - 拡張版
interface LoggerConfig {
  category: string
  level: 'debug' | 'info' | 'warn' | 'error'
  timestamp?: boolean
  prefix?: string
}

export function createLogger(config: LoggerConfig) {
  const { category, level, timestamp = true, prefix } = config
  
  return {
    debug: (...args: any[]) => {
      if (__DEV__ && shouldLog('debug', level)) {
        const time = timestamp ? new Date().toISOString() : ''
        console.log(`[${time}] [${category}] ${prefix || ''}`, ...args)
      }
    }
    // ... other methods
  }
}

// 使用例
const dailyMemoLogger = createLogger({
  category: 'DailyMemo',
  level: 'debug',
  prefix: 'AUTO_SAVE:'
})

dailyMemoLogger.debug('saveWithStatus called, status:', status)
```

#### パフォーマンス対応ログ
```typescript
// 重い処理のログを条件付きで
export const performanceLogger = {
  time: (label: string) => {
    if (__DEV__) console.time(label)
  },
  timeEnd: (label: string) => {
    if (__DEV__) console.timeEnd(label)
  },
  trace: (message: string) => {
    if (__DEV__ && performance.now() > PERFORMANCE_THRESHOLD) {
      console.trace(message)
    }
  }
}
```

## 緊急対応手順

### 即座に対応すべきログ
1. **機密情報漏洩リスク**
   ```typescript
   // App.tsx:791 - タスクメモ内容の出力
   console.log(`Saving task memo for ${selectedTaskForMobile.id}:`, content)
   ```

2. **パフォーマンス影響**
   ```typescript
   // E2E Tests - LocalStorage全内容の出力
   console.log('LocalStorage keys:', storageKeys)
   storageKeys.forEach(key => {
     console.log(`${key}:`, localStorage.getItem(key))
   })
   ```

### 安全な残存ログ
- エラーハンドリング用の`console.warn`、`console.error`
- 開発環境でのみ必要なデバッグ情報

## Builder実装時の注意点

### ログ実装のアンチパターン
```typescript
// ❌ 悪い例: 直接console使用
console.log('User data:', userData)

// ❌ 悪い例: 本番環境判定なし
if (DEBUG_MODE) console.log('debug info')

// ❌ 悪い例: 機密情報の出力
console.log('Auth token:', token)
```

### 推奨パターン
```typescript
// ✅ 良い例: logger utility使用
logger.debug('Processing user data', { userId: user.id })

// ✅ 良い例: 環境変数での制御
if (__DEV__) logger.debug('Development only info')

// ✅ 良い例: 機密情報の除外
logger.debug('Auth process completed', { userId: user.id, success: true })
```

## 測定可能な改善効果

### Before (現在)
- プロダクションビルドサイズ: 244.92 kB
- コンソール出力: 30+箇所
- セキュリティリスク: 機密情報漏洩可能性

### After (改善後予想)
- プロダクションビルドサイズ: 240kB (-2%)
- コンソール出力: エラー/警告のみ
- セキュリティリスク: 大幅軽減

## 次回実装での予防策

1. **開発開始時**: ログユーティリティの事前設定
2. **実装中**: ESLint ruleでの自動チェック
3. **PR時**: ログ出力の手動レビュー
4. **リリース前**: プロダクションビルドでのログ確認

---

**Builderからの提言**: この問題は今後のプロジェクトでも発生する可能性が高い。Plannerにログ制御システムの実装を提案し、プロダクション品質の向上を図るべきだぜ！
# T006 UTC/JST時差問題修正 - ベストプラクティス & トラブルシューティング

**作成日**: 2025-07-26  
**作成者**: Builder Agent  
**対象**: タイムゾーン処理・日付管理・TDD実装

## 🎯 概要

T006でUTC/JST時差問題を根本解決する過程で発見したベストプラクティスとトラブルシューティング手法を記録。将来の類似問題を効率的に解決するための実践的ガイド。

## 🏆 発見されたベストプラクティス

### 1. **タイムゾーン処理の基本原則**

#### ✅ DO: 一元化されたユーティリティ使用
```typescript
// ✅ 良い例: 専用ユーティリティで統一
import { getJSTTodayString, getJSTDateString } from '../utils/dateUtils'

const today = getJSTTodayString()
const formatted = getJSTDateString(new Date())
```

#### ❌ DON'T: 散在するタイムゾーン処理
```typescript
// ❌ 悪い例: コンポーネント内で直接UTC処理
const today = new Date().toISOString().split('T')[0] // UTC基準になる
```

### 2. **TDD手法による日付処理の確実な実装**

#### 境界条件テストの重要性
```typescript
// 🔴 Red Phase: 境界条件を先にテスト
test('should handle JST date boundary correctly at midnight', () => {
  // JST深夜0時 = UTC前日15時
  const jstMidnight = new Date('2025-07-24T15:00:00.000Z')
  vi.setSystemTime(jstMidnight)
  
  const result = getJSTTodayString()
  expect(result).toBe('2025-07-25') // JSTでは翌日
})
```

#### テスト駆動による信頼性確保
- **Red**: 失敗するテストで仕様を明確化
- **Green**: 最小限の実装でテスト通過
- **Blue**: 品質向上でエッジケース対応

### 3. **日付ユーティリティ設計パターン**

#### 関数分離の原則
```typescript
// 基本機能を分離
export function getJSTTodayString(): string
export function getJSTDateString(date: Date): string  
export function createJSTDate(dateString: string): Date
export function isJSTToday(dateString: string): boolean
```

#### オフセット計算の明示化
```typescript
// 🟢 明確なオフセット計算
const jstOffset = 9 * 60 * 60 * 1000 // 9時間をミリ秒で表現
const jstTime = new Date(date.getTime() + jstOffset)

// UTC時刻として取得するが、実際はJST時刻が格納されている
const year = jstTime.getUTCFullYear()
```

### 4. **E2Eテストでの日付テスト戦略**

#### LocalStorageデバッグ機能の活用
```typescript
// デバッグ情報の体系的収集
const storageKeys = Object.keys(localStorage)
console.log('LocalStorage keys:', storageKeys)
storageKeys.forEach(key => {
  if (key.startsWith('focus-flow')) {
    console.log(`${key}:`, localStorage.getItem(key))
  }
})
```

#### 日付依存テストの安定化
- フィルタ設定とタスク保存日付の一致確認
- 日付表示とデータ整合性の検証
- 時差境界での動作確認

## 🔧 トラブルシューティング手法

### Problem 1: E2Eテストでタスクが表示されない

#### 症状
```
TestingLibraryElementError: Unable to find an element with the text: 週末プロジェクトの準備
```

#### 診断手順
1. **LocalStorageの内容確認**
   ```typescript
   // タスク保存状況を確認
   const tasksData = localStorage.getItem('focus-flow-tasks')
   console.log('Tasks data:', JSON.parse(tasksData))
   ```

2. **フィルタ設定の確認**
   ```typescript
   // フィルタ設定を確認
   const filterData = localStorage.getItem('focus-flow-task-filter')
   console.log('Filter data:', JSON.parse(filterData))
   ```

3. **日付の齟齬検出**
   - タスクの`targetDate`: `2025-07-27`
   - フィルタの`viewDate`: `2025-07-28`
   - **→ 1日のズレを発見**

#### 解決パターン
```typescript
// UTC基準からJST基準への修正
// Before (UTC)
const [targetDate, setTargetDate] = useState(currentDate || new Date().toISOString().split('T')[0])

// After (JST)
const [targetDate, setTargetDate] = useState(currentDate || getJSTTodayString())
```

### Problem 2: TypeScript未使用インポートエラー

#### 症状
```
error TS6133: 'getJSTDateString' is declared but its value is never read.
```

#### 解決手順
1. **実際の使用箇所を確認**
   ```bash
   grep -r "getJSTDateString" src/
   ```

2. **不要なインポートを削除**
   ```typescript
   // Before
   import { getJSTTodayString, getJSTDateString, isJSTToday } from './dateUtils'
   
   // After (実際に使用するもののみ)
   import { getJSTTodayString, isJSTToday } from './dateUtils'
   ```

### Problem 3: JST計算の境界条件エラー

#### よくある間違い
```typescript
// ❌ 単純な時差加算（サマータイム未考慮）
const jstTime = new Date(utcTime.getTime() + 9 * 60 * 60 * 1000)
```

#### 堅牢な解決策
```typescript
// ✅ UTC操作による確実な計算
const jstTime = new Date(date.getTime() + jstOffset)
const year = jstTime.getUTCFullYear()
const month = String(jstTime.getUTCMonth() + 1).padStart(2, '0')
const day = String(jstTime.getUTCDate()).padStart(2, '0')
```

## 🔍 デバッグテクニック

### 1. **タイムゾーン問題の特定**
```typescript
// デバッグ用の時刻比較関数
function debugTimezone(date: Date) {
  console.log('UTC:', date.toISOString())
  console.log('Local:', date.toString())
  console.log('JST calculated:', getJSTDateString(date))
}
```

### 2. **E2Eテストでの段階的確認**
```typescript
// 各段階での状態確認
await waitFor(() => {
  console.log('Date display:', screen.getByTestId('date-display').textContent)
  console.log('Tasks count:', screen.getAllByTestId('task-item').length)
  console.log('Filter state:', localStorage.getItem('focus-flow-task-filter'))
})
```

### 3. **テスト用時刻固定**
```typescript
// Vitestでの時刻モック
import { vi } from 'vitest'

// 特定の時刻で固定
const fixedTime = new Date('2025-07-25T06:00:00.000Z') // JST 15:00
vi.setSystemTime(fixedTime)

// テスト実行
const result = getJSTTodayString()
expect(result).toBe('2025-07-25')

// 元に戻す
vi.useRealTimers()
```

## ⚠️ 既知の制限と将来の改善点

### 現在の制限
1. **サマータイム未対応**: 固定9時間オフセットのみ
2. **海外展開時の課題**: 他タイムゾーン未対応
3. **うるう年の考慮不足**: 2月29日の処理

### 推奨される改善
```typescript
// 将来の改善案: Intl.DateTimeFormat活用
function getJSTDateStringRobust(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date).replace(/\//g, '-')
}
```

## 📋 チェックリスト: 日付処理実装時

### 実装前
- [ ] タイムゾーン要件の明確化（JST固定？多言語対応？）
- [ ] 境界条件の洗い出し（深夜0時、月末、年末年始）
- [ ] テストケースの設計（TDD Red Phase）

### 実装中
- [ ] 専用ユーティリティ関数の使用
- [ ] UTC操作による確実な計算
- [ ] 適切なコメントでの意図明示

### 実装後
- [ ] 境界条件テストの実行
- [ ] E2Eテストでの実際の動作確認
- [ ] プロダクションビルドでのエラーチェック

## 🎓 学習リソース

### 参考ドキュメント
- [MDN - Date](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [MDN - Intl.DateTimeFormat](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Vitest - vi.setSystemTime](https://vitest.dev/api/vi.html#vi-setsystemtime)

### Builder実装パターン
- TDDサイクルでの境界条件テスト優先
- 一元化されたユーティリティ関数設計
- E2Eテストでの実データ検証

---

**Note**: このドキュメントは実際の問題解決経験に基づいて作成されています。新しい問題に遭遇した場合は、このドキュメントを更新してください。
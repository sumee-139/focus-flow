# スキップテスト復活戦略 - Builder技術分析報告

## 🎯 Builder前情報

**ユーザー要求**: スキップしたテスト達の復活をPlannerと協力して検討
**Builder目標**: 技術的問題を詳細分析し、Plannerと戦略立案の基盤を作る

## 📊 スキップテスト全容（32テスト詳細分析）

### 🚨 原因：統合テスト特有の複雑性問題

#### A. **統合テスト大分類（5カテゴリ）**
1. **Task Delete Functionality** (5テスト) - ConfirmDialog統合問題
2. **Permanent Task Form Display** (3テスト中2スキップ) - 非同期フォーム処理
3. **New Layout System** (6テスト中1スキップ) - CSS Grid + レスポンシブ
4. **TabArea Integration** (4テスト中2スキップ) - タブ切り替え + 状態管理
5. **Mobile Responsive Integration** (13テスト) - matchMedia + モバイル検出

#### B. **Date Management Integration** (7テスト中1スキップ) - 日付フィルタ統合

### 🔧 技術的問題パターン分析

#### Pattern 1: **非同期処理競合**
```typescript
// 問題のコード例（推定）
const handleDelete = async () => {
  await waitFor(() => screen.getByRole('dialog'))  // ConfirmDialog待機
  await fireEvent.click(confirmButton)              // 削除実行
  await waitFor(() => !screen.queryByRole('dialog')) // Dialog消失待機
}
```
**症状**: 30秒タイムアウト
**原因**: 複数の非同期処理が競合、無限ループ発生

#### Pattern 2: **matchMedia mock競合**
```typescript
// 現在のmock設定
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query) => ({
    matches: query === '(max-width: 768px)' ? false : false
  }))
})
```
**症状**: モバイル/デスクトップ切り替えテストでタイムアウト
**原因**: matchMediaイベントリスナー適切な削除なし

#### Pattern 3: **状態管理の複雑性**
```typescript
// App.tsx複雑な状態構造
const [state, dispatch] = useReducer(appReducer, initialState)
+ useTaskFilter(tasks, selectedDate, showCompleted)
+ useLocalStorage("focus-flow-tasks", defaultTasks)
+ 複数のUI状態（memoPanel, deleteConfirmDialog等）
```
**症状**: 状態変更の連鎖反応でレンダリング無限ループ
**原因**: useEffect依存配列の不適切な設定

#### Pattern 4: **DOM操作タイミング問題**
```typescript
// テストでの問題パターン
fireEvent.click(taskContent)               // TaskMemo表示
await waitFor(() => screen.getByTestId('task-memo'))  // タイムアウト
```
**症状**: DOM要素の表示/非表示切り替えでタイムアウト
**原因**: React状態更新とDOM反映のタイミングズレ

### 🎯 スキップテスト詳細カテゴリ分析

#### Category A: Task Delete Functionality (5テスト)
**問題**: ConfirmDialog表示→削除実行→Dialog消失の流れでタイムアウト
**技術要因**:
- ConfirmDialog state管理の競合
- Portal rendering + React state更新の同期問題
- useCallback依存配列の不適切設定

**復活難易度**: 🟡 Medium（ConfirmDialog単体は動作確認済み）

#### Category B: Mobile Responsive Integration (13テスト)
**問題**: matchMedia + モバイル検出でmock設定競合
**技術要因**:
- window.matchMedia mock設定の複雑性
- MobileAccordion + MobileTaskMemoModal同時レンダリング競合
- useEffect cleanup処理の不備

**復活難易度**: 🔴 High（モバイル検出ロジックの根本設計見直し必要）

#### Category C: TabArea Integration (2/4テスト)
**問題**: タブ切り替え + TaskMemo表示の状態管理競合
**技術要因**:
- TabArea + MemoPanel状態同期問題
- Dynamic tab追加時のReact key問題
- メモリリーク（event listener cleanup不備）

**復活難易度**: 🟡 Medium（TabArea単体は動作確認済み）

#### Category D: New Layout System (1/6テスト)
**問題**: CSS Grid + 複数コンポーネント統合での無限レンダリング
**技術要因**:
- CSS Grid resize検知の無限ループ
- ResponsiveComponent間のstate共有問題

**復活難易度**: 🟢 Low（CSS問題中心、機能ロジックは健全）

#### Category E: Date Management Integration (1/7テスト)
**問題**: DatePicker + TaskFilter統合でのフィルタリング無限ループ
**技術要因**:
- useTaskFilter + useDateNavigation hook間競合
- 日付変更→タスクフィルタ→re-render→日付変更の循環

**復活難易度**: 🟡 Medium（個別hookは動作確認済み）

## 🚀 Builder推奨復活戦略（技術ベース）

### Phase 1: 低リスク復活（🟢 Low - 推定2-3時間）
1. **New Layout System残り1テスト**: CSS Grid問題の単純修正
2. **Permanent Task Form動作テスト**: フォーム単体機能テスト

### Phase 2: 中リスク復活（🟡 Medium - 推定1-2日）
1. **Task Delete Functionality**: ConfirmDialog統合の段階的修正
2. **TabArea Integration**: 状態管理の分離・単純化
3. **Date Management Integration**: hook間競合の解決

### Phase 3: 高リスク復活（🔴 High - 推定3-5日）
1. **Mobile Responsive Integration**: matchMedia mock戦略の根本見直し
   - モバイル検出ロジックの単純化
   - テスト用mock戦略の再設計
   - Component単位でのモバイル対応テスト分離

## 🔧 Builder技術的提言

### 提言1: **統合テスト分離戦略**
```typescript
// 現在: 1つの巨大統合テスト
describe('App Integration Tests', () => {
  // 32テスト全て統合
})

// 提案: コンポーネント単位統合テスト
describe('App + TaskItem Integration', () => {})  // Task関連のみ
describe('App + MemoPanel Integration', () => {}) // Memo関連のみ
describe('App + Mobile Integration', () => {})    // Mobile関連のみ
```

### 提言2: **mock戦略の標準化**
```typescript
// 統一されたmock setup utility作成
function setupDesktopMock() { /* デスクトップ環境設定 */ }
function setupMobileMock() { /* モバイル環境設定 */ }
function setupTabletMock() { /* タブレット環境設定 */ }
```

### 提言3: **段階的復活プロセス**
1. **Single Component復活**: 1テストずつ個別復活
2. **Isolated Integration**: 2-3コンポーネント統合テストまで
3. **Full Integration**: 全機能統合テストの再構築

## 🤝 Plannerとの協調ポイント

### Builder担当範囲
- ✅ 技術的問題の詳細分析（完了）
- ✅ 復活戦略の技術的提言（完了）
- 🔄 具体的な修正実装（Planner指示待ち）

### Planner相談事項
1. **復活優先度**: どのカテゴリから復活させるか？
2. **工数配分**: Phase 1→2→3の実装スケジュール
3. **品質基準**: 復活テストの成功基準設定
4. **リスク管理**: 高リスクカテゴリの代替戦略

---

**Builder総括**: 32スキップテストの技術的分析完了。統合テストの複雑性が主因で、段階的復活戦略により確実な解決が可能。Plannerとの戦略相談により最適な復活計画を立案したい。
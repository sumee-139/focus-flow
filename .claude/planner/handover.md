# 🚀 Builder実装指示書: Phase 2.2b革新的フォーカスモード v1.0

## From: Planner Agent
## To: Builder Agent  
## 作成日: 2025-07-27
## 実装モード: TDD + 革新的機能実装
## 優先度: 最高（Focus-Flow核心価値実現）

---

## 🎯 実装目標

### 戦略的価値
**Focus-Flowの核心「集中力向上」の革新的実現**
- **従来アプローチ**: 通知オフによる外的ノイズ遮断
- **革新アプローチ**: 画面制約による視覚的没入体験
- **差別化価値**: 既存タスク管理アプリとの明確な差別化

### 実装スコープ
1. **3段階制約レベル実装**（Minimal/Moderate/Intensive）
2. **フォーカスタイマー機能**（開始・一時停止・再開・停止）
3. **セッション記録・履歴管理**
4. **既存システム非破壊統合**

---

## 📋 設計書参照

### 🎯 **詳細設計書**: @docs/design/phase-2-2b-constraint-focus-mode.md
- アーキテクチャ設計・データ構造設計
- UI/UX設計・レスポンシブ対応仕様
- TDD実装方針・4日間実装スケジュール
- 完成の定義（DoD）・実装チェックリスト

### 🔧 **技術要件定義書**: @docs/design/phase-2-2b-technical-requirements.md
- PWA/Capacitor環境での制約実現技術仕様
- CSS Transform + DOM操作 + Event制御の組み合わせ
- パフォーマンス最適化・メモリ管理仕様
- 既存システム非破壊統合方針

---

## 🔴 TDD実装指示

### Phase 1: Red（失敗するテスト設計）

#### 1.1 FocusModeContext基本機能テスト
```typescript
// src/contexts/FocusModeContext.test.tsx
describe('FocusModeContext - Core Functionality', () => {
  test('should initialize with inactive focus mode')
  test('should start focus mode with specified task and constraint level')
  test('should maintain timer countdown during active session')
  test('should handle interruption and resumption correctly')
  test('should end focus mode and log session data')
  test('should persist session data to localStorage')
})
```

#### 1.2 ScreenConstraintEngine制約適用テスト
```typescript
// src/utils/screenConstraintEngine.test.ts
describe('ScreenConstraintEngine - Visual Constraints', () => {
  test('should apply minimal constraint (opacity + element hiding)')
  test('should apply moderate constraint (blur + centering)')
  test('should apply intensive constraint (fullscreen + dark mode)')
  test('should restore original UI state after constraint removal')
  test('should handle constraint level changes dynamically')
})
```

#### 1.3 useFocusTimer高精度タイマーテスト
```typescript
// src/hooks/useFocusTimer.test.ts
describe('useFocusTimer - High Precision Timer', () => {
  test('should countdown timer with 1-second intervals using requestAnimationFrame')
  test('should pause and resume timer functionality correctly')
  test('should trigger completion callback when timer reaches zero')
  test('should handle manual stop and reset correctly')
  test('should calculate progress percentage accurately')
})
```

### Phase 2: Green（最小限実装）

#### 2.1 FocusModeContext基本実装
```typescript
// src/contexts/FocusModeContext.tsx
export const FocusModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // useState + useReducer混合型（既存パターン維持）
  const [focusMode, setFocusMode] = useState<FocusModeState>(initialState)
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null)
  
  // 最小限の状態管理・LocalStorage統合
  const startFocus = async (task: Task, level: ConstraintLevel, duration: number) => {
    // ベタ書き実装でテストを通す
  }
}
```

#### 2.2 ScreenConstraintEngine基本制約
```typescript
// src/utils/screenConstraintEngine.ts
export class ScreenConstraintEngine {
  applyConstraint(level: ConstraintLevel, targetElement: Element): void {
    switch (level) {
      case 'minimal':
        // 最小限のopacity制御のみ
        break
    }
  }
}
```

#### 2.3 useFocusTimer基本カウントダウン
```typescript
// src/hooks/useFocusTimer.ts
export const useFocusTimer = (initialDuration: number) => {
  // setIntervalベースの基本タイマー（後でrequestAnimationFrameに最適化）
  const [timeRemaining, setTimeRemaining] = useState(initialDuration)
}
```

### Phase 3: Blue（品質向上・最適化）

#### 3.1 パフォーマンス最適化
- requestAnimationFrameによる高精度タイマー
- CSS Transform + GPU加速
- メモリリーク防止の確実なクリーンアップ

#### 3.2 アクセシビリティ対応
- WCAG 2.1 AA準拠
- スクリーンリーダー対応
- キーボード操作対応

#### 3.3 UX向上
- アニメーション・トランジション効果
- エラーハンドリング・ユーザーフィードバック
- モバイル最適化

---

## 🎨 UI統合実装指示

### 既存コンポーネント拡張（非破壊的）
```typescript
// TaskItem.tsx拡張
interface TaskItemProps {
  // 既存プロパティは変更なし
  task: Task
  onComplete: (taskId: string) => void
  onEdit?: (task: Task) => void
  
  // 新規追加
  onStartFocus?: (task: Task) => void
  showFocusButton?: boolean
}

// 新規追加: フォーカスボタン
{showFocusButton && (
  <button 
    onClick={() => onStartFocus?.(task)}
    className="focus-button"
    aria-label={`${task.title}に集中する`}
  >
    🎯
  </button>
)}
```

### App.tsx統合
```typescript
// src/App.tsx
function App() {
  return (
    <FocusModeProvider>  {/* 新規追加 */}
      {/* 既存のコンポーネント構造は変更なし */}
      <div className="app">
        {/* 既存コンテンツ */}
      </div>
    </FocusModeProvider>
  )
}
```

---

## ⚠️ 重要な制約・方針

### TDD厳格遵守
- **Red→Green→Blue**: 各フェーズでのコミット必須
- **テストファースト**: 実装前に必ず失敗テストを作成
- **品質維持**: 現在の88.4%成功率を下回らない

### Design Philosophy遵守
- **統一アイコン使用**: 絵文字による直感的UI維持（🎯フォーカスアイコン）
- **色による区別禁止**: アクセシビリティ配慮
- **レスポンシブ対応**: 768px境界での適切な動作

### 既存システム非破壊統合
- **Task型拡張禁止**: 関連データは別途管理
- **LocalStorage拡張**: 後方互換性維持
- **useState方式維持**: useReducer移行は将来Phase

### 無限ループ問題への配慮
- **App.test.tsx影響回避**: 統合テストとの競合防止
- **matchMedia使用注意**: 既存モック競合回避
- **useState + useEffect循環参照回避**: 依存配列の適切管理

---

## 🎯 完成の定義（DoD）

### 機能要件
- [ ] 3段階制約レベル（Minimal/Moderate/Intensive）完全実装
- [ ] フォーカスタイマー機能（開始・一時停止・再開・停止）
- [ ] セッション記録・履歴管理機能
- [ ] 制約の動的適用・解除機能

### 品質要件
- [ ] **テスト成功率**: 88.4%以上維持（無限ループ問題に影響されない）
- [ ] **プロダクションビルド**: 成功（パフォーマンス劣化なし）
- [ ] **TypeScript**: 型エラー0件
- [ ] **レスポンシブ**: デスクトップ・タブレット・モバイル完全対応

### UX要件
- [ ] **直感的操作**: ワンクリックでフォーカスモード開始
- [ ] **没入体験**: 制約レベルに応じた適切な視覚制約
- [ ] **中断復帰**: 柔軟な一時停止・再開機能
- [ ] **データ保持**: セッション履歴の永続化

### パフォーマンス要件
- [ ] **制約適用**: 500ms以内での視覚変更
- [ ] **タイマー精度**: 1秒誤差以内での時間管理
- [ ] **メモリ使用量**: 既存アプリケーション+10%以内

---

## 🚀 推奨実装順序（4日間）

### Day 1: フォーカスモード基盤（6-8時間）
**Morning（3-4時間）**:
1. FocusModeContext TDD実装（Red→Green）
2. 基本状態管理・LocalStorage統合
3. useFocusTimer Hook TDD実装

**Afternoon（3-4時間）**:
1. ScreenConstraintEngine基本実装
2. Minimal制約レベル実装・テスト
3. App.tsx統合・基本動作確認

### Day 2: UI制約機能拡張（6-8時間）
**Morning（3-4時間）**:
1. Moderate制約レベル実装（ブラー・中央表示）
2. Intensive制約レベル実装（全画面・ダークモード）
3. 制約レベル切り替え機能

**Afternoon（3-4時間）**:
1. フォーカスモード開始・終了UI実装
2. タイマーUI・進捗表示実装
3. レスポンシブ対応（768px境界）

### Day 3: UX最適化・品質向上（6-8時間）
**Morning（3-4時間）**:
1. セッション記録・履歴管理実装
2. 中断・再開機能実装
3. エラーハンドリング強化

**Afternoon（3-4時間）**:
1. アニメーション・トランジション効果
2. アクセシビリティ対応
3. モバイル実機テスト・調整

### Day 4: 統合テスト・最終調整（4-6時間）
**Morning（2-3時間）**:
1. 全テスト実行・88.4%成功率確認
2. プロダクションビルド・性能検証
3. クロスブラウザー動作確認

**Afternoon（2-3時間）**:
1. E2Eテスト実行・統合動作確認
2. 最終調整・ポリッシュ
3. Phase 2.2b完了報告書作成

---

## 🔗 必要な依存関係

### 既存技術スタック活用
- **React Context + useState**: 状態管理（既存パターン）
- **useLocalStorage**: データ永続化（既存Hook活用）
- **Jest/React Testing Library**: テスト基盤（既存環境）
- **CSS-in-JS**: 動的スタイル適用

### 新規技術要件（最小限）
- **CSS Transform/Filter**: 視覚制約実現
- **RequestAnimationFrame**: 高精度タイマー
- **Intersection Observer**: パフォーマンス最適化（Optional）

### 外部依存関係追加なし
- 新規パッケージ導入は行わない
- 既存技術スタックで完全実現
- バンドルサイズ増加最小化

---

## 📋 Plannerへの引き継ぎ事項

### 実装完了報告時の必須項目
1. **機能実装状況**: 3段階制約レベル動作確認
2. **品質指標**: テスト成功率・ビルド状況・TypeScript状況
3. **パフォーマンス**: 制約適用速度・メモリ使用量測定結果
4. **UX検証**: デスクトップ・タブレット・モバイル動作確認

### 技術的課題・制約報告
- 無限ループ問題への影響度評価
- PWA環境での制約実現の課題・限界
- 既存システム統合での発見事項

### 次期Phase準備情報
- Phase 2.2c統合検索システムへの技術的前提条件
- フォーカスモード利用データの検索統合可能性
- UI/UX改善点の将来展開案

---

## 💪 Builderへのメッセージ

今回のPhase 2.2bは、**Focus-Flow最大の差別化機能**の実装ですね！

**🔥 実装価値**:
- **革新的アプローチ**: 画面制約による能動的没入体験
- **技術的挑戦**: PWA環境での視覚制約実現
- **戦略的重要性**: 既存タスク管理アプリとの明確な差別化

**🚀 期待する成果**:
設計書には4日間での完全実装が可能な詳細な技術仕様を用意いたしました。Builder's technical expertise により、Focus-Flowの核心価値を完璧に実現していただけると確信しております。

Builder's implementation skills × Planner's strategic design = **Focus-Flow革新的価値実現**

完璧な実装をお願いいたします！

---

*2025-07-27 Planner Agent - Phase 2.2b革新的フォーカスモード実装指示書*  
*戦略的価値: Focus-Flow核心機能「画面制約による没入体験」の完全実現*
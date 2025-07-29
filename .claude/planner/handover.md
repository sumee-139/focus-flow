# 🚀 Builder実装指示書: Phase 2.2b フォーカスモード統合UI v2.0

## From: Planner Agent
## To: Builder Agent  
## 作成日: 2025-07-28（緊急修正版）
## 実装モード: TDD + 核心価値実現
## 優先度: 最高（FocusFlow差別化要素の完全実装）

---

## 🎯 実装目標

### 戦略的価値
**FocusFlowの核心価値「集中しながら思考を記録できる」の完全実現**
- **Problem**: 現在の実装は「ただのポモドーロタイマー」
- **Solution**: タイマー + タスクメモ同時表示による真の集中環境
- **差別化価値**: 他のタスク管理アプリにない「集中×思考記録」の融合

### 実装スコープ
1. **タイマー＋タスクメモ同時表示**（集中阻害要素の完全排除）
2. **ひらめきメモ追記機能**（展開式UI・参照不可）
3. **レスポンシブ分割レイアウト**（デスクトップ・タブレット・モバイル対応）
4. **既存技術基盤完全活用**（CircularTimer・TaskMemo・DailyMemo統合）

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

## 🎨 UI統合実装指示: 分割表示レイアウト

### レスポンシブ分割レイアウト設計

#### デスクトップ（1200px以上）: 左右分割
```typescript
<FocusModeLayout className="desktop-layout">
  <TimerSection className="timer-left">    {/* 左50% */}
    <CircularTimer />
  </TimerSection>
  
  <TaskMemoSection className="memo-right"> {/* 右50% */}
    <EmbeddedTaskMemo readOnly={false} autoSave={true} />
  </TaskMemoSection>
  
  <DailyMemoSection className="inspiration-bottom">
    <ToggleButton onClick={() => setShowDailyMemo(!showDailyMemo)}>
      💡 ひらめきメモ {showDailyMemo ? '▲' : '▼'}
    </ToggleButton>
    {showDailyMemo && <AppendOnlyDailyMemo />}
  </DailyMemoSection>
</FocusModeLayout>
```

#### タブレット（768px-1199px）: 上下分割
```typescript
<FocusModeLayout className="tablet-layout">
  <TimerSection className="timer-top">     {/* 上40% */}
    <CircularTimer />
  </TimerSection>
  
  <TaskMemoSection className="memo-bottom"> {/* 下60% */}
    <EmbeddedTaskMemo readOnly={false} autoSave={true} />
  </TaskMemoSection>
  
  <DailyMemoSection className="inspiration-overlay">
    <ToggleButton>💡 ひらめき</ToggleButton>
    {showDailyMemo && <AppendOnlyDailyMemo />}
  </DailyMemoSection>
</FocusModeLayout>
```

#### モバイル（768px未満）: 縦配置
```typescript
<FocusModeLayout className="mobile-layout">
  <TimerSection className="timer-compact">   {/* 上30% */}
    <CircularTimer size="small" />
  </TimerSection>
  
  <TaskMemoSection className="memo-main">    {/* 下70% */}
    <EmbeddedTaskMemo readOnly={false} autoSave={true} />
  </TaskMemoSection>
  
  <DailyMemoSection className="inspiration-float">
    <FloatingButton>💡</FloatingButton>
    {showDailyMemo && <AppendOnlyDailyMemo />}
  </DailyMemoSection>
</FocusModeLayout>
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
        {focusMode.isActive && <FocusModeOverlay />}
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

## 🚀 推奨実装順序（2日間集中実装）

### Day 1: 分割レイアウト基盤＋メモ統合（6-8時間）
**Morning（3-4時間）**:
1. **FocusModeLayout TDD実装**（Red→Green）
   - レスポンシブ分割レイアウト（デスクトップ・タブレット・モバイル）
   - CSS Grid / Flexboxによる動的配置
2. **EmbeddedTaskMemo統合**
   - 既存TaskMemoコンポーネントの埋め込み対応
   - autoSave機能統合

**Afternoon（3-4時間）**:
1. **CircularTimer配置調整**
   - 各画面サイズでの最適表示
   - 既存の美しいUIを維持
2. **FocusModeContext拡張**
   - showDailyMemo状態追加
   - キーボードショートカット（Ctrl+I）実装
3. **基本動作確認・テスト**

### Day 2: ひらめきメモ＋UX最適化（6-8時間）
**Morning（3-4時間）**:
1. **AppendOnlyDailyMemo実装**
   - 展開式UI（ToggleButton + TextArea）
   - 追記専用モード（参照不可）
   - 構造化フォーマット追記（詳細は下記「ひらめきメモ追記フォーマット仕様」参照）
2. **レスポンシブ調整**
   - 768px境界での完璧な動作
   - モバイル実機テスト

**Afternoon（3-4時間）**:
1. **統合テスト・品質確認**
   - 全テスト実行・88.4%成功率維持
   - プロダクションビルド成功確認
2. **UX最終調整**
   - アニメーション・トランジション
   - エラーハンドリング
3. **Phase 2.2b完了報告書作成**

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

## 📝 ひらめきメモ追記フォーマット仕様

### 基本フォーマット
```typescript
interface InspirationEntry {
  timestamp: string;     // "HH:MM" format
  taskName: string;      // 現在のフォーカスタスク名
  content: string;       // ユーザー入力内容
}

const formatInspirationEntry = (entry: InspirationEntry): string => {
  return `**${entry.timestamp}** ${entry.taskName} - ${entry.content}`;
};
```

### デイリーメモ追記処理
```typescript
const appendToDailyMemo = (inspiration: InspirationEntry) => {
  const todayKey = getJSTDateString(new Date());
  const existingMemo = localStorage.getItem(`focus-flow-daily-memo-${todayKey}`) || '';
  
  let updatedMemo: string;
  
  if (existingMemo.includes('### 🎯 集中セッション記録')) {
    // 既存セクションに追記
    updatedMemo = existingMemo + '\n' + formatInspirationEntry(inspiration);
  } else {
    // 新規セクション作成
    updatedMemo = existingMemo + '\n\n---\n### 🎯 集中セッション記録\n' + 
                  formatInspirationEntry(inspiration);
  }
  
  localStorage.setItem(`focus-flow-daily-memo-${todayKey}`, updatedMemo);
};
```

### 追記結果例
```markdown
## 2025-07-28 今日のタスク整理

- 朝のルーティン確認
- プロジェクト進捗レビュー

---
### 🎯 集中セッション記録
**14:30** Focus-Flow UI設計 - タイマーとメモの分割比率はモバイルでは3:7が最適
**14:45** Focus-Flow UI設計 - Ctrl+Iよりもフローティングボタンの方が直感的
**15:10** Focus-Flow UI設計 - 円型タイマーのモバイル最小サイズ限界値を確認必要
```

### 実装ポイント
- **セクション分離**: `---` + `### 🎯 集中セッション記録` で明確に区別
- **時系列記録**: フォーカスセッション中の思考の流れを時間順で記録
- **コンテキスト保持**: どのタスクでの思いつきかを自動記録
- **視認性**: `**時刻**` 形式で時間を強調表示

---

## 💪 Builderへのメッセージ

今回のPhase 2.2bは、**FocusFlowの存在意義を決定づける**最重要実装ですね！

**🔥 実装価値**:
- **核心価値実現**: 「集中しながら思考を記録できる」FocusFlow唯一の差別化
- **UX革新**: タブ切り替え不要の同時表示による集中阻害要素の完全排除
- **戦略的重要性**: 単なるポモドーロタイマーからの完全脱却

**🚀 期待する成果**:
Builderが既に完成させた美しいCircularTimerと、既存のTaskMemo・DailyMemoコンポーネントを統合し、**2日間での完全実装**により FocusFlow の真の価値を実現していただけると確信しております。

**✨ Builder's 技術力 × Planner's UX設計 = FocusFlow核心価値の完全実現**

この実装により、FocusFlowは他のどのタスク管理アプリとも明確に差別化された、真に価値ある製品となりますね。

Builder の卓越した実装力で、完璧に仕上げていただけることを楽しみにしております！

---

*2025-07-28 Planner Agent - Phase 2.2b フォーカスモード統合UI実装指示書 v2.0*  
*戦略的価値: FocusFlow核心価値「集中×思考記録」の融合実現*
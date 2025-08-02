# テストにおける無限ループ問題の調査レポート

## 1. はじめに

本レポートは、`.claude/builder/handover.md`で指摘された、`focus-flow-capacitor/src/App.test.tsx`における無限ループ問題に関する詳細な調査結果と、その解決策をまとめたものである。

## 2. 問題の概要

現在、`App.test.tsx`に含まれる統合テストスイート全体（32テスト）が、無限ループまたはタイムアウトを引き起こすため、`describe.skip`によって意図的に無効化されている。これにより、アプリケーションの包括的な結合テストが実行できず、リグレッションのリスクが高まっている。

影響範囲は以下の通りである。

- タスクの削除機能
- 常時表示フォームの動作
- 新しいCSS Gridレイアウトシステム
- タブエリアとメモエリアの連携
- モバイルレスポンシブの切り替え

## 3. 根本原因の分析

コードベースを詳細に分析した結果、無限ループは単一の原因ではなく、以下の3つの問題が複合的に絡み合って発生していると結論付けた。

### 3.1. 状態更新の循環参照 (`useEffect`の依存関係ループ)

最も主要な原因は、`App.tsx`コンポーネントと`useTaskFilter`カスタムフック間での、状態更新ロジックの循環参照である。

**問題のメカニズム:**

1.  `App.tsx`は、初回レンダリング後の`useEffect`内で`useTaskFilter`から受け取った`updateFilter`関数を呼び出し、表示日付を「今日」に設定する。

    ```typescript
    // App.tsx
    useEffect(() => {
      const actualToday = getLocalDateString()
      updateFilter({ viewDate: actualToday, mode: 'today' })
    }, [updateFilter]) // updateFilterに依存
    ```

2.  `updateFilter`が実行されると、`useTaskFilter`フック内の`filter`ステートが更新される。

    ```typescript
    // useTaskFilter.ts
    const updateFilter = useCallback((updates: Partial<TaskFilter>) => {
      setFilter(prevFilter => {
        const newFilter = { ...prevFilter, ...updates };
        saveFilterToStorage(newFilter);
        return newFilter;
      });
    }, []); // 依存配列が空
    ```

3.  `filter`ステートの変更をトリガーとして、`useMemo`でメモ化された`filteredTasks`が再計算される。

4.  `filteredTasks`は`App.tsx`に渡されており、この変更が`App.tsx`の再レンダリングを引き起こす。

5.  `App.tsx`が再レンダリングされると、状況によっては再び`useEffect`が実行され、`updateFilter`が呼び出される。このプロセスが連鎖し、無限ループに陥る。

`updateFilter`自体は`useCallback`でメモ化されているが、それが引き起こす親コンポーネントの再レンダリングと副作用の連鎖が問題の核心である。

### 3.2. 不整合な`localStorage`同期

状態の永続化のために`localStorage`が利用されているが、その読み書き処理が複数の場所で一貫性のない形で行われている。

-   **`App.tsx`**: `useLocalStorage`フックを使って`tasks`配列を同期している。
-   **`useTaskFilter.ts`**: `loadFilterFromStorage`および`saveFilterToStorage`関数を使って`filter`オブジェクトを同期している。

これらの処理は同期されておらず、コンポーネントのレンダリングサイクルの中で、古い状態を読み込んだり、意図しないタイミングで書き込みを行ったりすることで、状態の不整合や予期せぬ更新ループを引き起こす一因となっている。

### 3.3. 不適切なテストモック管理

`App.test.tsx`における`window.matchMedia`のモック管理に問題がある。

-   **グローバルモック**: テストファイルのトップレベルで、すべてのテストケースに適用されるグローバルな`matchMedia`モックが定義されている。
-   **ローカルモック**: `describe`ブロックや個別の`test`ブロック内で、特定のレスポンシブ状態を再現するために`matchMedia`が再度モックされ、上書きされている。

`vitest`のようなモダンなテストランナーでは、テストは並列実行される可能性がある。テスト後にモックの状態を適切にクリーンアップしないと、あるテストのモックが他のテストに影響を与え（テスト汚染）、コンポーネントが意図しないレスポンシブ状態と判定される。これにより、モバイル用とデスクトップ用のコンポーネントが同時にレンダリングされるなど、予期せぬUIの状態変化が無限の再レンダリングループを誘発する。

`handover.md`で報告されている`teardown`時の`TypeError: Cannot delete property 'matchMedia' of #<Object>`エラーは、この不適切なモック管理が原因である可能性が極めて高い。

## 4. 推奨される解決策

問題の複合的な性質を考慮し、短期的および中長期的な視点での段階的な解決策を提案する。

### 4.1. 短期的な対策（即時実施を推奨）

これらの対策は、現在の無限ループを解消し、テストを再び有効にすることを目的とする。

1.  **`useEffect`の依存関係見直し**:
    `App.tsx`の初回マウント時にのみフィルタを初期化するように修正する。これにより、不要な再実行を防ぐ。

    **修正案:**
    ```typescript
    // App.tsx
    useEffect(() => {
      const actualToday = getLocalDateString()
      updateFilter({ viewDate: actualToday, mode: 'today' })
    }, []) // 依存配列を空にして、初回マウント時のみ実行する
    ```

2.  **テストモックのクリーンアップ徹底**:
    `beforeEach`と`afterEach`を使い、各テストの前後で`matchMedia`のモックを確実にセットアップおよびクリーンアップする。グローバルなモック定義を廃止し、テストケースごとに必要なモックを適用する。

    **修正案:**
    ```typescript
    // App.test.tsx
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
      vi.restoreAllMocks(); // vitestのモックをすべてリセット
    });

    // 各テストケース内で vi.spyOn(window, 'matchMedia').mockImplementation(...) を使用
    ```

### 4.2. 中長期的な対策（安定化後のリファクタリング）

根本的な設計問題を解決し、将来的な同様の問題の再発を防ぐ。

1.  **状態管理ロジックの集約**:
    `App.tsx`と`useTaskFilter`に分散している状態管理ロジックを、`useReducer`にさらに集約する。特に`localStorage`との同期処理は、ReducerのMiddlewareのような形で一元管理し、副作用を制御しやすくする。

2.  **状態管理ライブラリの導入検討**:
    ZustandやJotaiのような、副作用の管理や非同期処理に強い軽量な状態管理ライブラリの導入を検討する。これにより、コンポーネントから複雑な状態ロジックを分離し、コードの見通しを改善できる。

3.  **統合テストの再設計**:
    `App.test.tsx`のような巨大な統合テストファイルは、保守性が低い。これをより小さな単位（例：「タスク追加とフィルタリングの連携」「レスポンシブレイアウトの切り替え」など）に分割する。UIの操作フロー全体を通したテストは、Playwrightを用いたE2Eテストに責務を移譲し、役割分担を明確にする。

## 5. 結論

`App.test.tsx`の無限ループ問題は、状態管理の循環参照、`localStorage`の副作用、不適切なテストモックという複数の要因が絡み合った根深い問題である。まずは短期的な対策を講じてテストを復活させ、開発の安全性を確保した上で、中長期的なリファクタリング計画に着手することを強く推奨する。

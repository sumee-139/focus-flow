# カスタムESLintルール仕様案

## 1. 背景と目的

`useEffect`フックはReactにおける副作用管理の強力なツールであるが、その自由度の高さから、意図しないパフォーマンス低下や複雑なバグの原因となりやすい。特に、Propsや他のStateから派生するStateの更新や、イベントハンドリングの代替としての使用は、アンチパターンとして知られている。

本プロジェクトでは、コードの品質と保守性を高め、`useEffect`の適切な使用を促進するために、以下のカスタムESLintルールを導入する。

## 2. ルール仕様

### ルール1: `useEffect`内でのProps/Stateからの単純な派生State更新の禁止

-   **ルールID:** `focus-flow/no-derived-state-in-effect`
-   **目的:** レンダリングのたびに計算可能な値を`useEffect`と`useState`で冗長に管理するパターンを防ぎ、不要な再レンダリングを削減する。
-   **検出対象:**
    -   `useEffect`フックの処理本体（第1引数のコールバック関数）が、単一の`setState`呼び出しのみで構成されている。
    -   その`setState`の引数が、コンポーネントの`props`または他の`state`から直接導出されている（例: `setUserName(props.user.name)`）。
    -   `useEffect`の依存配列に、その`props`または`state`が含まれている。

-   **エラーメッセージ:**
    > `useEffect`内でPropsやStateから派生したState (`[State名]`) を更新しています。この値はレンダリング中に直接計算するか、`useMemo`を使用してメモ化することを検討してください。
    > (例: `const userName = props.user.name;`)

-   **コード例:**

    ```jsx
    // ❌ 検出対象
    function UserProfile({ user }) {
      const [userName, setUserName] = useState(user.name);

      useEffect(() => {
        setUserName(user.name);
      }, [user.name]);

      return <div>{userName}</div>;
    }

    // ✅ 修正後
    function UserProfile({ user }) {
      const userName = user.name; // レンダリング中に直接計算
      return <div>{userName}</div>;
    }
    ```

### ルール2: イベントハンドリング目的での`useEffect`使用の禁止

-   **ルールID:** `focus-flow/no-event-driven-effect`
-   **目的:** ユーザーのアクションや特定のイベントに応答するロジックが、イベントハンドラから直接実行されることを保証し、不自然なStateの更新と副作用の連鎖を防ぐ。
-   **検出対象:**
    -   `useEffect`の依存配列が、`boolean`型のState（例: `isSubmitting`, `shouldFetchData`）のみに依存している。
    -   `useEffect`の処理本体が、その`boolean`型Stateの`true`/`false`をチェックする`if`文で始まっている。
    -   その`boolean`型Stateを`true`に設定する`setState`が、コンポーネント内のイベントハンドラ（例: `handleClick`, `handleSubmit`）から呼び出されている。

-   **エラーメッセージ:**
    > `useEffect`がイベント処理のトリガーとして使用されています。関連するロジックは、`[イベントハンドラ名]`内で直接実行することを検討してください。

-   **コード例:**

    ```jsx
    // ❌ 検出対象
    function CheckoutButton() {
      const [isCheckingOut, setIsCheckingOut] = useState(false);

      useEffect(() => {
        if (isCheckingOut) {
          processPayment();
          setIsCheckingOut(false);
        }
      }, [isCheckingOut]);

      function handleClick() {
        setIsCheckingOut(true); // イベントハンドラでStateを更新し、effectをトリガー
      }

      return <button onClick={handleClick}>Checkout</button>;
    }

    // ✅ 修正後
    function CheckoutButton() {
      function handleCheckout() {
        processPayment(); // イベントハンドラで直接処理を実行
      }

      return <button onClick={handleCheckout}>Checkout</button>;
    }
    ```

## 3. 実装方針

-   **使用技術:** ESLintのカスタムルールAPI、TypeScript-ESLint Parser
-   **AST (Abstract Syntax Tree) の解析:**
    -   `CallExpression`ノードを探索し、`callee`が`useEffect`であるものを特定する。
    -   `useEffect`の引数（コールバック関数と依存配列）を解析する。
    -   コールバック関数のBody（`BlockStatement`）内の`ExpressionStatement`を調べ、`setState`呼び出しを特定する。
    -   依存配列（`ArrayExpression`）の要素を解析し、`props`や`state`への参照を特定する。
    -   コンポーネントスコープ内の他の関数（イベントハンドラ）を解析し、トリガーとなる`setState`の呼び出し元を特定する。
-   **開発ステップ:**
    1.  ESLint開発環境のセットアップ。
    2.  各ルールのためのASTセレクタを定義。
    3.  検出ロジックとメッセージングを実装。
    4.  ユニットテスト（正しいコード、誤ったコード）を作成。
    5.  プロジェクトのESLint設定に統合。

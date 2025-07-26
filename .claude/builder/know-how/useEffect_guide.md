# React `useEffect` 利用ガイドライン

`useEffect`はReactコンポーネントで副作用を扱うための強力なフックですが、その一方で、過度な使用や誤用はバグやパフォーマンス低下の原因となり得ます。この資料では、`useEffect`の本来の役割を理解し、よりクリーンで予測可能なコードを書くための指針を示します。

## 1. `useEffect`の機能

`useEffect`は、Reactコンポーネントのレンダリング結果が画面に反映された後に、何らかの処理（副作用）を実行するために使います。

主な機能は以下の通りです。

*   **副作用の実行:** APIリクエスト、DOMの直接操作、イベントリスナーの登録など、Reactのレンダリングサイクルとは直接関係のない処理を実行します。
*   **実行タイミングの制御:** 第2引数の「依存配列」を使い、副作用を実行するタイミングを細かく制御できます。
    *   `useEffect(() => { ... })` : 毎回のレンダリング後に実行
    *   `useEffect(() => { ... }, [])` : コンポーネントのマウント時に1度だけ実行
    *   `useEffect(() => { ... }, [dep1, dep2])` : マウント時、および依存する値（`dep1` or `dep2`）が変更された時だけ実行
*   **クリーンアップ:** `useEffect`から関数を返すと、その関数はコンポーネントがアンマウントされる時や、副作用が再実行される直前に呼び出されます。イベントリスナーの解除やタイマーのクリアなど、後処理に使います。

```jsx
useEffect(() => {
  // 副作用のロジック
  const handler = () => console.log('resized');
  window.addEventListener('resize', handler);

  // クリーンアップ関数
  return () => {
    window.removeEventListener('resize', handler);
  };
}, []); // マウント時に1度だけ実行
```

## 2. `useEffect`でしか実現できないこと

`useEffect`の核心的な役割は、**「Reactの管理外のシステムとコンポーネントの状態を同期させること」**です。以下のような処理は、`useEffect`が不可欠な場面です。

*   **ブラウザAPIとの同期:**
    *   `window`や`document`へのイベントリスナーの登録・解除 (`addEventListener`)
    *   `setTimeout`や`setInterval`といったタイマーの管理
    *   `document.title`の書き換え
*   **外部ライブラリとの連携:**
    *   ReactベースではないUIライブラリ（例: jQueryプラグイン）の初期化やインスタンスの操作
    *   外部のステート管理システムとの接続
*   **その他、外部システムとの接続:**
    *   WebSocketやFirebaseなど、リアルタイム通信の接続・切断
    *   ブラウザのAPI（`navigator.geolocation`など）の監視

これらの処理に共通するのは、「Reactの宣言的な世界」と「外部の命令的な世界」の橋渡しをしている点です。

## 3. `useEffect`を避けるべき場面と回避策

`useEffect`は便利ですが、本来不要な場面で使うとコードを複雑にします。よくあるアンチパターンと、その回避策を紹介します。

### ケース1: PropsやStateの変更に応じたStateの更新

あるStateが他のPropsやStateから計算できる場合、`useEffect`で同期するのは冗長です。

**❌ アンチパターン**

```jsx
function UserProfile({ user }) {
  const [userName, setUserName] = useState(user.name);

  // user.nameが変わるたびにStateを更新
  useEffect(() => {
    setUserName(user.name);
  }, [user.name]);

  return <div>{userName}</div>;
}
```
このコードは、親コンポーネントが再レンダリング → `UserProfile`が古い`userName`でレンダリング → `useEffect`が実行され`setUserName` → `UserProfile`が再レンダリング、という無駄なサイクルを生みます。

**✅ 回避策**

#### A) レンダリング中に計算する

計算コストが低い場合、レンダリングのたびに値を計算するのが最もシンプルです。

```jsx
function UserProfile({ user }) {
  // useEffectは不要。レンダリング中に直接計算する。
  const userName = user.name;
  return <div>{userName}</div>;
}

function NameDisplay({ firstName, lastName }) {
  // 複数のpropsから計算する場合も同様
  const fullName = `${firstName} ${lastName}`;
  return <div>{fullName}</div>;
}
```

#### B) コンポーネントのStateをリセットする

Propsの変更に応じて、コンポーネントが持つ**全ての内部State**をリセットしたい場合は、`useEffect`で個別にリセットするのではなく、親コンポーネントで`key`属性を使いましょう。

`key`が変わると、Reactは古いコンポーネントを破棄し、新しいコンポーネントをマウントするため、Stateが自然に初期化されます。

```jsx
// 親コンポーネント
function UserPage({ userId }) {
  // userIdが変わると、UserProfileコンポーネント全体がリセットされる
  return <UserProfile key={userId} userId={userId} />;
}

// 子コンポーネント
function UserProfile({ userId }) {
  // これで、userIdが変わるたびに内部のStateは初期値に戻る
  const [comment, setComment] = useState('');
  // ...
}
```

### ケース2: ユーザーイベントへの応答

ユーザーのアクション（クリックなど）をきっかけに処理を行う場合、`useEffect`は不要です。

**❌ アンチパターン**

```jsx
function Cart() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (isCheckingOut) {
      // 支払い処理を実行
      processPayment();
      setIsCheckingOut(false);
    }
  }, [isCheckingOut]);

  function handleClick() {
    // Stateを更新してuseEffectをトリガーする
    setIsCheckingOut(true);
  }

  return <button onClick={handleClick}>Checkout</button>;
}
```
Stateの更新を介して処理を起動しており、回りくどく、意図が分かりにくいです。

**✅ 回避策**

イベントハンドラ内で直接ロジックを実行しましょう。これが最も直接的で分かりやすい方法です。

```jsx
function Cart() {
  function handleCheckout() {
    // イベントハンドラで直接処理を実行
    processPayment();
  }

  return <button onClick={handleCheckout}>Checkout</button>;
}
```

### ケース3: データのフェッチ

`useEffect`でのデータフェッチは伝統的な手法ですが、競合状態（Race Condition）やローディング/エラー状態の管理など、多くの課題を自前で解決する必要があります。

**❌ アンチパターン（注意が必要）**

```jsx
function ProductDetails({ productId }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    let ignore = false;
    fetchProduct(productId).then(data => {
      if (!ignore) {
        setProduct(data);
      }
    });
    // クリーンアップで競合状態を防ぐ
    return () => {
      ignore = true;
    };
  }, [productId]);
  // ...
}
```
上記のように競合状態対策は可能ですが、コードは複雑になります。

**✅ 回避策**

#### A) データフェッチライブラリを使う

`SWR`や`React Query (TanStack Query)`といった専用ライブラリを使いましょう。これらはデータフェッチに伴う複雑な問題を抽象化し、キャッシュ、再検証、状態管理などをシンプルに記述できます。

```jsx
// React Queryの例
import { useQuery } from '@tanstack/react-query';

function ProductDetails({ productId }) {
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId)
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return <div>{product.name}</div>;
}
```

#### B) フレームワークの機能を利用する (React Server Componentsなど)

Next.js (App Router) や Remix といったモダンなフレームワークは、サーバーサイドでデータを取得し、コンポーネントをレンダリングする仕組みを提供します。これにより、クライアントサイドでの`useEffect`によるデータフェッチが不要になるケースが増えます。

```jsx
// Next.js App Routerの例 (Server Component)
async function ProductDetails({ productId }) {
  // サーバー上で直接データをフェッチ
  const product = await fetchProduct(productId);

  return <div>{product.name}</div>;
}
```

## まとめ

`useEffect`は、**「外部システムとの同期」**という明確な目的のために使いましょう。

*   **PropsやStateから計算できる値**は、レンダリング中に直接計算する。
*   **ユーザーイベントへの応答**は、イベントハンドラで直接処理する。
*   **データのフェッチ**は、専用ライブラリやフレームワークの機能を活用する。

この原則に従うことで、`useEffect`の利用を本来必要な場面に限定し、コンポーネントをよりシンプルで堅牢なものにできます。

# モバイルUI/UX設計のベストプラクティス

**バージョン:** 1.0
**日付:** 2025-07-26

## 1. 概要

このドキュメントは、FocusFlowのモバイルアプリケーションにおけるUI/UX設計の原則と具体的な指針を定義します。

内容は、AppleのHuman Interface Guidelines (HIG)やGoogleのMaterial Designといった業界標準のガイドライン、およびNielsen Norman Groupなどが提唱するユーザビリティの普遍的原則に基づいています。その上で、FocusFlow独自の設計思想である「集中の最大化」と「Calm Technology」を適用するための具体的な指針を示します。

設計に迷った際は、まずこのドキュメントの**第2部: 普遍的原則**に立ち返り、次いで**第3部: FocusFlowにおける具体的な設計指針**を参照してください。

## 2. 普遍的原則 (Universal Principles)

これらは、あらゆる高品質なモバイルアプリに共通する、文献などで広く認められた基本原則です。

### 2.1. プラットフォームとの一貫性

- **原則:** OSの標準的なデザイン言語と操作性を尊重する。
- **詳細:** iOSユーザーはHIGに、AndroidユーザーはMaterial Designに準拠した操作を期待します。ナビゲーションパターン、アイコンのスタイル、ジェスチャーなどをプラットフォームの標準に合わせることで、ユーザーは学習コストなしに直感的にアプリを使用できます。
- **出典:** Apple Human Interface Guidelines, Google Material Design

### 2.2. ユーザーによるコントロールと自由

- **原則:** ユーザーが間違った操作をしても、簡単に元に戻せる手段（「緊急脱出口」）を提供する。
- **詳細:** 「元に戻す（Undo）」機能や、破壊的な操作（削除など）の前に確認ダイアログを表示することは、ユーザーに安心感を与え、自由にアプリを試すことを促します。
- **出典:** ヤコブ・ニールセンのユーザビリティ10原則

### 2.3. 認知負荷の軽減

- **原則:** 人間の短期記憶には限界があることを認識し、ユーザーに情報を記憶させることを避ける。
- **詳細:** 関連情報は同じ画面にまとめて表示し、専門用語や不明瞭なアイコンの使用を避けます。UIは、ユーザーが「考えなくても使える」ように、明確で一貫性のあるものであるべきです。
- **出典:** 認知心理学、Hick's Law（選択肢が多いほど決定に時間がかかる法則）

### 2.4. 明確なフィードバック

- **原則:** ユーザーのアクションに対して、システムが何をしているのかを即座に、そして明確に伝える。
- **詳細:** ボタンをタップしたら押された状態に変化する、データの読み込み中にはインジケーターを表示するなど、システムの状態を常に可視化します。これにより、ユーザーは状況を把握し、次に行うべきことを判断できます。
- **出典:** ヤコブ・ニールセンのユーザビリティ10原則

## 3. FocusFlowにおける具体的な設計指針

上記の普遍的原則を、FocusFlowの「集中」と「静けさ」というコンテキストに適用します。

### 3.1. レイアウトとナビゲーション

- **指針:** 主要な操作は画面下部の「親指ゾーン」に配置する。
- **詳細:** タブバーやフローティングアクションボタン（FAB）など、頻繁に使う機能は画面下半分に配置します。これにより、特に大画面のデバイスでも快適な片手操作を実現します。
- **根拠:** Fitt's Law（ターゲットが近いほど操作しやすい法則）、プラットフォームとの一貫性。

- **指針:** 一つの画面には、一つの主要な目的（コールトゥアクション）のみを設定する。
- **詳細:** 「タスク一覧画面」ではタスクの確認と並び替えに、「フォーカス画面」ではタイマーの開始に集中させます。関連性の低い機能は別の画面に分け、視覚的なノイズを排除します。
- **根拠:** 認知負荷の軽減。

- **指針:** セーフエリアを尊重し、システムUIとの衝突を避ける。
- **詳細:** ボタンや重要なコンテンツを、OSのシステムUI（上部のステータスバーやカメラノッチ、下部のホームインジケーターやナビゲーションバー）と重ならない「セーフエリア」内に配置します。これにより、Pixel 6aなどで報告された「画面下部のボタンが操作しづらい」「上部の表示が見づらい」といった問題を根本的に防ぎます。
- **実装方法 (CSS例):** Webベースのフレームワークでは、CSSの `env()` 関数と `safe-area-inset-*` 定数を用いて、アプリのメインコンテナにパディングを設定するのが一般的です。
  ```css
  .app-container {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
  ```
- **根拠:** プラットフォームとの一貫性、エラーの防止。

### 3.2. インタラクションと入力

- **指針:** すべてのタップターゲットは、最低でも `44x44pt (iOS)` / `48x48dp (Android)` のサイズを確保する。
- **詳細:** ボタン、アイコン、リスト項目などが密集していても、ユーザーが意図したものを正確にタップできるようにします。ターゲットの周囲には十分な余白を設けます。
- **根拠:** プラットフォームとの一貫性、エラーの防止。

- **指針:** 破壊的な操作（削除など）には、元に戻す（Undo）オプションを提供する。
- **詳細:** 確認ダイアログはユーザーのフローを中断させるため、可能な限り避けます。代わりに、操作直後に「タスクを削除しました。[元に戻す]」といったスナックバーを短時間表示する方式を優先します。
- **根拠:** ユーザーによるコントロールと自由、認知負荷の軽減。

### 3.3. フィードバックと状態表示

- **指針:** フィードバックは「静か」な方法を優先する。
- **詳細:** ユーザーのアクションに対するフィードバックは、派手なアニメーションや音ではなく、控えめな触覚フィードバック（ハプティクス）や、UI要素の微妙な状態変化（例: ボタンの色が少し濃くなる）で行います。
- **根拠:** FocusFlowの設計思想（Calm Technology）。

- **指針:** ローディング状態は、スケルトンスクリーンで示す。
- **詳細:** データ読み込み中に、コンテンツの概形を模したプレースホルダー（スケルトンスクリーン）を表示します。これにより、ユーザーは体感的な待ち時間を短く感じ、何が表示されるかを予測できます。
- **根拠:** 明確なフィードバック、認知負荷の軽減。

### 3.4. アクセシビリティ (A11y)

- **指針:** WCAG 2.1のAAレベルを最低基準とする。
- **詳細:**
    - **コントラスト:** テキストと背景のコントラスト比を4.5:1以上確保する。
    - **スクリーンリーダー:** すべての画像やアイコンに代替テキストを設定し、UI要素が論理的な順序で読み上げられるようにする。
    - **フォントサイズ:** ユーザーがOSで設定した文字サイズをアプリが尊重するように設計する。
- **根拠:** すべてのユーザーに対する公平なアクセス性の提供。

## 4. 参考資料

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Google Material Design](https://material.io/design)
- [Nielsen Norman Group: Usability Heuristics for User Interface Design](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/)

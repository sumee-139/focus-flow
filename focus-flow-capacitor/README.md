# FocusFlow Capacitor - Development Guide

## プロジェクト概要

FocusFlowのCapacitor統一アーキテクチャ版です。Web、Desktop、Mobile（Android/iOS）で同一コードベースを使用し、OSレベル通知制御を実現します。

## 技術スタック

- **Frontend**: React 18 + TypeScript 5 + Vite 5
- **UI**: Vanilla CSS (レスポンシブデザイン)
- **State Management**: React Hooks (useState, useEffect)
- **Cross-Platform**: Capacitor 6
- **Notification**: @capacitor/local-notifications
- **Build Tool**: Vite (Web) + Gradle (Android) + Xcode (iOS)

## 開発環境セットアップ

### 必要なソフトウェア

1. **Node.js** (v18以上)
2. **npm** (v9以上)
3. **Android Studio** (Android開発用)
4. **Java 21** (Android開発用)
5. **Xcode** (iOS開発用 - macOSのみ)

### インストール手順

```bash
# 1. プロジェクトディレクトリに移動
cd /home/yuta_sakamoto/claude_test/focus-flow/focus-flow-capacitor

# 2. 依存関係インストール
npm install

# 3. Android SDK設定 (Android開発の場合)
export ANDROID_HOME=~/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## 開発・ビルド手順

### 1. PC Web版の起動手順

#### 開発サーバー起動
```bash
# 開発サーバー起動
npm run dev

# ブラウザで以下にアクセス
# http://localhost:5173
```

#### Web版機能確認
- **Platform Information**: `web` platform表示
- **Focus Mode**: ON/OFF切り替え
- **Notification Test**: ブラウザ通知（権限必要）

#### Web版制限事項
- OSレベル通知制御は不可（ブラウザ制限）
- Critical Alert機能は無効
- 通知はブラウザ標準通知のみ

### 2. Androidアプリのビルド手順

#### 事前準備
```bash
# Android SDK環境変数設定
export ANDROID_HOME=~/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Android SDK確認
ls $ANDROID_HOME/platform-tools/adb
```

#### ビルド実行
```bash
# 1. Webアセットビルド
npm run build

# 2. Capacitor同期
npx cap sync

# 3. Android APKビルド
cd android
./gradlew assembleDebug
cd ..

# 4. APKファイル確認
ls -la android/app/build/outputs/apk/debug/app-debug.apk
```

#### ビルド成功確認
```bash
# APKファイルサイズ確認（約5MB）
ls -lh android/app/build/outputs/apk/debug/app-debug.apk

# 出力例:
# -rw-r--r-- 1 user user 4.9M Jul 18 04:57 app-debug.apk
```

### 3. Android実機テスト手順

#### APKインストール方法

**方法A: USBデバッグ経由**
```bash
# デバイス接続確認
adb devices

# APKインストール
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**方法B: ファイル転送**
```bash
# WindowsにAPKコピー（日付付きファイル名）
cp android/app/build/outputs/apk/debug/app-debug.apk /mnt/c/Users/$(whoami)/Downloads/$(date +%Y-%m-%d)-app-debug.apk

# 1. Google DriveやUSBでAndroidデバイスに転送
# 2. 設定 → セキュリティ → 提供元不明のアプリ → 許可
# 3. ファイルマネージャーでAPKをタップしてインストール
```

#### 実機テスト項目
- **アプリ起動**: FocusFlowアプリが正常に起動
- **Platform Information**: `android` platform表示
- **Focus Mode**: ON/OFF切り替え動作
- **Critical Alert**: Do Not Disturb中でも通知表示

## APK命名規則

### 日付付きファイル名の使用
APKファイルは必ず先頭に `YYYY-MM-DD` 形式の日付を付けて管理します。

```bash
# 正しい命名例
2025-07-18-app-debug.apk
2025-07-18-app-debug-text-fixed.apk
2025-07-19-app-debug-ui-improved.apk

# 推奨コマンド
TODAY=$(date +%Y-%m-%d)
cp android/app/build/outputs/apk/debug/app-debug.apk /mnt/c/Users/$(whoami)/Downloads/${TODAY}-app-debug.apk
```

### バージョン管理のメリット
- **時系列での管理**: 最新版が一目でわかる
- **機能別識別**: 修正内容をファイル名で識別
- **テスト効率**: 複数バージョンの並行テストが可能

### 推奨命名パターン
```bash
# 基本形
YYYY-MM-DD-app-debug.apk

# 機能別
YYYY-MM-DD-app-debug-[feature].apk

# 例
2025-07-18-app-debug.apk              # 基本版
2025-07-18-app-debug-text-fixed.apk   # テキスト修正版
2025-07-18-app-debug-ui-improved.apk  # UI改善版
```

## 開発コマンド一覧

### Web開発
```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# プロダクションビルド
npm run build

# プロダクションプレビュー
npm run preview
```

### Capacitor操作
```bash
# 全プラットフォーム同期
npx cap sync

# Android同期のみ
npx cap sync android

# iOS同期のみ
npx cap sync ios

# Android Studioで開く
npx cap open android

# Xcodeで開く
npx cap open ios
```

### Android開発
```bash
# APKビルド（デバッグ版）
cd android && ./gradlew assembleDebug

# APKビルド（リリース版）
cd android && ./gradlew assembleRelease

# Android Studio起動
npx cap open android
```

### iOS開発（macOSのみ）
```bash
# iOS同期
npx cap sync ios

# Xcode起動
npx cap open ios
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. `npm run dev`が起動しない
```bash
# node_modulesクリア
rm -rf node_modules package-lock.json
npm install

# ポート確認
lsof -i :5173
```

#### 2. Android APKビルドエラー
```bash
# 環境変数確認
echo $ANDROID_HOME
echo $PATH

# Gradle キャッシュクリア
cd android
./gradlew clean
cd ..
```

#### 3. `SDK location not found`エラー
```bash
# Android SDK環境変数設定
export ANDROID_HOME=~/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# local.propertiesファイル作成
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
```

#### 4. Java バージョンエラー
```bash
# Java 21確認
java -version

# Java 21インストール（必要に応じて）
# Ubuntu/Debian:
sudo apt update
sudo apt install openjdk-21-jdk
```

### デバッグ用ログ
```bash
# Androidデバイスログ
adb logcat | grep -i focusflow

# Capacitorログ
npx cap run android --livereload
```

## ファイル構成

```
focus-flow-capacitor/
├── src/
│   ├── App.tsx              # メインアプリケーション
│   ├── App.css              # スタイルシート
│   ├── main.tsx             # エントリーポイント
│   └── vite-env.d.ts        # Vite型定義
├── android/                 # Android固有ファイル
│   ├── app/
│   │   └── build/outputs/apk/debug/  # APKファイル出力
│   └── local.properties     # Android SDK設定
├── ios/                     # iOS固有ファイル
├── public/                  # 静的ファイル
├── dist/                    # ビルド出力
├── capacitor.config.ts      # Capacitor設定
├── package.json             # 依存関係
└── vite.config.ts          # Vite設定
```

## 主要機能

### 1. OSレベル通知制御
- **Critical Alert**: Do Not Disturb設定を無視して通知
- **Focus Mode**: 通知のON/OFF制御
- **Platform Detection**: Web/Android/iOS自動判定

### 2. クロスプラットフォーム対応
- **Web**: ブラウザ標準通知
- **Android**: Critical Alert対応
- **iOS**: Critical Alert対応（予定）

### 3. UI/UX
- **レスポンシブデザイン**: 全画面サイズ対応
- **モバイル最適化**: 480px以下の小画面対応
- **アクセシビリティ**: キーボードナビゲーション

## 技術的な決定

詳細な技術選択理由については以下を参照：
- **ADR-0001**: Capacitor統一アーキテクチャの採用 (`/docs/adr/0001-capacitor-unified-architecture.md`)

## 今後の予定

### Phase 2（予定）
- タスク管理機能
- IndexedDBデータベース
- デイリーメモ機能

### Phase 3（予定）
- 時間分析機能
- 生産性レポート
- パフォーマンス最適化

## 貢献方法

開発への貢献については、プロジェクトのTDD & Component Development ルールに従ってください：
- **TDD**: Red-Green-Refactorサイクル
- **Component**: モックアップ必須
- **Testing**: 80%+カバレッジ目標

## ライセンス

このプロジェクトは、FocusFlowプロジェクトのプロトタイプとして開発されています。
# FocusFlow Capacitor - トラブルシューティング

## 🔧 よくある問題と解決方法

### 1. Web開発環境の問題

#### `npm run dev`が起動しない
```bash
# 解決方法 1: node_modulesをクリア
rm -rf node_modules package-lock.json
npm install
npm run dev

# 解決方法 2: ポート確認
lsof -i :5173
# 別のプロセスが使用中の場合は停止

# 解決方法 3: キャッシュクリア
npm run dev -- --force
```

#### TypeScriptエラー
```bash
# 型チェック実行
npm run type-check

# よくあるエラー:
# - 型定義ファイルが不足 → npm install @types/node
# - 型の不一致 → App.tsxの型注釈確認
```

### 2. Android開発環境の問題

#### `SDK location not found`エラー
```bash
# 解決方法 1: 環境変数設定
export ANDROID_HOME=~/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# 解決方法 2: local.propertiesファイル作成
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

# 解決方法 3: Android SDK確認
ls -la ~/android-sdk/platform-tools/adb
```

#### Java バージョンエラー
```bash
# 現在のJavaバージョン確認
java -version

# Java 21が必要です
# Ubuntu/Debian:
sudo apt update
sudo apt install openjdk-21-jdk

# 環境変数設定
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
```

#### Gradleビルドエラー
```bash
# 解決方法 1: Gradleキャッシュクリア
cd android
./gradlew clean
cd ..

# 解決方法 2: 権限確認
chmod +x android/gradlew

# 解決方法 3: Android SDK更新
# Android Studioを起動 → SDK Manager → 最新版に更新
```

### 3. Capacitor関連の問題

#### `npx cap sync`エラー
```bash
# 解決方法 1: distフォルダ確認
npm run build
ls -la dist/

# 解決方法 2: Capacitor設定確認
cat capacitor.config.ts

# 解決方法 3: プラットフォーム追加
npx cap add android
```

#### プラグインエラー
```bash
# 解決方法 1: プラグイン再インストール
npm uninstall @capacitor/local-notifications
npm install @capacitor/local-notifications
npx cap sync

# 解決方法 2: プラグイン一覧確認
npx cap ls
```

### 4. Android実機テストの問題

#### APKインストールエラー
```bash
# 解決方法 1: 提供元不明のアプリ許可
# 設定 → セキュリティ → 提供元不明のアプリ → 許可

# 解決方法 2: ストレージ容量確認
# 5MB以上の空き容量が必要

# 解決方法 3: 古いバージョンのアンインストール
# アプリ一覧からFocusFlowを削除してから再インストール
```

#### ADBデバッグ接続エラー
```bash
# 解決方法 1: USBデバッグ設定確認
# 設定 → 開発者向けオプション → USBデバッグ ON

# 解決方法 2: デバイス認証
adb devices
# 「unauthorized」の場合はデバイスで認証ダイアログを承認

# 解決方法 3: ADBサーバー再起動
adb kill-server
adb start-server
adb devices
```

#### ワイヤレスデバッグエラー
```bash
# 解決方法 1: 同じWi-Fiネットワーク確認
# PCとAndroidデバイスが同じWi-Fiに接続されていることを確認

# 解決方法 2: ペアリングやり直し
# 設定 → 開発者向けオプション → ワイヤレスデバッグ → リセット

# 解決方法 3: ファイアウォール確認
# Windowsファイアウォールがポートをブロックしていないか確認
```

### 5. 通知機能の問題

#### 通知が表示されない
```bash
# 解決方法 1: 権限確認
# アプリ設定で通知権限が有効になっているか確認

# 解決方法 2: Do Not Disturb設定確認
# Critical Alertが設定されているか確認

# 解決方法 3: ログ確認
adb logcat | grep -i notification
```

#### Critical Alertが動作しない
```bash
# 解決方法 1: Android設定確認
# 設定 → 通知 → 詳細設定 → Critical Alertの許可

# 解決方法 2: コード確認
# App.tsxのextraパラメータ確認:
# extra: { critical: 1, volume: 1.0 }

# 解決方法 3: Androidバージョン確認
# Android 8.0以上でCritical Alert対応
```

### 6. UI表示の問題

#### 文字が切れる・見えない
```bash
# 解決方法 1: CSS確認
# App.cssのレスポンシブ設定確認

# 解決方法 2: 再ビルド
npm run build
npx cap sync
cd android && ./gradlew assembleDebug && cd ..

# 解決方法 3: ブラウザ確認
# まずPC Web版 (localhost:5173) で表示確認
```

#### Platform Information文字が白飛びする
**症状**: 「Platform:」「Native:」「Permission:」の文字が見えない

**原因**: `.info-grid`内のテキストに色指定がない

**解決方法**:
```css
/* App.cssに追加 */
.info-grid div {
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* モバイル表示の強化 */
@media (max-width: 480px) {
  .info-grid div {
    color: #222;
    font-weight: 600;
  }
}
```

**確認方法**:
1. PC Web版 (`npm run dev`) で文字表示確認
2. Android APK再ビルド・インストール
3. Platform Informationセクションで文字が明確に見えることを確認

#### レスポンシブデザインが機能しない
```bash
# 解決方法 1: viewport設定確認
# index.htmlのviewportメタタグ確認

# 解決方法 2: CSS media query確認
# App.cssの@mediaクエリ確認

# 解決方法 3: デバイス確認
# Chrome DevToolsでモバイル表示確認
```

## 🔍 デバッグ方法

### 1. Web版デバッグ
```bash
# 開発サーバー起動
npm run dev

# ブラウザのDevToolsでConsoleエラー確認
# F12 → Console タブ
```

### 2. Android版デバッグ
```bash
# Androidデバイスログ確認
adb logcat | grep -i focusflow

# Capacitorログ確認
adb logcat | grep -i capacitor

# Live Reloadでデバッグ
npx cap run android --livereload
```

### 3. ビルドデバッグ
```bash
# Viteビルド詳細ログ
npm run build -- --mode development

# Gradleビルド詳細ログ
cd android
./gradlew assembleDebug --info
cd ..
```

## 📊 状態確認コマンド

### 環境状態確認
```bash
# Node.js環境
node -v
npm -v

# Java環境
java -version

# Android SDK
echo $ANDROID_HOME
ls -la $ANDROID_HOME/platform-tools/adb

# プロジェクト状態
ls -la node_modules/ dist/ android/
```

### 実行状態確認
```bash
# 開発サーバー確認
curl http://localhost:5173

# Androidデバイス確認
adb devices

# APKファイル確認
ls -la android/app/build/outputs/apk/debug/app-debug.apk
```

## 🆘 緊急時の対応

### 完全リセット手順
```bash
# 1. 依存関係完全削除
rm -rf node_modules package-lock.json

# 2. ビルド成果物削除
rm -rf dist/ android/app/build/

# 3. Capacitor設定リセット
npx cap sync --force

# 4. 完全再ビルド
npm install
npm run build
npx cap sync
cd android && ./gradlew clean && ./gradlew assembleDebug && cd ..
```

### 環境変数永続化
```bash
# ~/.bashrcに追加
echo 'export ANDROID_HOME=~/android-sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc
```

## 📞 サポート情報

### ログ収集
問題報告時は以下のログを添付してください：

```bash
# 環境情報
node -v > debug.log
npm -v >> debug.log
java -version >> debug.log 2>&1
echo $ANDROID_HOME >> debug.log

# エラーログ
npm run build >> debug.log 2>&1
npx cap sync >> debug.log 2>&1
cd android && ./gradlew assembleDebug >> ../debug.log 2>&1
```

### 既知の制限事項
- **iOS対応**: 現在未対応（Phase 2予定）
- **Web版通知**: Critical Alert機能なし
- **ワイヤレスデバッグ**: WSL2環境での制限
- **UI最適化**: 一部モバイル表示問題

問題が解決しない場合は、上記のdebug.logファイルと具体的なエラーメッセージを共有してください。
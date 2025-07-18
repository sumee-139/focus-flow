# FocusFlow Capacitor - クイックスタートガイド

## 🚀 最速でテストを開始する手順

### 1. PC Web版テスト（2分）

```bash
# プロジェクトディレクトリに移動
cd /home/yuta_sakamoto/claude_test/focus-flow/focus-flow-capacitor

# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:5173 にアクセス
```

#### 確認項目
✅ **Platform Information**: `web` と表示  
✅ **Focus Mode**: ON/OFF切り替え動作  
✅ **Notification Test**: ブラウザ通知（権限許可後）  

### 2. Android APK作成（5分）

```bash
# 環境変数設定
export ANDROID_HOME=~/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# ビルド実行
npm run build
npx cap sync
cd android && ./gradlew assembleDebug && cd ..

# APKファイル確認
ls -la android/app/build/outputs/apk/debug/app-debug.apk
```

#### 成功確認
✅ APKファイルサイズ: 約5MB  
✅ エラーなくビルド完了  

### 3. Android実機テスト（3分）

#### 方法A: 直接転送（推奨）
```bash
# WindowsにAPKコピー（日付付きファイル名）
TODAY=$(date +%Y-%m-%d)
cp android/app/build/outputs/apk/debug/app-debug.apk /mnt/c/Users/$(whoami)/Downloads/${TODAY}-app-debug.apk

# 1. Google DriveやUSBでAndroidデバイスに転送
# 2. 設定 → セキュリティ → 提供元不明のアプリ → 許可
# 3. ファイルマネージャーでAPKをタップしてインストール
```

#### 方法B: ADBインストール
```bash
# Androidデバイス接続確認
adb devices

# APKインストール
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 4. 実機テスト内容

#### 基本動作確認
✅ **アプリ起動**: FocusFlowアプリが正常に起動  
✅ **Platform Information**: `android` と表示  
✅ **Focus Mode**: ON/OFF切り替え動作  

#### 通知制御テスト（重要）
1. **Do Not Disturb OFF**の状態で「Test Notification」→ 通知表示
2. **Do Not Disturb ON**に設定
3. **Focus Mode OFF**の状態で「Test Notification」→ **Critical Alert通知表示**
4. **Focus Mode ON**の状態で「Test Notification」→ 通知ブロック

✅ **Critical Alert**: Do Not Disturb中でも通知が表示される  
✅ **Focus Mode**: 通知のON/OFF制御が動作する  

## 💡 トラブルシューティング

### Web版が起動しない
```bash
# node_modulesクリア
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Android APKビルドエラー
```bash
# 環境変数確認
echo $ANDROID_HOME
echo $PATH

# local.propertiesファイル作成
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
```

### APKインストールエラー
- **提供元不明のアプリ**の許可を確認
- **ストレージ容量**を確認（5MB以上必要）
- **アプリの重複インストール**を確認（古いバージョンをアンインストール）

## ✅ 成功の判定基準

### Phase 1 MVP成功基準
- [ ] PC Web版でアプリが正常に起動
- [ ] Android APKが正常にビルド
- [ ] Android実機でアプリが正常に起動
- [ ] **Critical Alert機能がDo Not Disturb中でも動作**
- [ ] Focus Mode ON/OFF制御が正常に動作

### 特に重要な検証ポイント
**OSレベル通知制御** = FocusFlowの優位性の核心機能

> 「通知を制御できなければFocusFlowの優位性はほぼない」

Android Do Not Disturb設定中でも、Critical Alert通知が表示されることが最重要テスト項目です。

## 📋 次のステップ

Phase 1検証完了後：
1. **UI改善**: モバイル表示問題の修正
2. **Phase 2機能**: タスク管理機能の実装
3. **iOS対応**: iOS版の実装と検証

## 🔗 関連ドキュメント

- [詳細な開発ガイド](./README.md)
- [技術的決定 (ADR-0001)](../docs/adr/0001-capacitor-unified-architecture.md)
- [Design Philosophy](../docs/core/design-philosophy.md)
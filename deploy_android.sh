#!/bin/bash
#
# focus-flow-capacitor Androidビルド＆デプロイスクリプト
#
# このスクリプトは、CapacitorプロジェクトのAndroidアプリをビルドし、
# ADB経由で接続されたデバイスに自動的にインストールします。
# QUICKSTART.mdに基づき、環境設定も自動で行います。
#

# --- 色付け用の変数 ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# スクリプトが失敗したら即座に終了
set -e

echo -e "${GREEN}Androidビルド＆デプロイスクリプトを開始します...${NC}"

# --- ステップ0: 環境設定 (QUICKSTART.mdに基づく) ---
echo -e "\n${YELLOW}ステップ0: Android SDK環境を確認・設定します...${NC}"

# ANDROID_HOMEが設定されていない場合、デフォルト値を設定
if [ -z "$ANDROID_HOME" ]; then
    echo "ANDROID_HOMEが設定されていません。デフォルト値 '~/android-sdk' を使用します。"
    export ANDROID_HOME=~/android-sdk
fi

# platform-toolsへのパスを追加
PLATFORM_TOOLS_PATH="$ANDROID_HOME/platform-tools"
if [[ ":$PATH:" != *":${PLATFORM_TOOLS_PATH}:"* ]]; then
    echo "PATHに '$PLATFORM_TOOLS_PATH' を追加します。"
    export PATH="$PATH:$PLATFORM_TOOLS_PATH"
fi

# adbコマンドの存在確認
if ! command -v adb &> /dev/null; then
    echo -e "${RED}エラー: adbコマンドが見つかりません。${NC}"
    echo "ANDROID_HOMEのパスが正しいか確認してください: $ANDROID_HOME"
    echo "Android SDK Platform-Toolsがインストールされているか確認してください。"
    exit 1
fi

echo -e "${GREEN}ANDROID_HOME: $ANDROID_HOME${NC}"
echo -e "${GREEN}ADBコマンドのパス: $(command -v adb)${NC}"

# --- ステップ1: ADB接続確認 ---
echo -e "\n${YELLOW}ステップ1: ADBデバイスの接続を確認しています...${NC}"

# `adb devices`の出力を確認し、'device'という単語が含まれているかで判断
# `tail -n +2`でヘッダー行を除外し、`grep -w 'device'`でデバイスがリストされている行を探す
if ! adb devices | tail -n +2 | grep -qw 'device'; then
    echo -e "${RED}ADBデバイスが見つかりません。${NC}"
    read -p "接続するデバイスのIPアドレスを入力してください (例: 192.168.1.10): " DEVICE_IP

    if [ -z "$DEVICE_IP" ]; then
        echo -e "${RED}IPアドレスが入力されませんでした。スクリプトを終了します。${NC}"
        exit 1
    fi

    echo -e "${YELLOW}${DEVICE_IP}に接続を試みます...${NC}"
    # adb connectは失敗時に非0の終了コードを返すことがあるため、|| trueでスクリプトの即時終了を防ぐ
    adb connect "${DEVICE_IP}" || true

    # 再度デバイス接続を確認
    if ! adb devices | tail -n +2 | grep -qw 'device'; then
        echo -e "${RED}IPアドレス (${DEVICE_IP}) への接続に失敗しました。${NC}"
        read -p "ワイヤレスデバッグのペアリングを試みますか？ (y/n): " TRY_PAIRING

        if [[ "$TRY_PAIRING" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}ペアリング情報を入力してください。${NC}"
            read -p "ペアリング用のIPアドレス: " PAIRING_IP
            read -p "ペアリング用のポート番号: " PAIRING_PORT
            read -p "6桁のペアリングコード: " PAIRING_CODE

            if [ -z "$PAIRING_IP" ] || [ -z "$PAIRING_PORT" ] || [ -z "$PAIRING_CODE" ]; then
                echo -e "${RED}ペアリング情報が不足しています。スクリプトを終了します。${NC}"
                exit 1
            fi

            echo -e "${YELLOW}${PAIRING_IP}:${PAIRING_PORT} とペアリングを試みます...${NC}"
            # ペアリングコードを標準入力で渡す
            echo "$PAIRING_CODE" | adb pair "${PAIRING_IP}:${PAIRING_PORT}"

            # ペアリング後の接続試行
            echo -e "${YELLOW}ペアリング後、再度 ${DEVICE_IP} に接続を試みます...${NC}"
            adb connect "${DEVICE_IP}" || true

            if ! adb devices | tail -n +2 | grep -qw 'device'; then
                echo -e "${RED}ペアリング後の接続にも失敗しました。スクリプトを終了します。${NC}"
                echo "以下の点を確認してください:"
                echo " - デバイスとPCが同じWi-Fiに接続されているか"
                echo " - 入力したIPアドレス、ポート、ペアリングコードが正しいか"
                echo " - デバイスのワイヤレスデバッグが有効になっているか"
                exit 1
            fi
        else
            echo -e "${RED}ペアリングを行わずにスクリプトを終了します。${NC}"
            exit 1
        fi
    fi
    echo -e "${GREEN}デバイスに接続しました。${NC}"
    adb devices | tail -n +2
else
    echo -e "${GREEN}接続中のデバイスが見つかりました。${NC}"
    adb devices | tail -n +2
fi

# --- ステップ2: Capacitorプロジェクトのビルド ---
PROJECT_DIR="focus-flow-capacitor"
echo -e "\n${YELLOW}ステップ2: Capacitorプロジェクトをビルドします (場所: ${PROJECT_DIR})${NC}"

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}エラー: ディレクトリ '${PROJECT_DIR}' が見つかりません。${NC}"
    exit 1
fi

# local.propertiesの確認と作成
ANDROID_PROJECT_DIR="${PROJECT_DIR}/android"
LOCAL_PROPERTIES_FILE="${ANDROID_PROJECT_DIR}/local.properties"
if [ ! -f "$LOCAL_PROPERTIES_FILE" ]; then
    echo -e "${YELLOW}'$LOCAL_PROPERTIES_FILE' が見つかりません。自動作成します...${NC}"
    # SDKパスの'~'を絶対パスに展開
    SDK_PATH_EXPANDED=$(eval echo $ANDROID_HOME)
    echo "sdk.dir=${SDK_PATH_EXPANDED}" > "$LOCAL_PROPERTIES_FILE"
    echo -e "${GREEN}'$LOCAL_PROPERTIES_FILE' を作成しました。${NC}"
fi

# サブシェルで実行することで、スクリプト終了後に元のディレクトリに戻る
(
    cd "$PROJECT_DIR"

    echo -e "\n${GREEN}--- 依存関係をインストールしています (npm install)...${NC}"
    npm install

    echo -e "\n${GREEN}--- WebアセットをAndroidプロジェクトに同期しています (npx cap sync android)...${NC}"
    npx cap sync android

    echo -e "\n${GREEN}--- AndroidのデバッグAPKをビルドしています (./gradlew assembleDebug)...${NC}"
    cd android
    ./gradlew assembleDebug
    cd ..
)

# --- ステップ3: APKのインストール ---
echo -e "\n${YELLOW}ステップ3: APKをデバイスにインストールします...${NC}"

# ビルドされたAPKファイルへのパスを検索
APK_PATH=$(find "${PROJECT_DIR}/android/app/build/outputs/apk/debug/" -name "app-debug.apk" -print -quit)

if [ -z "$APK_PATH" ]; then
    echo -e "${RED}エラー: ビルドされたapp-debug.apkが見つかりませんでした。${NC}"
    exit 1
fi

echo -e "${GREEN}APKファイルを発見: ${APK_PATH}${NC}"
echo -e "${GREEN}デバイスにインストールしています...${NC}"

# -r オプションで既存のアプリを上書きインストール
adb install -r "$APK_PATH"

echo -e "\n${GREEN}🎉 スクリプトは正常に完了しました！${NC}"
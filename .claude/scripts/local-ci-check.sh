#!/bin/bash
# ローカル環境でCI/CDを模倣する品質ゲートスクリプト

# スクリプトが配置されているディレクトリに移動して実行
cd "$(dirname "$0")/../../focus-flow-capacitor"

# 色付け用
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# タイムスタンプ
start_time=$(date +%s)

echo -e "${YELLOW}===== ローカル品質ゲート開始 =====${NC}"

# 1. 静的解析 (ESLint)
echo -e "\n${YELLOW}1/4: 静的解析 (ESLint) を実行中...${NC}"
npm run lint
if [ $? -ne 0 ]; then
    echo -e "\n${RED}静的解析でエラーが検出されました。処理を中断します。${NC}"
    exit 1
fi
echo -e "${GREEN}静的解析クリア！${NC}"

# 2. 単体・結合テスト (Vitest)
echo -e "\n${YELLOW}2/4: 単体・結合テスト (Vitest) を実行中...${NC}"
npm run test:run
if [ $? -ne 0 ]; then
    echo -e "\n${RED}単体・結合テストでエラーが検出されました。処理を中断します。${NC}"
    exit 1
fi
echo -e "${GREEN}単体・結合テストクリア！${NC}"

# 3. E2Eテスト (Playwright)
echo -e "\n${YELLOW}3/4: E2Eテスト (Playwright) を実行中...${NC}"
npm run test:e2e
if [ $? -ne 0 ]; then
    echo -e "\n${RED}E2Eテストでエラーが検出されました。処理を中断します。${NC}"
    exit 1
fi
echo -e "${GREEN}E2Eテストクリア！${NC}"

# 4. プロダクションビルド
echo -e "\n${YELLOW}4/4: プロダクションビルドを実行中...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "\n${RED}プロダクションビルドに失敗しました。処理を中断します。${NC}"
    exit 1
fi
echo -e "${GREEN}プロダクションビルド成功！${NC}"

end_time=$(date +%s)
duration=$((end_time - start_time))

echo -e "\n${GREEN}===== すべての品質ゲートをクリアしました！ (${duration}秒) =====${NC}"

exit 0

#!/bin/bash
# 改善されたCSSクラス検証スクリプト
# 複合セレクタに対応し、未定義クラスを正確に検出する

# プロジェクトのルートディレクトリに移動
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$SCRIPT_DIR/../../focus-flow-capacitor"

if [ ! -d "$PROJECT_ROOT" ]; then
    echo "Error: プロジェクトディレクトリが見つかりません: $PROJECT_ROOT"
    exit 1
fi

cd "$PROJECT_ROOT"

# 色付け用
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== CSS Class Definition Check ===${NC}"

# 使用されているクラス一覧を取得
echo "使用されているクラスを抽出中..."
grep -r "className=" src/components --include="*.tsx" | \
    grep -o 'className="[^"]*"' | \
    sed 's/className="//;s/"//' | \
    tr ' ' '\n' | \
    grep -v '^$' | \
    sort | uniq > /tmp/used_classes.txt

# 定義されているクラス一覧を取得（複合セレクタ対応）
echo "定義されているクラスを抽出中..."
find src -name "*.css" -exec cat {} \; | \
    # CSSコメントを除去
    sed 's|/\*.*\*/||g' | \
    # 複数行コメントを除去
    sed '/\/\*/,/\*\//d' | \
    # セレクタ行のみを抽出（{より前の部分）
    sed 's/{.*//' | \
    # クラスセレクタのみを抽出（.で始まる）
    grep '\.' | \
    # 複合セレクタを分解（例: .focus-btn.active → focus-btn と active）
    sed 's/\./ /g' | \
    # 疑似クラス・疑似要素を除去（:hover, ::before など）
    sed 's/:[a-z-]*//g' | \
    # 空白区切りで複数クラスに分割
    tr ' ' '\n' | \
    # 空行と余分な文字を除去
    grep -v '^$' | \
    # CSS クラス名のパターンにマッチするもののみ（英数字、ハイフン、アンダースコア）
    grep '^[a-zA-Z][a-zA-Z0-9_-]*$' | \
    # CSS プロパティっぽいものを除外（既知のプロパティ名）
    grep -v -E '^(color|background|border|margin|padding|font|text|display|position|width|height|top|left|right|bottom|opacity|transform|transition|animation|flex|grid|gap|line|box|outline|list|overflow|visibility|z)' | \
    sort | uniq > /tmp/defined_classes.txt

echo -e "\n使用されているクラス ($(wc -l < /tmp/used_classes.txt)個):"
cat /tmp/used_classes.txt

echo -e "\n定義されているクラス ($(wc -l < /tmp/defined_classes.txt)個):"
cat /tmp/defined_classes.txt

# 未定義クラスの検出
echo -e "\n未定義クラスをチェック中..."
comm -23 /tmp/used_classes.txt /tmp/defined_classes.txt > /tmp/undefined_classes.txt

UNDEFINED_COUNT=$(wc -l < /tmp/undefined_classes.txt)

if [ "$UNDEFINED_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ すべてのクラスが定義されています！${NC}"
    exit_code=0
else
    echo -e "${RED}❌ 未定義クラスが ${UNDEFINED_COUNT}個 見つかりました:${NC}"
    cat /tmp/undefined_classes.txt | sed 's/^/  ❌ /'
    exit_code=1
fi

# 詳細情報の表示
echo -e "\n${YELLOW}詳細情報:${NC}"
echo "  使用クラス数: $(wc -l < /tmp/used_classes.txt)"
echo "  定義クラス数: $(wc -l < /tmp/defined_classes.txt)"
echo "  未定義クラス数: $UNDEFINED_COUNT"

# ファイルクリーンアップ
rm -f /tmp/used_classes.txt /tmp/defined_classes.txt /tmp/undefined_classes.txt

exit $exit_code
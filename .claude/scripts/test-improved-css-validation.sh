#!/bin/bash
# 改善されたCSSクラス検証スクリプトのテスト

# テスト用の一時ファイル作成
TEMP_DIR="/tmp/css-validation-test-improved"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR/src/components"
mkdir -p "$TEMP_DIR/src"

# テスト用のTSXファイル作成（複合セレクタを含む）
cat > "$TEMP_DIR/src/components/TestComponent.tsx" << 'EOF'
import React from 'react';

export const TestComponent = () => {
  return (
    <div>
      <div className="simple-class">Simple class</div>
      <div className="nav-large nav-primary">Complex selectors</div>
      <div className="btn btn-primary btn-large">Button with multiple classes</div>
      <div className="focus-btn active">Focus button active state</div>
      <div className="task-item completed">Task item completed</div>
    </div>
  );
};
EOF

# テスト用のCSSファイル作成
cat > "$TEMP_DIR/src/index.css" << 'EOF'
.simple-class {
  display: block;
}

.nav-large {
  font-size: 1.2rem;
}

.nav-primary {
  color: blue;
}

.btn {
  padding: 0.5rem;
}

.btn-primary {
  background-color: blue;
}

/* btn-large クラスは意図的に定義しない（未定義クラステスト用） */

.focus-btn {
  border: 1px solid;
}

.focus-btn.active {
  background-color: yellow;
}

.task-item {
  margin: 0.5rem;
}

/* completed クラスは意図的に定義しない（未定義クラステスト用） */
EOF

echo "=== 改善されたCSS検証テスト開始 ==="

# 改善されたCSSクラス検証ロジックをテスト
echo "使用されているクラス:"
grep -r "className=" "$TEMP_DIR/src/components" --include="*.tsx" | \
    grep -o 'className="[^"]*"' | \
    sed 's/className="//;s/"//' | \
    tr ' ' '\n' | \
    grep -v '^$' | \
    sort | uniq

echo -e "\n定義されているクラス（改善版）:"
find "$TEMP_DIR/src" -name "*.css" -exec cat {} \; | \
    sed 's|/\*.*\*/||g' | \
    sed '/\/\*/,/\*\//d' | \
    sed 's/{.*//' | \
    grep '\.' | \
    sed 's/\./ /g' | \
    sed 's/:[a-z-]*//g' | \
    tr ' ' '\n' | \
    grep -v '^$' | \
    grep '^[a-zA-Z0-9_-]*$' | \
    sort | uniq

echo -e "\n未定義クラス（改善版）:"
# 使用されているクラス一覧
grep -r "className=" "$TEMP_DIR/src/components" --include="*.tsx" | \
    grep -o 'className="[^"]*"' | \
    sed 's/className="//;s/"//' | \
    tr ' ' '\n' | \
    grep -v '^$' | \
    sort | uniq > /tmp/used_classes_test.txt

# 定義されているクラス一覧（改善版）
find "$TEMP_DIR/src" -name "*.css" -exec cat {} \; | \
    sed 's|/\*.*\*/||g' | \
    sed '/\/\*/,/\*\//d' | \
    sed 's/{.*//' | \
    grep '\.' | \
    sed 's/\./ /g' | \
    sed 's/:[a-z-]*//g' | \
    tr ' ' '\n' | \
    grep -v '^$' | \
    grep '^[a-zA-Z0-9_-]*$' | \
    sort | uniq > /tmp/defined_classes_test.txt

# 未定義クラスの検出
UNDEFINED_CLASSES=$(comm -23 /tmp/used_classes_test.txt /tmp/defined_classes_test.txt)
echo "$UNDEFINED_CLASSES"

# 結果の検証
echo -e "\n=== 結果検証 ==="
if echo "$UNDEFINED_CLASSES" | grep -q "^btn-large$" && echo "$UNDEFINED_CLASSES" | grep -q "^completed$"; then
    if ! echo "$UNDEFINED_CLASSES" | grep -q "^active$"; then
        echo "✅ テスト成功: btn-large と completed のみが検出され、active は誤検出されなかった"
        test_result=0
    else
        echo "❌ テスト失敗: active が誤検出されている"
        test_result=1
    fi
else
    echo "❌ テスト失敗: 期待されるクラス（btn-large, completed）が検出されていない"
    test_result=1
fi

# クリーンアップ
rm -rf "$TEMP_DIR"
rm -f /tmp/used_classes_test.txt /tmp/defined_classes_test.txt

echo "=== テスト完了 ==="
exit $test_result
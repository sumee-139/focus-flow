#!/bin/bash
# CSSクラス検証スクリプトのテスト

# テスト用の一時ファイル作成
TEMP_DIR="/tmp/css-validation-test"
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

echo "=== CSS検証テスト開始 ==="

# 現在のCSSクラス検証ロジックをテスト
echo "使用されているクラス:"
grep -r "className=" "$TEMP_DIR/src/components" --include="*.tsx" | \
  grep -o 'className="[^"]*"' | \
  sed 's/className="//;s/"//' | \
  tr ' ' '\n' | \
  sort | uniq

echo -e "\n定義されているクラス:"
find "$TEMP_DIR/src" -name "*.css" -exec grep -h "^\." {} \; | \
  sed 's/[[:space:]]*{.*//' | \
  sed 's/^\.//' | \
  sort | uniq

echo -e "\n未定義クラス（現在のロジック）:"
# 使用されているクラス一覧
grep -r "className=" "$TEMP_DIR/src/components" --include="*.tsx" | \
  grep -o 'className="[^"]*"' | \
  sed 's/className="//;s/"//' | \
  tr ' ' '\n' | \
  sort | uniq > /tmp/used_classes.txt

# 定義されているクラス一覧  
find "$TEMP_DIR/src" -name "*.css" -exec grep -h "^\." {} \; | \
  sed 's/[[:space:]]*{.*//' | \
  sed 's/^\.//' | \
  sort | uniq > /tmp/defined_classes.txt

# 未定義クラスの検出
comm -23 /tmp/used_classes.txt /tmp/defined_classes.txt

echo -e "\n期待される結果: btn-large と completed が未定義クラスとして検出されるべき"
echo "複合セレクタ (.focus-btn.active) が正しく処理されるかテスト"

# クリーンアップ
rm -rf "$TEMP_DIR"
rm -f /tmp/used_classes.txt /tmp/defined_classes.txt

echo "=== テスト完了 ==="
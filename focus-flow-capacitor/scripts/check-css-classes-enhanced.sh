#!/bin/bash
echo "=== CSS Class Definition Check (T008 Enhanced Version) ==="

# Extract used classes from TSX files
grep -r "className=" src/components --include="*.tsx" | grep -o 'className="[^"]*"' | sed 's/className="//;s/"//' | tr ' ' '\n' | sort | uniq > /tmp/used_classes.txt

# Extract all class definitions including compound selectors
# Handle .btn.primary, .layout .section, etc.
find src -name "*.css" -exec cat {} \; | \
  grep -E "^\s*\." | \
  sed -E 's/\s*\{.*$//' | \
  sed -E 's/^\s*//' | \
  sed -E 's/:[^,\s]*//' | \
  sed -E 's/\s*,\s*/\n/g' | \
  sed -E 's/\./\n/g' | \
  grep -v "^$" | \
  sort | uniq > /tmp/all_css_selectors.txt

# Extract individual class names from complex selectors
cat /tmp/all_css_selectors.txt | \
  grep -v -E "^(media|keyframes|import|font-face)" | \
  sed -E 's/\s+/ /g' | \
  tr ' ' '\n' | \
  grep -v "^$" | \
  sort | uniq > /tmp/defined_classes.txt

# Find truly undefined classes
comm -23 /tmp/used_classes.txt /tmp/defined_classes.txt > /tmp/undefined_classes.txt

UNDEFINED_COUNT=$(wc -l < /tmp/undefined_classes.txt)
echo "UNDEFINED CLASSES: $UNDEFINED_COUNT"

if [ "$UNDEFINED_COUNT" -eq 0 ]; then
  echo "✅ All CSS classes are properly defined!"
  echo ""
  echo "📊 Summary:"
  echo "  Used classes: $(wc -l < /tmp/used_classes.txt)"
  echo "  Defined classes: $(wc -l < /tmp/defined_classes.txt)"
  echo "  Undefined classes: 0"
else
  echo "❌ Found $UNDEFINED_COUNT undefined classes:"
  echo ""
  while read -r class; do
    echo "  ❌ .$class"
    # Show where it's used
    echo "     Used in:"
    grep -r "className.*$class" src/components --include="*.tsx" | head -2 | sed 's/^/       /'
  done < /tmp/undefined_classes.txt
fi
# Page snapshot

```yaml
- banner:
  - heading "FocusFlow" [level=1]
  - paragraph: 今日必ず着手するタスクのみを管理
  - 'button "Focus: OFF"'
- complementary:
  - heading "Today's Tasks" [level=3]
  - form:
    - text: 📝
    - textbox "タスクタイトル"
    - spinbutton "見積時間": "30"
    - text: 分
    - button "詳細オプション": 詳細
    - button "追加"
  - text: "⋮⋮ 📝 FocusFlowプロトタイプを完成させる Design Philosophyに準拠したUI実装 ⏱️ 120分 ⏰ 14:00 #development"
  - checkbox "Mark \"FocusFlowプロトタイプを完成させる\" as complete"
  - button "Edit \"FocusFlowプロトタイプを完成させる\"": ✏️
  - button "Delete \"FocusFlowプロトタイプを完成させる\"": 🗑️
  - text: "⋮⋮ 📝 タスク管理機能をテストする 基本的なCRUD操作の動作確認 ⏱️ 30分 #testing"
  - checkbox "Mark \"タスク管理機能をテストする\" as complete"
  - button "Edit \"タスク管理機能をテストする\"": ✏️
  - button "Delete \"タスク管理機能をテストする\"": 🗑️
  - text: ⋮⋮ 📝 これは非常に長いタスクタイトルでレイアウトのオーバーフロー問題やはみ出しを検出するためのテストケースです。UI崩れがないか確認します。 ⏱️ 30分
  - checkbox "Mark \"これは非常に長いタスクタイトルでレイアウトのオーバーフロー問題やはみ出しを検出するためのテストケースです。UI崩れがないか確認します。\" as complete"
  - button "Edit \"これは非常に長いタスクタイトルでレイアウトのオーバーフロー問題やはみ出しを検出するためのテストケースです。UI崩れがないか確認します。\"": ✏️
  - button "Delete \"これは非常に長いタスクタイトルでレイアウトのオーバーフロー問題やはみ出しを検出するためのテストケースです。UI崩れがないか確認します。\"": 🗑️
- main:
  - button "Open memo panel": 📝 メモパネルを開く
  - heading "📝 デイリーメモ" [level=2]
  - textbox "デイリーメモ"
  - paragraph: "📄 自動保存: 入力停止から3秒後"
- complementary:
  - heading "Tab Area" [level=4]
  - paragraph: Coming soon...
- group: Debug Information
```
# Plannerモードへ切り替え

## 実行内容
1. 現在のエージェントを確認
2. handover.md作成を促す（現在のエージェントがnone以外の場合）
3. active.mdを"planner"に更新
4. Plannerの3つの質問を表示

## プロンプト
現在のエージェントから引き継ぎを受ける場合は、前のhandover.mdを確認してください。

### Plannerモード開始
あなたは今、**Planner**として活動します。

#### 開始時チェックリスト
1. **私は誰？** → @.claude/planner/identity.md
2. **何をすべき？** → @.claude/planner/handover.md または @.claude/builder/handover.md
3. **制約は何？** → @.claude/shared/constraints.md

#### あなたの役割
- プロジェクトの方向性を決める
- Phase管理とToDo管理を維持する
- Builderへの明確な指示を出す

#### 現在の状態
- Phase/ToDo: @.claude/shared/phase-todo.md
- 作業メモ: @.claude/planner/notes.md

さあ、計画を立てましょう！

---

## 使用例
```
/agent:planner
```

## 注意事項
- 前のエージェントがhandover.mdを作成していない場合は、作成を促してください
- 割り込みの場合は、handover-interrupt-[日時].mdの作成を検討してください
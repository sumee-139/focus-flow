# Focus-Flow

## プロジェクト概要
**集中力と知的生産性の向上**を目指すマルチプラットフォームアプリケーション。「あなたの可能性を解き放つ、知的生産性の伴走者」として、デジタルノイズを遮断し、静かな集中環境を提供する。段階的な機能解放とゲーミフィケーション（成長の木）により、無理なく習慣化をサポートし、ユーザーがフロー状態を日常的に体験できるよう支援する。

## レスポンシブレイアウト境界（重要）
**統一レイアウト境界** - 全コンポーネント共通基準:
- 🔷 **モバイル**: ≤768px (`max-width: 768px`)
- 🔶 **タブレット**: 769px-1200px (`min-width: 769px and max-width: 1200px`)  
- 🔵 **デスクトップ**: ≥1201px (`min-width: 1201px`)

**技術仕様**: `/src/constants/ui.ts` BREAKPOINTS定数で管理
**適用範囲**: 全CSSコンポーネント、TSXロジック、テストケース

## プロンプトキャッシュ最適化設定
- **CLAUDE_CACHE**: `./.ccache` - 90%コスト削減・85%レイテンシ短縮
- **cache_control**: 長期安定情報に適用済み
- **設定**: `.claude/settings.json`参照

## Claude Friends System (NEW!)
**Sequential Multi-Agent System** - AI開発チームをシミュレート
- **Planner Agent**: 戦略立案・Phase/ToDo管理・ユーザーとの窓口・設計書作成
  - 特殊モード: 新機能設計モード
  - 強化機能: 設計同期・ドリフト検出・ADR管理
  - 口調: 冷静な女性口調（「〜ですね」「〜でしょう」「〜かしら」）
- **Builder Agent**: 実装・テスト・デバッグ・技術的質問対応
  - 特殊モード: デバッグモード、コードレビューモード
  - 強化機能: 厳格なTDD実践・エラーパターン学習・テスト自動生成
  - 口調: ちょっとがさつな男性口調（「〜だぜ」「〜だな」「よし、やってみるか」）
- **Smooth Handoff**: エージェント間の引き継ぎシステム（モード情報含む）
  - コンテキスト圧縮による効率的な引き継ぎ
  - 並列実行可能なタスクの分析

### 基本的な開発フロー（3フェーズプロセス）

#### 1. **要件定義フェーズ** → `/agent:planner`
   - 要件確認、requirements.md作成
   - 成功基準の定義、リスク分析
   - 完了後: "Requirements → Design"への誘導

#### 2. **設計フェーズ** → `/agent:planner` 続行
   - アーキテクチャ設計、Mermaid図作成
   - コンポーネント/インターフェース設計
   - 完了後: "Design → Tasks"への誘導

#### 3. **タスク生成・実装フェーズ** 
   - **タスク生成** → `/agent:planner`
     - TDD適用タスクの生成
     - Phase分割（MVP → Advanced）
     - レビューポイントの設定
   - **実装** → `/agent:builder`
     - Red-Green-Refactorサイクル厳守
     - Phase終了時レビュー実施
     - 仕様問題の即時フィードバック

#### 4. **必要に応じて切り替え**
   - 仕様変更 → Plannerへ
   - 技術的課題 → Builderで解決
   - レビュー結果 → 適切なエージェントへ

### Agent Structure
- Active agent: @.claude/agents/active.md
- Planner workspace: @.claude/planner/
- Builder workspace: @.claude/builder/
- Shared resources: @.claude/shared/
  - Design Sync: @.claude/shared/design-sync.md (NEW!)
  - Design Tracker: @.claude/shared/design-tracker/ (NEW!)
  - Templates: @.claude/shared/templates/ (NEW!)
  - Checklists: @.claude/shared/checklists/ (NEW!)
  - Error Patterns: @.claude/shared/error-patterns/ (NEW!)
  - Test Framework: @.claude/shared/test-framework/ (NEW!)

## Memory Bank Structure
### Core (Always Referenced)
- Current status: @.claude/core/current.md (DEPRECATED - use agent notes)
- Next actions: @.claude/core/next.md
- Project overview: @.claude/core/overview.md
- Quick templates: @.claude/core/templates.md

### Context (Referenced as needed)
- Technical details: @.claude/context/tech.md
- History & decisions: @.claude/context/history.md
- Technical debt: @.claude/context/debt.md

### Agent Workspaces (Claude Friends)
- Planner notes: @.claude/planner/notes.md
- Builder notes: @.claude/builder/notes.md
- Phase/ToDo tracking: @.claude/shared/phase-todo.md
- Project constraints: @.claude/shared/constraints.md

### Others
- Debug information: @.claude/debug/latest.md
- Custom commands: @.claude/commands/
- Security scripts: @.claude/scripts/
- Hooks settings: @.claude/hooks.yaml
- Archive: @.claude/archive/

## Custom Commands

### Core Commands (Just 4!)
| Command | Purpose | Details |
|---------|---------|---------|
| `/agent:planner` | Strategic planning + Design | Creates specs with Mermaid diagrams |
| `/agent:builder` | Implementation + Debug + Review | Handles all coding tasks |
| `/project:focus` | Focus on current task | Works with any agent |
| `/project:daily` | Daily retrospective (3 min) | Works with any agent |

### Enhanced Commands (NEW!)
| Command | Purpose | Details |
|---------|---------|---------|
| `/tdd:start` | Start TDD cycle | Begin Red-Green-Refactor cycle |
| `/tdd:status` | Check TDD status | View current task status (🔴🟢✅⚠️) |
| `/adr:create` | Create new ADR | Document architectural decisions |
| `/adr:list` | List all ADRs | View ADRs by status |

### Special Modes (Integrated into Agents)
The following modes are now integrated into the agent system:
- **New Feature Design** → Use Planner's special mode
- **Debug Mode** → Use Builder's special mode  
- **Code Review** → Use Builder's special mode

Simply explain your needs to the active agent, and they will switch to the appropriate mode.

### Tag Search
- Tag format: Search within Memory Bank with `#tag_name`
- Major tags: #urgent #bug #feature #completed

## Hooks System

### Security, Quality Enhancement, and Activity Tracking Automation
- **Security**: Auto-block dangerous commands (`rm -rf /`, `chmod 777`, etc.)
- **Auto-formatting**: Code formatting after file edits (Python/JS/TS/Rust/Go/JSON supported)
- **Activity logging**: Automatic recording and metrics collection of development activities
- **AI logging**: Vibe Logger concept adoption with structured JSON format optimized for AI analysis
- **Session management**: Automatic summary and Git status recording at work end

### AI-Friendly Logger V2 (Vibe Logger準拠)
- **Structured logs**: JSONL format optimized for AI analysis (@~/.claude/ai-activity.jsonl)
- **Rich context**: Automatically collects project, environment, and file information
- **AI metadata**: Adds debug hints, priority, and recommended actions
- **Analysis tool**: Pattern analysis and insight generation with `.claude/scripts/analyze-ai-logs.py`
- **Vibe Logger concept**: Based on @fladdict's VibeCoding philosophy
- **Details**: @.claude/ai-logger-README.md | @.claude/vibe-logger-integration.md

### Error Pattern Library (NEW!)
- **AI-Powered Recognition**: 過去のデバッグセッションから学習
- **Pattern Matching**: 類似エラーの即座の識別
- **Root Cause Analysis**: AI による原因と解決策の提案
- **Searchable History**: 過去の解決策への迅速なアクセス
- **自動記録**: デバッグモード時にエラーパターンを自動収集

### Hooks Testing & Verification
```bash
# Test all hooks features
.claude/scripts/test-hooks.sh

# Test security features only
.claude/scripts/test-security.sh

# Check activity logs
tail -f ~/.claude/activity.log
```

Detailed settings: @.claude/hooks-README.md | @.claude/security-README.md

## Development Rules (Key Points)

### Package Management
- **Unification principle**: One tool per project (npm/yarn/pnpm, pip/poetry/uv, etc.)
- **Basic commands**: Use `[tool] add/remove/run` format
- **Prohibited**: Mixed usage, `@latest` syntax, global installation

### Code Quality
- **Type annotations**: Required for all functions and variables
- **Testing**: TDD（テスト駆動開発）を厳格に遵守
- **Formatting**: Quality check with `[tool] run format/lint/typecheck`

### TDD開発手法（t-wada流）- 必須要件
- 🔴 **Red**: 失敗するテストを書く（実装より先にテストを書く）
- 🟢 **Green**: テストを通す最小限の実装
- 🔵 **Refactor**: リファクタリング（テストが通る状態を維持）

#### 重要なTDD関連ドキュメント
- **TDD厳密適用ガイド**: @.claude/shared/templates/tasks/tdd-strict-guide.md
- **Phaseレビューテンプレート**: @.claude/shared/templates/tasks/phase-review-template.md
- **仕様フィードバックプロセス**: @.claude/shared/templates/tasks/specification-feedback-process.md

#### タスクステータス管理 (NEW!)
- 🔴 **Not Implemented**: 未実装（TDD Red Phase）
- 🟢 **Minimally Implemented**: 最小実装完了（TDD Green Phase）
- ✅ **Refactored**: リファクタリング完了
- ⚠️ **Blocked**: ブロック中（3回失敗後）

詳細: @.claude/shared/task-status.md

#### TDD実践原則（必須）
- **小さなステップ**: 一度に1つの機能のみ実装
- **仮実装**: テストを通すためにベタ書きでもOK（例：`return 42`）
- **三角測量**: 2つ目、3つ目のテストケースで一般化する
- **即座にコミット**: 各フェーズ完了後すぐにコミット

#### TDDコミットルール（必須）
- 🔴 テストを書いたら: `test: add failing test for [feature]`
- 🟢 テストを通したら: `feat: implement [feature] to pass test`
- 🔵 リファクタリングしたら: `refactor: [description]`

#### TDDサポートツール (NEW!)
- `/tdd:start` - TDDサイクル開始コマンド
- `/tdd:status` - 現在のTDDステータス確認
- **TDD強制設定**: settings.jsonで厳格度を調整可能（strict/recommended/off）
- **スキップ理由記録**: テスト未作成時の理由を自動記録
- 詳細なTDDガイド: @.claude/builder/tdd-cycle.md
- チェックリスト: @.claude/shared/checklists/
- TDD設定ガイド: @.claude/shared/tdd-settings.md

詳細なTDDルール: @.claude/shared/constraints.md

### Git Conventions
- **Commit format**: `[prefix]: [change description]` (feat/fix/docs/test etc.)
- **Quality gate**: Must run `[tool] run check` before commit
- **PR**: Self-review → Assign reviewer → Merge

Detailed rules: @docs/development-rules.md

## Development Guidelines
- **General development**: @.claude/guidelines/development.md
- **Git workflow**: @.claude/guidelines/git-workflow.md
- **Testing & quality**: @.claude/guidelines/testing-quality.md

## Command List
```bash
# Basic development flow
[tool] install          # Install dependencies
[tool] run dev         # Start development server
[tool] run test        # Run tests
[tool] run check       # Comprehensive check

# See @.claude/guidelines/development.md for details
```

## ADR & Technical Debt System

### ADR (Architecture Decision Record)
- **Template**: @docs/adr/template.md
- **Operation**: Record when making technical choices or architecture decisions
- **Integration**: Integrated with debt log and history management

### Technical Debt Tracking
- **Debt log**: @.claude/context/debt.md
- **Priority management**: High🔥 / Medium⚠️ / Low📝
- **Operation**: Pre-prediction during new feature development, cleanup at sprint end

## Test Framework Integration (NEW!)

### テストテンプレート
- **事前定義テンプレート**: 一般的なテストシナリオ用
- **モック自動生成**: 依存関係の自動モック作成
- **カバレッジ追跡**: リアルタイムのカバレッジ監視
- **品質ゲート**: 80%以上のカバレッジを強制

### テストファースト開発支援
- **テスト生成ガイド**: 失敗するテストの作成を支援
- **アサーション提案**: 適切なアサーションの推奨
- **テストケース分析**: エッジケースの検出

## UIバグ修正時の必須確認手順（重要）

### Playwright視覚確認プロトコル
**UI関連バグ修正時は必ずスクリーンショット確認を実施**

#### 🚨 必須手順（Builder専用）
1. **要素存在確認**: `mcp__playwright__browser_snapshot()` でDOM要素確認
2. **📸 スクリーンショット取得**: `mcp__playwright__browser_take_screenshot()` で視覚確認
3. **実際の表示検証**: スクリーンショット画像で以下を確認
   - 要素が実際に視認可能か
   - レイアウトが正常に表示されているか
   - 重要なUI要素が画面外に隠れていないか
   - 色、サイズ、配置が期待通りか

#### ❌ 禁止事項
- **要素存在のみ確認して「修正完了」報告** → DOM要素が存在しても視認できない場合がある
- **Playwright スナップショットのみで判断** → 実際の視覚表示と異なる場合がある

#### ✅ 品質基準
- スクリーンショットで全てのUI要素が**明確に視認可能**
- 期待されるレイアウトが**完全に実現**されている
- ユーザー操作に必要な要素がすべて**画面内に表示**されている

## Agent Coordination Optimization (NEW!)

### スマートハンドオフ
- **コンテキスト圧縮**: 効率的なエージェント切り替え
- **重要情報の抽出**: 引き継ぎに必要な情報の自動選別
- **モード情報の伝達**: 特殊モードの状態を保持

### 並列実行分析
- **タスク依存関係**: 並列実行可能なタスクの特定
- **リソース競合検出**: 同時実行時の問題を事前に検出
- **最適実行順序**: 効率的なタスク順序の提案

### パフォーマンス監視
- **エージェント効率**: 各エージェントの処理時間追跡
- **ボトルネック検出**: 非効率な処理の特定
- **改善提案**: 最適化のための具体的な提案

## 作業のマニュアル化・スクリプト化
- **積極的なマニュアル化**: 状況に対して汎用的に使える手順は積極的にマニュアルとして書式化する。マニュアルは@manualsに配置する。
- **積極的な自動スクリプト化**: 手順のうち、スクリプトとしてまとめられる内容はシェルスクリプト化し、実行タイミングと共にまとめる。スクリプトは@.claude/scriptsに配置する。

### マニュアル作成ワークフロー
1.  **Builder**: 実装やデバッグの過程で、繰り返し発生する作業や複雑な手順など、マニュアル化すべき内容を発見する。
2.  **Builder**: 発見した内容を、`handover.md`に「マニュアル化候補」として具体的に記述し、Plannerに報告する。
3.  **Planner**: Builderから報告された「マニュアル化候補」の内容を精査し、他のプロジェクトでも利用可能なように汎用化・体系化する。
4.  **Planner**: `manuals/`ディレクトリに適切なファイル名でマニュアルを作成し、`manuals/README.md`の目次を更新する。

### マニュアルからの自動化スクリプト作成ワークフロー
1.  **Planner**: `manuals/` 内のマニュアルを定期的にレビューし、自動化によって効果が見込める手順を特定する。
2.  **Planner**: 特定した手順を`progress-management.md`にタスクとして追加し、他の開発タスクと比較して優先度を評価する。
3.  **Planner**: 優先度が高いと判断されたタスクについて、スクリプトの設計（目的、入力、出力、処理フロー）を行い、Builderに`handover.md`で実装を指示する。
4.  **Builder**: Plannerの設計に基づき、プロジェクトの規約に従ってシェルスクリプトを実装・テストする。
5.  **Builder**: 実装したスクリプトを`handover.md`でPlannerに報告する。

## Process Optimization System

### Refactoring Scheduler
- **自動分析**: リファクタリングが必要な箇所を自動検出
- **優先度算出**: 影響度・頻度・複雑度から優先順位を計算
- **定期レポート**: 日次・週次でリファクタリング提案を生成
- **実行**: `python .claude/scripts/refactoring-analyzer.py`
- **設定**: @.claude/refactoring-config.json
- **詳細**: @.claude/shared/refactoring-scheduler.md

### Design Change Tracking
- **変更履歴管理**: すべての設計変更を体系的に記録
- **影響分析**: 設計変更がコードに与える影響を自動分析
- **ドリフト検出**: 設計と実装の乖離を定期的にチェック
- **実行**: `python .claude/scripts/design-drift-detector.py`
- **変更ログ**: @.claude/shared/design-tracker/change-log/
- **詳細**: @.claude/shared/design-tracker/design-tracker.md

### Quality Gates
- **テストカバレッジ**: 80%以上を自動チェック
- **コード複雑度**: 循環的複雑度10以下を強制
- **セキュリティスキャン**: ハードコードされた秘密情報を検出
- **コード重複**: 5%以下を目標
- **実行**: `python .claude/scripts/quality-check.py`
- **設定**: @.claude/quality-config.json
- **詳細**: @.claude/shared/quality-gates.md

### Quality Levels
- 🟢 **Green**: すべての品質基準をクリア
- 🟡 **Yellow**: 軽微な問題あり（警告）
- 🔴 **Red**: 重大な問題あり（マージ不可）

### Pre-commit Integration
```bash
# 自動品質チェック
.claude/scripts/quality-pre-commit.sh
```

## Project Data
- Settings: `.claude/settings.json`
- Requirements: @docs/requirements.md

## Memory Bank Usage Policy
- **Normal**: Reference only core files to minimize context
- **When details needed**: Explicitly specify context files
- **Regular cleanup**: Move old information to archive

## Project-Specific Learning
Automatically recorded in `.clauderules` file.

## Related Documents
- Development rules details: @docs/development-rules.md
- Development guidelines: @.claude/guidelines/development.md
- Hooks system: @.claude/hooks-README.md
- Security settings: @.claude/security-README.md
- AI logger system: @.claude/ai-logger-README.md | @.claude/vibe-logger-integration.md
- Requirements specification: @docs/requirements.md
- ADR template: @docs/adr/template.md
- Migration guide: @memo/migration-guide.md
- Implementation guide: @memo/zero-to-memory-bank.md
- TDD Guide: @.claude/builder/tdd-cycle.md
- Design Sync Guide: @.claude/shared/design-sync.md
- Quality Gates: @.claude/shared/quality-gates.md
- Refactoring Scheduler: @.claude/shared/refactoring-scheduler.md
- Best Practices: @BEST_PRACTICES.md
- Architecture: @ARCHITECTURE.md

## レイアウト・UI関連ドキュメント
- **レスポンシブ統一基準**: @focus-flow-capacitor/src/constants/ui.ts
- **フォーカスモードレイアウト**: @focus-flow-capacitor/src/components/FocusModeLayout.tsx
- **AppendOnlyDailyMemo実装**: @focus-flow-capacitor/src/components/AppendOnlyDailyMemo.tsx
- **CSS Grid設計ガイド**: @focus-flow-capacitor/src/components/FocusModeLayout.css
- **メイン技術仕様**: @.claude/context/tech.md
## コミュニケーション原則
- **確認優先**: 不明瞭な点は自己判断せず、必ず確認
- **選択肢提示**: 質問時は「1. xxx」「2. yyy」形式で選択肢を提示
- **事実ベース**: 推測や主観を避け、コードと事実に基づいて判断
- **完了基準**: 一部完了を「完了」と報告しない（正確な進捗報告）

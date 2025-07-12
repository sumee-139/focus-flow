# [Project Name]

## Project Overview
[Write a concise description of the project here]

## Prompt Cache Optimization Settings
- **CLAUDE_CACHE**: `./.ccache` - 90% cost reduction, 85% latency reduction
- **cache_control**: Applied to long-term stable information
- **Settings**: See `.claude/settings.json`

## Claude Friends System (NEW!)
**Sequential Multi-Agent System** - AI開発チームをシミュレート
- **Planner Agent**: 戦略立案・Phase/ToDo管理・ユーザーとの窓口・設計書作成
  - 特殊モード: 新機能設計モード
- **Builder Agent**: 実装・テスト・デバッグ・技術的質問対応
  - 特殊モード: デバッグモード、コードレビューモード
- **Smooth Handoff**: エージェント間の引き継ぎシステム（モード情報含む）

### 基本的な開発フロー
1. **計画・設計フェーズ** → `/agent:planner`
   - 要件確認、設計書作成、ToDo分解
2. **実装フェーズ** → `/agent:builder`
   - コーディング、テスト、デバッグ
3. **必要に応じて切り替え**
   - 仕様変更 → Plannerへ
   - 技術的課題 → Builderで解決

### Agent Structure
- Active agent: @.claude/agents/active.md
- Planner workspace: @.claude/planner/
- Builder workspace: @.claude/builder/
- Shared resources: @.claude/shared/

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
- **Structured logs**: JSONL format optimized for AI analysis (@~/.claude/ai-activity-v2.jsonl)
- **Rich context**: Automatically collects project, environment, and file information
- **AI metadata**: Adds debug hints, priority, and recommended actions
- **Analysis tool**: Pattern analysis and insight generation with `.claude/scripts/analyze-ai-logs.py`
- **Vibe Logger concept**: Based on @fladdict's VibeCoding philosophy
- **Details**: @.claude/ai-logger-README.md | @.claude/vibe-logger-integration.md

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
- **Testing**: 80%+ coverage for important features, TDD recommended (gradual learning)
- **Formatting**: Quality check with `[tool] run format/lint/typecheck`

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

## Project Data
- Settings: `config/settings.json`
- Data: `data/`
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
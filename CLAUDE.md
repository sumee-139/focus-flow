# [Project Name]

## Project Overview
[Write a concise description of the project here]

## Prompt Cache Optimization Settings
- **CLAUDE_CACHE**: `./.ccache` - 90% cost reduction, 85% latency reduction
- **cache_control**: Applied to long-term stable information
- **Settings**: See `.claude/settings.json`

## Memory Bank Structure
### Core (Always Referenced)
- Current status: @.claude/core/current.md
- Next actions: @.claude/core/next.md
- Project overview: @.claude/core/overview.md
- Quick templates: @.claude/core/templates.md

### Context (Referenced as needed)
- Technical details: @.claude/context/tech.md
- History & decisions: @.claude/context/history.md
- Technical debt: @.claude/context/debt.md

### Others
- Debug information: @.claude/debug/latest.md
- Custom commands: @.claude/commands/
- Security scripts: @.claude/scripts/
- Hooks settings: @.claude/hooks.yaml
- Archive: @.claude/archive/

## Custom Commands

### Basic Commands
| Command | Purpose | Time Required | Details |
|---------|---------|---------------|---------|
| `/project:plan` | Work planning | 5 min | @.claude/commands/plan.md |
| `/project:act` | Execute based on plan | Implementation time | @.claude/commands/act.md |
| `/project:focus` | Focus on current task | Immediate | @.claude/commands/focus.md |
| `/project:daily` | Daily retrospective | 3 min | @.claude/commands/daily.md |

### Specialized Modes
| Command | Purpose | Referenced Files |
|---------|---------|------------------|
| `/debug:start` | Debug-focused mode | current.md + tech.md + debug/latest.md |
| `/feature:plan` | New feature design mode | overview.md + next.md + requirements |
| `/review:check` | Code review mode | history.md + checklist |

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

### AI-Friendly Logger (NEW)
- **Structured logs**: JSON format optimized for AI analysis (@~/.claude/ai-activity.jsonl)
- **Rich context**: Automatically collects project, environment, and file information
- **AI metadata**: Adds debug hints, priority, and recommended actions
- **Analysis tool**: Pattern analysis and insight generation with `.claude/scripts/analyze-ai-logs.py`
- **Details**: @.claude/ai-logger-README.md

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
- AI logger system: @.claude/ai-logger-README.md
- Requirements specification: @docs/requirements.md
- ADR template: @docs/adr/template.md
- Migration guide: @memo/migration-guide.md
- Implementation guide: @memo/zero-to-memory-bank.md
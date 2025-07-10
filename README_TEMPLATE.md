# Claude Code Lightweight Project Template v1.2.0

An efficient project development template optimized for individual developers.

## 🎯 Features

- **Lightweight Design**: Minimizes context usage
- **Hierarchical Memory Bank**: Loads only necessary information
- **Gradual Expansion**: Scales from small to large projects
- **Daily Operations**: Complete status updates in 3 minutes
- **Versatility**: Language and tech-stack agnostic design
- **Integrated Development Standards**: Incorporates Anthropic best practices
- **Quality Management**: Built-in error handling guide and quality gates
- **Enhanced Security**: Dangerous command blocking via Claude Code hooks
- **Project Memory**: Systematic management of history and decisions
- **Automated Workflow**: Quality checks automation with Hooks functionality
- **AI-Friendly Logger**: Vibe Logger concept adoption with structured JSON format optimized for AI analysis

## 📁 Template Structure

### Required Files
```
CLAUDE.md                    # Project configuration
.clauderules                 # Project insights
.gitignore                   # Cache file exclusion settings
.claude/settings.json        # Cache environment + security settings
.claude/hooks.yaml           # Hooks settings (new)
.claude/security-README.md   # Security settings documentation
.claude/ai-logger-README.md  # AI Logger settings documentation
docs/requirements.md         # Requirements specification
docs/adr/template.md         # ADR template
```

### Memory Bank (Hierarchical)
```
.claude/
├── core/                    # Always referenced (lightweight)
│   ├── current.md          # Current status (within 50 lines)
│   ├── next.md             # Next actions (within 30 lines)
│   ├── overview.md         # Project overview
│   └── templates.md        # Quick templates & pattern collection
├── context/                # Referenced as needed
│   ├── tech.md             # Technical details
│   ├── history.md          # History & decisions
│   └── debt.md             # Technical debt tracking
├── debug/                  # Debug information
│   └── latest.md           # Latest debug session (within 100 lines)
├── archive/                # Regular cleanup
├── commands/               # Custom commands
│   ├── plan.md             # Planning
│   ├── act.md              # Implementation execution
│   ├── daily.md            # Daily update
│   ├── focus.md            # Focus mode
│   ├── debug-start.md      # Debug-focused mode
│   ├── feature-plan.md     # New feature design mode
│   └── review-check.md     # Code review mode
├── scripts/                # Security & logging scripts
│   ├── deny-check.sh       # Dangerous command blocking
│   ├── allow-check.sh      # Safe command allow
│   ├── test-security.sh    # Security tests
│   ├── ai-logger.sh        # AI-Friendly Logger
│   └── analyze-ai-logs.py  # AI log analysis tool
├── security-README.md      # Security settings documentation
└── settings.json           # Project settings (cache+security)
```

## 🚀 Usage

### 1. Starting a Project
```bash
# Copy the template
cp -r claude_file_template/ your-project/
cd your-project/

# Customize project information
# - Replace [Project Name] in CLAUDE.md
# - Fill in docs/requirements.md
# - Update files in .claude/core/
```

### 2. Daily Development Flow

#### Basic Cycle (Daily)
```
Morning: /project:plan     # Today's work plan (5 min)
↓
Implementation: /project:act    # Execute based on plan
(Depending on situation)
↓ /debug:start      # When debugging
↓ /feature:plan     # When designing new features
↓ /review:check     # When reviewing code
↓
Focus work: /project:focus  # When switching tasks or focusing
↓
Evening: /project:daily    # Daily update (3 min)
```

#### Tag Search (As needed)
```
Tag search: #urgent #bug #feature #completed  # Fast search for related info
```

## 💡 Efficiency Points

### Context Minimization
- **Normal**: Reference only `@.claude/core/*`
- **When details needed**: Explicitly specify `@.claude/context/*`
- **Past reference**: Check history with `@.claude/archive/*`

### Memory Bank Operations
- **core/**: Maintain within 50 lines
- **context/**: Update only when necessary
- **archive/**: Organize monthly

### Time Management
- Planning: Within 5 minutes
- Daily updates: Within 3 minutes
- Memory Bank updates: Only when necessary

## 🛠 Custom Commands

### Basic Commands
| Command | Purpose | Time Required |
|---------|---------|---------------|
| `/project:plan` | Work planning | 5 min |
| `/project:act` | Execute based on plan | Implementation time |
| `/project:focus` | Focus on current task | Immediate |
| `/project:daily` | Daily retrospective | 3 min |

### Specialized Modes
| Command | Purpose | Referenced Files |
|---------|---------|------------------|
| `/debug:start` | Debug-focused mode | current.md + tech.md + debug/latest.md |
| `/feature:plan` | New feature design mode | overview.md + next.md + requirements |
| `/review:check` | Code review mode | history.md + checklist |

### Tag Search
- Tag format: Search within Memory Bank with `#tag_name`
- Major tags: #urgent #bug #feature #completed

## 📋 Built-in Features

### Core Development Rules
- Unified package management policy
- Code quality standards & test requirements
- Git/PR conventions (commit format, trailers, review rules)

### Command List
- Language-agnostic development flow (`[tool]` notation)
- Unified commands for setup, test, quality check, and build
- Support for major languages (Node.js/Python/Rust/Go)

### Error Handling Guide
- Standard problem-solving order (format → type → lint → test)
- Common problems and solutions by domain
- Best practices for development, error handling, and information gathering

### Quality Gates
- Stage-specific checklists (pre-commit, pre-PR, pre-deploy)
- Automation level classification (fully automated, semi-automated, manual check)
- Continuous quality management guidelines

### Security Features
- **Deny List**: Auto-block dangerous commands (`rm -rf /`, `chmod 777`, `curl | sh`, etc.)
- **Allow List**: Pre-allow safe commands needed for development (`git`, `npm`, `python`, etc.)
- **Security Log**: Command execution audit and recording
- **Test Suite**: Automated security settings verification
- **Documentation**: Complete setup guide and emergency response guide

### AI-Friendly Logger (v1.2.0 New Feature - Vibe Logger Concept)
- **Structured Logs**: JSON format optimized for AI analysis (`~/.claude/ai-activity.jsonl`)
- **Rich Context**: Automatically collects project, environment, and Git information
- **AI Metadata**: Automatically adds debug hints, priority, and recommended actions
- **Pattern Analysis**: Visualizes error detection, frequent operations, and file activity
- **Analysis Tool**: Generate AI insights with `analyze-ai-logs.py`
- **Reference**: Adopts [Vibe Logger](https://github.com/fladdict/vibe-logger) concept

## 🎯 Target Projects

### Optimal
- Personal development projects
- 1-3 month medium-term projects
- Web development, app development
- Prototype development

### Requires Adjustment
- Large team development
- Long-term projects (1+ years)
- Projects with advanced regulatory requirements

## 📈 Expected Benefits

### Token Usage
- **Significant Reduction**: Efficiency through hierarchical Memory Bank
- **Maintained Constant**: Lightweight regardless of project scale

### Development Efficiency
- **Fast Planning**: Gradual information loading
- **Focused Work**: Uninterrupted with focus mode
- **Continuous Operation**: Habit formation with lightweight updates

### Scalability
- **Gradual Growth**: Natural expansion from small to large scale
- **Knowledge Accumulation**: Continuous learning with `.clauderules`
- **Reusability**: Leverage templates and patterns

## ⚠️ Precautions

- Keep Memory Bank files concise (recommend within 50 lines each)
- Maintain performance with regular archiving
- Ensure replacement with project-specific content
- Always record important decisions

## 📋 Actual Operation Examples

### 🚀 First Day Flow

#### Human-Led Development
```
09:00 Copy template & customize
09:15 /project:plan - First work plan
09:30 Start development work
12:00 Progress check
17:00 /project:daily - First day retrospective
```

#### AI-Led Development
```
09:00 Copy template & customize (Human)
09:15 /project:plan - First work plan (Human→AI)
09:30 AI development starts (AI implements, human checks/suggests)
12:00 Progress check & direction adjustment (Human)
16:00 Deliverable review & feedback (Human)
17:00 /project:daily - First day retrospective (Human→AI)
```

### 📅 Daily Operations (Day 2 onwards)

#### Human-Led Development
```
09:00 /project:plan     # Today's task organization
09:30 Start development # Use Quick Modes as needed
      /debug:start      # When debugging
      /feature:plan     # When designing new features
      /review:check     # When reviewing code
12:00 /project:focus    # Focus on afternoon tasks
17:00 /project:daily    # Today's retrospective
```

#### AI-Led Development (Recommended Timeline)
```
09:00-09:30  Human: Today's work instructions with /project:plan
09:30-11:30  AI: Focused implementation with /project:act (human can work in parallel)
             (Use /debug:start, /feature:plan etc. as needed)
11:30-12:00  Human: Interim review & feedback
13:00-15:00  AI: Continue implementation (human does design/planning)
             Check code quality with /review:check
15:00-15:30  Human: Course correction & additional instructions
15:30-16:30  AI: Final implementation & adjustments
16:30-17:00  Human: Final review & tomorrow's preparation
17:00-17:15  Human: Retrospective with /project:daily
```

### 👥 Human-AI Role Division

#### Human Responsibilities
- **Strategic Decisions**: Planning with `/project:plan`
- **Quality Management**: Regular reviews and feedback
- **Direction Control**: Implementation course correction
- **Requirements Adjustment**: Adding/changing new requirements
- **Retrospective**: Progress management with `/project:daily`

#### AI Responsibilities
- **Implementation Work**: Code creation, modification, testing
- **Technical Research**: Library selection, implementation method investigation
- **Documentation**: Technical documents, comment creation
- **Problem Solving**: Bug fixes, performance improvements

### ⚡ Human Time Utilization During AI Work
```
Parallel work during AI implementation (30-90 min):
- Planning next phase
- UI/UX design consideration
- External API/service research
- Documentation maintenance
- Work on other projects
```

### 📊 Command Usage Frequency

| Frequency | Command | Timing |
|-----------|---------|--------|
| Daily | `/project:plan` | Morning work start |
| Daily | `/project:daily` | Evening retrospective |
| During work | `/project:act` | Implementation execution |
| As needed | `/project:focus` | Focused implementation |
| Situational | `/debug:start` | When debugging |
| Situational | `/feature:plan` | New feature design |
| Situational | `/review:check` | Code review |
| Anytime | `#tag search` | Related info search |

## 🎉 Let's Start

1. Copy the template
2. Customize CLAUDE.md
3. Test security settings: Run `.claude/scripts/test-security.sh`
4. Create your first plan with `/project:plan`
5. Start efficient development referring to the above examples!

Let's achieve efficient personal development with Claude Code using this template!

## 📚 Enhancement Details & Source Information

### v1.1.0 Enhanced Features
- **Prompt Cache Optimization**: 90% cost reduction, 85% latency reduction
- **Gradual TDD Learning Path**: Learning system for beginners
- **ADR System**: Technical decision recording and management
- **Technical Debt Tracking**: Systematic debt management system
- **Security Features**: Dangerous command blocking via Claude Code hooks

### Sources & References

#### Claude Code Optimization Techniques
- **Anthropic Official**: [Prompt caching - Anthropic API](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- **Anthropic Official**: [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- **AWS Official**: [Supercharge your development with Claude Code and Amazon Bedrock prompt caching](https://aws.amazon.com/blogs/machine-learning/supercharge-your-development-with-claude-code-and-amazon-bedrock-prompt-caching/)
- **Medium**: [Unlocking Efficiency: A Practical Guide to Claude Prompt Caching](https://medium.com/@mcraddock/unlocking-efficiency-a-practical-guide-to-claude-prompt-caching-3185805c0eef)

#### TDD & Test-Driven Development
- **Anthropic Official**: [Claude Code: Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices)
- **Reddit**: [Claude Dev can now automatically fix linter, compiler, and build errors](https://www.reddit.com/r/ClaudeAI/comments/1fgzo87/claude_dev_can_now_automatically_fix_linter/)
- **Reddit**: [Generating unit tests with Claude](https://www.reddit.com/r/ClaudeAI/comments/1i17nwn/generating_unit_tests_with_claude/)

#### ADR (Architecture Decision Record)
- **GitHub**: [Architecture decision record (ADR) examples](https://github.com/joelparkerhenderson/architecture-decision-record)
- **MakerX Blog**: [Architecture Decision Records: How we make better technical choices](https://blog.makerx.com.au/architecture-decision-records-how-we-make-better-technical-choices-at-makerx/)
- **Medium**: [Why Every Software Team Should Embrace Architecture Decision Records](https://levelup.gitconnected.com/why-every-software-team-should-embrace-architecture-decision-records-18cd201cc179)

#### Memory Bank & Context Management
- **Anthropic Official**: [Manage Claude's memory](https://docs.anthropic.com/en/docs/claude-code/memory)
- **Cloud Artisan**: [Claude Code Tips & Tricks: Maximising Memory](https://cloudartisan.com/posts/2025-04-16-claude-code-tips-memory/)
- **DEV Community**: [Introducing Claude Crew: Enhancing Claude Desktop's Coding Agent Capabilities](https://dev.to/kimuson/introducing-claude-crew-enhancing-claude-desktops-coding-agent-capabilities-36ah)

#### AI-Friendly Logging
- **Vibe Logger**: [GitHub - fladdict/vibe-logger](https://github.com/fladdict/vibe-logger)
- **Vibe Logger Article**: [note - Proposal for AI Agent Logging System "Vibe Logger"](https://note.com/fladdict/n/n5046f72bdadd)

#### Cache Technology Details
- **Anthropic Official**: [Long context prompting tips](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips)
- **LinkedIn**: [How to Use Anthropic Claude Prompt Caching (and RAG)](https://www.linkedin.com/posts/anantharamuavinash_how-to-use-claude-prompt-caching-and-ditch-activity-7230786805590061056-xupU)
- **Reddit**: [Claude Caching Is Fantastic For Iterating Over Code!](https://www.reddit.com/r/ClaudeAI/comments/1ewms42/claude_caching_is_fantastic_for_iterating_over/)

### Implementation Details

#### 1. CLAUDE_CACHE Configuration
```json
// .claude/settings.json
{
  "env": {
    "CLAUDE_CACHE": "./.ccache"
  }
}
```

#### 2. cache_control Optimization
cache_control applied to the following files:
- `.claude/core/overview.md` - Project overview
- `.claude/core/templates.md` - Quick templates
- `.claude/context/tech.md` - Technology stack
- `.claude/context/debt.md` - Technical debt tracking
- `docs/requirements.md` - Requirements specification

#### 3. TDD Gradual Learning Path
- **Phase 1 (Week 1-2)**: Master Claude Code without TDD experience
- **Phase 2 (Week 3-4)**: TDD experience with small features
- **Phase 3 (Month 2-3)**: Full TDD application

#### 4. ADR System
- **Template**: `docs/adr/template.md`
- **Decision Records**: Technical choices, architecture, security policies, etc.
- **Integration**: GitHub Issues, debt log, history management

#### 5. Technical Debt Tracking
- **Priority Management**: High🔥/Medium⚠️/Low📝
- **Cost Estimation**: Estimate and record actual time
- **Cache Impact Analysis**: Deletion cost and optimization effect measurement

### Performance Effects
- **Cost Reduction**: 90% reduction through prompt caching
- **Latency Reduction**: 85% reduction in API response
- **TDD Learning**: Beginners can master in 2-3 months
- **Knowledge Management**: Systematic management with ADR and debt logs
- **Enhanced Security**: Improved safety while maintaining development efficiency

### Notes
- `.ccache/` folder is already added to `.gitignore`
- Apply cache_control only to long-term stable information
- Gradual TDD introduction for gentle learning curve
- Record only important technical decisions in ADR to avoid excessive documentation
- **Security Settings**: Use in production after testing
- **Log Monitoring**: Regularly check `~/.claude/security.log` for unauthorized access

### v1.2.0 New Features (AI-Friendly Logger & Automation)

#### Hooks Automation System
- **Automated Quality Checks**: Auto lint and type check on code changes
- **Test Success Recording**: Automatically record successful tests to PROJECT_MEMORY
- **Evolution Auto-tracking**: Auto-log new features and commits

#### Project Health Check
- **Metrics Collection**: Code size, technical debt, dependency health
- **Overall Score Calculation**: Evaluate project health with A-F grades
- **Improvement Suggestions**: Automatically generate specific action plans

#### AI-Friendly Logger (Vibe Logger Concept)
- **Structured Log Format**: JSONL files optimized for AI analysis
- **Automatic Context Collection**: Auto-record project, environment, and Git state
- **AI Metadata**: Add debug hints, priority, and recommended actions
- **Pattern Analysis Tool**: Visualize error trends, operation frequency, and file activity
- **Coexistence with Existing System**: Gradual migration possible with continued generation of traditional logs
- **Inspiration**: [Vibe Logger](https://github.com/fladdict/vibe-logger) by @fladdict
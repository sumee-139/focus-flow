# Claude Code Lightweight Project Template v1.2.0

**The Next-Generation Knowledge Management System Designed for AI-Native Development**

## 🚀 Why This Template is Revolutionary

### 1. **90% Cost Reduction** - Prompt Cache Optimization
By applying `cache_control` to long-term stable information (project overview, technical specifications, etc.), this system dramatically reduces Claude API usage costs. It fundamentally solves the cost problem in daily AI-powered development.

### 2. **AI Analyzes Problems Instantly** - AI-Friendly Logger (Vibe Logger Concept)
Transforms logging from "logs for humans to read" to "logs for AI to analyze". Structured JSON logs automatically collect context information, evolving debugging from "guessing and checking" to "instant root cause analysis by AI".

### 3. **Systematized Project Memory** - Memory Bank System
Hierarchically structures and stores your project's "memory". Dramatically reduces onboarding time for new members and eliminates "what was that again?" moments. AI provides accurate answers instantly.

### 4. **Gradual Integration for Existing Projects**
No need to "change everything right now". The design allows gradual adoption of necessary features while minimizing risk.

---

An efficient project development template optimized for AI-native development.

[日本語版はこちら](README_TEMPLATE_ja.md)

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

## 🚀 Quick Start

### 1. Use This Template
```bash
# Clone the template
git clone https://github.com/yourusername/claude-file-template.git your-project-name
cd your-project-name

# Remove git history and start fresh
rm -rf .git
git init

# Customize project information
# - Replace [Project Name] in CLAUDE.md
# - Fill in docs/requirements.md
# - Update files in .claude/core/
```

### 2. Install and Test Security Features
```bash
# Make scripts executable
chmod +x .claude/scripts/*.sh

# Test security features
.claude/scripts/test-security.sh
```

### 3. Start Development with Claude Code
```bash
# Create your first plan
# Use the command: /project:plan

# Begin implementation
# Use the command: /project:act

# Daily retrospective
# Use the command: /project:daily
```

## 📋 Documentation

### For Beginners
- [README_TEMPLATE.md](README_TEMPLATE.md) - Detailed usage guide
- [Development Rules](docs/development-rules.md) - Development standards and conventions

### For Existing Projects
- [Migration Guide](memo/migration-guide.md) - Gradual migration from existing projects
- [Zero to Memory Bank](memo/zero-to-memory-bank.md) - Implementation guide for projects without Memory Bank

### Technical Documentation
- [Requirements Specification](docs/requirements.md) - Project requirements template
- [ADR Template](docs/adr/template.md) - Architecture Decision Record template
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Version migration guide

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

## 📈 Key Benefits

- **90% Cost Reduction**: Through prompt caching optimization
- **85% Latency Reduction**: Faster API responses
- **Efficient Development**: Hierarchical Memory Bank
- **Enhanced Security**: Automatic dangerous command blocking
- **AI-Powered Debugging**: Structured logs optimized for AI analysis

## 🆕 v1.2.0 New Features

### AI-Friendly Logger (Vibe Logger Concept)
- **Structured Logs**: JSON format optimized for AI analysis
- **Rich Context**: Automatically collects project, environment, and Git information
- **AI Metadata**: Adds debug hints, priority, and recommended actions
- **Pattern Analysis**: Visualizes error trends and file activity
- **Analysis Tool**: Generate AI insights with `analyze-ai-logs.py`

Inspired by [Vibe Logger](https://github.com/fladdict/vibe-logger) by @fladdict

## 📚 Sources & References

- [Anthropic Official Documentation](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Architecture Decision Records](https://github.com/joelparkerhenderson/architecture-decision-record)
- [Vibe Logger](https://github.com/fladdict/vibe-logger) - AI-optimized logging concept

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Anthropic team for Claude Code and best practices
- @fladdict for the Vibe Logger concept
- Community contributors

---

Start efficient personal development with Claude Code using this template!
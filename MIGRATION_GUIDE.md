# Claude Friends v2.0.0 Migration Guide

🌐 **[日本語](MIGRATION_GUIDE_ja.md)** | **English**

A guide to help you migrate from v1.x to v2.0.0.

## 🎉 Revolutionary Changes in v2.0.0

### Introduction of Claude Friends Multi-Agent System
- **Planner Agent**: Strategic planning & design documentation (with Mermaid diagrams)
- **Builder Agent**: Implementation, debugging, and code review
- **Smart Mode Switching**: Agents automatically switch to special modes based on context

### Major Command Simplification
- **Before**: 7+ commands
- **Now**: Just 4 core commands
- **Reduction**: 40%+ command reduction

## 🚨 Breaking Changes

### 1. Deprecated Commands

| Deprecated Command | New Method |
|-------------------|------------|
| `/project:plan` | Use `/agent:planner` |
| `/project:act` | Use `/agent:builder` |
| `/feature:plan` | Planner's Feature Design Mode (automatic) |
| `/debug:start` | Builder's Debug Mode (automatic) |
| `/review:check` | Builder's Code Review Mode |

### 2. New Agent Structure
```
.claude/
├── agents/          # NEW!
│   └── active.md    # Currently active agent
├── planner/         # NEW!
│   ├── identity.md  # Planner role definition
│   ├── notes.md     # Work notes
│   └── handover.md  # Handover document
├── builder/         # NEW!
│   ├── identity.md  # Builder role definition
│   ├── notes.md     # Implementation notes
│   └── handover.md  # Handover document
└── shared/          # NEW!
    ├── phase-todo.md    # Phase/ToDo management
    └── constraints.md   # Project constraints
```

### 3. Workflow Changes
- **Before**: Command-based development
- **Now**: Agent-based development
- **Benefits**: More natural dialogue, automatic context understanding

## 🔧 Migration Steps

### Step 1: Backup
```bash
# Backup current configuration
cp -r .claude .claude_backup_v1
cp CLAUDE.md CLAUDE_backup_v1.md
```

### Step 2: Create New Agent Structure
```bash
# Create agent directories
mkdir -p .claude/agents
mkdir -p .claude/planner/archive
mkdir -p .claude/builder/archive
mkdir -p .claude/shared

# Initialize active.md
echo "# Active Agent\n\n## Current Agent: none\n\nLast updated: $(date +%Y-%m-%d)" > .claude/agents/active.md
```

### Step 3: Apply Latest Version
```bash
# Get latest version
git pull origin main

# Or manually copy v2.0.0 files
```

### Step 4: Migrate Commands

#### Daily Workflow Migration
```bash
# Previous workflow
/project:plan      # Planning
/project:act       # Implementation
/debug:start       # Debugging
/review:check      # Review

# New workflow
/agent:planner     # Planning & design (auto feature mode)
/agent:builder     # Implementation, debug, review (auto mode switching)
```

#### Update Custom Commands
If you have created custom commands:
1. Check `.claude/commands/`
2. Update references to deprecated commands
3. Adapt to new agent-based flow

### Step 5: Update CLAUDE.md
```bash
# Update major sections in CLAUDE.md
# - Custom commands section
# - Add Claude Friends system description
# - Remove deprecated command descriptions
```

### Step 6: Verification
```bash
# Check agent structure
ls -la .claude/agents/
ls -la .claude/planner/
ls -la .claude/builder/

# Test command operation
# Test Planner mode
"Please switch to planner mode"

# Test Builder mode  
"Please switch to builder mode"
```

## 📋 Migration Checklist

- [ ] Created backup
- [ ] Created agent directory structure
- [ ] Updated CLAUDE.md
- [ ] Updated references to deprecated commands
- [ ] `/agent:planner` works correctly
- [ ] `/agent:builder` works correctly
- [ ] Verified automatic special mode switching
- [ ] Understood handover.md creation process

## 🆕 Leveraging New Features

### 1. Smart Mode Switching
```
While using Planner:
"I want to design a new user authentication feature"
→ Automatically switches to Feature Design Mode and creates Mermaid diagrams

While using Builder:
Error occurs
→ Automatically switches to Debug Mode and analyzes root cause
```

### 2. Handover System
```bash
# When switching agents
1. Current agent creates handover.md
2. Includes recommendations for next agent
3. Enables smooth work continuation
```

### 3. Phase/ToDo Management
```
# Centralized management in shared/phase-todo.md
- Current Phase
- ToDos within Phase (priority order)
- Completed Phases
- Next Phase candidates
```

## ❓ Frequently Asked Questions

### Q: Why were commands reduced?
A: The agent system understands context and automatically switches to appropriate modes, eliminating the need for individual mode commands.

### Q: Where did the `/debug:start` functionality go?
A: Builder agent automatically enters Debug Mode when errors are detected. To manually activate, simply say "analyze this in debug mode".

### Q: What about `/feature:plan`'s detailed design documentation?
A: It's integrated into Planner agent and enhanced. It now creates more visual design documents that automatically include Mermaid diagrams.

### Q: How long does migration take?
A: About 30 minutes for typical projects. Allow 1 hour for heavily customized projects.

### Q: Can I revert to v1.x?
A: You can restore from backup, but you'll lose v2.0.0 benefits (cost reduction, efficiency improvements).

## 🚀 New Workflow Example After Migration

```
Morning start:
/agent:planner
"I want to complete the user management feature today"
→ Planner creates plan and design documents

Start implementation:
/agent:builder  
"Start implementation based on Planner's design"
→ Builder implements, tests, debugs as needed

Review:
"Review the implemented code in review mode"
→ Builder automatically switches to Code Review Mode

Daily retrospective:
/project:daily
→ Can be executed from any agent
```

## 📞 Support

If you have questions or issues about migration, please report them on GitHub Issues.

---

**Important**: Migration to v2.0.0 significantly improves the development experience. While there's an initial learning curve, you'll quickly appreciate the efficiency of the new workflow.
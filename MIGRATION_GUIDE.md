# Claude File Template v1.2.0 Migration Guide

This guide explains how to migrate from previous versions to v1.2.0.

## 🚨 Breaking Changes

### 1. Major Simplification of CLAUDE.md
- **Before**: 367 lines of detailed configuration
- **After**: 65 lines of compact configuration
- **Action**: Detailed information has been moved to `@.claude/guidelines/`

### 2. Deleted Files/Directories
The following elements have been removed:

#### Deleted Commands
- `.claude/commands/compress.md` → Unnecessary (temporary use)
- `.claude/commands/deploy-prep.md` → Recommend CI/CD automation
- `.claude/commands/monthly.md` → Low usage frequency
- `.claude/commands/update-memory.md` → Recommend automation
- `.claude/commands/health.md` → Integrated into `/project:daily`

#### Deleted Structure
- `PROJECT_MEMORY.md` → Replaced by `.claude/context/history.md`
- `.claude/evolution/` → Removed due to over-structuring
- `.claude/agents/` → Removed as premature

### 3. Guidelines Integration
Old file → New file mapping:

| Old File | New File |
|----------|----------|
| `development.md` | `development.md` |
| `error-handling.md` | Integrated into `development.md` |
| `quality-gates.md` | Integrated into `development.md` |
| `git-conventions.md` | Integrated into `git-workflow.md` |
| `adr-system.md` | Integrated into `git-workflow.md` |
| `testing.md` | Integrated into `testing-quality.md` |
| `debt-tracking.md` | Integrated into `testing-quality.md` |

## 🔧 Migration Steps

### Step 1: Backup
```bash
# Backup current configuration
cp -r .claude .claude_backup
cp CLAUDE.md CLAUDE_backup.md
```

### Step 2: Apply New Version
```bash
# Get latest version
git pull origin main

# Or manually update files
```

### Step 3: Migrate Customizations

#### If using PROJECT_MEMORY.md
1. Move content to `.claude/context/history.md`
2. Add "Design Reasons" section to "Important Decisions" in history.md
3. Add "Learning Log" to "Retrospective Log" in history.md

#### hooks.yaml Customization
Update references to evolution/ directory:
```yaml
# Before
echo "..." >> .claude/evolution/changes.log

# After (if needed)
echo "..." >> .claude/logs/changes.log  # Create logs directory
```

### Step 4: Enable AI Logger (Optional)
```bash
# Check configuration file
cat .claude/settings.json

# Verify AI Logger is included in hooks
# Check if "command": ".claude/scripts/ai-logger.sh" exists

# Test run
echo "Test file" > test.txt
rm test.txt

# Check AI logs
ls -la ~/.claude/ai-activity.jsonl
```

### Step 5: Verification
```bash
# Check file structure
find .claude -type f -name "*.md" | sort

# Check CLAUDE.md
cat CLAUDE.md
```

## 📋 Checklist

Confirm migration completion:
- [ ] CLAUDE.md is the new simplified version
- [ ] `.claude/guidelines/` contains 3 files
- [ ] `.claude/commands/` contains 7 files
- [ ] Custom commands work properly
- [ ] hooks.yaml paths are updated

## 🆕 New Features

### AI-Friendly Logger (v1.2.0 - Vibe Logger Concept)
**New files added**:
- `.claude/scripts/ai-logger.sh` - Structured log generation script
- `.claude/scripts/analyze-ai-logs.py` - AI log analysis tool
- `.claude/ai-logger-README.md` - Detailed documentation

**Main features**:
- Structured JSON format optimized for AI analysis
- Automatic collection of project, environment, and Git information
- AI metadata (debug hints, priority, recommended actions)
- Error pattern analysis and AI-oriented insight generation
- Parallel operation with existing activity log system

**Inspiration**: [Vibe Logger](https://github.com/fladdict/vibe-logger) by @fladdict

### Secure Bash Configuration
Safe execution permissions added to `.claude/settings.local.json`:
- Deny list for dangerous commands
- Whitelist for allowed commands
- Pre-execution security checks

### Integrated Guidelines
- Development information consolidated into one file
- Git/ADR related content integrated into one file
- Testing/quality/technical debt integrated into one file

## ❓ Troubleshooting

### Q: Cannot find previous commands
A: Check the following mapping:
- `/health` → Use health check feature in `/project:daily`
- Monthly tasks → Execute manually or set calendar reminders

### Q: Reference error to PROJECT_MEMORY.md
A: Update all references to `.claude/context/history.md`

### Q: Too many files causing confusion
A: Remove unnecessary backup files:
```bash
rm -rf .claude_backup CLAUDE_backup.md
```

## 📞 Support

If you encounter any issues, please report them on GitHub Issues:
https://github.com/sougetuOte/claude-file-template/issues

---

**Note**: This migration makes project management simpler and more efficient. While there is temporary effort involved, the long-term benefits are significant.
# Claude Friends User Guide

🌐 **English** | **[日本語](claude-friends-guide_ja.md)**

## 🎯 What is Claude Friends?
**Sequential Multi-Agent System** - Experience team development even when working solo with AI.

### Two AI Agents
- **Planner**: Determines project direction and organizes tasks
- **Builder**: Writes code and tests based on the plan

## 🚀 Basic Usage

### 1. First Launch
```bash
# Start in Planner mode (planning)
/agent:planner

# Switch to Builder once plan is ready (implementation)
/agent:builder
```

### 2. Daily Development Flow
```
Morning: Plan today's work with Planner
  ↓
Morning: Implement with Builder
  ↓  
Afternoon: Re-plan with Planner if stuck
  ↓
Evening: Finish up with Builder
  ↓
End: Create handover for next day
```

### 3. When to Switch Agents

#### When to Use Planner
- Determining project direction
- Designing major features
- Organizing task priorities
- Re-planning when stuck

#### When to Use Builder
- Writing actual code
- Fixing bugs
- Creating tests
- Refactoring

## 📝 Handover Tips

### Good Handover Example
```markdown
# Handover - 2025-01-11 15:30

## From: Planner
## To: Builder

## Completed Work
- Authentication design complete
- API endpoints defined
- Database schema decided

## For Next Agent

### Tasks:
1. Implement /api/auth/login endpoint
2. JWT token generation
3. Create user table

### Notes:
- Hash passwords with bcrypt
- Token expiry: 24 hours
- Use unified error response format
```

### When to Create Handovers
- Before switching agents (required)
- When interrupting work
- After important decisions
- End of day

## 🎭 Working with Agent Personalities

### Talking to Planner
- "What's the big picture?"
- "What are the priorities?"
- "Is this approach good?"

### Talking to Builder
- "Fix this error"
- "Write tests for this"
- "Improve performance"

## 📁 Understanding File Structure

```
.claude/
├── agents/
│   └── active.md          # Current agent
├── planner/
│   ├── identity.md        # Planner role definition
│   ├── notes.md          # Planner work notes
│   └── handover.md       # Handover document
├── builder/
│   ├── identity.md        # Builder role definition
│   ├── notes.md          # Builder work notes
│   └── handover.md       # Handover document
└── shared/
    ├── constraints.md     # Project constraints
    └── phase-todo.md     # Phase/ToDo management
```

## 💡 Tips & Tricks

### 1. Leverage Phase Management
- Split large projects into 5-7 phases
- Each phase should complete in 1-2 weeks
- Review at phase completion

### 2. Handling Interruptions
```bash
# For urgent interruptions
# Create handover-interrupt-2025-01-11-1530.md
```

### 3. Using Archives
- Move handovers older than 1 week to archive folder
- Useful for referencing past decisions

### 4. Combining with Existing Commands
- `/project:daily` for daily retrospective
- `/debug:start` for debug mode
- Agent system coexists with traditional commands

## ⚠️ Important Notes

### Don't Do This
- Switch agents without handover
- Go into implementation details as Planner
- Make major design changes as Builder

### Troubleshooting
- **Switching doesn't work**: Manually edit active.md
- **Unclear handover**: Re-read previous handover
- **Role confusion**: Check identity.md for role clarity

## 🎉 Tips for Success
- Treat agents as "colleagues"
- Give clear instructions and expectations
- Use feedback to improve
- Build small successes

---

Experience "team development" efficiency even when working alone with Claude Friends!
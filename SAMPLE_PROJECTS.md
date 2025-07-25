# 🚀 Sample Projects for Claude Friends

🌐 **English** | **[日本語](SAMPLE_PROJECTS_ja.md)**

Want to test drive the Claude Friends multi-agent system? Here are some moderately complex projects perfect for experiencing the Planner-Builder workflow!

## 📝 1. Markdown-Driven Task Management System

**Complexity**: Medium-High  
**Why it's perfect**: Clear separation between architecture (Planner) and implementation (Builder)

### Core Features
- Extract tasks from markdown files automatically
- Kanban board UI with drag-and-drop
- Two-way sync with GitHub Issues
- Tag, priority, and deadline management
- Progress report generation
- Multi-project support

### Tech Stack Suggestion
- Python + FastAPI for backend
- Vue.js or React for frontend
- SQLite for local storage
- GitHub API integration

### Getting Started
```bash
/agent:planner
"Let's design a markdown-driven task management system. Start with system architecture and core features."
```

---

## 🌱 2. Digital Pet Ecosystem Simulator

**Complexity**: Medium-High  
**Why it's perfect**: Simulation rules need careful planning before implementation

### Core Features
- Multiple species (herbivores, carnivores, plants)
- Environmental parameters (temperature, humidity, light)
- Evolution and mutation system
- Real-time statistics and graphs
- Intervention features (feeding, environment adjustment)
- Long-term observation logs

### Tech Stack Suggestion
- Python + Pygame for visualization
- NumPy for simulation calculations
- Matplotlib for statistics
- JSON for save files

### Getting Started
```bash
/agent:planner
"Design a digital pet ecosystem where creatures evolve based on environmental conditions."
```

---

## 🎮 3. Roguelike Dungeon Crawler

**Complexity**: High  
**Why it's perfect**: Game systems require extensive planning before coding

### Core Features
- Procedural dungeon generation
- Turn-based combat system
- Item and skill systems
- Enemy AI with state machines
- Save/load functionality
- ASCII or tile-based graphics

### Tech Stack Suggestion
- Python + tcod (for traditional roguelike)
- OR Python + Pygame (for graphical version)
- JSON for game data
- Pickle for save files

### Getting Started
```bash
/agent:planner
"Let's create a roguelike dungeon crawler. Focus on core gameplay loop and systems."
```

---

## 📊 4. Personal Developer Metrics Collector

**Complexity**: Medium  
**Why it's perfect**: Can leverage Claude Friends' own activity logs

### Core Features
- Automatic coding time measurement
- Per-language and per-project statistics
- WakaTime-style dashboard
- Weekly/monthly reports
- Pomodoro timer integration
- Git commit analysis

### Tech Stack Suggestion
- Python for data collection
- SQLite for storage
- Flask + Chart.js for dashboard
- Cron for scheduling

### Getting Started
```bash
/agent:planner
"Design a personal metrics collector for developers. Should track coding time and provide insights."
```

---

## 🔄 5. Local File Sync Tool

**Complexity**: High  
**Why it's perfect**: Many edge cases require careful planning

### Core Features
- Two-way synchronization
- Conflict resolution UI
- Version history
- Exclude patterns
- Diff viewer
- Scheduled sync

### Tech Stack Suggestion
- Python + watchdog for file monitoring
- tkinter for GUI
- SQLite for sync history
- rsync algorithm implementation

### Getting Started
```bash
/agent:planner
"Create a local file synchronization tool with conflict resolution. Think Dropbox but local."
```

---

## 💡 How to Use These Projects

1. **Choose a project** that interests you
2. **Start with Planner agent** to design the architecture
3. **Switch to Builder agent** when ready to implement
4. **Use handovers** to switch between planning and building phases
5. **Track progress** in phase-todo.md

### Example Workflow

```bash
# 1. Initial planning
/agent:planner
"I want to build [chosen project]. Let's start with requirements and architecture."

# 2. After planning is complete
/agent:builder
"Let's implement the core features we planned."

# 3. When you need to revisit design
/agent:planner
"We need to reconsider the architecture for [specific feature]."
```

## 🎯 Tips for Success

- **Start small**: Implement core features first
- **Iterate often**: Switch between agents as needed
- **Document decisions**: Use ADR for important choices
- **Track debt**: Note shortcuts in debt.md
- **Test early**: Write tests as you build

## 🤝 Share Your Experience

Built something cool? Have feedback on the Claude Friends system?
- Open an issue with your experience
- Share your project structure
- Suggest improvements

Happy coding with Claude Friends! 🎉
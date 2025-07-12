# 🛡️ Claude Friends Secure Development Container

This development container provides a **safety-first environment** for experimenting with Claude Friends and custom commands.

## 🔒 Security Features

### 1. **Multiple Safety Layers**
- **Container Isolation**: Your host system is protected
- **Automatic Backups**: Hourly snapshots to `/workspace-backup/`
- **Command Interception**: Dangerous commands require confirmation
- **Git Hooks**: Pre-commit safety checks
- **Restricted Permissions**: System directories are protected

### 2. **Built-in Protection Against**
- Accidental `rm -rf /` commands
- System directory deletion
- Unsafe file permissions (777)
- Malicious curl/wget pipes
- Direct disk operations

### 3. **Safe Experimentation**
- Test custom commands without fear
- Experiment with agent behaviors safely
- Learn from mistakes without consequences
- Easy rollback from backups

## 🚀 Getting Started

1. **Open in VS Code**:
   ```bash
   code .
   ```
   Then select "Reopen in Container" when prompted.

2. **Using GitHub Codespaces**:
   - Click "Code" → "Codespaces" → "Create codespace"
   - Automatic secure environment in the cloud

3. **Using Docker locally**:
   ```bash
   docker compose -f .devcontainer/docker-compose.yml up -d
   ```

## 📁 Container Structure

```
/workspace/              # Your project files
/workspace-backup/       # Automatic hourly backups
/safe-scripts/          # Protected script storage
/home/vscode/.claude/   # Claude logs and history
```

## 🛠️ Customization

### Adding More Safety Rules

Edit `.devcontainer/post-create.sh` to add custom protections:
```bash
# Example: Block custom dangerous command
echo 'alias dangerous-cmd="echo Command blocked for safety"' >> ~/.bashrc
```

### Adjusting Backup Frequency

Modify the crontab in `post-create.sh`:
```bash
# Every 30 minutes instead of hourly
"*/30 * * * * rsync -av ..."
```

### Disabling Specific Protections

If you need to disable certain protections (use with caution!):
```bash
# Temporarily use real rm without confirmation
/bin/rm -f file.txt

# Bypass all aliases for one session
unalias rm mv cp
```

## 🚨 Emergency Procedures

### Restore from Backup
```bash
# Full restoration
rsync -av /workspace-backup/ /workspace/

# Restore specific files
cp /workspace-backup/important-file.txt /workspace/
```

### Check Command History
```bash
# View all executed commands
cat ~/.claude/command-history.log

# Search for specific commands
grep "rm" ~/.claude/command-history.log
```

### Reset Environment
```bash
# Rebuild container with fresh state
# VS Code: Cmd/Ctrl+Shift+P → "Rebuild Container"
```

## 🎯 Best Practices

1. **Test in Stages**: Start with read-only commands before modifications
2. **Use Version Control**: Commit often to track changes
3. **Review Agent Actions**: Check what commands agents plan to execute
4. **Monitor Logs**: Keep an eye on security logs and command history
5. **Ask for Confirmation**: When in doubt, add confirmation prompts

## 📊 Monitoring

The container provides several monitoring tools:
- `htop`: System resource usage
- `iotop`: Disk I/O monitoring
- Command history in `~/.claude/command-history.log`
- Git history for all file changes

## 🤝 Contributing Safely

When adding new features to Claude Friends:
1. Test in the container first
2. Add appropriate safety checks
3. Document any new risks
4. Update safety rules as needed

---

Remember: **It's better to be safe than sorry!** This container lets you experiment freely while protecting your system. 🚀
#!/bin/bash

echo "🚀 Setting up Claude Friends secure development environment..."

# Make scripts executable
chmod +x .claude/scripts/*.sh

# Create initial backup
echo "📦 Creating initial workspace backup..."
rsync -av --exclude='.git' --exclude='node_modules' --exclude='.ccache' /workspace/ /workspace-backup/

# Set up automatic backup cron job
echo "⏰ Setting up hourly backup..."
(crontab -l 2>/dev/null; echo "0 * * * * rsync -av --exclude='.git' --exclude='node_modules' --exclude='.ccache' /workspace/ /workspace-backup/") | crontab -

# Initialize git hooks for safety
if [ -d .git ]; then
    echo "🔒 Installing git safety hooks..."
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Safety check before commit
echo "🔍 Running safety checks before commit..."

# Check for potentially dangerous patterns
dangerous_patterns=(
    "rm -rf /"
    "rm -rf /usr"
    "chmod 777"
    "curl.*|.*sh"
    "wget.*|.*bash"
)

for pattern in "${dangerous_patterns[@]}"; do
    if git diff --cached | grep -E "$pattern"; then
        echo "⚠️  WARNING: Potentially dangerous pattern detected: $pattern"
        echo "Please review your changes carefully!"
        read -p "Are you sure you want to commit? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
done

echo "✅ Safety checks passed!"
EOF
    chmod +x .git/hooks/pre-commit
fi

# Create safety wrapper for rm command
cat > /home/vscode/.local/bin/safe-rm << 'EOF'
#!/bin/bash
# Safety wrapper for rm command

# Check if trying to delete system directories
for arg in "$@"; do
    if [[ "$arg" == "/" || "$arg" == "/usr" || "$arg" == "/etc" || "$arg" == "/var" || "$arg" == "/home" ]]; then
        echo "🚫 ERROR: Attempting to delete system directory: $arg"
        echo "This operation is blocked for safety."
        exit 1
    fi
done

# Check if -rf flags are used with root paths
if [[ "$*" == *"-rf /"* ]] || [[ "$*" == *"-fr /"* ]]; then
    echo "🚫 ERROR: Dangerous rm -rf command detected!"
    echo "This operation is blocked for safety."
    exit 1
fi

# Execute the real rm with interactive flag for safety
/bin/rm -i "$@"
EOF

chmod +x /home/vscode/.local/bin/safe-rm
mkdir -p /home/vscode/.local/bin

# Add safety PATH
echo 'export PATH="/home/vscode/.local/bin:$PATH"' >> /home/vscode/.bashrc
echo 'export PATH="/home/vscode/.local/bin:$PATH"' >> /home/vscode/.zshrc

# Test Claude security scripts
echo "🧪 Testing Claude security scripts..."
if .claude/scripts/test-security.sh; then
    echo "✅ Security scripts are working correctly!"
else
    echo "⚠️  Security scripts test failed. Please check the configuration."
fi

# Create a safety reminder
cat > /workspace/.claude-safety-reminder.md << 'EOF'
# 🛡️ Claude Friends Safety Reminder

This development container includes multiple safety layers:

1. **Automatic Backups**: Your workspace is backed up hourly to `/workspace-backup/`
2. **Command Aliases**: `rm`, `mv`, and `cp` require confirmation
3. **Git Hooks**: Pre-commit checks for dangerous patterns
4. **Safe Wrappers**: System directories are protected
5. **Claude Security**: Built-in command blocking via `.claude/scripts/`

## In Case of Emergency

If you need to restore from backup:
```bash
rsync -av /workspace-backup/ /workspace/
```

## Customizing Safety Rules

- Edit `.claude/scripts/deny-check.sh` for command blocking
- Edit `.devcontainer/post-create.sh` for container setup
- Edit `.git/hooks/pre-commit` for commit checks

Stay safe and happy coding! 🚀
EOF

echo "✨ Claude Friends secure environment setup complete!"
echo "📖 See .claude-safety-reminder.md for safety features"
#!/bin/bash
# Universal safety wrapper for dangerous commands

COMMAND=$(basename $0)
ARGS="$@"

# Log all command attempts
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Command: $COMMAND $ARGS" >> /home/vscode/.claude/command-history.log

# Define dangerous patterns
case "$COMMAND" in
    "rm")
        # Check for dangerous rm patterns
        if [[ "$ARGS" =~ ^-[^-]*r[^-]*f[[:space:]]+/ ]] || [[ "$ARGS" =~ ^-rf[[:space:]]+/ ]]; then
            echo "🚫 BLOCKED: Dangerous recursive deletion attempted"
            echo "Command: rm $ARGS"
            echo "This command could destroy your system and has been blocked."
            exit 1
        fi
        ;;
    "chmod")
        # Check for dangerous chmod patterns
        if [[ "$ARGS" =~ 777 ]] || [[ "$ARGS" =~ [0-7]77 ]]; then
            echo "⚠️  WARNING: Setting world-writable permissions (777)"
            echo "This is a security risk. Are you sure?"
            read -p "Continue? (y/N) " -n 1 -r
            echo
            [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
        fi
        ;;
    "dd")
        # Always warn for dd commands
        echo "⚠️  WARNING: dd command can be destructive"
        echo "Command: dd $ARGS"
        read -p "Are you absolutely sure? (y/N) " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
        ;;
esac

# Execute the real command
exec /usr/bin/$COMMAND "$@"
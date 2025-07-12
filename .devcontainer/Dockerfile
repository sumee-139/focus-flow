FROM mcr.microsoft.com/devcontainers/universal:2-linux

# Install additional security tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    # File monitoring tools
    inotify-tools \
    # System monitoring
    htop \
    iotop \
    # Security tools
    chkrootkit \
    # Backup tools for safety
    rsync \
    # JSON processing
    jq \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create safety directories
RUN mkdir -p /workspace-backup \
    && mkdir -p /safe-scripts \
    && mkdir -p /home/vscode/.claude

# Set up safe aliases
RUN echo 'alias rm="rm -i"' >> /home/vscode/.bashrc \
    && echo 'alias mv="mv -i"' >> /home/vscode/.bashrc \
    && echo 'alias cp="cp -i"' >> /home/vscode/.bashrc \
    && echo 'alias rm="rm -i"' >> /home/vscode/.zshrc \
    && echo 'alias mv="mv -i"' >> /home/vscode/.zshrc \
    && echo 'alias cp="cp -i"' >> /home/vscode/.zshrc

# Install Python safety tools
RUN pip3 install --no-cache-dir \
    bandit \
    safety \
    black \
    ruff \
    mypy

# Install Node.js safety tools
RUN npm install -g \
    prettier \
    eslint \
    npm-audit-resolver \
    snyk

# Create safety wrapper scripts
COPY safety-wrapper.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/safety-wrapper.sh

# Set restricted permissions
RUN chmod 700 /workspace-backup \
    && chown vscode:vscode /workspace-backup \
    && chown -R vscode:vscode /safe-scripts \
    && chown -R vscode:vscode /home/vscode/.claude

# Add warning message
RUN echo '#!/bin/bash' > /etc/profile.d/claude-safety.sh \
    && echo 'echo "⚠️  Claude Friends Development Container - Safety Mode Enabled"' >> /etc/profile.d/claude-safety.sh \
    && echo 'echo "📁 Your workspace is automatically backed up to /workspace-backup"' >> /etc/profile.d/claude-safety.sh \
    && echo 'echo "🛡️  Destructive commands require confirmation"' >> /etc/profile.d/claude-safety.sh \
    && chmod +x /etc/profile.d/claude-safety.sh

USER vscode
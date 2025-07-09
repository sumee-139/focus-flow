#!/bin/bash

# Claude Code Security Hook - Deny List Checker
# このスクリプトは危険なコマンドをブロックします

# 標準入力からコマンドを読み取り
command=$(cat)

# ログファイルの設定
LOG_FILE="${HOME}/.claude/security.log"
timestamp=$(date '+%Y-%m-%d %H:%M:%S')

# ログ記録関数
log_attempt() {
    echo "[$timestamp] $1" >> "$LOG_FILE"
}

# 危険なコマンドパターンのリスト
DANGEROUS_PATTERNS=(
    # システム破壊的コマンド
    "rm -rf /"
    "rm -rf /*"
    "rm -rf ~"
    "rm -rf $HOME"
    "chmod 777 /"
    "chmod -R 777 /"
    "chown -R root /"
    
    # 外部コードの実行
    "curl.*|.*sh"
    "wget.*|.*sh"
    "curl.*|.*bash"
    "wget.*|.*bash"
    "curl.*>.*\.sh"
    "wget.*>.*\.sh"
    
    # 設定変更
    "git config --global"
    "npm config set"
    "pip config set"
    "conda config"
    
    # プロセス・サービス操作
    "sudo systemctl"
    "sudo service"
    "sudo kill -9"
    "killall -9"
    
    # ネットワーク危険操作
    "iptables -F"
    "ufw disable"
    "firewall-cmd --disable"
    
    # データベース危険操作
    "DROP DATABASE"
    "DROP TABLE"
    "DELETE FROM.*WHERE.*1=1"
    
    # パッケージ管理（全体）
    "sudo apt-get remove"
    "sudo apt-get purge"
    "sudo yum remove"
    "sudo dnf remove"
    "brew uninstall --zap"
    
    # 権限昇格
    "sudo su"
    "sudo -i"
    "sudo bash"
    "sudo sh"
    
    # ファイル暗号化・削除
    "shred -vfz"
    "dd if=/dev/zero"
    "dd if=/dev/urandom"
    
    # 危険なディレクトリ操作
    "mv /usr"
    "mv /bin"
    "mv /sbin"
    "mv /lib"
    "mv /etc"
)

# コマンドチェック
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    if echo "$command" | grep -qE "$pattern"; then
        log_attempt "BLOCKED: $command (matched: $pattern)"
        echo "セキュリティ警告: 危険なコマンドが検出されました"
        echo "ブロックされたコマンド: $command"
        echo "マッチしたパターン: $pattern"
        echo ""
        echo "このコマンドは安全上の理由でブロックされています。"
        echo "必要な場合は、管理者に相談してください。"
        exit 1
    fi
done

# 許可されたコマンドをログに記録
log_attempt "ALLOWED: $command"
exit 0
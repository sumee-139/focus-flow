#!/bin/bash

# Claude Code Security Hook - Allow List Checker
# このスクリプトは許可されたコマンドのみを通します

# 標準入力からコマンドを読み取り
command=$(cat)

# ログファイルの設定
LOG_FILE="${HOME}/.claude/security.log"
timestamp=$(date '+%Y-%m-%d %H:%M:%S')

# ログ記録関数
log_attempt() {
    echo "[$timestamp] $1" >> "$LOG_FILE"
}

# 許可されたコマンドパターンのリスト
ALLOWED_PATTERNS=(
    # 基本的なファイル操作
    "^ls( |$)"
    "^cat( |$)"
    "^head( |$)"
    "^tail( |$)"
    "^grep( |$)"
    "^find( |$)"
    "^sort( |$)"
    "^uniq( |$)"
    "^wc( |$)"
    "^awk( |$)"
    "^sed( |$)"
    
    # 安全なファイル操作
    "^mkdir( |$)"
    "^touch( |$)"
    "^cp( |$)"
    "^mv( |$)"
    "^rm [^-]"  # rm -rf 等の危険なオプション以外
    "^chmod [0-7][0-7][0-7]( |$)"  # 具体的なパーミッション指定のみ
    
    # Git操作（プロジェクト内）
    "^git status( |$)"
    "^git add( |$)"
    "^git commit( |$)"
    "^git push( |$)"
    "^git pull( |$)"
    "^git diff( |$)"
    "^git log( |$)"
    "^git branch( |$)"
    "^git checkout( |$)"
    "^git merge( |$)"
    "^git stash( |$)"
    
    # 開発ツール（プロジェクト内）
    "^npm install( |$)"
    "^npm run( |$)"
    "^npm test( |$)"
    "^npm start( |$)"
    "^npm build( |$)"
    "^yarn install( |$)"
    "^yarn run( |$)"
    "^pnpm install( |$)"
    "^pnpm run( |$)"
    
    # Python開発
    "^python( |$)"
    "^python3( |$)"
    "^pip install( |$)"
    "^pip show( |$)"
    "^pip list( |$)"
    "^poetry install( |$)"
    "^poetry run( |$)"
    "^uv( |$)"
    
    # 現代的CLIツール
    "^eza( |$)"
    "^batcat( |$)"
    "^rg( |$)"
    "^fd( |$)"
    "^dust( |$)"
    "^z( |$)"
    
    # プロセス確認
    "^ps( |$)"
    "^top( |$)"
    "^htop( |$)"
    "^jobs( |$)"
    
    # ネットワーク（読み取り専用）
    "^curl -s( |$)"
    "^wget -q( |$)"
    "^ping( |$)"
    "^nslookup( |$)"
    
    # テスト・ビルド
    "^make( |$)"
    "^cmake( |$)"
    "^cargo( |$)"
    "^go( |$)"
    "^mvn( |$)"
    "^gradle( |$)"
    
    # システム情報（読み取り専用）
    "^uname( |$)"
    "^whoami( |$)"
    "^pwd( |$)"
    "^env( |$)"
    "^date( |$)"
    "^uptime( |$)"
    "^df( |$)"
    "^free( |$)"
    
    # エディタ
    "^nano( |$)"
    "^vim( |$)"
    "^emacs( |$)"
    "^code( |$)"
    
    # 圧縮・解凍
    "^tar( |$)"
    "^zip( |$)"
    "^unzip( |$)"
    "^gzip( |$)"
    "^gunzip( |$)"
)

# コマンドチェック
for pattern in "${ALLOWED_PATTERNS[@]}"; do
    if echo "$command" | grep -qE "$pattern"; then
        log_attempt "ALLOWED: $command (matched: $pattern)"
        exit 0
    fi
done

# 許可されていないコマンドをログに記録
log_attempt "DENIED: $command (no matching allow pattern)"
echo "セキュリティ警告: 許可されていないコマンドが検出されました"
echo "拒否されたコマンド: $command"
echo ""
echo "このコマンドは許可リストに含まれていません。"
echo "必要な場合は、管理者に許可リストの追加を依頼してください。"
exit 1
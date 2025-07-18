# Windows Electron Execution Fix Script
# このスクリプトを管理者権限で実行してください

Write-Host "=== FocusFlow Windows Electron Fix ===" -ForegroundColor Green
Write-Host "Diagnosing Electron execution issues..." -ForegroundColor Yellow

# Step 1: 基本環境確認
Write-Host "`n--- Step 1: Environment Check ---" -ForegroundColor Cyan
Write-Host "Node.js version:"
node --version
Write-Host "NPM version:"
npm --version
Write-Host "PowerShell execution policy:"
Get-ExecutionPolicy
Write-Host "Current user:"
whoami

# Step 2: npx動作確認
Write-Host "`n--- Step 2: NPX Test ---" -ForegroundColor Cyan
Write-Host "Testing npx basic functionality..."
npx --version

# Step 3: Electron直接確認
Write-Host "`n--- Step 3: Direct Electron Test ---" -ForegroundColor Cyan
Write-Host "Checking Electron installation..."
if (Test-Path "node_modules\.bin\electron.cmd") {
    Write-Host "✅ Electron binary found" -ForegroundColor Green
    Write-Host "Attempting direct execution..."
    & ".\node_modules\.bin\electron.cmd" --version
} else {
    Write-Host "❌ Electron binary not found" -ForegroundColor Red
}

# Step 4: Windows Defender確認
Write-Host "`n--- Step 4: Windows Defender Check ---" -ForegroundColor Cyan
Write-Host "Checking Windows Defender real-time protection..."
try {
    $defenderStatus = Get-MpPreference
    if ($defenderStatus.DisableRealtimeMonitoring) {
        Write-Host "✅ Real-time protection is disabled" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Real-time protection is enabled (may block Electron)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Cannot check Windows Defender status" -ForegroundColor Red
}

# Step 5: 実行ポリシー修正
Write-Host "`n--- Step 5: PowerShell Policy Fix ---" -ForegroundColor Cyan
$currentPolicy = Get-ExecutionPolicy
if ($currentPolicy -eq "Restricted" -or $currentPolicy -eq "AllSigned") {
    Write-Host "⚠️  Restrictive execution policy detected: $currentPolicy" -ForegroundColor Yellow
    Write-Host "Attempting to set RemoteSigned policy..."
    try {
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Write-Host "✅ Execution policy updated" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to update execution policy" -ForegroundColor Red
    }
} else {
    Write-Host "✅ Execution policy is suitable: $currentPolicy" -ForegroundColor Green
}

# Step 6: Electronキャッシュクリア
Write-Host "`n--- Step 6: Electron Cache Clear ---" -ForegroundColor Cyan
Write-Host "Clearing npm cache..."
npm cache clean --force
Write-Host "Reinstalling Electron..."
npm uninstall electron
npm install electron --save-dev

# Step 7: 最終テスト
Write-Host "`n--- Step 7: Final Test ---" -ForegroundColor Cyan
Write-Host "Testing Electron after fixes..."
npx electron --version

Write-Host "`n=== Fix Complete ===" -ForegroundColor Green
Write-Host "If Electron still doesn't work, try:" -ForegroundColor Yellow
Write-Host "1. Restart PowerShell as Administrator" -ForegroundColor White
Write-Host "2. Add Electron to Windows Defender exclusions" -ForegroundColor White
Write-Host "3. Use WSL2 for development instead" -ForegroundColor White
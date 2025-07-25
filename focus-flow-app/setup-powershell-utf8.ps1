# PowerShell UTF-8 設定スクリプト
# 文字化け修正のため、PowerShell起動時に実行してください

Write-Host "FocusFlow: PowerShell UTF-8 setup starting..." -ForegroundColor Green

# 現在の文字エンコーディングを確認
Write-Host "Current Console Encoding: $([Console]::OutputEncoding.EncodingName)" -ForegroundColor Yellow

# UTF-8を設定
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

# Code pageをUTF-8に設定
chcp 65001 > $null

Write-Host "UTF-8 encoding applied successfully!" -ForegroundColor Green
Write-Host "New Console Encoding: $([Console]::OutputEncoding.EncodingName)" -ForegroundColor Green

# PowerShellプロファイルに永続化するか確認
$response = Read-Host "Do you want to make this setting permanent? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    if (!(Test-Path $PROFILE)) {
        New-Item -ItemType File -Path $PROFILE -Force
        Write-Host "PowerShell profile created at: $PROFILE" -ForegroundColor Green
    }
    
    $profileContent = @"
# FocusFlow UTF-8 Settings
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 > `$null
"@
    
    Add-Content $PROFILE $profileContent
    Write-Host "UTF-8 settings added to PowerShell profile!" -ForegroundColor Green
    Write-Host "Settings will be applied automatically in future PowerShell sessions." -ForegroundColor Green
}

Write-Host "`nFocusFlow app can now be started with proper UTF-8 encoding!" -ForegroundColor Cyan
Write-Host "Run: npm start" -ForegroundColor Cyan
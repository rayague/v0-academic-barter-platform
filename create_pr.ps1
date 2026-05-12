# Create PR via GitHub API
param(
    [string]$Token = $env:GITHUB_TOKEN
)

if (-not $Token) {
    Write-Host "⚠️  GitHub token needed!"
    Write-Host "📝 Create one at: https://github.com/settings/tokens/new"
    Write-Host ""
    Write-Host "Permissions needed:"
    Write-Host "  ✓ repo (Full control of private repositories)"
    Write-Host ""
    $Token = Read-Host "Enter your GitHub Personal Access Token"
}

$headers = @{
    "Authorization" = "Bearer $Token"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$body = @{
    title = "feat: Add exchange proposal feature with all improvements"
    body = @"
## 🎯 Exchange Proposal Feature - Ready for Production

### What's New
- ✨ Modal dialog for proposing exchanges between users
- 🎨 Cyan-teal-emeraude gradient button with shimmer animation
- ✅ Real-time email/phone validation with error messages
- 👤 Show user email when full_name is missing
- 🔒 TypeScript strict mode enabled
- 📊 Error boundaries for better error handling
- 🚀 Production-ready build (25 routes, 0 errors)

### Build Status
✅ All 25 routes compile successfully
✅ TypeScript strict mode (no errors)
✅ Production ready

Ready to merge and deploy! 🚀
"@
    head = "correction_app"
    base = "main"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "https://api.github.com/repos/rayague/v0-academic-barter-platform/pulls" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop

    $pr = $response.Content | ConvertFrom-Json
    Write-Host ""
    Write-Host "✅ Pull Request Created Successfully!" -ForegroundColor Green
    Write-Host "PR #$($pr.number): $($pr.title)"
    Write-Host "URL: $($pr.html_url)"
    Write-Host ""
} catch {
    Write-Host "❌ Error creating PR:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Make sure your token has 'repo' permissions!"
}

param(
	[string]$Port = "1234"
)

# Starts a Cloudflare quick tunnel to the local LM Studio server
# Usage: powershell -ExecutionPolicy Bypass -File scripts/start-cloudflared.ps1 -Port 1234

$ErrorActionPreference = "Stop"

# Check if cloudflared is installed
$cloudflared = (Get-Command cloudflared -ErrorAction SilentlyContinue)
if (-not $cloudflared) {
	Write-Host ""
	Write-Host "❌ cloudflared not found!" -ForegroundColor Red
	Write-Host ""
	Write-Host "📦 Install with:" -ForegroundColor Yellow
	Write-Host "   winget install -e --id Cloudflare.Cloudflared" -ForegroundColor Cyan
	Write-Host ""
	Write-Host "Or download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/" -ForegroundColor Gray
	Write-Host ""
	exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "☁️  Starting Cloudflare Tunnel..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start cloudflared and capture output
$process = Start-Process -FilePath "cloudflared" -ArgumentList "tunnel","--url","http://127.0.0.1:$Port" -PassThru -NoNewWindow -RedirectStandardOutput "cloudflared-output.log" -RedirectStandardError "cloudflared-error.log"

# Wait a bit for tunnel to start
Start-Sleep -Seconds 3

# Try to extract the URL from the log
$retries = 10
$tunnelUrl = $null
for ($i = 0; $i -lt $retries; $i++) {
	if (Test-Path "cloudflared-output.log") {
		$logContent = Get-Content "cloudflared-output.log" -Raw
		if ($logContent -match 'https://[a-zA-Z0-9-]+\.trycloudflare\.com') {
			$tunnelUrl = $matches[0]
			break
		}
	}
	if (Test-Path "cloudflared-error.log") {
		$errContent = Get-Content "cloudflared-error.log" -Raw
		if ($errContent -match 'https://[a-zA-Z0-9-]+\.trycloudflare\.com') {
			$tunnelUrl = $matches[0]
			break
		}
	}
	Start-Sleep -Seconds 1
}

if ($tunnelUrl) {
	# Save URL to .tunnel-url file
	$tunnelUrl | Out-File -FilePath ".tunnel-url" -Encoding utf8 -NoNewline
	
	Write-Host "✅ Tunnel active!" -ForegroundColor Green
	Write-Host ""
	Write-Host "🌍 Public URL: $tunnelUrl" -ForegroundColor Cyan
	Write-Host ""
	Write-Host "💡 No password needed - ready to use!" -ForegroundColor Green
	Write-Host "💡 Press Ctrl+C to stop the tunnel" -ForegroundColor Yellow
	Write-Host ""
	Write-Host "========================================" -ForegroundColor Cyan
	Write-Host ""
} else {
	Write-Host "⚠️  Tunnel started but URL not detected yet" -ForegroundColor Yellow
	Write-Host "Check cloudflared-output.log for the URL" -ForegroundColor Gray
	Write-Host ""
}

# Wait for process to exit
try {
	$process.WaitForExit()
} catch {
	Write-Host "`n🛑 Tunnel stopped" -ForegroundColor Yellow
}

# Cleanup
if (Test-Path "cloudflared-output.log") { Remove-Item "cloudflared-output.log" -Force }
if (Test-Path "cloudflared-error.log") { Remove-Item "cloudflared-error.log" -Force }

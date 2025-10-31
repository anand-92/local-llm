param(
	[string]$Port = "1234"
)

# Starts a Cloudflare quick tunnel to the local LM Studio server
# Usage: powershell -ExecutionPolicy Bypass -File scripts/start-cloudflared.ps1 -Port 1234

$cloudflared = (Get-Command cloudflared -ErrorAction SilentlyContinue)
if (-not $cloudflared) {
	Write-Host "cloudflared not found. Please install via: winget install -e --id Cloudflare.Cloudflared" -ForegroundColor Yellow
	exit 1
}

& cloudflared tunnel --url "http://127.0.0.1:$Port"

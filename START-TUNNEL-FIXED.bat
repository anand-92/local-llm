@echo off
echo ========================================
echo Starting Proxy + Tunnel for Netlify
echo ========================================
echo.

echo Checking if LM Studio is running on port 1234...
curl -s http://localhost:1234/v1/models > nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: LM Studio is NOT running on port 1234
    echo Please start LM Studio first!
    pause
    exit /b 1
)
echo [OK] LM Studio is running
echo.

echo Step 1: Starting proxy server on port 3001...
start "Proxy Server (PORT 3001)" cmd /k "npm run proxy"
echo Waiting for proxy to start...
timeout /t 5 /nobreak >nul

echo Checking if proxy started...
curl -s http://localhost:3001/health > nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Proxy might not be ready yet, waiting longer...
    timeout /t 5 /nobreak >nul
)
echo [OK] Proxy should be running
echo.

echo Step 2: Starting localtunnel to expose port 3001...
start "Localtunnel" cmd /k "npm run tunnel:lt"
echo Waiting for tunnel to establish...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo Checking tunnel status...
echo ========================================

if exist .tunnel-url (
    set /p TUNNEL_URL=<.tunnel-url
    echo.
    echo SUCCESS: Tunnel URL is ready!
    echo.
    echo  Tunnel URL: %TUNNEL_URL%
    echo.
    echo ========================================
    echo NEXT STEPS:
    echo ========================================
    echo.
    echo 1. Test the tunnel works by visiting:
    echo    %TUNNEL_URL%/health
    echo.
    echo    You should see: {"status":"ok",...}
    echo.
    echo 2. If you see a localtunnel password page:
    echo    - Check the "Localtunnel" window for the password
    echo    - Enter it once, then the tunnel will work
    echo.
    echo 3. Once tunnel works, update Netlify:
    echo    https://app.netlify.com/sites/boisterous-muffin-b4092e/configuration/env
    echo.
    echo    Set VITE_API_BASE to: %TUNNEL_URL%
    echo.
    echo 4. Redeploy your Netlify site
    echo.
) else (
    echo.
    echo WARNING: Tunnel URL file not found yet
    echo Check the "Localtunnel" window for the URL
    echo.
)

echo ========================================
echo.
echo Keep all windows open while using the tunnel!
echo Press any key to close this window (proxy + tunnel will keep running)
pause >nul

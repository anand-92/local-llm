@echo off
echo ========================================
echo Starting Proxy + Tunnel for Netlify
echo ========================================
echo.

echo Step 1: Starting proxy server (port 3001)...
start "Proxy Server" cmd /k "npm run proxy"
timeout /t 3 /nobreak >nul

echo Step 2: Starting localtunnel...
start "Localtunnel" cmd /k "npm run tunnel:lt"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo IMPORTANT: Check the Localtunnel window
echo ========================================
echo.
echo Look for the tunnel URL (something like https://xxxxx.loca.lt)
echo.
echo Then set it in Netlify:
echo   1. Go to: https://app.netlify.com/sites/boisterous-muffin-b4092e/configuration/env
echo   2. Add environment variable:
echo      Key:   VITE_API_BASE
echo      Value: YOUR_TUNNEL_URL (from the localtunnel window)
echo   3. Click "Save" then trigger a redeploy
echo.
echo ========================================
echo.
pause

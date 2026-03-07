@echo off
echo 🚀 Starting AVAXVERSE Ecosystem...

:: 1. Start Hardhat Node in a new window
echo 💎 Check if Hardhat Node is running...
netstat -ano | findstr :8545 > nul
if %errorlevel% neq 0 (
    echo 🚀 Starting Hardhat Node...
    start "AVAXVERSE-Node" cmd /c "cd packages/contracts && call npx hardhat node"
    echo ⏳ Waiting for node to start...
    timeout /t 10 /nobreak > nul
) else (
    echo 💎 Hardhat Node is already running.
)

:: 2. Choose Deployment Mode
echo.
echo [1] Deploy Fresh Contracts (WIPE ALL LOCAL DATA)
echo [2] Upgrade Contract Logic (KEEP EXISTING DATA)
set /p mode="Choose deployment mode [1 or 2]: "

if "%mode%"=="2" (
    echo 📜 Upgrading Smart Contracts...
    cd packages/contracts && call npx hardhat run scripts/upgrade.ts --network localhost
) else (
    echo 📜 Deploying Fresh Smart Contracts...
    cd packages/contracts && call npx hardhat run scripts/deploy.ts --network localhost
)

if %errorlevel% neq 0 (
    echo ❌ Operation failed!
    pause
    exit /b %errorlevel%
)

:: 4. Sync Environment Variables
echo 🔗 Syncing Addresses to Frontend...
call npx hardhat run scripts/update-env.ts --network localhost
if %errorlevel% neq 0 (
    echo ❌ Sync failed!
    pause
    exit /b %errorlevel%
)

:: 5. Fund Test Account
echo 💰 Funding Test Account...
call npx hardhat run scripts/fund.ts --network localhost
if %errorlevel% neq 0 (
    echo ❌ Funding failed!
    pause
    exit /b %errorlevel%
)

:: 6. Start Frontend in a new window
echo 🌐 Starting Frontend Marketplace...
cd ../../apps/web
start "AVAXVERSE-Web" cmd /c "call npm run dev"

echo ✨ All systems operational!
echo 🔗 Local Node: http://127.0.0.1:8545
echo 🔗 Frontend: http://localhost:3000
pause

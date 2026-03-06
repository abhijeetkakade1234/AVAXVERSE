@echo off
echo 🚀 Starting AVAXVERSE Ecosystem...

:: 1. Start Hardhat Node in a new window
echo 💎 Starting Hardhat Node...
start "AVAXVERSE-Node" cmd /c "cd packages/contracts && call npx hardhat node"

:: 2. Wait for node to initialize
echo ⏳ Waiting for node to start...
timeout /t 10 /nobreak > nul

:: 3. Deploy Contracts
echo 📜 Deploying Smart Contracts...
cd packages/contracts && call npx hardhat run scripts/deploy.ts --network localhost
if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
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

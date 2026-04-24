@echo off
setlocal ENABLEDELAYEDEXPANSION

cd /d "%~dp0"

echo Starting AVAXVERSE Ecosystem...
set "RPC_PAYLOAD={\"jsonrpc\":\"2.0\",\"method\":\"eth_chainId\",\"params\":[],\"id\":1}"

:: 1) Ensure Hardhat RPC is actually healthy (not just port TIME_WAIT)
echo Checking Hardhat RPC health...
call :check_rpc
if %errorlevel% neq 0 (
    echo Hardhat RPC not reachable. Starting Hardhat Node...
    start "AVAXVERSE-Node" cmd /k "cd /d %~dp0packages\contracts && call npx hardhat node"

    echo Waiting for Hardhat RPC to become ready...
    set /a retries=0
    :wait_rpc
    call :check_rpc
    if !errorlevel! equ 0 goto rpc_ready
    set /a retries+=1
    if !retries! geq 30 (
        echo ERROR: Hardhat RPC did not start on http://127.0.0.1:8545
        echo Check the "AVAXVERSE-Node" window for startup errors.
        pause
        exit /b 1
    )
    timeout /t 1 /nobreak > nul
    goto wait_rpc
)

:rpc_ready
echo Hardhat RPC is healthy.

echo.
echo [1] Deploy Fresh Contracts (WIPE ALL LOCAL DATA)
echo [2] Upgrade Contract Logic (KEEP EXISTING DATA)
set /p mode="Choose deployment mode [1 or 2]: "

if "%mode%"=="2" (
    echo Upgrading Smart Contracts...
    cd /d packages\contracts && call npx hardhat run scripts/upgrade.ts --network localhost
) else (
    echo Deploying Fresh Smart Contracts...
    cd /d packages\contracts && call npx hardhat run scripts/deploy.ts --network localhost
)

if %errorlevel% neq 0 (
    echo Operation failed!
    pause
    exit /b %errorlevel%
)

:: 4) Sync env
echo Syncing addresses to frontend...
call npx hardhat run scripts/update-env.ts --network localhost
if %errorlevel% neq 0 (
    echo Sync failed!
    pause
    exit /b %errorlevel%
)

:: 5) Fund test account
echo Funding test account...
call npx hardhat run scripts/fund.ts --network localhost
if %errorlevel% neq 0 (
    echo Funding failed!
    pause
    exit /b %errorlevel%
)

:: 6) Start frontend
echo Starting frontend marketplace...
cd /d ..\..\apps\web
start "AVAXVERSE-Web" cmd /c "call npm run dev"

echo All systems operational.
echo Local Node: http://127.0.0.1:8545
echo Frontend:   http://localhost:3000
pause
exit /b 0

:check_rpc
curl -s --max-time 2 -X POST -H "Content-Type: application/json" --data "%RPC_PAYLOAD%" http://127.0.0.1:8545 >nul 2>&1
exit /b %errorlevel%

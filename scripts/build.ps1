# ═══════════════════════════════════════════════════════════════
# Khazane-DZ — Build de production (sans Electron)
# Compile frontend + backend → dist/
#
# Usage :
#   .\scripts\build.ps1          # Build complet
#   .\scripts\build.ps1 -Clean   # Nettoyage + build
# ═══════════════════════════════════════════════════════════════

param(
    [switch]$Clean
)

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $PSScriptRoot
$BACKEND = Join-Path $ROOT "backend"
$FRONTEND = Join-Path $ROOT "frontend"

$DIST = Join-Path $ROOT "dist"
$DIST_FRONTEND = Join-Path $DIST "frontend"
$DIST_BACKEND = Join-Path $DIST "backend"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Khazane-DZ — Build de production            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ─── Nettoyage si demandé ────────────────────────────────────
if ($Clean -and (Test-Path $DIST)) {
    Write-Host "[0] Nettoyage de dist/..." -ForegroundColor DarkGray
    Remove-Item $DIST -Recurse -Force
}

if (-not (Test-Path $DIST)) { New-Item -ItemType Directory -Path $DIST -Force | Out-Null }

# ─── 1. Build Frontend → dist/frontend/ ─────────────────────
Write-Host "[1/3] Build du frontend React..." -ForegroundColor Yellow
Push-Location $FRONTEND
npm ci --silent 2>$null
npm run build
Pop-Location

if (Test-Path $DIST_FRONTEND) { Remove-Item $DIST_FRONTEND -Recurse -Force }
Copy-Item -Path (Join-Path $FRONTEND "dist") -Destination $DIST_FRONTEND -Recurse
Write-Host "      → dist/frontend/" -ForegroundColor Green

# ─── 2. Build Backend → dist/backend/ ───────────────────────
Write-Host "[2/3] Build du backend NestJS..." -ForegroundColor Yellow
Push-Location $BACKEND
npm ci --silent 2>$null
npx nest build
Pop-Location

if (Test-Path $DIST_BACKEND) { Remove-Item $DIST_BACKEND -Recurse -Force }
New-Item -ItemType Directory -Path $DIST_BACKEND -Force | Out-Null

Copy-Item -Path (Join-Path $BACKEND "dist")         -Destination (Join-Path $DIST_BACKEND "dist")         -Recurse
Copy-Item -Path (Join-Path $BACKEND "prisma")        -Destination (Join-Path $DIST_BACKEND "prisma")        -Recurse
Copy-Item -Path (Join-Path $BACKEND "node_modules")  -Destination (Join-Path $DIST_BACKEND "node_modules")  -Recurse
Copy-Item -Path (Join-Path $BACKEND "package.json")  -Destination (Join-Path $DIST_BACKEND "package.json")

# Embarquer le frontend compilé dans le backend
Copy-Item -Path $DIST_FRONTEND -Destination (Join-Path $DIST_BACKEND "frontend-dist") -Recurse
Write-Host "      → dist/backend/" -ForegroundColor Green

# ─── 3. Générer le lanceur ───────────────────────────────────
Write-Host "[3/3] Génération du lanceur..." -ForegroundColor Yellow

$launcher = @'
@echo off
echo ═══════════════════════════════════════
echo   Khazane-DZ — Serveur de production
echo ═══════════════════════════════════════
echo.
cd /d "%~dp0backend"
set NODE_ENV=production
set SERVE_STATIC=true
set STATIC_PATH=%~dp0backend\frontend-dist
node dist/src/main.js
pause
'@

$launcher | Set-Content -Path (Join-Path $DIST "start-server.bat") -Encoding ASCII
Write-Host "      → dist/start-server.bat" -ForegroundColor Green

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✓ Build terminé !                           ║" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║                                              ║" -ForegroundColor Green
Write-Host "║  dist/                                       ║" -ForegroundColor Green
Write-Host "║  ├── frontend/         Build React (Vite)    ║" -ForegroundColor Green
Write-Host "║  ├── backend/          Build NestJS + API    ║" -ForegroundColor Green
Write-Host "║  └── start-server.bat  Lanceur production    ║" -ForegroundColor Green
Write-Host "║                                              ║" -ForegroundColor Green
Write-Host "║  Pour lancer :                               ║" -ForegroundColor Green
Write-Host "║    dist\start-server.bat                     ║" -ForegroundColor Green
Write-Host "║                                              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

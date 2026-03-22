# ═══════════════════════════════════════════════════════════════
# Khazane-DZ — Script de build de l'application desktop
# Génère un installateur Windows standalone
#
# Structure de sortie :
#   dist/
#   ├── frontend/     ← Build Vite (HTML/CSS/JS)
#   ├── backend/      ← Build NestJS + frontend embarqué + prisma
#   └── desktop/      ← Installateur Electron final (.exe)
# ═══════════════════════════════════════════════════════════════

param(
    [switch]$SkipPgDownload,
    [switch]$DirOnly
)

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $PSScriptRoot
$DESKTOP = Join-Path $ROOT "desktop"
$BACKEND = Join-Path $ROOT "backend"
$FRONTEND = Join-Path $ROOT "frontend"

# ─── Output directories (séparés du code source) ────────────
$DIST = Join-Path $ROOT "dist"
$DIST_FRONTEND = Join-Path $DIST "frontend"
$DIST_BACKEND = Join-Path $DIST "backend"
$DIST_DESKTOP = Join-Path $DIST "desktop"

$PGSQL_DIR = Join-Path $DESKTOP "pgsql"
$PG_VERSION = "16.4-1"
$PG_URL = "https://get.enterprisedb.com/postgresql/postgresql-$PG_VERSION-windows-x64-binaries.zip"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Khazane-DZ — Build Desktop Standalone       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Créer l'arborescence dist/
if (-not (Test-Path $DIST)) { New-Item -ItemType Directory -Path $DIST -Force | Out-Null }

# ─── Étape 1 : Télécharger PostgreSQL portable ──────────────
if (-not $SkipPgDownload) {
    if (-not (Test-Path (Join-Path $PGSQL_DIR "bin\pg_ctl.exe"))) {
        Write-Host "[1/7] Téléchargement de PostgreSQL $PG_VERSION..." -ForegroundColor Yellow
        $zipFile = Join-Path $env:TEMP "pgsql-$PG_VERSION.zip"

        if (-not (Test-Path $zipFile)) {
            Write-Host "      Téléchargement depuis $PG_URL"
            Write-Host "      (environ 200 Mo, patientez...)"
            Invoke-WebRequest -Uri $PG_URL -OutFile $zipFile -UseBasicParsing
        } else {
            Write-Host "      Archive déjà en cache : $zipFile"
        }

        Write-Host "      Extraction..."
        $tempExtract = Join-Path $env:TEMP "pgsql-extract"
        if (Test-Path $tempExtract) { Remove-Item $tempExtract -Recurse -Force }
        Expand-Archive -Path $zipFile -DestinationPath $tempExtract -Force

        if (Test-Path $PGSQL_DIR) { Remove-Item $PGSQL_DIR -Recurse -Force }
        New-Item -ItemType Directory -Path $PGSQL_DIR -Force | Out-Null

        $srcPg = Join-Path $tempExtract "pgsql"
        Copy-Item -Path (Join-Path $srcPg "bin") -Destination (Join-Path $PGSQL_DIR "bin") -Recurse
        Copy-Item -Path (Join-Path $srcPg "lib") -Destination (Join-Path $PGSQL_DIR "lib") -Recurse
        Copy-Item -Path (Join-Path $srcPg "share") -Destination (Join-Path $PGSQL_DIR "share") -Recurse

        Remove-Item $tempExtract -Recurse -Force
        Write-Host "      PostgreSQL extrait dans desktop/pgsql/" -ForegroundColor Green
    } else {
        Write-Host "[1/7] PostgreSQL déjà présent dans desktop/pgsql/" -ForegroundColor Green
    }
} else {
    Write-Host "[1/7] PostgreSQL — téléchargement ignoré (SkipPgDownload)" -ForegroundColor DarkGray
}

# ─── Étape 2 : Build du Frontend → dist/frontend/ ───────────
Write-Host "[2/7] Build du frontend React..." -ForegroundColor Yellow
Push-Location $FRONTEND
npm ci --silent 2>$null
npm run build
Pop-Location

# Copier le build dans dist/frontend/
if (Test-Path $DIST_FRONTEND) { Remove-Item $DIST_FRONTEND -Recurse -Force }
Copy-Item -Path (Join-Path $FRONTEND "dist") -Destination $DIST_FRONTEND -Recurse
Write-Host "      Frontend compilé → dist/frontend/" -ForegroundColor Green

# ─── Étape 3 : Build du Backend → dist/backend/ ─────────────
Write-Host "[3/7] Build du backend NestJS..." -ForegroundColor Yellow
Push-Location $BACKEND
npm ci --silent 2>$null
npx nest build
Pop-Location

# Assembler dist/backend/ (code compilé + frontend embarqué + prisma + node_modules)
if (Test-Path $DIST_BACKEND) { Remove-Item $DIST_BACKEND -Recurse -Force }
New-Item -ItemType Directory -Path $DIST_BACKEND -Force | Out-Null

Copy-Item -Path (Join-Path $BACKEND "dist") -Destination (Join-Path $DIST_BACKEND "dist") -Recurse
Copy-Item -Path (Join-Path $BACKEND "prisma") -Destination (Join-Path $DIST_BACKEND "prisma") -Recurse
Copy-Item -Path (Join-Path $BACKEND "node_modules") -Destination (Join-Path $DIST_BACKEND "node_modules") -Recurse

# Embarquer le frontend dans le backend (pour le mode SERVE_STATIC)
Copy-Item -Path $DIST_FRONTEND -Destination (Join-Path $DIST_BACKEND "frontend-dist") -Recurse

Write-Host "      Backend compilé → dist/backend/" -ForegroundColor Green

# ─── Étape 4 : Copier aussi dans backend/frontend-dist pour le desktop builder ──
# electron-builder lit les chemins relatifs depuis desktop/package.json
$backendFrontendDist = Join-Path $BACKEND "frontend-dist"
if (Test-Path $backendFrontendDist) { Remove-Item $backendFrontendDist -Recurse -Force }
Copy-Item -Path $DIST_FRONTEND -Destination $backendFrontendDist -Recurse
Write-Host "[4/7] Frontend embarqué dans backend/frontend-dist/ (pour electron-builder)" -ForegroundColor Green

# ─── Étape 5 : Compiler le seed script en JS ────────────────
Write-Host "[5/7] Compilation du script de seed..." -ForegroundColor Yellow
Push-Location $BACKEND
if (Test-Path "prisma\seed.ts") {
    npx tsc prisma/seed.ts --outDir prisma --esModuleInterop --resolveJsonModule --skipLibCheck 2>$null
    if (Test-Path "prisma\seed.js") {
        Write-Host "      seed.js généré" -ForegroundColor Green
    } else {
        Write-Host "      seed.ts non compilé (non bloquant)" -ForegroundColor DarkYellow
    }
}
Pop-Location

# ─── Étape 6 : Installer les dépendances Electron ───────────
Write-Host "[6/7] Installation des dépendances Electron..." -ForegroundColor Yellow
Push-Location $DESKTOP
npm ci --silent 2>$null
if ($LASTEXITCODE -ne 0) { npm install --silent 2>$null }
Pop-Location
Write-Host "      Dépendances Electron installées" -ForegroundColor Green

# ─── Étape 7 : Packager avec electron-builder → dist/desktop/ ──
Write-Host "[7/7] Packaging de l'application desktop..." -ForegroundColor Yellow
Push-Location $DESKTOP
if ($DirOnly) {
    npx electron-builder --dir
} else {
    npx electron-builder
}
Pop-Location

# Copier l'installateur final dans dist/desktop/
$ebOutput = Join-Path $ROOT "dist-desktop"
if (Test-Path $ebOutput) {
    if (Test-Path $DIST_DESKTOP) { Remove-Item $DIST_DESKTOP -Recurse -Force }
    Copy-Item -Path $ebOutput -Destination $DIST_DESKTOP -Recurse
    Write-Host "      Installateur copié → dist/desktop/" -ForegroundColor Green
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✓ Build terminé !                           ║" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║                                              ║" -ForegroundColor Green
Write-Host "║  dist/                                       ║" -ForegroundColor Green
Write-Host "║  ├── frontend/    ← Build React (Vite)       ║" -ForegroundColor Green
Write-Host "║  ├── backend/     ← Build NestJS + API       ║" -ForegroundColor Green
Write-Host "║  └── desktop/     ← Installateur Windows     ║" -ForegroundColor Green
Write-Host "║                                              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

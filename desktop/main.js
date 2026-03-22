// Khazane-DZ — Electron Main Process
// Orchestre le démarrage complet : PostgreSQL → Migrations → Backend → Fenêtre

const { app, BrowserWindow, Menu, Tray, dialog } = require('electron');
const path = require('path');
const { fork, execSync, spawn } = require('child_process');
const log = require('electron-log');
const PgManager = require('./pgManager');

// ─── Configuration ──────────────────────────────────────────
const IS_DEV = !app.isPackaged;
const APP_NAME = 'Khazane-DZ';

function resourcePath(...segments) {
  if (IS_DEV) return path.join(__dirname, '..', ...segments);
  return path.join(process.resourcesPath, ...segments);
}

const BACKEND_DIST = resourcePath('backend', 'dist', 'src', 'main.js');
const PRISMA_DIR = resourcePath('backend', 'prisma');
const FRONTEND_DIST = resourcePath('backend', 'frontend-dist');
const PGSQL_DIR = resourcePath('pgsql');
const DATA_DIR = path.join(app.getPath('userData'), 'data');
const PG_DATA = path.join(DATA_DIR, 'pgdata');
const PG_LOG = path.join(DATA_DIR, 'pg.log');

let mainWindow = null;
let splashWindow = null;
let backendProcess = null;
let pgManager = null;
let backendPort = 3002;
let pgPort = 5434;

// ─── Splash Screen ─────────────────────────────────────────
function createSplash() {
  splashWindow = new BrowserWindow({
    width: 420,
    height: 320,
    frame: false,
    center: true,
    resizable: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.on('closed', () => { splashWindow = null; });
}

function setSplashStatus(msg) {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.send('status', msg);
  }
  log.info(`[startup] ${msg}`);
}

// ─── Main Window ────────────────────────────────────────────
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    center: true,
    show: false,
    title: APP_NAME,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(`http://localhost:${backendPort}`);

  mainWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
    mainWindow.show();
    if (IS_DEV) mainWindow.webContents.openDevTools();
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  // Remove default menu in production
  if (!IS_DEV) Menu.setApplicationMenu(null);
}

// ─── Find free port ─────────────────────────────────────────
async function findFreePort(preferred) {
  try {
    const getPort = require('get-port');
    return await getPort({ port: preferred });
  } catch {
    return preferred;
  }
}

// ─── Backend Process ────────────────────────────────────────
function startBackend(dbUrl) {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      PORT: String(backendPort),
      DATABASE_URL: dbUrl,
      JWT_SECRET: 'khazane-standalone-secret-key',
      JWT_EXPIRES_IN: '7d',
      NODE_ENV: 'production',
      SERVE_STATIC: 'true',
      STATIC_PATH: FRONTEND_DIST,
    };

    backendProcess = fork(BACKEND_DIST, [], { env, silent: true });

    backendProcess.stdout.on('data', (d) => log.info(`[backend] ${d}`));
    backendProcess.stderr.on('data', (d) => log.warn(`[backend] ${d}`));

    backendProcess.on('error', (err) => {
      log.error('[backend] Failed to start:', err);
      reject(err);
    });

    backendProcess.on('exit', (code) => {
      log.info(`[backend] Exited with code ${code}`);
      backendProcess = null;
    });

    // Poll until backend is ready
    let attempts = 0;
    const maxAttempts = 60;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const http = require('http');
        const req = http.get(`http://localhost:${backendPort}/api/v1/auth`, (res) => {
          // Any response means the server is up (even 404)
          clearInterval(poll);
          resolve();
        });
        req.on('error', () => {});
        req.setTimeout(1000, () => req.destroy());
      } catch {
        // ignore
      }
      if (attempts >= maxAttempts) {
        clearInterval(poll);
        reject(new Error('Backend did not start in time'));
      }
    }, 500);
  });
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill('SIGTERM');
    backendProcess = null;
  }
}

// ─── Prisma Migrate ─────────────────────────────────────────
function runMigrations(dbUrl) {
  return new Promise((resolve, reject) => {
    setSplashStatus('Migration de la base de données...');

    const prismaClient = IS_DEV
      ? path.join(__dirname, '..', 'backend', 'node_modules', '.bin', 'prisma.cmd')
      : path.join(process.resourcesPath, 'backend', 'node_modules', '.bin', 'prisma.cmd');

    const prismaBin = process.platform === 'win32' ? prismaClient : prismaClient.replace('.cmd', '');

    const env = { ...process.env, DATABASE_URL: dbUrl };

    try {
      execSync(`"${prismaBin}" migrate deploy --schema "${path.join(PRISMA_DIR, 'schema.prisma')}"`, {
        env,
        stdio: 'pipe',
        timeout: 30000,
      });
      log.info('[prisma] Migrations applied successfully');

      // Run seed if first launch
      const seedMarker = path.join(DATA_DIR, '.seeded');
      const fs = require('fs');
      if (!fs.existsSync(seedMarker)) {
        setSplashStatus('Initialisation des données...');
        try {
          const seedScript = IS_DEV
            ? path.join(__dirname, '..', 'backend', 'prisma', 'seed.ts')
            : path.join(process.resourcesPath, 'backend', 'prisma', 'seed.js');

          if (fs.existsSync(seedScript)) {
            execSync(`node "${seedScript}"`, { env, stdio: 'pipe', timeout: 30000 });
            fs.writeFileSync(seedMarker, new Date().toISOString());
            log.info('[prisma] Seed completed');
          }
        } catch (seedErr) {
          log.warn('[prisma] Seed failed (non-critical):', seedErr.message);
        }
      }

      resolve();
    } catch (err) {
      log.error('[prisma] Migration failed:', err.message);
      reject(err);
    }
  });
}

// ─── App Lifecycle ──────────────────────────────────────────
async function startApp() {
  try {
    createSplash();

    // Ensure data directory exists
    const fs = require('fs');
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    // 1. Find free ports
    setSplashStatus('Recherche de ports disponibles...');
    pgPort = await findFreePort(5434);
    backendPort = await findFreePort(3002);

    // 2. Start PostgreSQL
    setSplashStatus('Démarrage de PostgreSQL...');
    pgManager = new PgManager({
      binDir: path.join(PGSQL_DIR, 'bin'),
      dataDir: PG_DATA,
      logFile: PG_LOG,
      port: pgPort,
      user: 'khazane',
      database: 'khazane_db',
    });
    await pgManager.start();

    const dbUrl = `postgresql://khazane@localhost:${pgPort}/khazane_db`;

    // 3. Run migrations
    setSplashStatus('Mise à jour de la base de données...');
    await runMigrations(dbUrl);

    // 4. Start backend
    setSplashStatus('Démarrage du serveur...');
    await startBackend(dbUrl);

    // 5. Open main window
    setSplashStatus('Ouverture de l\'interface...');
    createMainWindow();

  } catch (err) {
    log.error('[startup] Fatal error:', err);
    dialog.showErrorBox(
      'Erreur de démarrage',
      `Khazane-DZ n'a pas pu démarrer.\n\n${err.message}\n\nConsultez les logs : ${log.transports.file.getFile().path}`,
    );
    app.quit();
  }
}

app.whenReady().then(startApp);

app.on('window-all-closed', async () => {
  log.info('[app] All windows closed, shutting down...');
  stopBackend();
  if (pgManager) await pgManager.stop();
  app.quit();
});

app.on('before-quit', async () => {
  stopBackend();
  if (pgManager) await pgManager.stop();
});

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

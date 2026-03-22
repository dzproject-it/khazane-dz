// Khazane-DZ — PostgreSQL Embedded Manager
// Gère le cycle de vie d'une instance PostgreSQL portable (Windows)

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');

class PgManager {
  constructor({ binDir, dataDir, logFile, port, user, database }) {
    this.binDir = binDir;
    this.dataDir = dataDir;
    this.logFile = logFile;
    this.port = port;
    this.user = user;
    this.database = database;
    this.pgProcess = null;
  }

  bin(name) {
    const ext = process.platform === 'win32' ? '.exe' : '';
    return path.join(this.binDir, `${name}${ext}`);
  }

  isInitialized() {
    return fs.existsSync(path.join(this.dataDir, 'PG_VERSION'));
  }

  async start() {
    if (!this.isInitialized()) {
      await this.initDb();
    }
    await this.startServer();
    await this.ensureDatabase();
  }

  async initDb() {
    log.info(`[pg] Initializing database cluster at ${this.dataDir}`);

    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    const initdb = this.bin('initdb');
    if (!fs.existsSync(initdb)) {
      throw new Error(`PostgreSQL binary not found: ${initdb}\nPlease run the build script to download PostgreSQL binaries.`);
    }

    execSync(
      `"${initdb}" -D "${this.dataDir}" -U ${this.user} --encoding=UTF8 --locale=C --auth=trust`,
      { stdio: 'pipe', timeout: 60000 },
    );

    // Configure postgresql.conf for embedded use
    const confPath = path.join(this.dataDir, 'postgresql.conf');
    let conf = fs.readFileSync(confPath, 'utf8');

    const settings = [
      `port = ${this.port}`,
      `listen_addresses = 'localhost'`,
      `max_connections = 20`,
      `shared_buffers = 64MB`,
      `work_mem = 4MB`,
      `logging_collector = off`,
      `log_destination = 'stderr'`,
    ];

    conf += '\n# Khazane-DZ standalone settings\n' + settings.join('\n') + '\n';
    fs.writeFileSync(confPath, conf);

    log.info('[pg] Database cluster initialized');
  }

  startServer() {
    return new Promise((resolve, reject) => {
      log.info(`[pg] Starting PostgreSQL on port ${this.port}`);

      const pgCtl = this.bin('pg_ctl');
      if (!fs.existsSync(pgCtl)) {
        throw new Error(`pg_ctl not found: ${pgCtl}`);
      }

      try {
        execSync(
          `"${pgCtl}" start -D "${this.dataDir}" -l "${this.logFile}" -w -t 30`,
          { stdio: 'pipe', timeout: 60000 },
        );
        log.info('[pg] PostgreSQL started successfully');
        resolve();
      } catch (err) {
        // Check if already running
        try {
          const status = execSync(`"${pgCtl}" status -D "${this.dataDir}"`, { stdio: 'pipe' }).toString();
          if (status.includes('server is running')) {
            log.info('[pg] PostgreSQL was already running');
            resolve();
            return;
          }
        } catch {}
        log.error('[pg] Failed to start PostgreSQL:', err.message);
        reject(new Error(`PostgreSQL failed to start: ${err.message}`));
      }
    });
  }

  async ensureDatabase() {
    const createdb = this.bin('createdb');
    const psql = this.bin('psql');

    // Check if database exists
    try {
      execSync(
        `"${psql}" -p ${this.port} -U ${this.user} -d ${this.database} -c "SELECT 1" -t`,
        { stdio: 'pipe', timeout: 10000 },
      );
      log.info(`[pg] Database '${this.database}' already exists`);
    } catch {
      // Database doesn't exist, create it
      try {
        execSync(
          `"${createdb}" -p ${this.port} -U ${this.user} ${this.database}`,
          { stdio: 'pipe', timeout: 10000 },
        );
        log.info(`[pg] Database '${this.database}' created`);
      } catch (err) {
        log.error(`[pg] Failed to create database:`, err.message);
        throw err;
      }
    }
  }

  async stop() {
    log.info('[pg] Stopping PostgreSQL...');
    const pgCtl = this.bin('pg_ctl');

    try {
      execSync(
        `"${pgCtl}" stop -D "${this.dataDir}" -m fast -t 15`,
        { stdio: 'pipe', timeout: 30000 },
      );
      log.info('[pg] PostgreSQL stopped');
    } catch (err) {
      log.warn('[pg] Error stopping PostgreSQL (may already be stopped):', err.message);
    }
  }
}

module.exports = PgManager;

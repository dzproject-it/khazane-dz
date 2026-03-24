#!/usr/bin/env node
/**
 * Khazane-DZ — Générateur de licence standalone
 *
 * Usage:
 *   node scripts/generate-license.js --plan PRO --licensee "Société ABC"
 *   node scripts/generate-license.js --plan ENTERPRISE --duration 730 --licensee "Grand Corp"
 *   node scripts/generate-license.js --plan TRIAL
 *   node scripts/generate-license.js --help
 *
 * Options:
 *   --plan       TRIAL | PRO | ENTERPRISE (défaut: PRO)
 *   --licensee   Nom du titulaire
 *   --duration   Durée en jours (défaut: selon plan)
 *   --secret     Secret HMAC (défaut: env LICENSE_SECRET ou 'khazane-license-secret-key')
 */

const crypto = require('crypto');

const PLAN_DEFAULTS = {
  TRIAL:      { maxUsers: 2,   maxProducts: 50,    maxSites: 1,  durationDays: 14 },
  PRO:        { maxUsers: 10,  maxProducts: 500,   maxSites: 5,  durationDays: 365 },
  ENTERPRISE: { maxUsers: 100, maxProducts: 10000, maxSites: 50, durationDays: 365 },
};

function parseArgs(args) {
  const result = { plan: 'PRO', licensee: '', duration: null, secret: null };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--plan':
        result.plan = (args[++i] || 'PRO').toUpperCase();
        break;
      case '--licensee':
        result.licensee = args[++i] || '';
        break;
      case '--duration':
        result.duration = parseInt(args[++i], 10);
        break;
      case '--secret':
        result.secret = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
Khazane-DZ — Générateur de licence

Usage:
  node scripts/generate-license.js [options]

Options:
  --plan <TRIAL|PRO|ENTERPRISE>  Plan de licence (défaut: PRO)
  --licensee <nom>               Titulaire de la licence
  --duration <jours>             Durée en jours (défaut: selon plan)
  --secret <secret>              Secret HMAC (défaut: env LICENSE_SECRET)
  --help                         Afficher l'aide

Exemples:
  node scripts/generate-license.js --plan PRO --licensee "Société ABC"
  node scripts/generate-license.js --plan ENTERPRISE --duration 730
  node scripts/generate-license.js --plan TRIAL
`);
        process.exit(0);
    }
  }
  return result;
}

function generateKey(plan, durationDays, secret) {
  const planCode = plan.charAt(0); // T, P, E
  const durationB36 = durationDays.toString(36).toUpperCase().padStart(3, '0');
  const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();

  const payload = `KHZN-${planCode}${durationB36}-${randomPart}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
    .slice(0, 4)
    .toUpperCase();

  return `${payload}-${signature}`;
}

// ─── Main ────────────────────────────────────────

const args = parseArgs(process.argv.slice(2));

const validPlans = ['TRIAL', 'PRO', 'ENTERPRISE'];
if (!validPlans.includes(args.plan)) {
  console.error(`\n  ❌ Plan invalide: "${args.plan}". Valeurs acceptées: ${validPlans.join(', ')}\n`);
  process.exit(1);
}

const secret = args.secret || process.env.LICENSE_SECRET || 'khazane-license-secret-key';
const defaults = PLAN_DEFAULTS[args.plan];
const duration = args.duration || defaults.durationDays;

if (duration < 1 || duration > 3650) {
  console.error('\n  ❌ La durée doit être entre 1 et 3650 jours.\n');
  process.exit(1);
}

const key = generateKey(args.plan, duration, secret);

const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + duration);

console.log('');
console.log('═══════════════════════════════════════════════');
console.log('  Khazane-DZ — Licence générée');
console.log('═══════════════════════════════════════════════');
console.log('');
console.log(`  🔑 Clé:          ${key}`);
console.log('');
console.log(`  📋 Plan:         ${args.plan}`);
console.log(`  👤 Titulaire:    ${args.licensee || '(non spécifié)'}`);
console.log(`  📅 Durée:        ${duration} jours`);
console.log(`  ⏰ Expire le:    ${expiresAt.toISOString().split('T')[0]}`);
console.log('');
console.log('  📊 Limites:');
console.log(`     Utilisateurs: ${defaults.maxUsers}`);
console.log(`     Produits:     ${defaults.maxProducts}`);
console.log(`     Sites:        ${defaults.maxSites}`);
console.log('');
console.log('═══════════════════════════════════════════════');
console.log('');
console.log('  Communiquez cette clé au client pour activer');
console.log('  le produit lors de la première installation.');
console.log('');

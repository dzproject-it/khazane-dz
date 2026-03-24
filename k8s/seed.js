const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@khazane.dz' },
    update: {},
    create: {
      email: 'admin@khazane.dz',
      password: hashedPassword,
      name: 'Administrateur',
      role: 'ADMIN',
    },
  });
  console.log('Admin cree:', admin.email);

  const site = await prisma.site.upsert({
    where: { code: 'MAIN-01' },
    update: {},
    create: {
      code: 'MAIN-01',
      name: 'Entrepot Principal',
      type: 'WAREHOUSE',
      address: 'Alger, Algerie',
    },
  });
  console.log('Site cree:', site.name);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });

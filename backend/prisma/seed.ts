import { PrismaClient, UserRole, SiteType, ZoneType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Créer l'admin par défaut
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@khazane.dz' },
    update: {},
    create: {
      email: 'admin@khazane.dz',
      password: hashedPassword,
      name: 'Administrateur',
      role: UserRole.ADMIN,
    },
  });

  // Créer un site exemple
  const site = await prisma.site.upsert({
    where: { code: 'ENT-01' },
    update: {},
    create: {
      code: 'ENT-01',
      name: 'Entrepôt Principal',
      type: SiteType.WAREHOUSE,
      address: 'Zone industrielle, Alger',
    },
  });

  // Créer une zone
  const zone = await prisma.zone.upsert({
    where: { siteId_code: { siteId: site.id, code: 'A1' } },
    update: {},
    create: {
      siteId: site.id,
      code: 'A1',
      name: 'Allée 1',
      type: ZoneType.AISLE,
    },
  });

  // Créer des emplacements
  for (let i = 1; i <= 5; i++) {
    await prisma.location.upsert({
      where: { zoneId_code: { zoneId: zone.id, code: `A1-${String(i).padStart(2, '0')}` } },
      update: {},
      create: {
        zoneId: zone.id,
        code: `A1-${String(i).padStart(2, '0')}`,
        label: `Étagère ${i}`,
        maxCapacity: 100,
      },
    });
  }

  // Assigner le site à l'admin
  await prisma.userSite.upsert({
    where: { userId_siteId: { userId: admin.id, siteId: site.id } },
    update: {},
    create: { userId: admin.id, siteId: site.id },
  });

  // Catégories exemples
  const catGen = await prisma.category.upsert({
    where: { id: 'cat-general' },
    update: {},
    create: { id: 'cat-general', name: 'Général', depthLevel: 0 },
  });

  console.log('✅ Seed terminé : admin, site, zone, emplacements, catégorie créés.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

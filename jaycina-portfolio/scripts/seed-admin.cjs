const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main() {
  const prisma = new PrismaClient();
  const email = process.env.SEED_ADMIN_EMAIL || 'myronrebello97@gmail.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'password123';
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash },
    });
    console.log('Seeded admin user:', user.email);
  } catch (e) {
    console.error('Seeding admin failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();




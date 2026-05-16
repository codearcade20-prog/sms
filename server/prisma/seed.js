const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create Departments
  const engineering = await prisma.department.upsert({
    where: { name: 'Engineering' },
    update: {},
    create: { name: 'Engineering' },
  });

  const design = await prisma.department.upsert({
    where: { name: 'Design' },
    update: {},
    create: { name: 'Design' },
  });

  // Create MD
  await prisma.user.upsert({
    where: { email: 'md@propulse.com' },
    update: {},
    create: {
      name: 'Managing Director',
      email: 'md@propulse.com',
      password: hashedPassword,
      role: 'MD',
      status: 'APPROVED',
      departmentId: engineering.id,
    },
  });

  // Create an Admin
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'APPROVED',
      departmentId: engineering.id,
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

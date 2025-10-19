const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const authors = await prisma.author.findMany({
    select: { id: true, name: true, youtube: true }
  });

  console.log('Authors and their YouTube URLs:');
  authors.forEach(a => {
    console.log(`${a.name}: ${a.youtube || 'NOT SET'}`);
  });

  await prisma.$disconnect();
}
check();

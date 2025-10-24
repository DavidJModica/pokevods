const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countAuthors() {
  try {
    const totalAuthors = await prisma.author.count();
    console.log(`Total authors in database: ${totalAuthors}`);

    const authorsWithResources = await prisma.author.findMany({
      include: {
        _count: {
          select: { resources: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`\nAuthors returned by API: ${authorsWithResources.length}`);
    console.log(`\nFirst 10 authors:`);
    authorsWithResources.slice(0, 10).forEach((author, i) => {
      console.log(`${i + 1}. ${author.name} (${author._count.resources} resources)`);
    });

    console.log(`\nLast 10 authors:`);
    authorsWithResources.slice(-10).forEach((author, i) => {
      console.log(`${authorsWithResources.length - 9 + i}. ${author.name} (${author._count.resources} resources)`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

countAuthors();

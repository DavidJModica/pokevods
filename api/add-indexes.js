const prisma = require('../lib/prisma');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting index creation...');
    const results = [];

    // Add indexes to Resource table
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Resource_deckId_publicationDate_idx" ON "Resource"("deckId", "publicationDate")`;
      results.push('✅ Created index: Resource_deckId_publicationDate_idx');
    } catch (e) {
      results.push(`⚠️ Resource_deckId_publicationDate_idx: ${e.message}`);
    }

    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Resource_authorId_publicationDate_idx" ON "Resource"("authorId", "publicationDate")`;
      results.push('✅ Created index: Resource_authorId_publicationDate_idx');
    } catch (e) {
      results.push(`⚠️ Resource_authorId_publicationDate_idx: ${e.message}`);
    }

    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Resource_status_idx" ON "Resource"("status")`;
      results.push('✅ Created index: Resource_status_idx');
    } catch (e) {
      results.push(`⚠️ Resource_status_idx: ${e.message}`);
    }

    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Resource_type_idx" ON "Resource"("type")`;
      results.push('✅ Created index: Resource_type_idx');
    } catch (e) {
      results.push(`⚠️ Resource_type_idx: ${e.message}`);
    }

    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Resource_platform_idx" ON "Resource"("platform")`;
      results.push('✅ Created index: Resource_platform_idx');
    } catch (e) {
      results.push(`⚠️ Resource_platform_idx: ${e.message}`);
    }

    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Resource_publicationDate_idx" ON "Resource"("publicationDate")`;
      results.push('✅ Created index: Resource_publicationDate_idx');
    } catch (e) {
      results.push(`⚠️ Resource_publicationDate_idx: ${e.message}`);
    }

    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Resource_url_idx" ON "Resource"("url")`;
      results.push('✅ Created index: Resource_url_idx');
    } catch (e) {
      results.push(`⚠️ Resource_url_idx: ${e.message}`);
    }

    // Add indexes to Chapter table
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Chapter_resourceId_idx" ON "Chapter"("resourceId")`;
      results.push('✅ Created index: Chapter_resourceId_idx');
    } catch (e) {
      results.push(`⚠️ Chapter_resourceId_idx: ${e.message}`);
    }

    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Chapter_opposingDeckId_idx" ON "Chapter"("opposingDeckId")`;
      results.push('✅ Created index: Chapter_opposingDeckId_idx');
    } catch (e) {
      results.push(`⚠️ Chapter_opposingDeckId_idx: ${e.message}`);
    }

    console.log('Index creation complete!');

    return res.status(200).json({
      success: true,
      message: 'Indexes created successfully',
      results
    });

  } catch (error) {
    console.error('Error creating indexes:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
};

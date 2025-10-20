const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
  const { method } = req;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    console.log('🔄 Running database migration...');
    const results = [];

    // Step 1: Add lastScanDate column to Author table
    try {
      await sql`ALTER TABLE "Author" ADD COLUMN IF NOT EXISTS "lastScanDate" TIMESTAMP(3)`;
      results.push('✅ Added lastScanDate column to Author table');
      console.log('✅ Added lastScanDate column');
    } catch (error) {
      results.push(`⚠️ lastScanDate column: ${error.message}`);
      console.error('Error adding lastScanDate:', error.message);
    }

    // Step 2: Add lastVideoDate column to Author table
    try {
      await sql`ALTER TABLE "Author" ADD COLUMN IF NOT EXISTS "lastVideoDate" TIMESTAMP(3)`;
      results.push('✅ Added lastVideoDate column to Author table');
      console.log('✅ Added lastVideoDate column');
    } catch (error) {
      results.push(`⚠️ lastVideoDate column: ${error.message}`);
      console.error('Error adding lastVideoDate:', error.message);
    }

    // Step 3: Create RejectedVideo table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS "RejectedVideo" (
          "id" SERIAL NOT NULL,
          "url" TEXT NOT NULL,
          "title" TEXT,
          "reason" TEXT,
          "rejectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "RejectedVideo_pkey" PRIMARY KEY ("id")
        )
      `;
      results.push('✅ Created RejectedVideo table');
      console.log('✅ Created RejectedVideo table');
    } catch (error) {
      results.push(`⚠️ RejectedVideo table: ${error.message}`);
      console.error('Error creating RejectedVideo table:', error.message);
    }

    // Step 4: Create unique index on url
    try {
      await sql`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE indexname = 'RejectedVideo_url_key'
          ) THEN
            CREATE UNIQUE INDEX "RejectedVideo_url_key" ON "RejectedVideo"("url");
          END IF;
        END
        $$
      `;
      results.push('✅ Created unique index on RejectedVideo.url');
      console.log('✅ Created unique index');
    } catch (error) {
      results.push(`⚠️ Unique index: ${error.message}`);
      console.error('Error creating unique index:', error.message);
    }

    console.log('✅ Migration completed!');

    return res.status(200).json({
      success: true,
      message: 'Migration completed successfully',
      results: results
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Migration failed',
      details: error.message
    });
  }
};

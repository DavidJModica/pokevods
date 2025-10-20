# Database Migration Instructions

## What This Migration Does
- Adds `lastScanDate` and `lastVideoDate` fields to the Author table
- Creates a new `RejectedVideo` table to track rejected videos

## How to Run the Migration

### Option 1: Run SQL Directly in Your Database (Recommended)

1. Go to your PostgreSQL database provider (Neon, Supabase, etc.)
2. Open the SQL editor
3. Copy and paste this SQL:

```sql
-- Add scan tracking fields to Author table
ALTER TABLE "Author" ADD COLUMN IF NOT EXISTS "lastScanDate" TIMESTAMP(3);
ALTER TABLE "Author" ADD COLUMN IF NOT EXISTS "lastVideoDate" TIMESTAMP(3);

-- Create RejectedVideo table (if not exists)
CREATE TABLE IF NOT EXISTS "RejectedVideo" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "reason" TEXT,
    "rejectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RejectedVideo_pkey" PRIMARY KEY ("id")
);

-- Create unique index on url (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'RejectedVideo_url_key'
    ) THEN
        CREATE UNIQUE INDEX "RejectedVideo_url_key" ON "RejectedVideo"("url");
    END IF;
END
$$;
```

4. Run the SQL
5. Done! ✅

### Option 2: Use Vercel CLI with Prisma

If you have the Vercel CLI installed and your database credentials locally:

```bash
# Make sure your .env.local has DATABASE_URL and DIRECT_URL
npx prisma migrate deploy
```

## Verify Migration Success

After running the migration, you can verify it worked by:
1. Running a channel scan - it should now skip rejected videos
2. Checking the Vercel logs for "Updated author scan tracking"
3. Looking in your database to see the new RejectedVideo table

## What Happens After Migration

✅ Scanner will track when each author was last scanned
✅ Scanner will remember the most recent video date per author
✅ Rejected videos won't be re-added in future scans
✅ You can use the new /api/reject-video endpoint

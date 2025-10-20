-- Add scan tracking fields to Author table
ALTER TABLE "Author" ADD COLUMN "lastScanDate" TIMESTAMP(3);
ALTER TABLE "Author" ADD COLUMN "lastVideoDate" TIMESTAMP(3);

-- Create RejectedVideo table
CREATE TABLE "RejectedVideo" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "reason" TEXT,
    "rejectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RejectedVideo_pkey" PRIMARY KEY ("id")
);

-- Create unique index on url
CREATE UNIQUE INDEX "RejectedVideo_url_key" ON "RejectedVideo"("url");

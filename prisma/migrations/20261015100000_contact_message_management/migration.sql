CREATE TABLE IF NOT EXISTS "contact_message" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'new',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "contact_message_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "contact_message"
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "contact_message"
SET "status" = CASE LOWER("status")
  WHEN 'unread' THEN 'new'
  WHEN 'new' THEN 'new'
  WHEN 'read' THEN 'in_progress'
  WHEN 'replied' THEN 'in_progress'
  WHEN 'in_progress' THEN 'in_progress'
  WHEN 'archived' THEN 'resolved'
  WHEN 'resolved' THEN 'resolved'
  ELSE 'new'
END;

ALTER TABLE "contact_message"
  ALTER COLUMN "status" SET DEFAULT 'new';

CREATE INDEX IF NOT EXISTS "contact_message_status_createdAt_idx"
  ON "contact_message"("status", "createdAt");

CREATE TABLE IF NOT EXISTS "contact_rate_limit" (
  "key" TEXT NOT NULL,
  "windowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "requests" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "contact_rate_limit_pkey" PRIMARY KEY ("key")
);

CREATE INDEX IF NOT EXISTS "contact_rate_limit_windowStartedAt_idx"
  ON "contact_rate_limit"("windowStartedAt");

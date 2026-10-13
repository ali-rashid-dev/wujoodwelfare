DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'ProjectStatus'
  ) THEN
    CREATE TYPE "ProjectStatus" AS ENUM ('planned', 'active', 'completed', 'archived');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'project'
      AND column_name = 'published'
  ) THEN
    ALTER TABLE "project"
      ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);

    UPDATE "project"
    SET "published" = true,
        "publishedAt" = "createdAt";
  END IF;
END $$;

ALTER TABLE "project"
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "images" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "published" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "programId" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'project'
      AND column_name = 'imageUrl'
  ) THEN
    UPDATE "project"
    SET "images" = CASE
      WHEN "imageUrl" IS NULL OR "imageUrl" = '' THEN '[]'
      ELSE json_build_array("imageUrl")::TEXT
    END
    WHERE "images" = '';
  END IF;
END $$;

ALTER TABLE "project" ALTER COLUMN "slug" DROP NOT NULL;

WITH duplicate_slugs AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "id") AS row_number
  FROM "project"
  WHERE "slug" IS NOT NULL AND BTRIM("slug") <> ''
)
UPDATE "project" AS project
SET "slug" = NULL
FROM duplicate_slugs
WHERE project."id" = duplicate_slugs."id"
  AND duplicate_slugs.row_number > 1;

DO $$
DECLARE
  project_row RECORD;
  base_slug TEXT;
  candidate_slug TEXT;
  suffix INTEGER;
BEGIN
  FOR project_row IN
    SELECT "id", "title"
    FROM "project"
    WHERE "slug" IS NULL OR BTRIM("slug") = ''
    ORDER BY "id"
  LOOP
    base_slug := TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(COALESCE(project_row."title", '')), '[^a-z0-9]+', '-', 'g'));
    IF base_slug = '' THEN
      base_slug := 'project';
    END IF;

    candidate_slug := base_slug;
    suffix := 1;
    WHILE EXISTS (
      SELECT 1 FROM "project" WHERE "slug" = candidate_slug
    ) LOOP
      suffix := suffix + 1;
      candidate_slug := base_slug || '-' || suffix;
    END LOOP;

    UPDATE "project"
    SET "slug" = candidate_slug
    WHERE "id" = project_row."id";
  END LOOP;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'project'
      AND column_name = 'status'
      AND udt_name <> 'ProjectStatus'
  ) THEN
    UPDATE "project"
    SET "status" = CASE LOWER("status"::TEXT)
      WHEN 'ongoing' THEN 'active'
      WHEN 'upcoming' THEN 'planned'
      WHEN 'completed' THEN 'completed'
      WHEN 'active' THEN 'active'
      WHEN 'planned' THEN 'planned'
      WHEN 'archived' THEN 'archived'
      ELSE 'planned'
    END;

    ALTER TABLE "project" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "project"
      ALTER COLUMN "status" TYPE "ProjectStatus"
      USING ("status"::TEXT::"ProjectStatus");
  END IF;
END $$;

ALTER TABLE "project"
  ALTER COLUMN "slug" SET NOT NULL,
  ALTER COLUMN "status" SET DEFAULT 'planned';

CREATE UNIQUE INDEX IF NOT EXISTS "project_slug_key" ON "project"("slug");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'project_programId_fkey'
      AND conrelid = '"project"'::regclass
  ) THEN
    ALTER TABLE "project"
      ADD CONSTRAINT "project_programId_fkey"
      FOREIGN KEY ("programId") REFERENCES "program"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "project"
  DROP COLUMN IF EXISTS "tag",
  DROP COLUMN IF EXISTS "progress",
  DROP COLUMN IF EXISTS "targetAmount",
  DROP COLUMN IF EXISTS "raisedAmount",
  DROP COLUMN IF EXISTS "imageUrl";

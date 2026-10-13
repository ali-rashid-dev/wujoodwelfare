CREATE TABLE IF NOT EXISTS "gallery_item" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gallery_item_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "gallery_item"
  ADD COLUMN IF NOT EXISTS "published" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "projectId" TEXT;

UPDATE "gallery_item" SET "published" = true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'gallery_item_projectId_fkey'
      AND conrelid = '"gallery_item"'::regclass
  ) THEN
    ALTER TABLE "gallery_item"
      ADD CONSTRAINT "gallery_item_projectId_fkey"
      FOREIGN KEY ("projectId") REFERENCES "project"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "gallery_item_published_createdAt_idx"
  ON "gallery_item"("published", "createdAt");

INSERT INTO "gallery_item" ("id", "title", "category", "imageUrl", "published")
SELECT seed."id", seed."title", seed."category", seed."imageUrl", true
FROM (VALUES
  ('legacy-gallery-food', 'Food support for local families', 'Food Distribution', '/gallery-food.jpg'),
  ('legacy-gallery-medical', 'Community medical camp', 'Medical Camps', '/gallery-medical.jpg'),
  ('legacy-gallery-education', 'Education support for children', 'Education Support', '/gallery-education.jpg'),
  ('legacy-gallery-volunteers', 'Volunteers serving the community', 'Volunteer Activities', '/gallery-volunteers.jpg'),
  ('legacy-gallery-clothes', 'Warm clothes for families', 'Community Events', '/gallery-clothes.jpg'),
  ('legacy-gallery-community', 'Community outreach and awareness', 'Community Events', '/gallery-community.jpg')
) AS seed("id", "title", "category", "imageUrl")
WHERE NOT EXISTS (
  SELECT 1
  FROM "gallery_item" existing
  WHERE existing."imageUrl" = seed."imageUrl"
);

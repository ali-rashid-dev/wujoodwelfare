ALTER TABLE "team_profile"
  ADD COLUMN "isTopLeadership" BOOLEAN NOT NULL DEFAULT true;

UPDATE "team_profile" AS profile
SET "isTopLeadership" = category."section"::text IN (
  'founders',
  'executive_leadership',
  'leadership'
)
FROM "team_category" AS category
WHERE profile."categoryId" = category."id";

ALTER TABLE "team_profile"
  DROP CONSTRAINT "team_profile_categoryId_fkey";

DROP INDEX "team_profile_categoryId_sortOrder_idx";
DROP INDEX "team_profile_published_featured_sortOrder_createdAt_idx";

ALTER TABLE "team_profile"
  DROP COLUMN "categoryId";

DROP TABLE "team_category";
DROP TYPE "TeamSection";

CREATE INDEX "team_profile_published_isTopLeadership_featured_sortOrder_createdAt_idx"
  ON "team_profile"("published", "isTopLeadership", "featured", "sortOrder", "createdAt");

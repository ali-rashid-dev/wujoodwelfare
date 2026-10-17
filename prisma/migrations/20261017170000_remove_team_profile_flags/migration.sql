DROP INDEX "team_profile_published_isTopLeadership_featured_sortOrder_createdAt_idx";

ALTER TABLE "team_profile"
  DROP COLUMN "isTopLeadership",
  DROP COLUMN "featured";

CREATE INDEX "team_profile_published_sortOrder_createdAt_idx"
  ON "team_profile"("published", "sortOrder", "createdAt");

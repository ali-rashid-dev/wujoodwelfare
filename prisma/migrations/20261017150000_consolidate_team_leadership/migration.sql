CREATE TYPE "TeamSection_new" AS ENUM (
  'founders',
  'executive_leadership',
  'leadership',
  'department_leads'
);

DROP INDEX "team_category_section_name_key";

ALTER TABLE "team_category"
  ALTER COLUMN "section" TYPE "TeamSection_new"
  USING (
    CASE
      WHEN "section"::text IN ('coordinators', 'team_members_volunteers') THEN 'leadership'
      ELSE "section"::text
    END
  )::"TeamSection_new";

DROP TYPE "TeamSection";
ALTER TYPE "TeamSection_new" RENAME TO "TeamSection";

UPDATE "team_category"
SET "name" = 'Leadership'
WHERE "section" = 'leadership'
  AND (
    "id" IN ('team-category-coordinators', 'team-category-team-members-volunteers')
    OR "name" IN ('Coordinators', 'Team Members and Volunteers')
  );

INSERT INTO "team_category" ("id", "name", "section", "sortOrder", "updatedAt")
SELECT 'team-category-leadership', 'Leadership', 'leadership', 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1
  FROM "team_category"
  WHERE "section" = 'leadership' AND "name" = 'Leadership'
);

WITH ranked_categories AS (
  SELECT
    "id",
    FIRST_VALUE("id") OVER (
      PARTITION BY "section", "name"
      ORDER BY "sortOrder", "id"
    ) AS "canonicalId"
  FROM "team_category"
),
duplicate_categories AS (
  SELECT "id", "canonicalId"
  FROM ranked_categories
  WHERE "id" <> "canonicalId"
)
UPDATE "team_profile" AS profile
SET "categoryId" = duplicates."canonicalId"
FROM duplicate_categories AS duplicates
WHERE profile."categoryId" = duplicates."id";

WITH ranked_categories AS (
  SELECT
    "id",
    FIRST_VALUE("id") OVER (
      PARTITION BY "section", "name"
      ORDER BY "sortOrder", "id"
    ) AS "canonicalId"
  FROM "team_category"
)
DELETE FROM "team_category" AS category
USING ranked_categories AS duplicates
WHERE category."id" = duplicates."id"
  AND duplicates."id" <> duplicates."canonicalId";

CREATE UNIQUE INDEX "team_category_section_name_key"
  ON "team_category"("section", "name");

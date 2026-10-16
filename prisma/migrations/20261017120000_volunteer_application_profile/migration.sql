UPDATE "volunteer_application" AS application
SET
  "name" = account."name",
  "email" = account."email",
  "phone" = COALESCE(account."phone", application."phone"),
  "city" = COALESCE(account."city", application."city"),
  "skills" = COALESCE(account."skills", application."skills")
FROM "user" AS account
WHERE application."userId" = account."id"
  AND application."status" = 'approved';

UPDATE "volunteer_application" AS application
SET
  "name" = account."name",
  "email" = account."email",
  "phone" = COALESCE(account."phone", application."phone"),
  "city" = COALESCE(account."city", application."city"),
  "skills" = COALESCE(account."skills", application."skills")
FROM "user" AS account
WHERE application."userId" IS NULL
  AND LOWER(application."email") = LOWER(account."email")
  AND application."status" = 'approved';

ALTER TABLE "user"
  DROP COLUMN "phone",
  DROP COLUMN "city",
  DROP COLUMN "skills";

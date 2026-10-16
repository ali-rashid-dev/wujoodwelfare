CREATE TYPE "TeamSection" AS ENUM (
  'founders',
  'executive_leadership',
  'coordinators',
  'department_leads',
  'team_members_volunteers'
);

CREATE TABLE "team_category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "section" "TeamSection" NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "team_category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "team_profile" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "designation" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "biography" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "department" TEXT,
  "linkedinUrl" TEXT,
  "instagramUrl" TEXT,
  "facebookUrl" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "team_profile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "team_category_section_name_key" ON "team_category"("section", "name");
CREATE INDEX "team_category_section_sortOrder_name_idx" ON "team_category"("section", "sortOrder", "name");
CREATE INDEX "team_profile_published_featured_sortOrder_createdAt_idx" ON "team_profile"("published", "featured", "sortOrder", "createdAt");
CREATE INDEX "team_profile_categoryId_sortOrder_idx" ON "team_profile"("categoryId", "sortOrder");
CREATE UNIQUE INDEX "team_profile_userId_key" ON "team_profile"("userId");

ALTER TABLE "team_profile"
  ADD CONSTRAINT "team_profile_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "team_category"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "team_profile"
  ADD CONSTRAINT "team_profile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "team_category" ("id", "name", "section", "sortOrder", "updatedAt") VALUES
  ('team-category-founders', 'Founders', 'founders', 0, CURRENT_TIMESTAMP),
  ('team-category-executive-leadership', 'Executive Leadership', 'executive_leadership', 0, CURRENT_TIMESTAMP),
  ('team-category-coordinators', 'Coordinators', 'coordinators', 0, CURRENT_TIMESTAMP),
  ('team-category-department-leads', 'Department Leads', 'department_leads', 0, CURRENT_TIMESTAMP),
  ('team-category-team-members-volunteers', 'Team Members and Volunteers', 'team_members_volunteers', 0, CURRENT_TIMESTAMP);

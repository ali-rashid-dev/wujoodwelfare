CREATE TABLE "who_we_are" (
  "id" TEXT NOT NULL DEFAULT 'main',
  "heading" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "yearsExperience" INTEGER NOT NULL DEFAULT 5,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "who_we_are_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "who_we_are_value" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "icon" TEXT NOT NULL DEFAULT 'sparkles',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "who_we_are_value_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "who_we_are_value_sortOrder_createdAt_idx"
  ON "who_we_are_value"("sortOrder", "createdAt");

INSERT INTO "who_we_are" ("id", "heading", "description", "imageUrl", "yearsExperience", "updatedAt")
VALUES (
  'main',
  'Restoring dignity, one family at a time.',
  'Founded in Faisalabad, Wujood Welfare exists to support families who are often forgotten. From hot meals during Ramadan to medical camps in underserved neighbourhoods, our work is local, personal, and built on trust earned door-by-door.',
  '/about-story.jpg',
  5,
  CURRENT_TIMESTAMP
);

INSERT INTO "who_we_are_value" ("id", "title", "text", "icon", "sortOrder", "updatedAt")
VALUES
  ('legacy-who-we-are-mission', 'Mission', 'To uplift underserved families with food, healthcare, education and emergency relief — restoring dignity and hope.', 'target', 0, CURRENT_TIMESTAMP),
  ('legacy-who-we-are-vision', 'Vision', 'A Pakistan where no child sleeps hungry, no patient is left untreated, and every family has a path forward.', 'eye', 1, CURRENT_TIMESTAMP),
  ('legacy-who-we-are-values', 'Core Values', 'Transparency, compassion, accountability and long-term community impact in everything we do.', 'sparkles', 2, CURRENT_TIMESTAMP);

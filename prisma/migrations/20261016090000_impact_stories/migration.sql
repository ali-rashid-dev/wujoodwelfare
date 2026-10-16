CREATE TABLE "impact_story" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "impact_story_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "impact_story_published_sortOrder_createdAt_idx"
  ON "impact_story"("published", "sortOrder", "createdAt");

INSERT INTO "impact_story"
  ("id", "name", "role", "text", "imageUrl", "sortOrder", "published", "updatedAt")
VALUES
  ('legacy-impact-story-iqbal', 'Muhammad Iqbal', 'Father of three, Faisalabad',
   'When my workshop closed, Wujood Welfare delivered ration to our door every month. They helped me reopen with a small grant. My family eats with dignity again.',
   '/story-1.jpg', 0, true, CURRENT_TIMESTAMP),
  ('legacy-impact-story-saima', 'Saima Bibi', 'Widow & seamstress',
   'After my husband passed away, I had no income. They paid my children''s school fees and gave me a sewing machine. Today I support my family with my own hands.',
   '/story-2.jpg', 1, true, CURRENT_TIMESTAMP),
  ('legacy-impact-story-hamza', 'Hamza Ali', 'Student, Class 9',
   'I almost dropped out after Class 7. Wujood Welfare paid my fees and gave me books. Now I want to become a doctor and serve my community the same way.',
   '/story-3.jpg', 2, true, CURRENT_TIMESTAMP);

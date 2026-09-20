CREATE TABLE "household_code_sequence" (
  "year" INTEGER NOT NULL,
  "nextValue" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "household_code_sequence_pkey" PRIMARY KEY ("year")
);

INSERT INTO "household_code_sequence" ("year", "nextValue")
SELECT
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  COALESCE(
    MAX(
      NULLIF(
        SUBSTRING("householdCode" FROM '^HH-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-([0-9]+)$'),
        ''
      )::INTEGER
    ),
    0
  )
FROM "household"
WHERE "householdCode" LIKE 'HH-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-%';
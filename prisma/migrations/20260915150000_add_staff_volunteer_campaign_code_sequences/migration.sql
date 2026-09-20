CREATE TABLE "staff_code_sequence" (
  "year" INTEGER NOT NULL,
  "nextValue" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "staff_code_sequence_pkey" PRIMARY KEY ("year")
);

CREATE TABLE "volunteer_code_sequence" (
  "year" INTEGER NOT NULL,
  "nextValue" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "volunteer_code_sequence_pkey" PRIMARY KEY ("year")
);

CREATE TABLE "campaign_code_sequence" (
  "year" INTEGER NOT NULL,
  "nextValue" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "campaign_code_sequence_pkey" PRIMARY KEY ("year")
);

INSERT INTO "staff_code_sequence" ("year", "nextValue")
SELECT
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  COALESCE(MAX(NULLIF(SUBSTRING("employeeId" FROM '^EMP-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-([0-9]+)$'), '')::INTEGER), 0)
FROM "staff"
WHERE "employeeId" LIKE 'EMP-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-%';

INSERT INTO "volunteer_code_sequence" ("year", "nextValue")
SELECT
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  COALESCE(MAX(NULLIF(SUBSTRING("volunteerCode" FROM '^VOL-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-([0-9]+)$'), '')::INTEGER), 0)
FROM "volunteer"
WHERE "volunteerCode" LIKE 'VOL-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-%';

INSERT INTO "campaign_code_sequence" ("year", "nextValue")
SELECT
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  COALESCE(MAX(NULLIF(SUBSTRING("code" FROM '^CMP-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-([0-9]+)$'), '')::INTEGER), 0)
FROM "welfare_campaign"
WHERE "code" LIKE 'CMP-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-%';

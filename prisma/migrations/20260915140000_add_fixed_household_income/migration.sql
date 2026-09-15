ALTER TABLE "household"
ADD COLUMN "fixedMonthlyIncome" DECIMAL(12, 2);

UPDATE "household" AS household
SET "fixedMonthlyIncome" = GREATEST(
  household."monthlyIncome" - COALESCE(member_income."memberIncome", 0),
  0
)
FROM (
  SELECT "householdId", SUM(COALESCE("monthlyIncome", 0)) AS "memberIncome"
  FROM "household_member"
  GROUP BY "householdId"
) AS member_income
WHERE household."id" = member_income."householdId";

UPDATE "household"
SET "fixedMonthlyIncome" = COALESCE("monthlyIncome", 0)
WHERE "fixedMonthlyIncome" IS NULL;
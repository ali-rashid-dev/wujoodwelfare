ALTER TABLE "volunteer_opportunity"
  ADD COLUMN "startTime" VARCHAR(5),
  ADD COLUMN "endTime" VARCHAR(5);

CREATE UNIQUE INDEX "volunteer_assignment_opportunityId_userId_key"
  ON "volunteer_assignment"("opportunityId", "userId");

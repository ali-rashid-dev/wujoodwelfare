-- Create volunteer_opportunity table
CREATE TABLE IF NOT EXISTS "volunteer_opportunity" (
  "id"             TEXT NOT NULL,
  "title"          TEXT NOT NULL,
  "category"       TEXT NOT NULL,
  "description"    TEXT NOT NULL,
  "location"       TEXT NOT NULL,
  "date"           TIMESTAMP(3),
  "timeCommitment" TEXT NOT NULL,
  "spotsNeeded"    INTEGER NOT NULL DEFAULT 5,
  "spotsFilled"    INTEGER NOT NULL DEFAULT 0,
  "status"         TEXT NOT NULL DEFAULT 'open',
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "volunteer_opportunity_pkey" PRIMARY KEY ("id")
);

-- Create volunteer_assignment table
CREATE TABLE IF NOT EXISTS "volunteer_assignment" (
  "id"             TEXT NOT NULL,
  "userId"         TEXT NOT NULL,
  "opportunityId"  TEXT,
  "title"          TEXT NOT NULL,
  "description"    TEXT NOT NULL,
  "location"       TEXT,
  "status"         TEXT NOT NULL DEFAULT 'pending',
  "priority"       TEXT NOT NULL DEFAULT 'medium',
  "deadline"       TIMESTAMP(3),
  "volunteerNotes" TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "volunteer_assignment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "volunteer_assignment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "volunteer_assignment_opportunityId_fkey"
    FOREIGN KEY ("opportunityId") REFERENCES "volunteer_opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create progress_log table
CREATE TABLE IF NOT EXISTS "progress_log" (
  "id"           TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "userId"       TEXT NOT NULL,
  "hoursSpent"   DOUBLE PRECISION NOT NULL DEFAULT 0,
  "notes"        TEXT NOT NULL,
  "statusUpdate" TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "progress_log_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "progress_log_assignmentId_fkey"
    FOREIGN KEY ("assignmentId") REFERENCES "volunteer_assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "progress_log_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

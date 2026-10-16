CREATE TABLE "who_we_are_pending_upload" (
  "fileKey" TEXT NOT NULL,
  "uploadedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "who_we_are_pending_upload_pkey" PRIMARY KEY ("fileKey")
);

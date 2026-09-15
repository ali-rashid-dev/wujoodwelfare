ALTER TABLE "beneficiary"
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "whatsapp" TEXT,
  ADD COLUMN IF NOT EXISTS "email" TEXT;

DO $$
BEGIN
  IF to_regclass('"beneficiary_contact"') IS NOT NULL THEN
    UPDATE "beneficiary" AS beneficiary
    SET
      "phone" = COALESCE(beneficiary."phone", contact."phone"),
      "whatsapp" = COALESCE(beneficiary."whatsapp", contact."whatsapp"),
      "email" = COALESCE(beneficiary."email", contact."email")
    FROM "beneficiary_contact" AS contact
    WHERE contact."beneficiaryId" = beneficiary."id";

    DROP TABLE "beneficiary_contact";
  END IF;
END $$;

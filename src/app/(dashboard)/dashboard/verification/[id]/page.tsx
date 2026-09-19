import React, { ComponentProps } from "react";
import { notFound } from "next/navigation";
import { getVerificationById } from "../verification-actions";
import { VerificationProfile } from "@/components/verification/VerificationProfile";

interface VerificationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VerificationDetailPage({ params }: VerificationDetailPageProps) {
  const { id } = await params;
  const record = await getVerificationById(id);

  if (!record) {
    notFound();
  }

  return <VerificationProfile record={record as ComponentProps<typeof VerificationProfile>["record"]} />;
}


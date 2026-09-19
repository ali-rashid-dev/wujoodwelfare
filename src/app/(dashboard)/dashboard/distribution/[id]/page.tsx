import React, { ComponentProps } from "react";
import { notFound } from "next/navigation";
import { getDistributionById } from "../distribution-actions";
import { DistributionProfile } from "@/components/distribution/DistributionProfile";

interface DistributionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DistributionDetailPage({ params }: DistributionDetailPageProps) {
  const { id } = await params;
  const record = await getDistributionById(id);

  if (!record) {
    notFound();
  }

  return <DistributionProfile record={record as ComponentProps<typeof DistributionProfile>["record"]} />;
}

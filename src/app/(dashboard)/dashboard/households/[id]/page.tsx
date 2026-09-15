import React from "react";
import { notFound } from "next/navigation";
import { requireServerSession } from "@/lib/auth-server";
import { getHouseholdById } from "@/app/(dashboard)/dashboard/households/households";
import { HouseholdProfile } from "@/components/households/HouseholdProfile";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const household = await getHouseholdById(resolvedParams.id);
  if (!household) return { title: "Household Not Found" };

  return {
    title: `${household.name} - Welfare Profile`,
    description: `Family welfare assessment and household details for ${household.householdCode}`,
  };
}

export default async function HouseholdDetailPage({ params }: PageProps) {
  await requireServerSession();
  const resolvedParams = await params;
  const household = await getHouseholdById(resolvedParams.id);

  if (!household) {
    notFound();
  }

  return <HouseholdProfile household={household} />;
}

import React from "react";
import { notFound } from "next/navigation";
import { getVolunteerById, getCampaignsList } from "../volunteer-actions";
import { VolunteerProfile } from "@/components/volunteers/VolunteerProfile";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VolunteerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [volunteer, campaigns] = await Promise.all([
    getVolunteerById(id),
    getCampaignsList(),
  ]);

  if (!volunteer) {
    notFound();
  }

  return <VolunteerProfile volunteer={volunteer} availableCampaigns={campaigns} />;
}

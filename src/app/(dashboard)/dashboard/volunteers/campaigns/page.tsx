import React from "react";
import { getCampaignsList } from "../volunteer-actions";
import { CampaignsManager } from "@/components/volunteers/CampaignsManager";

export default async function CampaignsPage() {
  const campaigns = await getCampaignsList();
  return <CampaignsManager campaigns={campaigns} />;
}

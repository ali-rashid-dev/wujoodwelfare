import React from "react";
import { notFound } from "next/navigation";
import { getStaffById, getAvailableCasesForStaff } from "../staff-actions";
import { StaffProfile } from "@/components/staff/StaffProfile";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StaffDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [staff, availableCases] = await Promise.all([
    getStaffById(id),
    getAvailableCasesForStaff(),
  ]);

  if (!staff) {
    notFound();
  }

  return <StaffProfile staff={staff} availableCases={availableCases.items} availableCasesTotalPages={availableCases.totalPages} />;
}

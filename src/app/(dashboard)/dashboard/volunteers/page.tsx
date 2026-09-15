import React from "react";
import { getVolunteerList, getVolunteerStats } from "./volunteer-actions";
import { VolunteerTable } from "@/components/volunteers/VolunteerTable";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    availability?: string;
    skill?: string;
    city?: string;
    page?: string;
  }>;
}

export default async function VolunteersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const [volunteerData, stats] = await Promise.all([
    getVolunteerList({
      search: params.search,
      status: params.status,
      availability: params.availability,
      skill: params.skill,
      city: params.city,
      page,
      limit: 10,
    }),
    getVolunteerStats(),
  ]);

  return (
    <VolunteerTable
      initialItems={volunteerData.items}
      totalItems={volunteerData.total}
      currentPage={volunteerData.page}
      totalPages={volunteerData.totalPages}
      stats={stats}
    />
  );
}

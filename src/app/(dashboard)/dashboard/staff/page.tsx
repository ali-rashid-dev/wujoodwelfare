import React from "react";
import { getStaffList, getStaffStats } from "./staff-actions";
import { StaffTable } from "@/components/staff/StaffTable";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    department?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function StaffPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const [staffData, stats] = await Promise.all([
    getStaffList({
      search: params.search,
      role: params.role,
      department: params.department,
      status: params.status,
      page,
      limit: 10,
    }),
    getStaffStats(),
  ]);

  return (
    <StaffTable
      initialItems={staffData.items}
      totalItems={staffData.total}
      currentPage={staffData.page}
      totalPages={staffData.totalPages}
      stats={stats}
    />
  );
}

import type { Metadata } from "next";
import { getAdminUserManagement } from "@/actions/user-management";
import { UserManagement } from "@/components/dashboard/UserManagement";

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage Wujood Welfare accounts, roles, and account status.",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string | string[];
    role?: string | string[];
    status?: string | string[];
    page?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const firstValue = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const data = await getAdminUserManagement({
    query: firstValue(params.query) ?? "",
    role: firstValue(params.role) ?? "all",
    status: firstValue(params.status) ?? "all",
    page: firstValue(params.page) ?? "1",
  });

  return <UserManagement data={data} />;
}

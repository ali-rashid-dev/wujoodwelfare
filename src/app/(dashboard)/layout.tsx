import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: {
    template: "%s | Wujood Welfare",
    default: "Dashboard | Wujood Welfare",
  },
  description: "Manage beneficiaries, assistance, and welfare operations.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return <div className="w-full flex-1 flex flex-col">{children}</div>;
}

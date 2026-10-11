import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Wujood Welfare",
    default: "Dashboard | Wujood Welfare",
  },
  description: "Role-based management portal for administrators and volunteers.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

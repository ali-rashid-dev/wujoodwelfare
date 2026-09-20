import type { Metadata } from "next";
import { SiteLayout } from "@/components/site/SiteLayout";

export const metadata: Metadata = {
  title: {
    template: "%s | Wujood Welfare",
    default: "Wujood Welfare",
  },
  description: "Wujood Welfare is a non-profit organization dedicated to providing food, medical aid, and education to underprivileged communities in Pakistan.",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}

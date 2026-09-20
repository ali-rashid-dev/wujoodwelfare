
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Our mission, vision and values. Learn how Wujood Welfare serves Faisalabad's most vulnerable families.",
  openGraph: {
    title: "About Wujood Welfare",
    description: "Restoring dignity, one family at a time.",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function DashbaordPage() {
  return (
    <>
      <p>dashboard</p>
    </>
  );
}

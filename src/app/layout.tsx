import { SiteLayout } from "@/components/site/SiteLayout";
import type { Metadata } from "next";
import { Noto_Nastaliq_Urdu, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const urdu = Noto_Nastaliq_Urdu({
  variable: "--font-noto-nastaliq-urdu",
  subsets: ["arabic"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Wujood Welfare",
  description: "Wujood Welfare is a non-profit organization dedicated to providing food, medical aid, and education to underprivileged communities in Pakistan. Join us in making a difference.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${urdu.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}

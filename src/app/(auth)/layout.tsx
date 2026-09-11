import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Wujood Welfare",
    default: "Account Access | Wujood Welfare",
  },
  description: "Access your account, sign up, or recover your password at Wujood Welfare.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full flex-1 flex flex-col">{children}</div>;
}

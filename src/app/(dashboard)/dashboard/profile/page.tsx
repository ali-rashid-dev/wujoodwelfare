import { Metadata } from "next";
import { requireServerSession } from "@/lib/auth-server";
import { UserProfileView } from "@/components/dashboard/UserProfileView";

export const metadata: Metadata = {
  title: "User Profile - Wujood Welfare",
  description: "View and manage your staff administrator user profile and account security settings.",
};

export default async function UserProfilePage() {
  const session = await requireServerSession();

  return (
    <div className="space-y-6">
      <UserProfileView
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          emailVerified: Boolean(session.user.emailVerified),
          createdAt: session.user.createdAt,
        }}
      />
    </div>
  );
}

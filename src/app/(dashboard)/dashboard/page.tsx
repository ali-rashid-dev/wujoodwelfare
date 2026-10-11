import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";

export default async function DashboardRedirectPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role === "admin") {
    redirect("/admin/dashboard");
  } else {
    redirect("/volunteer/dashboard");
  }
}

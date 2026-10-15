import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export default async function VolunteerApplicationStatusPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role === "admin") redirect("/admin/dashboard");

  const application = await prisma.volunteerApplication.findFirst({
    where: {
      OR: [
        { userId: user.id },
        { email: { equals: user.email, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: { status: true, userId: true },
  });

  let role = user.role;
  if (
    application?.status === "approved" &&
    !user.banned &&
    role !== "volunteer" &&
    (application.userId === user.id || user.emailVerified)
  ) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "volunteer" },
      select: { id: true },
    });
    role = "volunteer";
  }

  if (application?.status === "approved" && role === "volunteer" && !user.banned) {
    redirect("/volunteer/dashboard");
  }

  const title = user.banned
    ? "Volunteer access is unavailable"
    : application?.status === "pending"
      ? "Your application is under review"
      : application?.status === "rejected"
        ? "Your application was not approved"
        : "Apply to become a volunteer";

  const message = user.banned
    ? "Your account is currently inactive. Please contact the Wujood Welfare team for assistance."
    : application?.status === "pending"
      ? "Thank you for applying. An administrator will review your details before volunteer portal access is granted."
      : application?.status === "rejected"
        ? "Your application was not approved. You can submit a new application with updated information."
        : "Volunteer portal access is available only after an administrator approves your application.";

  return (
    <main className="container-x section-y">
      <section className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-blue md:p-10">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          Volunteer application
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
        {!user.banned && application?.status !== "pending" && (
          <Link
            href="/volunteer"
            className="mt-6 inline-flex rounded-full gradient-gold px-6 py-3 text-sm font-semibold text-secondary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
          >
            {application?.status === "rejected" ? "Submit a new application" : "View application"}
          </Link>
        )}
      </section>
    </main>
  );
}

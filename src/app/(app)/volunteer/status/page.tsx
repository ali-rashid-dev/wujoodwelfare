import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { VolunteerApplicationForm } from "@/components/sections/VolunteerApplicationForm";

export default async function VolunteerApplicationStatusPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role === "admin") redirect("/admin/dashboard");

  const application = await prisma.volunteerApplication.findFirst({
    where: {
      OR: [
        { userId: user.id },
        ...(user.emailVerified
          ? [{ userId: null, email: { equals: user.email, mode: "insensitive" as const } }]
          : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      status: true,
      userId: true,
      name: true,
      fatherName: true,
      email: true,
      phone: true,
      city: true,
      qualification: true,
      gender: true,
      skills: true,
      availability: true,
      statementOfPurpose: true,
    },
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
        : "Volunteers";

  const message = user.banned
    ? "Your account is currently inactive. Please contact the Wujood Welfare team for assistance."
    : application?.status === "pending"
      ? "Thank you for applying. An administrator will review your details before volunteer portal access is granted."
      : application?.status === "rejected"
        ? "Your application was not approved. You can submit a new application with updated information."
        : "Volunteer portal access is available only after an administrator approves your application.";

  const canApply =
    !user.banned &&
    application?.status !== "pending" &&
    user.emailVerified;

  return (
    <div className="container-x section-y">
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
      </section>
      {!user.banned &&
        application?.status !== "pending" &&
        (canApply ? (
          <section className="mx-auto mt-8 max-w-3xl">
            <VolunteerApplicationForm
              email={user.email}
              initialValues={
                application
                  ? {
                      name: application.name,
                      father_name: application.fatherName ?? "",
                      phone: application.phone,
                      city: application.city,
                      qualification: application.qualification,
                      gender: application.gender,
                      skills: application.skills,
                      availability: application.availability,
                      statement_of_purpose: application.statementOfPurpose ?? "",
                    }
                  : undefined
              }
            />
          </section>
        ) : (
          <p className="mx-auto mt-6 max-w-2xl text-sm text-destructive">
            Verify your sign-in email before submitting a volunteer application.
          </p>
        ))}
    </div>
  );
}

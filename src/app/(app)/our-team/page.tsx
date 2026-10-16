import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, Star, Users } from "lucide-react";
import { connection } from "next/server";
import { getPublishedTeamProfiles } from "@/actions/team";
import { TEAM_SECTIONS, TEAM_SECTION_LABELS } from "@/lib/team";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the people who contribute to Wujood Welfare.",
  alternates: {
    canonical: "/our-team",
  },
};

export default async function OurTeamPage() {
  await connection();
  const profiles = await getPublishedTeamProfiles();

  return (
    <main>
      <section className="relative overflow-hidden border-b border-primary/10 bg-linear-to-br from-primary/10 via-background to-secondary/10 pt-28 sm:pt-36">
        <div className="container-x mx-auto max-w-7xl pb-14 sm:pb-20">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Wujood Welfare
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Our Team
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            The people working together to support our communities.
          </p>
        </div>
      </section>

      <div className="container-x mx-auto max-w-7xl space-y-14 py-12 sm:space-y-20 sm:py-16">
        {profiles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Team profiles coming soon</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Our team profiles will appear here once they are published.
            </p>
          </div>
        ) : (
          TEAM_SECTIONS.map((section) => {
            const sectionProfiles = profiles.filter(
              (profile) => profile.category.section === section,
            );
            if (sectionProfiles.length === 0) return null;

            return (
              <section
                key={section}
                aria-labelledby={`team-section-${section}`}
                className="scroll-mt-24"
              >
                <div className="mb-7 flex items-end justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Wujood Welfare
                    </p>
                    <h2
                      id={`team-section-${section}`}
                      className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl"
                    >
                      {TEAM_SECTION_LABELS[section]}
                    </h2>
                  </div>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {sectionProfiles.length} {sectionProfiles.length === 1 ? "profile" : "profiles"}
                  </span>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {sectionProfiles.map((profile) => (
                    <article
                      key={profile.id}
                      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <Image
                          src={profile.imageUrl}
                          alt={profile.name}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        {profile.featured && (
                          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="space-y-3 p-5">
                        <div>
                          <h3 className="text-lg font-semibold">{profile.name}</h3>
                          <p className="mt-0.5 text-sm font-medium text-primary">
                            {profile.designation}
                          </p>
                          {profile.department && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {profile.department}
                            </p>
                          )}
                        </div>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                          {profile.biography}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3">
                          {[
                            ["LinkedIn", profile.linkedinUrl],
                            ["Instagram", profile.instagramUrl],
                            ["Facebook", profile.facebookUrl],
                          ].map(([label, url]) =>
                            url ? (
                              <a
                                key={label}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${profile.name} on ${label}`}
                                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                              >
                                {label}
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            ) : null,
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}

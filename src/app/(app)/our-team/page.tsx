import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, Star, Users } from "lucide-react";
import { connection } from "next/server";
import { getPublishedTeamProfiles } from "@/actions/team";

export const metadata: Metadata = {
  title: "Our Leadership",
  description: "Meet the top leadership team at Wujood Welfare.",
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
            Top Leadership
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Meet the leaders guiding Wujood Welfare and supporting our communities.
          </p>
        </div>
      </section>

      <div className="container-x mx-auto max-w-7xl space-y-14 py-12 sm:space-y-20 sm:py-16">
        {profiles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Leadership profiles coming soon</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Our team profiles will appear here once they are published.
            </p>
          </div>
        ) : (
          <section aria-labelledby="top-leadership-heading" className="scroll-mt-24">
            <div className="mb-7 flex items-end justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Wujood Welfare
                </p>
                <h2
                  id="top-leadership-heading"
                  className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl"
                >
                  Top Leadership
                </h2>
              </div>
              <span className="shrink-0 text-sm text-muted-foreground">
                {profiles.length} {profiles.length === 1 ? "profile" : "profiles"}
              </span>
            </div>
            <div className="space-y-6 sm:space-y-8">
              {profiles.map((profile, index) => {
                const imageOnRight = index % 2 === 0;
                return (
                  <article
                    key={profile.id}
                    className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg lg:grid-cols-2"
                  >
                    <div
                      className={`relative order-1 min-h-64 overflow-hidden bg-muted sm:min-h-80 lg:min-h-[28rem] ${
                        imageOnRight ? "lg:order-2" : "lg:order-1"
                      }`}
                    >
                      <Image
                        src={profile.imageUrl}
                        alt={profile.name}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                      />
                      {profile.featured && (
                        <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          Featured
                        </span>
                      )}
                    </div>
                    <div
                      className={`order-2 flex flex-col justify-center space-y-5 p-6 sm:p-8 lg:p-10 ${
                        imageOnRight ? "lg:order-1" : "lg:order-2"
                      }`}
                    >
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                          {profile.name}
                        </h3>
                        <p className="mt-2 text-base font-semibold text-primary">
                          {profile.designation}
                        </p>
                        {profile.department && (
                          <p className="mt-1 text-sm font-medium text-muted-foreground">
                            {profile.department}
                          </p>
                        )}
                      </div>
                      <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
                        {profile.biography}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4">
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
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type TeamPreviewProfile = {
  id: string;
  name: string;
  designation: string;
  imageUrl: string;
};

export function TeamPreview({ profiles }: { profiles: TeamPreviewProfile[] }) {
  if (profiles.length === 0) return null;

  return (
    <section aria-labelledby="team-preview-heading" className="section-y">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-5 border-b border-border pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Wujood Welfare</p>
            <h2
              id="team-preview-heading"
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Meet our team
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              The people working together to support our communities.
            </p>
          </div>
          <Link
            href="/our-team"
            className="inline-flex min-h-10 items-center gap-2 self-start rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-auto"
          >
            Meet the team <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {profiles.slice(0, 4).map((profile) => (
            <article
              key={profile.id}
              className="overflow-hidden rounded-lg border border-border bg-card transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={profile.imageUrl}
                  alt={profile.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{profile.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{profile.designation}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

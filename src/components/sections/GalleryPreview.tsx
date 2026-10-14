import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { GalleryItemRecord } from "@/actions/gallery";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";

type GalleryPreviewItem = Pick<
  GalleryItemRecord,
  "id" | "title" | "category" | "imageUrl"
>;

export function GalleryPreview({ items }: { items: GalleryPreviewItem[] }) {
  const previewItems = items.slice(0, 6);

  return (
    <section className="section-y container-x">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Gallery</span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
          Moments from the field
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          A glimpse of the people and communities behind our work.
        </p>
      </Reveal>

      {previewItems.length > 0 ? (
        <Stagger className="mt-10 grid auto-rows-[180px] grid-cols-2 gap-4 md:auto-rows-[220px] md:grid-cols-3">
          {previewItems.map((item, index) => (
            <StaggerItem
              key={item.id}
              className={index % 3 === 0 ? "row-span-2" : ""}
            >
              <article className="group relative h-full overflow-hidden rounded-2xl border border-border">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-primary-dark/85 via-primary-dark/10 to-transparent" />
                <div className="absolute inset-x-3 bottom-3">
                  <span className="inline-flex rounded-full bg-secondary/95 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary-foreground">
                    {item.category}
                  </span>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold text-white">
                    {item.title}
                  </p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Photos from our welfare activities will appear here soon.
        </p>
      )}

      <Reveal className="mt-8 text-center">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:border-primary/50 hover:bg-muted/50"
        >
          Explore all photos <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Reveal>
    </section>
  );
}

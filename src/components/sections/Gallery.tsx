"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import type { GalleryItemRecord } from "@/actions/gallery";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GalleryItem = Pick<
  GalleryItemRecord,
  "id" | "title" | "category" | "imageUrl" | "description"
>;

export function Gallery({ items }: { items: GalleryItem[] }) {
  const [category, setCategory] = useState("All");
  const [openItem, setOpenItem] = useState<GalleryItem | null>(null);
  const categories = useMemo(
    () => ["All", ...new Set(items.map((item) => item.category))],
    [items],
  );
  const filtered = items.filter(
    (item) => category === "All" || item.category === category,
  );

  return (
    <section id="gallery" className="section-y container-x">
      <Reveal className="text-center max-w-2xl mx-auto">
        <span className="eyebrow">Gallery</span>
        <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">
          Moments from the field
        </h2>
      </Reveal>

      {categories.length > 1 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((itemCategory) => (
            <button
              key={itemCategory}
              onClick={() => setCategory(itemCategory)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                category === itemCategory
                  ? "gradient-blue text-primary-foreground shadow-blue"
                  : "border border-border bg-card hover:border-secondary"
              }`}
            >
              {itemCategory}
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 auto-rows-[180px] md:auto-rows-[220px] gap-4">
          {filtered.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setOpenItem(item)}
              className={`group relative overflow-hidden rounded-2xl border border-border ${
                index % 3 === 0 ? "row-span-2" : ""
              }`}
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="image-hover-zoom object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-primary-dark/85 via-primary-dark/10 to-transparent" />
              <div className="absolute inset-x-3 bottom-3 text-left">
                <span className="inline-flex rounded-full bg-secondary/95 text-secondary-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  {item.category}
                </span>
                <span className="mt-2 block line-clamp-2 text-sm font-semibold text-white">
                  {item.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          {items.length
            ? "There are no photos in this category yet."
            : "Photos from our welfare activities will appear here soon."}
        </p>
      )}

      <Dialog
        open={Boolean(openItem)}
        onOpenChange={(open) => {
          if (!open) setOpenItem(null);
        }}
      >
        <DialogContent
          overlayClassName="bg-primary-dark/95 supports-backdrop-filter:backdrop-blur-sm"
          className="w-[min(90vw,1100px)] max-w-[95vw] border-none bg-primary-dark p-5 text-primary-foreground ring-0 sm:max-w-[min(90vw,1100px)]"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{openItem?.title ?? "Gallery image"}</DialogTitle>
            <DialogDescription>{openItem?.category ?? "Gallery image"}</DialogDescription>
          </DialogHeader>
          {openItem && (
            <>
              <div className="relative h-[65vh] max-h-[700px] min-h-48 w-full">
                <Image
                  src={openItem.imageUrl}
                  alt={openItem.title}
                  fill
                  sizes="90vw"
                  className="rounded-lg object-contain"
                />
              </div>
              <div className="text-center">
                <p className="font-semibold">{openItem.title}</p>
                <p className="mt-1 text-sm text-primary-foreground/70">
                  {openItem.category}
                </p>
                {openItem.description && (
                  <p className="mt-2 text-sm text-primary-foreground/80">
                    {openItem.description}
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import type { GalleryItemRecord } from "@/actions/gallery";

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
            <motion.button
              key={item.id}
              layout
              onClick={() => setOpenItem(item)}
              className={`group relative overflow-hidden rounded-2xl border border-border ${
                index % 3 === 0 ? "row-span-2" : ""
              }`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                unoptimized
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
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
            </motion.button>
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          {items.length
            ? "There are no photos in this category yet."
            : "Photos from our welfare activities will appear here soon."}
        </p>
      )}

      <AnimatePresence>
        {openItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenItem(null)}
            className="fixed inset-0 z-100 grid place-items-center bg-primary-dark/95 backdrop-blur p-6"
          >
            <button
              aria-label="Close image"
              onClick={() => setOpenItem(null)}
              className="absolute top-5 right-5 grid h-10 w-10 place-items-center rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-secondary hover:text-secondary-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <div
              className="max-w-[95vw] space-y-3"
              onClick={(event) => event.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="relative h-[65vh] w-[min(90vw,1100px)]"
              >
                <Image
                  src={openItem.imageUrl}
                  alt={openItem.title}
                  fill
                  unoptimized
                  sizes="90vw"
                  className="rounded-2xl object-contain shadow-2xl"
                />
              </motion.div>
              <div className="text-center text-primary-foreground">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

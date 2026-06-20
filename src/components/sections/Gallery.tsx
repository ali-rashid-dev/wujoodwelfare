"use client";
import { Reveal } from "@/components/site/Reveal";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const items = [
  { src: "/gallery-food.jpg", cat: "Food Distribution", h: "row-span-2" },
  { src: "/gallery-medical.jpg", cat: "Medical Camps", h: "row-span-2" },
  { src: "/gallery-education.jpg", cat: "Education Support", h: "" },
  { src: "/gallery-volunteers.jpg", cat: "Volunteer Activities", h: "row-span-2" },
  { src: "/gallery-clothes.jpg", cat: "Community Events", h: "" },
  { src: "/gallery-community.jpg", cat: "Community Events", h: "" },
];

const categories = ["All", "Food Distribution", "Medical Camps", "Education Support", "Volunteer Activities", "Community Events"];

export function Gallery() {
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<string | null>(null);
  const filtered = items.filter((i) => cat === "All" || i.cat === cat);

  return (
    <section id="gallery" className="section-y container-x">
      <Reveal className="text-center max-w-2xl mx-auto">
        <span className="eyebrow">Gallery</span>
        <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">Moments from the field</h2>
      </Reveal>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${cat === c
              ? "gradient-blue text-primary-foreground shadow-blue"
              : "border border-border bg-card hover:border-secondary"
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 auto-rows-[180px] md:auto-rows-[220px] gap-4">
        {filtered.map((it, i) => (
          <motion.button
            key={it.src + i}
            layout
            onClick={() => setOpen(it.src)}
            className={`group relative overflow-hidden rounded-2xl border border-border ${it.h}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <Image
              src={it.src}
              alt={it.cat}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-primary-dark/85 via-primary-dark/10 to-transparent" />
            <span className="absolute bottom-3 left-3 rounded-full bg-secondary/95 text-secondary-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              {it.cat}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-100 grid place-items-center bg-primary-dark/95 backdrop-blur p-6"
          >
            <button aria-label="Close" className="absolute top-5 right-5 grid h-10 w-10 place-items-center rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-secondary hover:text-secondary-foreground">
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={open}
              alt=""
              className="max-h-[90vh] max-w-[95vw] rounded-2xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

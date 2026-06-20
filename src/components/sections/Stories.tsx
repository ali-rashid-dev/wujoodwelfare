"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/site/Reveal";

const stories = [
  { img: "/story-1.jpg", name: "Muhammad Iqbal", role: "Father of three, Faisalabad", text: "When my workshop closed, Wujood Welfare delivered ration to our door every month. They helped me reopen with a small grant. My family eats with dignity again." },
  { img: "/story-2.jpg", name: "Saima Bibi", role: "Widow & seamstress", text: "After my husband passed away, I had no income. They paid my children's school fees and gave me a sewing machine. Today I support my family with my own hands." },
  { img: "/story-3.jpg", name: "Hamza Ali", role: "Student, Class 9", text: "I almost dropped out after Class 7. Wujood Welfare paid my fees and gave me books. Now I want to become a doctor and serve my community the same way." },
];

export function Stories() {
  const [i, setI] = useState(0);
  const s = stories[i];

  return (
    <section className="section-y container-x">
      <Reveal className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <span className="eyebrow">Stories of impact</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">Real lives, real change.</h2>
        </div>
        <div className="flex gap-2">
          <button aria-label="Previous" onClick={() => setI((p) => (p - 1 + stories.length) % stories.length)} className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button aria-label="Next" onClick={() => setI((p) => (p + 1) % stories.length)} className="grid h-11 w-11 place-items-center rounded-full gradient-gold text-secondary-foreground shadow-gold">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </Reveal>

      <div className="mt-10 grid lg:grid-cols-5 gap-8 items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 relative"
          >
            <div className="rounded-3xl overflow-hidden border border-border shadow-blue">
              <Image src={s.img} alt={s.name} width={512} height={512} loading="lazy" className="w-full aspect-square object-cover" />
            </div>
            <div className="absolute -top-4 -left-4 grid h-14 w-14 place-items-center rounded-full gradient-gold shadow-gold text-secondary-foreground">
              <Quote className="h-6 w-6" />
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={s.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-3 rounded-3xl border border-border bg-card p-8 md:p-10"
          >
            <p className="text-xl md:text-2xl leading-relaxed text-foreground/90">"{s.text}"</p>
            <div className="mt-6">
              <p className="font-semibold text-primary">{s.name}</p>
              <p className="text-sm text-muted-foreground">{s.role}</p>
            </div>
            <div className="mt-6 flex gap-1.5">
              {stories.map((_, idx) => (
                <button key={idx} aria-label={`Story ${idx + 1}`} onClick={() => setI(idx)} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-10 bg-secondary" : "w-4 bg-border"}`} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

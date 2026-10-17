"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/site/Reveal";

type ImpactStory = {
  id: string;
  name: string;
  role: string;
  text: string;
  imageUrl: string;
};

export function Stories({ stories }: { stories: ImpactStory[] }) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  if (stories.length === 0) return null;

  const activeIndex = Math.min(index, stories.length - 1);
  const story = stories[activeIndex];
  const multipleStories = stories.length > 1;

  return (
    <section className="section-y container-x">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="eyebrow">Stories of impact</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
            Real lives, real change.
          </h2>
        </div>
        {multipleStories && (
          <div className="flex gap-2">
            <button
              aria-label="Previous story"
              onClick={() =>
                setIndex((current) => (Math.min(current, stories.length - 1) - 1 + stories.length) % stories.length)
              }
              className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card hover:bg-muted"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next story"
              onClick={() =>
                setIndex((current) => (Math.min(current, stories.length - 1) + 1) % stories.length)
              }
              className="grid h-11 w-11 place-items-center rounded-full gradient-gold text-secondary-foreground shadow-gold"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </Reveal>

      <div className="mt-10 grid items-center gap-8 lg:grid-cols-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={story.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="relative lg:col-span-2"
          >
            <div className="overflow-hidden rounded-3xl border border-border shadow-blue">
              <Image
                src={story.imageUrl}
                alt={story.name}
                width={512}
                height={512}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="absolute -left-4 -top-4 grid h-14 w-14 place-items-center rounded-full gradient-gold text-secondary-foreground shadow-gold">
              <Quote className="h-6 w-6" />
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${story.id}-quote`}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl border border-border bg-card p-8 md:p-10 lg:col-span-3"
          >
            <p className="text-xl leading-relaxed text-foreground/90 md:text-2xl">
              &ldquo;{story.text}&rdquo;
            </p>
            <div className="mt-6">
              <p className="font-semibold text-primary">{story.name}</p>
              <p className="text-sm text-muted-foreground">{story.role}</p>
            </div>
            {multipleStories && (
              <div className="mt-6 flex gap-1.5">
                {stories.map((item, itemIndex) => (
                  <button
                    key={item.id}
                    aria-label={`Show story ${itemIndex + 1}`}
                    aria-current={itemIndex === activeIndex}
                    onClick={() => setIndex(itemIndex)}
                    className={`h-1.5 rounded-full transition-all ${
                      itemIndex === activeIndex ? "w-10 bg-secondary" : "w-4 bg-border"
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

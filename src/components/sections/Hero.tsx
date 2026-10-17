"use client";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, HandHeart, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  MOTION_DURATION_ENTER,
  MOTION_EASE,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/lib/motion";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative isolate min-h-[82vh] flex items-end overflow-hidden">
      <Image
        src="/hero-humanitarian.jpg"
        alt="Volunteers distributing food to families in Pakistan"
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-[#123a68]/90 via-[#123a68]/45 to-[#123a68]/10"
      />

      <div className="container-x relative pb-12 md:pb-20 pt-32 text-primary-foreground">
        <motion.div
          className="motion-entrance max-w-3xl"
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
          variants={staggerContainerVariants}
        >
          <motion.span
            variants={staggerItemVariants}
            transition={{ duration: MOTION_DURATION_ENTER, ease: MOTION_EASE }}
            className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Wujood Welfare · Faisalabad
          </motion.span>

          <motion.h1
            variants={staggerItemVariants}
            transition={{ duration: MOTION_DURATION_ENTER, ease: MOTION_EASE }}
            className="mt-5 text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
          >
            Giving Hope. <br />
            Creating Impact. <br />
            <span className="text-secondary">Building Futures.</span>
          </motion.h1>

          <motion.p
            variants={staggerItemVariants}
            transition={{ duration: MOTION_DURATION_ENTER, ease: MOTION_EASE }}
            className="font-urdu mt-5 text-2xl md:text-3xl text-secondary"
            dir="rtl"
          >
            زندگی کو وجو د دو
          </motion.p>

          <motion.p
            variants={staggerItemVariants}
            transition={{ duration: MOTION_DURATION_ENTER, ease: MOTION_EASE }}
            className="mt-5 max-w-xl text-base md:text-lg text-primary-foreground/85 leading-relaxed"
          >
            Wujood Welfare is dedicated to supporting vulnerable communities through
            food, healthcare, education, clothing, and emergency relief.
          </motion.p>

          <motion.div
            variants={staggerItemVariants}
            transition={{ duration: MOTION_DURATION_ENTER, ease: MOTION_EASE }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/donate"
              className="group inline-flex min-h-11 items-center gap-2 rounded-lg bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-primary-dark"
            >
              <Heart className="h-4 w-4" /> Donate Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/volunteer"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary-foreground/50 bg-primary-foreground/10 px-5 py-3 text-sm font-semibold transition-colors hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary-dark"
            >
              <HandHeart className="h-4 w-4" /> Become Volunteer
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

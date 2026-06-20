import { Counter } from "@/components/site/Counter";
import { motion } from "framer-motion";
import { ArrowRight, HandHeart, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const stats = [
  { label: "Meals Distributed", value: 5000, suffix: "+" },
  { label: "Families Supported", value: 500, suffix: "+" },
  { label: "Volunteers", value: 100, suffix: "+" },
  { label: "Welfare Campaigns", value: 20, suffix: "+" },
];

export function Hero() {
  return (
    <section className="relative isolate min-h-[92vh] flex items-end overflow-hidden">
      <Image
        src="/hero-humanitarian.jpg"
        alt="Volunteers distributing food to families in Pakistan"
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-primary-dark/95 via-primary-dark/40 to-transparent" />

      <div className="container-x relative pb-12 md:pb-20 pt-32 text-primary-foreground">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
            Wujood Welfare · Faisalabad
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-5 text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
          >
            Giving Hope. <br />
            Creating Impact. <br />
            <span className="text-secondary">Building Futures.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-urdu mt-5 text-2xl md:text-3xl text-secondary"
            dir="rtl"
          >
            زندگی کو وجو د دو
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-5 max-w-xl text-base md:text-lg text-primary-foreground/85 leading-relaxed"
          >
            Wujood Welfare is dedicated to supporting vulnerable communities through
            food, healthcare, education, clothing, and emergency relief.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/donate"
              className="group inline-flex items-center gap-2 rounded-full gradient-gold px-6 py-3.5 text-sm font-semibold text-secondary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
            >
              <Heart className="h-4 w-4" /> Donate Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/volunteer"
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/5 px-6 py-3.5 text-sm font-semibold backdrop-blur hover:bg-primary-foreground/10"
            >
              <HandHeart className="h-4 w-4" /> Become Volunteer
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 backdrop-blur overflow-hidden"
        >
          {stats.map((s) => (
            <div key={s.label} className="p-5 md:p-6 bg-primary-dark/40">
              <p className="text-3xl md:text-4xl font-bold text-secondary">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-xs md:text-sm text-primary-foreground/75">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import {
  staggerContainerVariants,
  staggerItemVariants,
  revealVariants,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "h1" | "h2" | "p";
}) {
  const reduceMotion = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={cn("motion-entrance", className)}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.2 }}
      custom={delay}
      variants={revealVariants}
    >
      {children}
    </Comp>
  );
}

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("motion-entrance", className)}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainerVariants}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn("motion-entrance", className)}
      variants={staggerItemVariants}
    >
      {children}
    </motion.div>
  );
}

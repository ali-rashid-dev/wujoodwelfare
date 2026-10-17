"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  MOTION_DURATION_INTERACTION,
  staggerItemVariants,
} from "@/lib/motion";

export function DashboardCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={staggerItemVariants}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      transition={{ duration: MOTION_DURATION_INTERACTION }}
      className={cn("motion-entrance h-full", className)}
    >
      {children}
    </motion.div>
  );
}

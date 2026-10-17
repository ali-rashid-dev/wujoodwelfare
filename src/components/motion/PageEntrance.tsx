"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { pageEntranceVariants } from "@/lib/motion";

export function PageEntrance({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      className="motion-entrance"
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      variants={pageEntranceVariants}
    >
      {children}
    </motion.div>
  );
}

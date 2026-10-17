import type { Variants } from "motion/react";

export const MOTION_DURATION_ENTER = 0.25;
export const MOTION_DURATION_INTERACTION = 0.18;
export const MOTION_STAGGER_DELAY = 0.05;
export const MOTION_EASE = "easeOut" as const;

export const pageEntranceVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATION_ENTER, ease: MOTION_EASE },
  },
};

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATION_ENTER,
      ease: MOTION_EASE,
      delay,
    },
  }),
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: MOTION_STAGGER_DELAY },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATION_ENTER, ease: MOTION_EASE },
  },
};

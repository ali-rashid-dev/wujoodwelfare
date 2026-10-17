"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, animate, useReducedMotion } from "motion/react";

export function Counter({
  to,
  prefix = "",
  suffix = "",
  duration = 2,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setN(v),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduceMotion]);

  return (
    <span ref={ref}>
      {prefix}
      {Math.round(reduceMotion ? to : n).toLocaleString()}
      {suffix}
    </span>
  );
}

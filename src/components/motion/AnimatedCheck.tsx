"use client";

import { motion } from "motion/react";

export function AnimatedCheck({ size = 72 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      initial="hidden"
      animate="show"
    >
      <motion.circle
        cx="36"
        cy="36"
        r="33"
        stroke="currentColor"
        strokeWidth="3"
        className="text-brand-500"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          show: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] },
          },
        }}
      />
      <motion.path
        d="M22 37.5L31.5 47L50 26"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-brand-600"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          show: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.5, delay: 0.55, ease: [0.21, 0.47, 0.32, 0.98] },
          },
        }}
      />
    </motion.svg>
  );
}

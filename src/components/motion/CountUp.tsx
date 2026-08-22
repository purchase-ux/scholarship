"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useMotionValue, useMotionValueEvent } from "motion/react";

export function CountUp({
  to,
  duration = 1.4,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  // Drive a plain React state update on each tick instead of rendering the
  // MotionValue directly as JSX children — that pattern relies on Framer
  // Motion patching the DOM node outside React's render cycle, which didn't
  // reliably apply the initial value in this app's SSR/hydration setup and
  // left the counter stuck at 0.
  useMotionValueEvent(count, "change", (latest) => setDisplay(Math.round(latest)));

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, to, {
      duration,
      ease: [0.21, 0.47, 0.32, 0.98],
    });
    return () => controls.stop();
  }, [isInView, to, duration, count]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

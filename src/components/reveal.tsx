"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { ditherIn, prepareDitherIn } from "~/lib/dither-in";
import { onPageReady } from "~/lib/page-ready";
import { cn } from "~/lib/util";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const items = gsap.utils.toArray<HTMLElement>(".reveal-item", el);
      if (items.length === 0) return;

      prepareDitherIn(items);

      return onPageReady(() => {
        for (const [i, item] of items.entries()) {
          ditherIn(item, {
            delay: delay + i * 0.06,
            scrollTrigger: { trigger: item, start: "top 92%", once: true },
          });
        }
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}

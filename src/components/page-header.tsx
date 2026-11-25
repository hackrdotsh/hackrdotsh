"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { ScrambleText } from "~/components/scramble-text";
import { ditherIn, prepareDitherIn } from "~/lib/dither-in";
import { onPageReady } from "~/lib/page-ready";

gsap.registerPlugin(useGSAP);

export const PageHeader = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const line = container.querySelector(".reveal-line > span");
      const meta = gsap.utils.toArray<HTMLElement>(".header-meta", container);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        if (line) gsap.set(line, { y: 0 });
        return;
      }

      prepareDitherIn(meta);

      const cleanup = onPageReady(() => {
        const tl = gsap.timeline({ delay: 0.15 });
        if (line) {
          tl.to(line, {
            y: 0,
            duration: 0.9,
            ease: "power4.out",
          });
        }
        tl.add(() => {
          for (const [i, el] of meta.entries()) {
            ditherIn(el, { delay: i * 0.08 });
          }
        }, "-=0.5");
      });
      return cleanup;
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef}>
      <p className="header-meta label">
        <span className="label-index">{"// "}</span>
        <ScrambleText text={eyebrow} trigger="ready" delay={0.5} />
      </p>
      <h1 className="reveal-line mt-4 font-sans text-5xl font-semibold tracking-[-0.03em] text-foreground sm:text-6xl">
        <span>{title}</span>
      </h1>
      {description && (
        <p className="header-meta mt-5 max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};

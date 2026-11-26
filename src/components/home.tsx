"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CommitGraph } from "~/components/commit-graph";
import { DitherHover } from "~/components/dither-hover";
import { ScrambleText } from "~/components/scramble-text";
import { onPageReady } from "~/lib/page-ready";
import { contactLinks, projects } from "~/lib/site-data";
import { cn } from "~/lib/util";

const aboutParagraphs = [
  "I also dabble in a lot of homelabbing projects — currently self-hosting dokploy, pyrodactyl, and home assistant.",
  "I love and use NixOS and Nix on a daily basis. Reproducible builds, declarative config, pinned versioning for projects — it really is one of the best things I've ever integrated into my workflow.",
  "Most of my time goes into building web apps, wrangling servers, and convincing everyone that Linux is better than Windows.",
];

function SectionHeading({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="font-mono text-xs text-accent">{index}</span>
      <h2 className="font-sans text-xl font-semibold tracking-tight text-foreground">
        <ScrambleText text={title} trigger="view" />
      </h2>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
    </div>
  );
}

const NoscriptContent = () => (
  <noscript>
    <article className="mx-auto max-w-2xl px-4 py-16 text-sm leading-relaxed text-gray-300 sm:px-8 sm:text-base">
      <h1>Hey, I'm hackr.</h1>
      <p>
        also known as Mohammad Al-Ahdal. I build most things with TypeScript,
        React, and Tailwind. Currently on my journey to learn Rust.
      </p>
      {aboutParagraphs.map((p) => (
        <p key={p.slice(0, 24)}>{p}</p>
      ))}
      <h2>What I'm working on.</h2>
      {projects.map((p) => (
        <p key={p.title}>
          <a
            href={p.href}
            target={p.href ? "_blank" : undefined}
            rel={p.href ? "noopener noreferrer" : undefined}
          >
            {p.title}
          </a>{" "}
          — {p.description}
        </p>
      ))}
      <h2>Get in touch.</h2>
      {contactLinks.map((l) => (
        <p key={l.label}>
          <a href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label}
          </a>
        </p>
      ))}
    </article>
  </noscript>
);

export function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setHasScrolled(true);
    window.addEventListener("scroll", onScroll, { once: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The name flickers once after the heading has dithered in.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    const cancelReady = onPageReady(() => {
      timer = window.setTimeout(() => {
        const name = containerRef.current?.querySelector(".hero-name");
        if (!name) return;
        name.classList.add("glitching");
        name.addEventListener(
          "animationend",
          () => name.classList.remove("glitching"),
          { once: true },
        );
      }, 900);
    });

    return () => {
      cancelReady();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={containerRef}>
      <NoscriptContent />
      <main id="main-content" tabIndex={-1}>
        {/* hero */}
        <section className="relative flex min-h-svh flex-col justify-center px-5 sm:px-8">
          <div aria-hidden="true" className="absolute inset-0 opacity-70">
            <CommitGraph />
          </div>
          {/* The text sits over the graph without taking the pointer, so the
              squares around it stay hoverable. */}
          <div className="pointer-events-none relative z-10 mx-auto w-full max-w-5xl">
            <p className="label">
              <span className="label-index">{"// "}</span>
              <ScrambleText
                text="mohammad al-ahdal"
                trigger="ready"
                delay={1}
              />
            </p>
            <h1 className="mt-6 font-sans text-[clamp(3rem,10vw,7.5rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
              <span className="block">Hey, I'm</span>
              <span className="block">
                <span className="hero-name inline-block">
                  hackr<span className="text-accent">.</span>
                </span>
              </span>
            </h1>
            <p className="mt-10 max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground sm:mt-14 sm:text-base">
              I'm a software developer building most things with TypeScript,
              React, and Tailwind. Currently on my journey to learn Rust.
            </p>
          </div>

          <div
            data-dither-in
            // The strip spans the full width over the commit graph, so it
            // must not take the pointer from it.
            className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center"
          >
            <span
              className={cn(
                "font-mono text-[0.625rem] tracking-[0.2em] text-muted-foreground uppercase select-none transition-opacity duration-500",
                hasScrolled && "pointer-events-none opacity-0",
              )}
            >
              psst! there's more stuff below
            </span>
          </div>
        </section>

        {/* about */}
        <section className="px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <SectionHeading index="01" title="about" />
            <div className="mt-10 grid gap-8 sm:mt-14 sm:grid-cols-3 sm:gap-10">
              {aboutParagraphs.map((p) => (
                <p
                  key={p.slice(0, 24)}
                  className="text-[0.9375rem] leading-relaxed text-muted-foreground"
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* work */}
        <section className="px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <SectionHeading index="02" title="what i'm working on" />
            <div className="mt-10 sm:mt-14">
              {projects.map((p, i) => (
                <a
                  key={p.title}
                  href={p.href}
                  target={p.href ? "_blank" : undefined}
                  rel={p.href ? "noopener noreferrer" : undefined}
                  className="row-hover group relative block border-t hairline py-8 sm:py-10"
                >
                  <DitherHover />
                  <div className="relative flex items-baseline gap-5 sm:gap-8">
                    <span className="font-mono text-xs text-muted-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="glitch-hover font-sans text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-4xl">
                        {p.title}
                        <ArrowUpRight className="mb-0.5 ml-2.5 inline-block size-5 text-muted-foreground/50 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent sm:ml-3.5 sm:size-7" />
                      </h3>
                      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                        {p.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
              <div className="border-t hairline" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

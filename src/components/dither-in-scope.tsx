"use client";

import { useEffect, useRef } from "react";
import { ditherIn, isDitheringIn, prepareDitherIn } from "~/lib/dither-in";
import { onPageReady } from "~/lib/page-ready";

/**
 * What dithers in. The outermost match wins: a panel or a row comes in as one
 * piece, and the headings and paragraphs inside it do not animate again. Add
 * `data-dither-in` to opt an element in, or `data-dither-skip` to leave an
 * element and everything inside it alone.
 */
const TARGETS = [
  "[data-dither-in]",
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  "li",
  "pre",
  "blockquote",
  "table",
  "figure",
  "label",
  ".panel",
  ".row",
  ".row-hover",
  ".btn",
  ".tag",
  ".field",
  ".select-trigger",
  ".rule",
  "[data-slot='input-control']",
  "[data-slot='textarea-control']",
  "[data-slot='switch']",
].join(", ");

/** Delay between items that come into view together. */
const STAGGER = 0.04;
const MAX_STAGGER = 0.5;

function isOutermostTarget(element: Element, root: Element) {
  const ancestor = element.parentElement?.closest(TARGETS);
  return !ancestor || !root.contains(ancestor);
}

/** Targets in a subtree that are rendered, not skipped and not nested. */
function findTargets(node: Element, root: Element) {
  const candidates = node.matches(TARGETS) ? [node] : [];
  candidates.push(...node.querySelectorAll(TARGETS));

  return candidates.filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement &&
      !element.closest("[data-dither-skip]") &&
      !isDitheringIn(element) &&
      isOutermostTarget(element, root) &&
      // Hidden elements never scroll into view, so they would stay masked.
      element.offsetHeight > 0,
  );
}

/** Everything inside dithers in: on load, as it scrolls into view, and when
    content is added later, such as a list that finishes loading. */
export function DitherInScope({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ready = false;
    const waiting = new Set<HTMLElement>();

    const inView = new IntersectionObserver(
      (entries) => {
        const arriving = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement);
        arriving.forEach((element, index) => {
          inView.unobserve(element);
          ditherIn(element, Math.min(index * STAGGER, MAX_STAGGER));
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    const watch = (element: HTMLElement) => {
      prepareDitherIn(element);
      if (ready) inView.observe(element);
      else waiting.add(element);
    };

    const added = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          // Content added inside something already animating comes with it.
          if (node.parentElement?.closest("[data-dithering]")) continue;
          for (const element of findTargets(node, root)) watch(element);
        }
      }
    });

    for (const element of findTargets(root, root)) watch(element);
    added.observe(root, { childList: true, subtree: true });

    // Nothing starts until the loading overlay has lifted.
    const cancelReady = onPageReady(() => {
      ready = true;
      for (const element of waiting) inView.observe(element);
      waiting.clear();
    });

    return () => {
      cancelReady();
      added.disconnect();
      inView.disconnect();
    };
  }, []);

  return <div ref={rootRef}>{children}</div>;
}

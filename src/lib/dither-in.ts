import gsap from "gsap";

/** The edge tile in design-system.css is 4 cells wide and 24 cells tall. */
const EDGE_ROWS = 24;
/** The front advances one tile width at a time, so pixels never slide. */
const STEP_ROWS = 4;
const PIXELS_PER_SECOND = 900;

/** Size of one dither pixel, from --dither-in-cell. */
function cellSize(element: HTMLElement) {
  const value = getComputedStyle(element).getPropertyValue("--dither-in-cell");
  return Number.parseFloat(value) || 6;
}

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Hides elements that are about to dither in. */
export function prepareDitherIn(elements: HTMLElement[]) {
  if (reducedMotion()) return;
  for (const element of elements) {
    element.classList.add("dither-in");
  }
}

/**
 * Reveals an element from top to bottom through a dithered edge. Call
 * `prepareDitherIn` first so it starts hidden. The mask is removed when the
 * animation lands, so it never clips what hangs outside the element.
 */
export function ditherIn(
  element: HTMLElement,
  options: { delay?: number; scrollTrigger?: ScrollTrigger.Vars } = {},
) {
  if (reducedMotion()) return;

  const cell = cellSize(element);
  const edgeHeight = EDGE_ROWS * cell;
  const step = STEP_ROWS * cell;
  const front = { y: -edgeHeight };
  const land = () => {
    element.classList.remove("dither-in");
    element.style.removeProperty("--dither-front");
  };

  return gsap.to(front, {
    // Measured when the tween starts, after layout has settled.
    y: () => element.offsetHeight,
    duration: () =>
      gsap.utils.clamp(
        0.3,
        0.9,
        (element.offsetHeight + edgeHeight) / PIXELS_PER_SECOND,
      ),
    ease: "none",
    delay: options.delay,
    scrollTrigger: options.scrollTrigger,
    onUpdate: () => {
      const snapped = Math.round(front.y / step) * step;
      element.style.setProperty("--dither-front", `${snapped}px`);
    },
    onComplete: land,
    onInterrupt: land,
  });
}

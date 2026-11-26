import gsap from "gsap";

/** The edge tile in design-system.css is 4 cells wide and 24 cells tall. */
const EDGE_ROWS = 24;
/** The front advances one tile width at a time, so pixels never slide. */
const STEP_ROWS = 4;
const PIXELS_PER_SECOND = 900;

/** Marks an element as masked by the dither-in rules in design-system.css. */
const STATE_ATTRIBUTE = "data-dithering";

/** Size of one dither pixel, from --dither-in-cell. */
function cellSize(element: HTMLElement) {
  const value = getComputedStyle(element).getPropertyValue("--dither-in-cell");
  return Number.parseFloat(value) || 6;
}

/** Hides an element that is about to dither in. */
export function prepareDitherIn(element: HTMLElement) {
  element.setAttribute(STATE_ATTRIBUTE, "");
}

export function isDitheringIn(element: Element) {
  return element.hasAttribute(STATE_ATTRIBUTE);
}

/**
 * Reveals a prepared element from top to bottom through a dithered edge. The
 * mask is removed when the animation lands, so it never clips what hangs
 * outside the element.
 */
export function ditherIn(element: HTMLElement, delay = 0) {
  const cell = cellSize(element);
  const edgeHeight = EDGE_ROWS * cell;
  const step = STEP_ROWS * cell;
  const height = element.offsetHeight;
  const front = { y: -edgeHeight };

  const land = () => {
    element.removeAttribute(STATE_ATTRIBUTE);
    element.style.removeProperty("--dither-front");
  };

  return gsap.to(front, {
    y: height,
    duration: gsap.utils.clamp(
      0.3,
      0.9,
      (height + edgeHeight) / PIXELS_PER_SECOND,
    ),
    ease: "none",
    delay,
    onUpdate: () => {
      const snapped = Math.round(front.y / step) * step;
      element.style.setProperty("--dither-front", `${snapped}px`);
    },
    onComplete: land,
    onInterrupt: land,
  });
}

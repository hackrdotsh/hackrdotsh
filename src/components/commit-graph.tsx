"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface Cell {
  day: ContributionDay | null;
  x: number;
  y: number;
}

interface Revealed {
  day: ContributionDay;
  x: number;
  y: number;
  cx: number;
  cy: number;
  /** 1 beneath the pointer, falling to 0 at the edge of the radius. */
  strength: number;
}

interface Point {
  x: number;
  y: number;
}

const GAP = 8;
const LEVEL_OPACITY = [0.06, 0.25, 0.45, 0.7, 1];

/** Outer radius, in cells: with a mouse, squares are hidden beyond it and
    fade into their resting look inside it. */
const SHOW_RADIUS_CELLS = 26;
/** Inner radius, in cells: squares sharpen, brighten and show their counts. */
const REVEAL_RADIUS_CELLS = 6;
/** The radius is split into this many rings, each a step more blurred. */
const BLUR_BANDS = 5;

/** Blur for a ring: none at the centre, MAX_BLUR at the outermost ring. */
function bandBlur(index: number) {
  const blur = (index / (BLUR_BANDS - 1)) * MAX_BLUR;
  return blur === 0 ? "none" : `blur(${blur}px)`;
}

/** The cross-fade between the resting graph and the hovered one. */
const FADE_CLASS = "transition-opacity duration-500";

/** Devices with a mouse or trackpad, as opposed to touch only. */
const MOUSE_QUERY = "(hover: hover) and (pointer: fine)";
/** The strongest blur, in pixels: on the resting squares, and on squares at
    the edge of the pointer's radius. */
const MAX_BLUR = 4;
/** How strongly the squares show at rest on devices without a mouse. */
const RESTING_OPACITY = 0.35;

/** The smallest a square may get, in pixels. */
const MIN_CELL = 4;

/**
 * Fills the whole area with one grid of days in date order, ending with the
 * latest day in the bottom-right square. The grid is at least as large as the
 * area; the few squares to spare sit before the first day, at the top left.
 */
function layOut(days: ContributionDay[], size: { w: number; h: number }) {
  const count = Math.max(1, days.length);
  const gridFor = (pitch: number) => {
    const cols = Math.max(1, Math.ceil((size.w + GAP) / pitch));
    return { cols, rows: Math.ceil(count / cols) };
  };

  // The largest squares whose rows still reach the bottom of the area.
  let pitch = Math.floor(Math.sqrt((size.w * size.h) / count)) + 2;
  let { cols, rows } = gridFor(pitch);
  while (rows * pitch - GAP < size.h && pitch > MIN_CELL + GAP) {
    pitch -= 1;
    ({ cols, rows } = gridFor(pitch));
  }

  const spare = cols * rows - days.length;
  const cells: Cell[] = Array.from({ length: cols * rows }, (_, i) => ({
    day: days[i - spare] ?? null,
    x: (i % cols) * pitch,
    y: Math.floor(i / cols) * pitch,
  }));

  return {
    cells,
    cell: pitch - GAP,
    pitch,
    gridW: cols * pitch - GAP,
    gridH: rows * pitch - GAP,
  };
}

/** Glitches come at random intervals between these, in milliseconds. */
const GLITCH_MIN_WAIT = 50;
const GLITCH_MAX_WAIT = 320;
/** One burst, as how long the square stays hidden, shown, hidden again. */
const GLITCH_BLINKS = [90, 60, 120];

/** The squares themselves. They never change while the pointer moves, so
    they are kept out of those re-renders. */
const Squares = memo(function Squares({
  cells,
  cell,
}: {
  cells: Cell[];
  cell: number;
}) {
  return cells.map((c) => {
    const active = c.day !== null && c.day.level > 0;
    return (
      <rect
        key={c.day ? c.day.date : `pad-${c.x}-${c.y}`}
        x={c.x}
        y={c.y}
        width={cell}
        height={cell}
        fill="currentColor"
        opacity={LEVEL_OPACITY[c.day?.level ?? 0]}
        className={active ? "text-accent" : "text-foreground"}
      />
    );
  });
});

export function CommitGraph() {
  const ref = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState<ContributionDay[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  // The last pointer position stays after the pointer leaves, so what it
  // lit can fade out in place while `hovering` drives the cross-fade.
  const [pointer, setPointer] = useState<Point | null>(null);
  const [hovering, setHovering] = useState(false);

  // Starts false so the first render matches a touch device, which is also
  // what shows before the page knows better.
  const [hasMouse, setHasMouse] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(MOUSE_QUERY);
    const update = () => setHasMouse(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/contributions")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        if (!cancelled) setDays(d.days ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => layOut(days, size), [days, size]);
  const { cells, cell, pitch, gridW, gridH } = layout;

  // Every so often one square glitches: it blinks out and back a couple of
  // times, keeping its resting opacity and blur. The square is toggled
  // directly so a blink never re-renders the graph.
  const squaresRef = useRef<SVGGElement>(null);
  useEffect(() => {
    if (cells.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timers = new Set<number>();
    const later = (run: () => void, wait: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        run();
      }, wait);
      timers.add(timer);
    };

    let blinking: SVGElement | null = null;
    const show = (visible: boolean) => {
      if (blinking) blinking.style.visibility = visible ? "" : "hidden";
    };

    const schedule = () => {
      const wait =
        GLITCH_MIN_WAIT + Math.random() * (GLITCH_MAX_WAIT - GLITCH_MIN_WAIT);
      later(() => {
        const squares = squaresRef.current?.children;
        if (!squares) return schedule();

        const index = Math.floor(Math.random() * squares.length);
        blinking = squares[index] as SVGElement;

        // Out, back, out again, then back for good.
        let elapsed = 0;
        GLITCH_BLINKS.forEach((duration, index) => {
          const visible = index % 2 === 1;
          later(() => show(visible), elapsed);
          elapsed += duration;
        });
        later(() => {
          show(true);
          schedule();
        }, elapsed);
      }, wait);
    };
    schedule();

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
      show(true);
    };
  }, [cells]);

  // The grid is pinned to the bottom-right corner so the latest day is fully
  // in view; any overflow is cut off at the top and left.
  const offsetX = size.w - gridW;
  const offsetY = size.h - gridH;

  // Squares near the pointer show with their counts: clear beneath it,
  // fainter and more blurred the further away.
  const radius = REVEAL_RADIUS_CELLS * pitch;
  // Blurring every square separately is slow, so squares are grouped into
  // a few rings by distance and each ring is blurred once.
  const bands: Revealed[][] = Array.from({ length: BLUR_BANDS }, () => []);
  // With a mouse, the resting squares only exist inside the outer radius,
  // fading out towards its edge.
  const showRadius = SHOW_RADIUS_CELLS * pitch;
  const shown: { cell: Cell; opacity: number }[] = [];
  if (pointer) {
    for (const c of cells) {
      const cx = c.x + cell / 2;
      const cy = c.y + cell / 2;
      const distance = Math.hypot(cx - pointer.x, cy - pointer.y);
      if (hasMouse && distance < showRadius) {
        shown.push({
          cell: c,
          opacity:
            LEVEL_OPACITY[c.day?.level ?? 0] * (1 - distance / showRadius),
        });
      }
      if (!c.day) continue;
      if (distance >= radius) continue;
      const falloff = distance / radius;
      bands[Math.floor(falloff * BLUR_BANDS)].push({
        day: c.day,
        x: c.x,
        y: c.y,
        cx,
        cy,
        strength: (1 - falloff) ** 1.5,
      });
    }
  }

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {cells.length > 0 && size.w > 0 && size.h > 0 && (
        // The graph arrives after its data loads, so it dithers in like the
        // rest of the page. The wrapper is the element that gets masked.
        <div data-dither-in className="absolute inset-0">
          <svg
            width={gridW}
            height={gridH}
            viewBox={`0 0 ${gridW} ${gridH}`}
            aria-hidden="true"
            className="block text-accent"
            style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
            onMouseMove={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              setPointer({
                x: event.clientX - bounds.left,
                y: event.clientY - bounds.top,
              });
              setHovering(true);
            }}
            onMouseLeave={() => setHovering(false)}
          >
            {/* Every square, resting dimmed and blurred. With a mouse over
                the graph these fade out and only the squares near the
                pointer are drawn, below. */}
            <g
              ref={squaresRef}
              shapeRendering="crispEdges"
              className={FADE_CLASS}
              style={{
                opacity: hasMouse && hovering ? 0 : RESTING_OPACITY,
                filter: `blur(${MAX_BLUR}px)`,
              }}
            >
              <Squares cells={cells} cell={cell} />
            </g>
            {/* Always present, so the first hover fades in like the rest. */}
            <g
              shapeRendering="crispEdges"
              className={`pointer-events-none ${FADE_CLASS}`}
              style={{
                opacity: hovering ? RESTING_OPACITY : 0,
                filter: `blur(${MAX_BLUR}px)`,
              }}
            >
              {shown.map(({ cell: c, opacity }) => (
                <rect
                  key={c.day ? c.day.date : `pad-${c.x}-${c.y}`}
                  x={c.x}
                  y={c.y}
                  width={cell}
                  height={cell}
                  fill="currentColor"
                  opacity={opacity}
                  className={
                    c.day && c.day.level > 0 ? "text-accent" : "text-foreground"
                  }
                />
              ))}
            </g>
            {bands.map((band, index) => (
              <g
                // biome-ignore lint/suspicious/noArrayIndexKey: bands are a fixed, ordered set
                key={index}
                className={`pointer-events-none ${FADE_CLASS}`}
                style={{ opacity: hovering ? 1 : 0, filter: bandBlur(index) }}
              >
                {band.map(({ day, x, y, cx, cy, strength }) => (
                  <g key={day.date}>
                    <rect
                      x={x}
                      y={y}
                      width={cell}
                      height={cell}
                      fill="currentColor"
                      className={
                        day.level > 0 ? "text-accent" : "text-foreground"
                      }
                      opacity={strength * LEVEL_OPACITY[day.level]}
                    />
                    <text
                      className="font-mono font-bold tabular-nums"
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="central"
                      opacity={strength}
                      style={{
                        fontSize: Math.max(6, Math.floor(cell * 0.48)),
                        fill:
                          day.level >= 3
                            ? "var(--accent-foreground)"
                            : "var(--foreground)",
                      }}
                    >
                      {day.count}
                    </text>
                  </g>
                ))}
              </g>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}

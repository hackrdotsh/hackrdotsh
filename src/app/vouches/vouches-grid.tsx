"use client";

import { useQuery } from "convex/react";
import { ArrowUpRight } from "lucide-react";
import { api } from "../../../convex/_generated/api";

function safeHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// Only allow http(s) URLs to be used as hrefs - anything else
// (javascript:, data:, ...) is an XSS vector.
function safeUrl(url: string): string | null {
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function FaviconImg({ url }: { url: string }) {
  const hostname = safeHostname(url);
  if (!hostname) return null;
  const src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  return (
    // biome-ignore lint/performance/noImgElement: external favicon URLs can't use next/image
    <img src={src} alt="" width={20} height={20} className="shrink-0" />
  );
}

export function VouchesGrid() {
  const vouches = useQuery(api.vouches.list);

  if (vouches === undefined) {
    return <p className="mt-12 text-sm text-muted-foreground">Loading…</p>;
  }

  if (vouches.length === 0) {
    return (
      <p className="mt-12 text-sm text-muted-foreground">No vouches yet.</p>
    );
  }

  return (
    <ul className="rows mt-12 sm:grid-cols-2">
      {vouches.map((vouch) => {
        const href = safeUrl(vouch.url);
        if (!href) return null;
        return (
          <li key={vouch._id}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="row flex h-full items-center gap-4"
            >
              <FaviconImg url={vouch.url} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">
                  {vouch.name}
                </span>
                <span className="pixel-11 block truncate text-faint">
                  {safeHostname(vouch.url) ?? vouch.url}
                </span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 shrink-0 text-faint"
              />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

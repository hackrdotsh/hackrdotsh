"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

const adminLinks = [
  { href: "/admin/resumes", label: "Resumes" },
  { href: "/admin/cover-letters", label: "Cover letters" },
  { href: "/admin/job-postings", label: "Job postings" },
  { href: "/admin/vouches", label: "Vouches" },
  { href: "/admin/design-system", label: "Design system" },
];

const tabClass = "px-3 py-2 text-sm whitespace-nowrap";
const idleTabClass =
  "text-muted-foreground hover:bg-surface-2 hover:text-foreground";

/** Section links for the admin area. They sit in the page flow, so they can
    never cover a control the way a floating bar does. */
export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin"
      className="-mx-3 flex gap-1 overflow-x-auto [scrollbar-width:none]"
    >
      {adminLinks.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              tabClass,
              active ? "bg-surface-2 text-foreground" : idleTabClass,
            )}
          >
            {link.label}
          </Link>
        );
      })}
      {/* Served by the Worker, outside the app router. */}
      <a href="/admin/mcp" className={cn(tabClass, idleTabClass)}>
        MCP
      </a>
    </nav>
  );
}

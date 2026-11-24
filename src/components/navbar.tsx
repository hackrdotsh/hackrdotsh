"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { isOwnerEmail } from "~/lib/admin";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/util";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/showcase", label: "Work" },
  { href: "/blog", label: "Writing" },
  { href: "/resume", label: "Resume" },
  { href: "/vouches", label: "Vouches" },
  { href: "/guestbook", label: "Guestbook" },
];

const adminLink = { href: "/admin/resumes", label: "Admin" };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === adminLink.href) return pathname.startsWith("/admin");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: close the menu on every route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  const links = isOwnerEmail(session?.user?.email)
    ? [...navLinks, adminLink]
    : navLinks;

  const signOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  const authControl =
    !isPending && session ? (
      <Button variant="ghost" size="sm" onClick={signOut}>
        Sign out
      </Button>
    ) : (
      <Button variant="ghost" size="sm" render={<Link href="/sign-in" />}>
        Sign in
      </Button>
    );

  return (
    <header className="sticky top-0 z-40 bg-background">
      <nav
        className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-8 px-5 sm:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="pixel-22 flex items-baseline text-foreground select-none"
        >
          hackr<span className="text-accent">.</span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-sm",
                  active
                    ? "text-foreground underline decoration-accent decoration-2 underline-offset-8"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto hidden lg:block">{authControl}</div>

        <Button
          variant="ghost"
          size="sm"
          className="ml-auto lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? "Close" : "Menu"}
        </Button>
      </nav>
      <hr className="rule" />

      {menuOpen && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full max-h-[calc(100svh-3.5rem)] overflow-y-auto bg-background px-5 pt-2 pb-6 shadow-lift-3 sm:px-8 lg:hidden"
        >
          <ul className="rows">
            {links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "row pixel-22",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-4">{authControl}</div>
        </div>
      )}
    </header>
  );
}

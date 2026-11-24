"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrambleText } from "~/components/scramble-text";
import { Button } from "~/components/ui/button";
import { isOwnerEmail } from "~/lib/admin";
import { authClient } from "~/lib/auth-client";
import { onPageReady } from "~/lib/page-ready";
import { cn } from "~/lib/util";

gsap.registerPlugin(useGSAP);

const navLinks = [
  { href: "/", label: "home" },
  { href: "/showcase", label: "work" },
  { href: "/blog", label: "writing" },
  { href: "/resume", label: "resume" },
  { href: "/vouches", label: "vouches" },
  { href: "/guestbook", label: "guestbook" },
];

const adminLink = { href: "/admin/resumes", label: "admin" };

function isActive(pathname: string, href: string) {
  if (href === adminLink.href) return pathname.startsWith("/admin");
  return pathname === href;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const barRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: close the menu on every route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen, closeMenu]);

  useGSAP(
    () => {
      const bar = barRef.current;
      if (!bar) return;
      gsap.set(bar, { y: -16, opacity: 0 });
      const cleanup = onPageReady(() => {
        gsap.to(bar, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          delay: 0.2,
        });
      });
      return cleanup;
    },
    { scope: barRef },
  );

  useGSAP(
    () => {
      const panel = menuRef.current;
      if (!panel) return;
      const links = gsap.utils.toArray<HTMLElement>(".menu-link", panel);
      if (links.length === 0) return;

      if (menuOpen) {
        gsap.set(panel, { pointerEvents: "auto" });
        gsap.to(panel, { opacity: 1, duration: 0.25, ease: "power2.out" });
        gsap.fromTo(
          links,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.06,
            ease: "power3.out",
            delay: 0.05,
          },
        );
      } else {
        gsap.to(links, {
          opacity: 0,
          y: 12,
          duration: 0.15,
          stagger: 0.02,
          ease: "power2.in",
        });
        gsap.to(panel, {
          opacity: 0,
          duration: 0.2,
          delay: 0.1,
          onComplete: () => gsap.set(panel, { pointerEvents: "none" }),
        });
      }
    },
    { scope: menuRef, dependencies: [menuOpen] },
  );

  // The owner reaches the admin area from here.
  const links = isOwnerEmail(session?.user?.email)
    ? [...navLinks, adminLink]
    : navLinks;

  const authButton =
    !isPending && session ? (
      <Button
        variant="secondary"
        size="sm"
        onClick={async () => {
          await authClient.signOut();
          router.push("/");
          router.refresh();
        }}
      >
        Sign out
      </Button>
    ) : (
      <Button variant="secondary" size="sm" render={<Link href="/sign-in" />}>
        Sign in
      </Button>
    );

  return (
    <>
      <header
        ref={barRef}
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled
            ? "border-b hairline bg-background/70 backdrop-blur-md"
            : "border-b border-transparent",
        )}
      >
        <nav
          className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="group flex items-baseline gap-1.5 font-mono text-sm tracking-[0.15em] uppercase select-none"
          >
            <span className="text-foreground transition-colors group-hover:text-accent">
              <ScrambleText text="hackr" trigger="ready" delay={0.4} />
            </span>
            <span className="inline-block size-1.5 translate-y-[-1px] bg-accent" />
          </Link>

          {/* Links are ghost buttons; below 1024px they would run into the
              logo, so the menu takes over. */}
          <div className="hidden items-center gap-1 lg:flex">
            {links.map((link, i) => {
              const active = isActive(pathname, link.href);
              return (
                <Button
                  key={link.href}
                  variant="ghost"
                  size="sm"
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group font-mono",
                    active
                      ? "bg-surface-2 text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  render={<Link href={link.href} />}
                >
                  <span
                    className={cn(
                      "text-[0.5625rem] tracking-wider",
                      active
                        ? "text-accent"
                        : "text-muted-foreground/50 group-hover:text-accent",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <ScrambleText text={link.label} trigger="hover" />
                </Button>
              );
            })}
            <span className="mr-3 ml-2 h-3 w-px bg-border" aria-hidden="true" />
            {authButton}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="font-mono lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? "close" : "menu"}
          </Button>
        </nav>
      </header>

      <div
        ref={menuRef}
        id="mobile-menu"
        role="dialog"
        aria-label="Navigation menu"
        className="fixed inset-0 z-30 flex flex-col justify-center px-8 opacity-0 pointer-events-none lg:hidden"
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMenu}
          className="absolute inset-0 bg-background/95 backdrop-blur-xl"
        />
        <div className="relative flex flex-col gap-6">
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className={cn(
                "menu-link flex items-baseline gap-4 pixel-33",
                isActive(pathname, link.href)
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <span className="font-mono text-xs text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              {link.label}
            </Link>
          ))}
          <div className="menu-link mt-4">{authButton}</div>
        </div>
      </div>
    </>
  );
}

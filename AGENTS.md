# AGENTS.md — hackr.sh

## Project Overview

Personal portfolio/site built with **vinext** (Next.js 16 App Router API on Vite, deployed to Cloudflare Workers), **React 19**, **Tailwind CSS v4**, and **GSAP** for animations. Auth is **Better Auth** (passkey-only) backed by a locally-installed Convex component. Managed via **pnpm** with a **Nix flake** dev shell.

## Essential Commands

```bash
pnpm dev          # Start vinext dev server (localhost:3002, runs in workerd)
pnpm build        # convex deploy + vinext build (production)
pnpm start        # Serve the built Worker locally (wrangler dev)
pnpm deploy       # convex deploy (prod) + deploy the built Worker (@vinext/cloudflare); run pnpm build first if dist/ is stale
pnpm lint         # Run Biome linter
pnpm format       # Format code with Biome (writes in place)
```

The Nix flake (`flake.nix`) provides `pnpm`, `nodejs_24`, and `biome` in the dev shell. Enter via `direnv allow` (`.envrc` contains `use flake`). It also exports `SSL_CERT_FILE` — workerd needs it for outbound TLS (Convex, Google Fonts) on NixOS.

## Toolchain Requirements

- **Node.js**: 24 (pinned in `package.json` engines and `.node-version`)
- **pnpm**: 10.22.0 (pinned via `packageManager` field — corepack will enforce)
- **Biome**: 2.4.12 (linter + formatter, replaces ESLint/Prettier)
- **Vite 8** via **vinext**: `vite.config.ts` wires `vinext()` + `@cloudflare/vite-plugin`; `worker/index.ts` is the Worker entry (required — delegates to `vinext/server/fetch-handler`)
- **Tailwind CSS**: v4 via `@tailwindcss/vite` (no `tailwind.config`, no PostCSS config — configuration is CSS-first via `@theme` blocks in `globals.css`)
- **next/* types**: come from `vinext/types` (see `next-env.d.ts`); the `next` package is NOT installed

## Auth (Better Auth, passkey-only)

- Local component install in `convex/betterAuth/` (passkey needs schema changes, so the npm component can't be used). Regenerate schema after plugin changes: `cd convex/betterAuth && npx auth generate --output schema.ts -y`
- Server config: `convex/auth.ts` (`createAuthOptions`), client: `src/lib/auth-client.ts`, server helpers: `src/lib/auth-server.ts` (`isAuthenticated`, `getToken`, `fetchAuthQuery`, ...)
- Owner sign-in is passkey-only (`/sign-in`). Guests sign in with GitHub (social provider in `createAuthOptions`) — used by the `/guestbook`. A session is therefore always either the owner (passkey) or a GitHub guest; ownership is decided by email (`isOwnerEmail`) because it holds across both sign-in methods
- First-passkey bootstrap is pre-auth but self-locks: it requires `PASSKEY_SETUP_TOKEN` (Convex env var) and only works while zero passkeys exist
- Admin gating: `src/proxy.ts` (Next 16 proxy convention, optimistic cookie check) + per-layout email allowlist in `src/app/admin/*/layout.tsx`. The allowlist email is centralized as `ADMIN_EMAIL` in `src/lib/admin.ts` (re-exported from `src/lib/auth-server.ts`); privileged API routes must use the `isAdmin()` helper from `src/lib/auth-server.ts` (not just `isAuthenticated()`)
- Env vars on the Convex deployment (set via `npx convex env set`): `BETTER_AUTH_SECRET`, `SITE_URL`, `PASSKEY_SETUP_TOKEN`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`. GitHub OAuth app callback URL is `<SITE_URL>/api/auth/callback/github` (i.e. `https://hackr.sh/...` prod, `http://localhost:3002/...` dev) — better-auth builds it from `SITE_URL`; the app's `/api/auth/[...all]` route proxies the callback to Convex. Dev and prod each need their own OAuth app + env values
- Rotating `BETTER_AUTH_SECRET` invalidates the JWT plugin's JWKS (private keys in the component's `jwks` table are encrypted with the secret) — afterwards, delete all rows in the betterAuth component's `jwks` table on the deployment (`npx convex dashboard [--prod]` → Data → jwks), or every Convex token mint 500s and `ctx.auth.getUserIdentity()` returns null (symptom: mutations throw "Not authenticated" despite a valid session)
- Keep `better-auth` and `@better-auth/passkey` on the same release, currently `1.6.33`. `@convex-dev/better-auth@0.12.6` requires Better Auth `<1.7.0`. Its provider types need the type-only patch in `patches/`; do not replace this with a cast. `@better-fetch/fetch@1.3.1` and `@better-auth/utils@0.4.2` satisfy the auth packages' exact peers. See `SECURITY.md` for remaining upstream advisories and upgrade constraints.

## Architecture

```
src/
  app/             # App Router (layout.tsx, page.tsx, globals.css)
                   # /guestbook = public guestbook (GitHub-sign-in + notes feed)
  components/      # React components
  lib/             # Utilities (cn helper, auth-client/auth-server, admin)
convex/
  guestbook.ts     # Guestbook list/sign/remove (owner can delete any entry)
  betterAuth/      # Locally-installed Better Auth component (schema, adapter)
worker/
  index.ts         # Cloudflare Worker entry for vinext; also injects baseline
                   # security headers (nosniff, DENY framing, HSTS, Referrer/
                   # Permissions-Policy) on every response
public/            # Static assets
```

- **Path alias**: `~/*` maps to `./src/*` (configured in `tsconfig.json` `paths`). Use this for all internal imports.
- **Layout**: `RootLayout` wraps all pages with DM Sans and Departure Mono fonts, the `PageLoader`, the navbar, and the footer.
- **Design system**: tokens live in `src/app/globals.css`; dither patterns and component classes (`btn`, `field`, `tag`, `rows`, `dither-frame`, `rule`) live in `src/app/design-system.css`. `/admin/design-system` shows every token and component; add new ones there. The look is dark only, square-cornered, and built from dither. The components change colour and pattern instantly and only animate travel (button presses, the select highlight). Page motion lives outside them: `PageLoader` plays on load and fires `page-ready`, then `ScrambleText`, `DitherHover` and the glitch classes run. Everything inside `DitherInScope` (the page and footer) dithers in from top to bottom automatically, including content that loads later; see its target list, and use `data-dither-in` or `data-dither-skip` to opt an element in or out. Use `onPageReady` from `~/lib/page-ready` to start entrance animations, register `useGSAP` before use, and honour `prefers-reduced-motion`.

## UI Components

Install all new UI components from **COSS UI** (`https://coss.com/ui`) instead of shadcn/ui. Do not use shadcn/ui as a source for any new component.

## Code Conventions

- **Styling**: Tailwind CSS v4 classes. No `tailwind.config` — use `@theme inline {}` blocks in CSS for custom theme tokens (see `globals.css`).
- **Class merging**: Use `cn()` from `~/lib/util` (clsx + tailwind-merge) for conditional/merged class names.
- **Imports**: Use `~/` path alias for internal imports (e.g., `~/lib/util`, `~/components/navbar`).
- **Formatting**: 2-space indentation (Biome enforced). Biome auto-organizes imports.

## Gotchas

- **Tailwind v4 has no config file**: Theme customization happens in CSS via `@theme inline {}` directives. Don't create a `tailwind.config.js/ts` or a `postcss.config` — Tailwind runs through `@tailwindcss/vite`.
- **sharp is ignored**: `pnpm-workspace.yaml` ignores the `sharp` dependency (image optimization uses it but it can fail in Nix environments).
- **Biome domains**: The linter has Next.js and React recommended rule domains enabled — it will catch Next-specific issues.
- **`noUnknownAtRules` is off**: Biome's CSS lint rule for unknown at-rules is disabled because Tailwind v4 uses at-rules like `@theme` that Biome doesn't recognize.
- **`VINEXT_KV_CACHE`**: the KV namespace id in `wrangler.jsonc` must be created with `npx wrangler kv namespace create VINEXT_KV_CACHE` and pasted in before deploying.
- **Security `pnpm.overrides`** in `package.json` pin patched transitive dependencies. Keep them unless the resolved dependency tree no longer needs them; run `pnpm audit` after changes. The `shadcn` CLI is not installed. Existing switch state variants live in `src/app/base-ui.css`, without a CLI runtime dependency.
- **MDX blog posts** are read from `content/` via `fs` + `gray-matter` (no `@next/mdx` — vinext doesn't run webpack loaders).

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

# hackr.sh

Personal portfolio built with Next.js, React, Tailwind CSS, and GSAP.

## Stack

- **Next.js** — App Router
- **React**
- **Tailwind CSS** — CSS-first config via `@theme inline`
- **GSAP** — animations
- **Biome** — linting and formatting
- **Nix** — dev shell via `flake.nix`
- **pnpm** — package management

## Getting Started

Requires **Node.js 24** and **pnpm**.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

Alternatively, enter the Nix dev shell:

```bash
direnv allow
```

This provides `pnpm`, `nodejs_24`, and `biome`.

## Cloudflare builds

Workers Builds deploys every push to `main` on GitHub. No build command is
needed: when `pnpm install` runs there, `scripts/workers-ci-build.mjs` builds
the site, and the default deploy command (`npx wrangler deploy`) picks up the
generated configuration. Locally the script does nothing.

- Production's public Convex URLs come from the committed `.env.production`.
  Dev values belong in `.env.development.local`, which production builds never
  read.
- Set `CONVEX_DEPLOY_KEY` (a production deploy key) under Settings > Build >
  Build variables and secrets so each build also deploys the Convex functions.
  Without it the build warns and deploys the site only.
- Cloudflare selects Node 24 from `.node-version`. Remove any older
  `NODE_VERSION` override.

To deploy by hand, run `pnpm build` and then `pnpm deploy`.

Run `pnpm audit` to review dependency advisories. See `SECURITY.md` for the
remaining Better Auth compatibility constraint.

## Scripts

| Command          | Description            |
| ---------------- | ---------------------- |
| `pnpm dev`       | Start dev server       |
| `pnpm build`     | Production build       |
| `pnpm start`     | Start production server|
| `pnpm lint`      | Run Biome linter       |
| `pnpm format`    | Format with Biome      |

## Project Structure

```
src/
  app/             # App Router pages and layout
  components/      # React components
  lib/             # Utilities
public/            # Static assets
```

Internal imports use the `~/` path alias mapped to `./src/*`.

---

*more things to come~!*

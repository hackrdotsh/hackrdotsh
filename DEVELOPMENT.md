# hackr.sh

Personal portfolio built with Next.js, React, and Tailwind CSS.

## Stack

- **Next.js** — App Router
- **React**
- **Tailwind CSS** — CSS-first config via `@theme inline`
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

Set the build command to `pnpm build` and the deploy command to `pnpm deploy`.
The build generates `dist/server/wrangler.json`, including the assets directory;
deploying the source `wrangler.jsonc` directly skips this step. Cloudflare can
select Node 24 from `.node-version`. Remove any older `NODE_VERSION` override.
The build environment also needs the production `CONVEX_DEPLOY_KEY` and the
app's public Convex environment variables.
After changing the Convex project slug, replace any existing deploy key in
Cloudflare's build variables with a newly generated production deploy key.

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

# Dependency security

## Runtime and verification

Use Node 24, selected by `.node-version`, `package.json`, and the Nix dev shell.
The updated Nix lock resolves Node 24.21.0.

After changing dependencies, run:

```sh
pnpm install --frozen-lockfile
pnpm exec vinext build
pnpm exec tsc --noEmit
pnpm lint
pnpm audit
```

The frontend build does not deploy Convex. `pnpm build` also deploys Convex and
requires deployment credentials. A successful build does not verify passkey or
GitHub sign-in against the production backend.

## Better Auth constraint

As of 2026-10-30, `@convex-dev/better-auth@0.12.6` declares support for Better Auth
`>=1.6.11 <1.7.0`. This app pins Better Auth and its passkey plugin to `1.6.33`.
The previous `1.6.15` release had additional advisories that this update fixes.

Six Better Auth audit entries remain, covering four advisories:

| Advisory | Affected feature | Current configuration |
| --- | --- | --- |
| GHSA-q84f-53jg-9ppm | Device login approval | Device authorization plugin is not enabled. |
| GHSA-r4xp-prcw-77qf | OAuth Proxy account takeover | OAuth Proxy plugin is not enabled. GitHub uses the built-in social provider. |
| GHSA-965c-763c-88jm | OAuth state accepted as a magic link | Magic Link plugin is not enabled. |
| GHSA-44jh-23m7-hpcf | SQL-adapter rate-limit race | The app uses the Convex adapter, not Drizzle or Kysely. Audit reports this against three installed packages. |

These advisories are not suppressed. `pnpm audit` still exits nonzero. Their
affected configurations are not used by this app, but the packages remain in
the dependency tree. Reassess this table before enabling another auth plugin or
changing adapters. Upgrade the integration and auth packages together when
Convex supports a fixed Better Auth 1.7 release.

## Open Graph renderer constraint

One additional advisory, GHSA-wx4j-mvgx-mqwp, affects the Satori renderer used
by `@vercel/og@0.8.6` through vinext. Satori 0.33.5 fixes SVG escaping, but
`@vercel/og` bundles its renderer, so overriding the separate Satori dependency
does not patch the embedded code. The patched `@vercel/og@1.0.3` was tested and
rejected: its bundled HarfBuzz initialization crashes in Cloudflare Workers
with `Cannot read properties of undefined (reading 'href')`.

Keep the existing renderer until a Worker-compatible patched release or a
tested renderer migration is available. Do not pass untrusted SVG nodes,
attributes, or styles to this renderer. The current OG route constructs its
own elements and styles; request parameters supply text only. This is a usage
restriction, not a fix for the installed vulnerable package. The full audit
therefore reports seven entries, not zero.

## Compatibility patch

`patches/@convex-dev__better-auth@0.12.6.patch` fixes the integration's provider
type declaration. Its generic plugin union infers session data as `never` with
newer Better Auth 1.6 releases. The patch describes the concrete Convex plugin
interfaces that the provider consumes, allowing additional client plugins
structurally. It changes TypeScript declarations and their source, not runtime
JavaScript. Keep the patch until an upstream release fixes this declaration.

## Component tooling

The unused `shadcn` CLI dependency was removed to eliminate its vulnerable
dependency tree. Its only app import supplied CSS state variants. The variants
used by the existing Base UI switch now live in `src/app/base-ui.css`.

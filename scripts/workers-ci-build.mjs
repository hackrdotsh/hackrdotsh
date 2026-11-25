// Builds the site during `pnpm install` on Cloudflare Workers Builds.
//
// Workers Builds runs an optional build command and then a deploy command
// that defaults to `npx wrangler deploy`. This project needs `vinext build`
// first: it writes dist/ and .wrangler/deploy/config.json, which points
// wrangler at the generated configuration. Running the build here means the
// default deploy command works even when no build command is configured.
//
// Outside Workers Builds this script does nothing.

import { execSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

if (process.env.WORKERS_CI !== "1") process.exit(0);

const run = (command) => execSync(command, { stdio: "inherit" });

function productionConvexUrl() {
  const line = readFileSync(".env.production", "utf8")
    .split("\n")
    .find((entry) => entry.startsWith("NEXT_PUBLIC_CONVEX_URL="));
  if (!line) throw new Error(".env.production has no NEXT_PUBLIC_CONVEX_URL");
  return line.slice(line.indexOf("=") + 1).trim();
}

function containsText(directory, text) {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
    .some((entry) =>
      readFileSync(join(entry.parentPath, entry.name), "utf8").includes(text),
    );
}

// Convex functions deploy only from the production branch, and only when the
// build has a deploy key.
const onProductionBranch = process.env.WORKERS_CI_BRANCH === "main";
if (onProductionBranch && process.env.CONVEX_DEPLOY_KEY) {
  run("pnpm exec convex deploy --yes");
} else if (onProductionBranch) {
  console.warn(
    "\nCONVEX_DEPLOY_KEY is not set, so Convex functions were NOT deployed. " +
      "Add it under Settings > Build > Build variables and secrets, or run " +
      "`npx convex deploy` yourself when convex/ changes.\n",
  );
}

run("pnpm exec vinext build");

// A build without the production backend URL would deploy a broken site.
const convexUrl = productionConvexUrl();
if (!containsText("dist/client", convexUrl)) {
  throw new Error(
    `The built site does not reference ${convexUrl}. Refusing to continue.`,
  );
}

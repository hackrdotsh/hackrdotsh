import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
    // The Nix dev shell keeps flake inputs under .direnv, tests included.
    exclude: [...configDefaults.exclude, ".direnv/**"],
  },
});

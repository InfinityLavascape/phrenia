import { defineConfig } from "vitest/config";

// PGlite is real Postgres compiled to WebAssembly. Its first start takes a few seconds.
export default defineConfig({ test: { testTimeout: 30_000, hookTimeout: 30_000 } });

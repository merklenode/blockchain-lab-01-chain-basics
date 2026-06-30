import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // node environment keeps globalThis.crypto.subtle intact.
    // jsdom replaces it with a stub that breaks sha256Hex.
    environment: "node",
    exclude: ["e2e/**", "node_modules/**"],
  },
  resolve: {
    // Mirror the tsconfig @/* path alias so transitive imports resolve correctly.
    alias: { "@": path.resolve(__dirname, ".") },
  },
});

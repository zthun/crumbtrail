import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export function defineTest(environment?: "node") {
  return defineConfig({
    plugins: [tsConfigPaths()],
    test: {
      environment,
      testTimeout: 30000,
    },
  });
}

import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import type { TestProjectConfiguration } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import vue from "@vitejs/plugin-vue";
import solid from "vite-plugin-solid";

const packages: [string, string][] = [
  ["core", "packages/core"],
  ["memory", "packages/adapters/memory"],
  ["http", "packages/adapters/http"],
  ["openfeature", "packages/adapters/openfeature"],
  ["openfeature-web", "packages/adapters/openfeature-web"],
  ["growthbook", "packages/adapters/growthbook"],
  ["unleash", "packages/adapters/unleash"],
  ["configcat", "packages/adapters/configcat"],
  ["statsig", "packages/adapters/statsig"],
  ["posthog", "packages/adapters/posthog"],
  ["launchdarkly-web", "packages/adapters/launchdarkly-web"],
  ["launchdarkly-react-native", "packages/adapters/launchdarkly-react-native"],
  ["simulcast", "packages/integrations/simulcast"],
  ["devtools", "packages/devtools"],
];

const source = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: { dedupe: ["react", "react-dom"] },
  test: {
    globals: false,
    environment: "node",
    execArgv: ["--no-experimental-webstorage"],
    restoreMocks: true,
    projects: [
      {
        extends: true,
        plugins: [vue()],
        resolve: {
          alias: {
            src: source("./examples/vue/src"),
            "examples/shared": source("./examples/shared"),
          },
        },
        test: {
          name: "example-vue",
          include: ["examples/vue/src/**/*.test.ts"],
          environment: "jsdom",
        },
      },
      {
        extends: true,
        plugins: [solid()],
        resolve: {
          alias: {
            src: source("./examples/solid/src"),
            "examples/shared": source("./examples/shared"),
          },
          conditions: ["development", "browser"],
        },
        test: {
          name: "example-solid",
          include: ["examples/solid/src/**/*.test.ts"],
          environment: "jsdom",
          server: { deps: { inline: [/solid-js/] } },
        },
      },
      {
        extends: true,
        plugins: [svelte({ configFile: false })],
        resolve: {
          alias: {
            src: source("./examples/svelte/src"),
            "examples/shared": source("./examples/shared"),
          },
          conditions: ["browser"],
        },
        test: {
          name: "example-svelte",
          include: ["examples/svelte/src/**/*.test.ts"],
          environment: "jsdom",
        },
      },
      {
        extends: true,
        resolve: { alias: { src: source("./packages/vue/src") } },
        test: {
          name: "vue",
          include: ["packages/vue/src/**/*.test.ts"],
          environment: "jsdom",
        },
      },
      {
        extends: true,
        resolve: {
          alias: { src: source("./packages/solid/src") },
          conditions: ["development", "browser"],
        },
        test: {
          name: "solid",
          include: ["packages/solid/src/**/*.test.ts"],
          exclude: ["**/*.server.test.ts"],
          environment: "jsdom",
          server: { deps: { inline: [/solid-js/] } },
        },
      },
      {
        extends: true,
        resolve: { alias: { src: source("./packages/solid/src") } },
        test: {
          name: "solid-ssr",
          include: ["packages/solid/src/**/*.server.test.ts"],
        },
      },
      {
        extends: true,
        plugins: [svelte({ configFile: false })],
        resolve: {
          alias: { src: source("./packages/svelte/src") },
          conditions: ["browser"],
        },
        test: {
          name: "svelte",
          include: ["packages/svelte/src/**/*.test.ts"],
          environment: "jsdom",
        },
      },
      {
        extends: true,
        resolve: {
          alias: {
            src: source("./examples/react/src"),
            "examples/shared": source("./examples/shared"),
          },
        },
        test: {
          name: "example-react",
          include: ["examples/react/src/**/*.test.{ts,tsx}"],
          environment: "jsdom",
        },
      },
      {
        extends: true,
        resolve: {
          alias: { "examples/shared": source("./examples/shared") },
        },
        test: {
          name: "example-shared",
          include: ["examples/shared/**/*.test.ts"],
        },
      },
      {
        extends: true,
        resolve: {
          alias: {
            "#src": source("./examples/server/src"),
            "examples/shared": source("./examples/shared"),
          },
        },
        test: {
          name: "example-server",
          include: ["examples/server/src/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration-react",
          include: ["tests/integration/**/*.test.tsx"],
          environment: "jsdom",
        },
      },
      ...packages.map(([name, directory]): TestProjectConfiguration => ({
        extends: true,
        resolve: { alias: { src: source(`./${directory}/src`) } },
        test: { name, include: [`${directory}/src/**/*.test.ts`] },
      })),
      {
        extends: true,
        resolve: { alias: { src: source("./packages/react/src") } },
        test: {
          name: "react",
          include: ["packages/react/src/**/*.test.{ts,tsx}"],
          environment: "jsdom",
        },
      },
    ],
  },
});

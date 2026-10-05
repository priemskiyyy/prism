import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/react.tsx"],
  format: ["esm"],
  target: "es2022",
  platform: "neutral",
  dts: true,
  clean: true,
  sourcemap: true,
});

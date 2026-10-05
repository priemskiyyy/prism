import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  resolve: {
    alias: {
      src: fileURLToPath(new URL("./src", import.meta.url)),
      "examples/shared": fileURLToPath(new URL("../shared", import.meta.url)),
    },
  },
});

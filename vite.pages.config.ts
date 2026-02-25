import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "example",
  base: "/banaspati/",
  resolve: {
    alias: {
      "@rfahmi/banaspati": "/src/index.ts",
    },
  },
  build: {
    outDir: "../dist-demo",
    emptyOutDir: true,
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "example",
  resolve: {
    alias: {
      "com.rfahmi.banaspati": "/src/index.ts",
    },
  },
});

import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base path for GitHub Pages
  // Set base to './' for local dev, or '/DHOBRStats/' for GitHub Pages
  base: process.env.GITHUB_PAGES === 'true' ? '/DHOBRStats/' : './',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        popover: resolve(__dirname, "popover.html"),
      },
    },
  },
  server: {
    cors: true,
  },
});

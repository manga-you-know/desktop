import { sveltekit } from "@sveltejs/kit/vite";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { defineConfig } from "vite";
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [enhancedImages(), sveltekit()],
  server: {
    host: host || false,
    strictPort: true,
    port: 5174,
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target:
      process.env.TAURI_ENV_PLATFORM == "windows" ? "chrome105" : "safari13",
    minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
  hmr: {
    protocol: "ws",
    host: host || false,
    port: 5174,
  },
});

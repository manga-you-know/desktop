import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      "@/*": "./path/to/lib/*",
      "@/*": "./src/*",
    },
    prerender: {
      entries: [
        "/",
        "/home",
        "/favorites",
        "/library",
        "/panels",
        "/notificator",
        "/reader/0/0",
        "/reader/2/1",
        "/reader/4/2",
        "/player/0/0",
        "/player/2/1",
        "/player/4/2",
      ],
    },
  },
};

export default config;

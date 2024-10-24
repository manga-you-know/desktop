// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-08-24",
  devtools: { enabled: false },
  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@tresjs/nuxt',
  ],
  srcDir: 'src',
  ssr: false,
  telemetry: false,
  devServer: { host: '0.0.0.0' },
  routeRules: {
    '/': { swr : true },
    '/favorites': { swr : true },
    '/configs': { swr : false, prerender: true }
  },
  vite: {
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
    server: {
      strictPort: true,
      hmr: {
        protocol: 'ws',
        host: '0.0.0.0',
        port: 5183,
      },
    },
  },
  spaLoadingTemplate: false,
})
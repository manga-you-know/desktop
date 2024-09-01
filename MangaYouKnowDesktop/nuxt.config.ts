// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-08-24",
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@prisma/nuxt'],
  srcDir: 'src',
})
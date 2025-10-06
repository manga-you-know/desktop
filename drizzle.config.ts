import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "sqlite:test.db",
  },
  verbose: false,
  strict: true,
  out: "./src-tauri/migrations",
});

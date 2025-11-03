import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema",
  dialect: "sqlite",
  dbCredentials: {
    url: "sqlite:test.db",
  },
  verbose: false,
  strict: true,
  casing: "snake_case",
  out: "./src-tauri/migrations",
});

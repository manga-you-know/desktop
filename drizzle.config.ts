import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  dialect: "sqlite",
  verbose: false,
  strict: true,
  casing: "snake_case",
  out: "./src-tauri/migrations",
});

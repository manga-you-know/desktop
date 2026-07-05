import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("user", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").unique(),
  username: text("username").notNull(),
  icon: text("icon").default("https://cdn.discordapp.com/embed/avatars/0.png"),
  password: text("password").default(""),
  isAuthenticated: integer("is_authenticated", { mode: "boolean" }).default(
    false,
  ),
});

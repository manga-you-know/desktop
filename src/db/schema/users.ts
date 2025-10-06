import { sqliteTable, integer, text, } from "drizzle-orm/sqlite-core";


export const users = sqliteTable("user", {
  id: integer().primaryKey({ autoIncrement: true }),
  email: text().unique(),
  username: text().notNull(),
  icon: text().default("https://cdn.discordapp.com/embed/avatars/0.png"),
  password: text().default(""),
  isAuthenticated: integer({ mode: "boolean" }).default(false)
})

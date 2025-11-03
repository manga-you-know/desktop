import { sqliteTable, integer, text, } from "drizzle-orm/sqlite-core";
import { users } from "./users";


export const marks = sqliteTable("mark", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  userId: integer().notNull().references(() => users.id),
  color: text().default("")
})

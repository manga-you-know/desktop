import { sqliteTable, integer, text, } from "drizzle-orm/sqlite-core";
import { users } from "./users";


export const marks = sqliteTable("mark", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  color: text("color").default("")
})

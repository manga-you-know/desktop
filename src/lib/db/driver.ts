import { drizzle } from "drizzle-orm/sqlite-proxy";
import { DATABASE_NAME } from "@/constants";
import Database from "@tauri-apps/plugin-sql";
import * as schema from "./schema";

/**
 * Represents the result of a SELECT query.
 */
export type SelectQueryResult = {
  [key: string]: any;
};

/**
 * Loads the sqlite database via the Tauri Proxy.
 */
// export const sqlite = await Database.load("sqlite:test.db");

export async function getDb() {
  return await Database.load(`sqlite:${DATABASE_NAME}`);
}

/**
 * The drizzle database instance.
 */
export const db = drizzle<typeof schema>(
  async (sql, params, method) => {
    const sqlite = await getDb();
    let rows: any = [];

    if (isSelectQuery(sql) || hasReturning(sql)) {
      rows = await sqlite.select(sql, params).catch((e) => {
        console.error("SQL Error:", e);
        return [];
      });
    } else {
      await sqlite.execute(sql, params).catch((e) => {
        console.error("SQL Error:", e);
      });
      return { rows: [] };
    }

    rows = rows.map((row: any) => Object.values(row));
    const results = method === "all" ? rows : rows[0];
    return { rows: results };
  },
  { schema: schema, logger: true, casing: "snake_case" },
);

function hasReturning(sql: string): boolean {
  return /\bRETURNING\b/i.test(sql);
}

function isSelectQuery(sql: string): boolean {
  return /^\s*SELECT\b/i.test(sql);
}

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.POSTRGES_URL) {
  throw new Error("POSTRGES_URL environment variable is not set");
}

const sql = neon(process.env.POSTRGES_URL);
export const db = drizzle(sql, { schema });

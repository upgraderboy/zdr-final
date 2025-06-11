import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

dotenv.config({ path: ".env"});
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  // SSL config if needed:
  // ssl: { rejectUnauthorized: false }, // uncomment if RDS requires SSL
});

export const db = drizzle(pool);
import { defineConfig } from "drizzle-kit";
import fs from "fs";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    //host: process.env.DATABASE_HOST!,
    //port: parseInt(process.env.DATABASE_PORT!),
    //user: process.env.DATABASE_USER!,
    //password: process.env.DATABASE_PASSWORD!,
    //database: process.env.DATABASE_NAME!,
    ssl: {
      //rejectUnauthorized: false, // ✅ Required for self-signed certs
      ca: fs.readFileSync(process.env.DATABASE_CA_FILE!).toString(),
    },
  },
});


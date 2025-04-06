import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./utils/schema.jsx",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: "postgresql://neondb_owner:npg_gne0MKkyP6Qo@ep-soft-star-a5ay7mhp-pooler.us-east-2.aws.neon.tech/Expenses-Tracker?sslmode=require"
    }
});

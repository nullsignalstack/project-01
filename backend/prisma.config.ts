import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

// Load the shared root environment; container-provided variables take precedence.
config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
  quiet: true,
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Generation does not need a database; migrate/validate receive DATABASE_URL.
  datasource: { url: process.env.DATABASE_URL ?? "" },
});

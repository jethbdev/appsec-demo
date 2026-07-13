import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrate: {
    async adapter() {
      const { PrismaLibSql } = await import("@prisma/adapter-libsql");
      const { createClient } = await import("@libsql/client");

      const client = createClient({
        url: process.env.DATABASE_URL ?? "file:./dev.db",
      });

      return new PrismaLibSql(client);
    },
  },
});

import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

// ⚠️  VULNERABLE — SQL Injection via $queryRawUnsafe
//
// The `query` parameter is interpolated directly into the SQL string.
// An attacker can inject:   %' OR '1'='1
// Which turns this query:
//   SELECT * FROM Note WHERE userId='<id>' AND content LIKE '%%' OR '1'='1%'
// Into a query that returns ALL notes from ALL users.
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q") ?? "";
  const userId = session.user.id;
  const likePattern = `%${query}%`;

  // ✅ SECURE: Using template literal with $queryRaw automatically parameterizes the inputs.
  // The SQL engine sees: SELECT id, title, content, userId, createdAt FROM Note WHERE userId = ? AND content LIKE ?
  // and treats variables as parameters, not executable SQL.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notes: any[] = await prisma.$queryRaw`SELECT id, title, content, userId, createdAt FROM Note WHERE userId = ${userId} AND content LIKE ${likePattern}`;

  // Safe explanation of executed query
  const sqlParamInfo = `SELECT id, title, content, userId, createdAt FROM Note WHERE userId = ? AND content LIKE ?\n[Parameters: ?1 = "${userId}", ?2 = "${likePattern}"]`;

  return NextResponse.json({ notes, sql_executed: sqlParamInfo });
}

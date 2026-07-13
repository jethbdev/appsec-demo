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

  // ❌ VULNERABILITY: String interpolation directly into raw SQL.
  // Never do this with user-supplied input.
  const sql = `SELECT id, title, content, userId, createdAt FROM Note WHERE userId = '${userId}' AND content LIKE '%${query}%'`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notes: any[] = await prisma.$queryRawUnsafe(sql);

  // Return with metadata so the UI can show the constructed query
  return NextResponse.json({ notes, sql_executed: sql });
}

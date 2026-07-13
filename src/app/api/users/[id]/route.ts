import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

// ⚠️  VULNERABLE — IDOR: No ownership check.
// Any authenticated user can fetch ANY user's data by changing the id.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  // ✅ SECURE: Check that the authenticated user is requesting their own data.
  if (session.user.id !== id) {
    return NextResponse.json(
      { error: "Forbidden: you may not access another user's data." },
      { status: 403 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

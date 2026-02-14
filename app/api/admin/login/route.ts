import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSession } from "@/lib/admin-auth";

const schema = z.object({ password: z.string() });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  if (parsed.data.password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  createAdminSession();
  return NextResponse.json({ ok: true });
}

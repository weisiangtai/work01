import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const paymentSchema = z.object({
  last5Digits: z.string().min(5).max(5),
  transferTime: z.string().min(1),
  note: z.string().optional().default("")
});

export async function GET(_: Request, { params }: { params: { orderNumber: string } }) {
  const order = await prisma.order.findUnique({ where: { orderNumber: params.orderNumber } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: Request, { params }: { params: { orderNumber: string } }) {
  const json = await req.json();
  const parsed = paymentSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const order = await prisma.order.update({
    where: { orderNumber: params.orderNumber },
    data: {
      paymentLast5Digits: parsed.data.last5Digits,
      paymentTransferTime: parsed.data.transferTime,
      paymentNote: parsed.data.note,
      status: "PENDING_REVIEW"
    }
  });

  return NextResponse.json(order);
}

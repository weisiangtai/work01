import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const updateOrderSchema = z.object({
  status: z.enum(["PENDING_PAYMENT", "PENDING_REVIEW", "CONFIRMED", "FULFILLED", "CANCELED"]),
  adminNote: z.string().optional(),
  deliveryChannel: z.string().optional(),
  deliveryDestination: z.string().optional()
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateOrderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const fulfilledAt = parsed.data.status === "FULFILLED" ? new Date() : null;

  const order = await prisma.order.update({
    where: { id: Number(params.id) },
    data: {
      status: parsed.data.status,
      adminNote: parsed.data.adminNote,
      deliveryChannel: parsed.data.deliveryChannel,
      deliveryDestination: parsed.data.deliveryDestination,
      fulfilledAt
    }
  });

  return NextResponse.json(order);
}

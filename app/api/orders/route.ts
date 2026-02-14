import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

const createOrderSchema = z.object({
  customerName: z.string().min(1),
  customerContact: z.string().min(1),
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number().min(1)
    })
  ).min(1)
});

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = createOrderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const productIds = parsed.data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  const totalAmount = parsed.data.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerName: parsed.data.customerName,
      customerContact: parsed.data.customerContact,
      totalAmount,
      orderItems: {
        create: parsed.data.items.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product?.price ?? 0
          };
        })
      }
    }
  });

  return NextResponse.json({ orderNumber: order.orderNumber });
}

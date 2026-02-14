import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminOrderActions } from "./ui";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) redirect("/admin/login");

  const order = await prisma.order.findUnique({
    where: { id: Number(params.id) },
    include: { orderItems: { include: { product: true } } }
  });

  if (!order) return notFound();

  return (
    <div className="grid">
      <h1>Order {order.orderNumber}</h1>
      <div className="card">
        <p>Status: {order.status}</p>
        <p>Customer: {order.customerName}</p>
        <p>Contact: {order.customerContact}</p>
        <p>Payment last 5: {order.paymentLast5Digits ?? "-"}</p>
        <p>Transfer time: {order.paymentTransferTime ?? "-"}</p>
        <p>Payment note: {order.paymentNote ?? "-"}</p>
      </div>
      <div className="card">
        <h3>Items</h3>
        {order.orderItems.map((item) => (
          <p key={item.id}>{item.product.name} x {item.quantity}</p>
        ))}
      </div>
      <AdminOrderActions orderId={order.id} currentStatus={order.status} adminNote={order.adminNote ?? ""} />
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="grid">
      <h1>Admin Orders</h1>
      {orders.map((order) => (
        <div className="card" key={order.id}>
          <h3>{order.orderNumber}</h3>
          <p>Status: {order.status}</p>
          <p>Customer: {order.customerName} ({order.customerContact})</p>
          <Link href={`/admin/orders/${order.id}`}>View detail</Link>
        </div>
      ))}
    </div>
  );
}

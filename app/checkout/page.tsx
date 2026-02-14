"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (items.length === 0) return;
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName, customerContact, items })
    });
    setLoading(false);
    if (!res.ok) return;
    const data = await res.json();
    clearCart();
    router.push(`/order/${data.orderNumber}`);
  };

  return (
    <div className="grid">
      <h1>Checkout</h1>
      <div className="card">
        <label>Name</label>
        <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        <label style={{ marginTop: 10, display: "block" }}>Contact (Email/LINE/Telegram)</label>
        <input value={customerContact} onChange={(e) => setCustomerContact(e.target.value)} />
      </div>
      <div className="card">
        <h3>Order Summary</h3>
        {items.map((item) => (
          <p key={item.productId}>{item.name} x {item.quantity}</p>
        ))}
        <p><strong>Total: {formatPrice(total)}</strong></p>
        <button disabled={loading || !customerName || !customerContact} onClick={submit}>
          {loading ? "Creating Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="card">
        <h1>Your Cart</h1>
        <p>Cart is empty.</p>
        <Link href="/">Go shopping</Link>
      </div>
    );
  }

  return (
    <div className="grid">
      <h1>Your Cart</h1>
      {items.map((item) => (
        <div className="card" key={item.productId}>
          <h3>{item.name}</h3>
          <p>{formatPrice(item.price)}</p>
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
          />
          <button onClick={() => removeItem(item.productId)}>Remove</button>
        </div>
      ))}
      <div className="card">
        <h3>Total: {formatPrice(total)}</h3>
        <Link href="/checkout">Proceed to Checkout</Link>
      </div>
    </div>
  );
}

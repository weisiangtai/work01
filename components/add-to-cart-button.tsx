"use client";

import { useCart } from "@/components/cart-context";

export function AddToCartButton({
  product
}: {
  product: { id: number; name: string; price: number };
}) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() => addItem({ productId: product.id, name: product.name, price: product.price })}
      style={{ padding: "8px 14px", background: "#111", color: "white", borderRadius: 8 }}
    >
      Add to Cart
    </button>
  );
}

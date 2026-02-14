import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: Number(params.id) } });
  if (!product) return notFound();

  return (
    <div className="card">
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p><strong>{formatPrice(product.price)}</strong></p>
      <AddToCartButton product={{ id: product.id, name: product.name, price: product.price }} />
    </div>
  );
}

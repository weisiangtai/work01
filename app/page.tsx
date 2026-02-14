import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function HomePage() {
  const products = await prisma.product.findMany({ where: { isActive: true }, include: { category: true } });

  return (
    <div className="grid">
      <h1>Products</h1>
      {products.map((product) => (
        <div className="card" key={product.id}>
          <p style={{ color: "#666", marginTop: 0 }}>{product.category.name}</p>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <p><strong>{formatPrice(product.price)}</strong></p>
          <Link href={`/product/${product.id}`}>View product</Link>
        </div>
      ))}
    </div>
  );
}

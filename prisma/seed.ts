import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const software = await prisma.category.upsert({
    where: { name: "Digital Software" },
    update: {},
    create: { name: "Digital Software" }
  });

  const products = [
    {
      name: "Pro Design Pack",
      slug: "pro-design-pack",
      description: "200+ templates and social media assets.",
      price: 990
    },
    {
      name: "Notion Business OS",
      slug: "notion-business-os",
      description: "Complete Notion workspace for business operations.",
      price: 1490
    },
    {
      name: "AI Prompt Vault",
      slug: "ai-prompt-vault",
      description: "Curated prompt library for marketing, coding, and sales.",
      price: 790
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: { ...product, categoryId: software.id }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

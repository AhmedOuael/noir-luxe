// Placeholder catalog (the products that used to be hardcoded in lib/products.ts)
// so the storefront, cart and checkout work end to end before the real catalog
// is entered. Re-running only adds missing products; existing ones (and their
// stock) are never modified. Run with: npx tsx prisma/seed-demo-products.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type DemoProduct = {
  slug: string;
  skuPrefix: string;
  name: string;
  category: string;
  color: string;
  price: number;
  description: string;
  details: string[];
  images: string[]; // first one is primary
  sizes: Record<string, number>; // size -> stock
  limited?: boolean;
};

const demoProducts: DemoProduct[] = [
  {
    slug: "heavy-box-hoodie",
    skuPrefix: "NR-H-001",
    name: "Heavy Box Hoodie",
    category: "Tops",
    color: "Pitch Black",
    price: 14500,
    description:
      "An oversized, heavyweight hoodie built from 450GSM brushed cotton. Structured box fit with a dropped shoulder and minimal embroidered wordmark.",
    details: ["450GSM cotton fleece", "Boxy, oversized fit", "Ribbed cuffs & hem", "Made & finished in Algeria"],
    images: ["/images/shirt.jpg"],
    sizes: { S: 12, M: 24, L: 8, XL: 0 },
  },
  {
    slug: "archival-overcoat",
    skuPrefix: "NR-C-002",
    name: "Archival Overcoat",
    category: "Outerwear",
    color: "Charcoal Grey",
    price: 42000,
    description:
      "A tailored wool overcoat with sharp lapel construction and a high-density weave. Cut for a structured, architectural silhouette.",
    details: ["High-density wool blend", "Structured tailored fit", "Interior pocket", "Dry clean only"],
    images: ["/images/shirt1.jpg"],
    sizes: { S: 4, M: 15, L: 20, XL: 5 },
  },
  {
    slug: "phantom-low-top",
    skuPrefix: "NR-S-003",
    name: "Phantom Low-Top",
    category: "Accessories",
    color: "Optic White",
    price: 18200,
    description: "Minimalist low-top leather sneakers with a clean silhouette and a thick off-white rubber sole.",
    details: ["Full-grain leather upper", "Rubber cupsole", "Comes with spare laces"],
    images: ["/images/shirt2.jpg"],
    sizes: { S: 10, M: 20, L: 14, XL: 6 },
  },
  {
    slug: "cargo-tech-trousers",
    skuPrefix: "NR-P-042",
    name: "Cargo Tech Trousers",
    category: "Bottoms",
    color: "Muted Olive",
    price: 16800,
    description: "Wide-leg tactical trousers in ripstop nylon with hidden zip pockets and adjustable hems.",
    details: ["Ripstop technical nylon", "Hidden zip cargo pockets", "Adjustable hem cuffs"],
    images: ["/images/shirt3.jpg"],
    sizes: { S: 20, M: 32, L: 18, XL: 10 },
  },
  {
    slug: "vantablack-puffer",
    skuPrefix: "NR-C-011",
    name: "Vantablack Puffer",
    category: "Outerwear",
    color: "Vantablack",
    price: 32500,
    description: "A technical, insulated puffer jacket with a matte deadstock nylon shell built for cold-weather cities.",
    details: ["Deadstock matte nylon shell", "Recycled fill insulation", "Storm cuffs"],
    images: ["/images/back.jpg"],
    sizes: { S: 6, M: 18, L: 12, XL: 4 },
    limited: true,
  },
  {
    slug: "sand-wash-hoodie",
    skuPrefix: "NR-H-014",
    name: "Sand Wash Hoodie",
    category: "Tops",
    color: "Sand Wash",
    price: 14200,
    description: "Garment-dyed hoodie with a soft, broken-in hand-feel from the first wear.",
    details: ["380GSM garment-dyed fleece", "Relaxed fit", "Kangaroo pocket"],
    images: ["/images/back2.jpg"],
    sizes: { S: 9, M: 21, L: 16, XL: 7 },
  },
];

async function main() {
  console.log("Seeding demo products...");
  let created = 0;

  for (const demo of demoProducts) {
    // Only create what's missing: an existing product may have real stock,
    // reservations or edits that a rerun must never overwrite.
    if (await prisma.product.findUnique({ where: { slug: demo.slug }, select: { id: true } })) continue;

    await prisma.product.create({
      data: {
        slug: demo.slug,
        name: demo.name,
        description: demo.description,
        details: demo.details,
        limited: demo.limited ?? false,
        categories: {
          create: {
            category: { connectOrCreate: { where: { name: demo.category }, create: { name: demo.category } } },
          },
        },
        images: {
          create: demo.images.map((imageUrl, i) => ({ imageUrl, isPrimary: i === 0, displayOrder: i })),
        },
        variants: {
          create: Object.entries(demo.sizes).map(([size, stock]) => ({
            sku: `${demo.skuPrefix}-${size}`,
            size,
            color: demo.color,
            price: demo.price,
            physicalStock: stock,
          })),
        },
      },
    });
    created++;
  }

  console.log(`Created ${created} demo products (${demoProducts.length - created} already existed, left untouched).`);
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
})();

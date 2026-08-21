// Temporary in-memory product catalog.
// In phase 2 this file gets replaced by real database queries (Postgres/Prisma),
// and the data itself gets managed from /admin instead of hardcoded here.

export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: "Outerwear" | "Tops" | "Bottoms" | "Accessories";
  colorName: string;
  price: number; // DZD
  description: string;
  details: string[];
  image: string; // primary image
  gallery: string[];
  sizes: Partial<Record<Size, number>>; // size -> stock count
  qrcode?: string; // optional QR code 
  limited?: boolean; // optional flag for limited edition products
  
};

export const products: Product[] = [
  {
    id: "1",
    slug: "heavy-box-hoodie",
    sku: "NR-H-001",
    name: "Heavy Box Hoodie",
    category: "Tops",
    colorName: "Pitch Black",
    price: 14500,
    description:
      "An oversized, heavyweight hoodie built from 450GSM brushed cotton. Structured box fit with a dropped shoulder and minimal embroidered wordmark.",
    details: ["450GSM cotton fleece", "Boxy, oversized fit", "Ribbed cuffs & hem", "Made & finished in Algeria"],
    image: "/images/shirt.jpg",
    gallery: [
      "",
    ],
    sizes: { S: 12, M: 24, L: 8, XL: 0 },
  },
  {
    id: "2",
    slug: "archival-overcoat",
    sku: "NR-C-002",
    name: "Archival Overcoat",
    category: "Outerwear",
    colorName: "Charcoal Grey",
    price: 42000,
    description:
      "A tailored wool overcoat with sharp lapel construction and a high-density weave. Cut for a structured, architectural silhouette.",
    details: ["High-density wool blend", "Structured tailored fit", "Interior pocket", "Dry clean only"],
    image: "/images/shirt1.jpg",
    gallery: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCsM3KsAWNUNG-DbgLq7gaCKUPXHv3Sxoh8XmySXbZgwWhbXq-YFnLkwhTwCCLoX3If4nDnqKH7lmYJMjva4cL-8P-GnxDaKitC_VmT_DQ-aOBHQdjMuAqPjcwlv2YaVZhoxlUkpzOalOatBEmlpsN1vv1xmtFokQh7Dv47FKFuC91HDgMhKrljo_Gb1v2uQMqQR2hYDHh8Q80BI2tnxH38bKtvHra14PrA6uGVWXTZfEyoOOb6Qpl6qs58wzUtiYAvOGZ3DkcPeyPp",
    ],
    sizes: { S: 4, M: 15, L: 20, XL: 5 },
  },
  {
    id: "3",
    slug: "phantom-low-top",
    sku: "NR-S-003",
    name: "Phantom Low-Top",
    category: "Accessories",
    colorName: "Optic White",
    price: 18200,
    description:
      "Minimalist low-top leather sneakers with a clean silhouette and a thick off-white rubber sole.",
    details: ["Full-grain leather upper", "Rubber cupsole", "Comes with spare laces"],
    image: "/images/shirt2.jpg",
    gallery: [],
    sizes: { S: 10, M: 20, L: 14, XL: 6 },
  },
  {
    id: "4",
    slug: "cargo-tech-trousers",
    sku: "NR-P-042",
    name: "Cargo Tech Trousers",
    category: "Bottoms",
    colorName: "Muted Olive",
    price: 16800,
    description:
      "Wide-leg tactical trousers in ripstop nylon with hidden zip pockets and adjustable hems.",
    details: ["Ripstop technical nylon", "Hidden zip cargo pockets", "Adjustable hem cuffs"],
    image:
      "/images/shirt3.jpg",
    gallery: [],
    sizes: { S: 20, M: 32, L: 18, XL: 10 },
  },
  {
    id: "5",
    slug: "vantablack-puffer",
    sku: "NR-C-011",
    name: "Vantablack Puffer",
    category: "Outerwear",
    colorName: "Vantablack",
    price: 32500,
    description: "A technical, insulated puffer jacket with a matte deadstock nylon shell built for cold-weather cities.",
    details: ["Deadstock matte nylon shell", "Recycled fill insulation", "Storm cuffs"],
    image: "/images/back.jpg",
    gallery: [],
    sizes: { S: 6, M: 18, L: 12, XL: 4 },
    limited: true,
  },
  {
    id: "6",
    slug: "sand-wash-hoodie",
    sku: "NR-H-014",
    name: "Sand Wash Hoodie",
    category: "Tops",
    colorName: "Sand Wash",
    price: 14200,
    description: "Garment-dyed hoodie with a soft, broken-in hand-feel from the first wear.",
    details: ["380GSM garment-dyed fleece", "Relaxed fit", "Kangaroo pocket"],
    image: "/images/back2.jpg",
    gallery: [],
    sizes: { S: 9, M: 21, L: 16, XL: 7 },
  },
];

export function getAllProducts() {
  return products;
}

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug) ?? null;
}

export function getCategories() {
  return Array.from(new Set(products.map((p) => p.category)));
}

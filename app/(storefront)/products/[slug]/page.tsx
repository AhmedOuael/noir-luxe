import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import ProductDetailClient from "./ProductDetailClient";

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}

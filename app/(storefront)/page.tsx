import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import NewsletterForm from "@/components/NewsletterForm";
import Hero from "@/components/Hero";
import { getProducts } from "@/lib/catalog";

// Stock/prices change with orders; re-render at most once a minute.
export const revalidate = 60;

export default async function HomePage() {
  const featured = (await getProducts()).slice(0, 4);

  return (
    <div>
      <Hero />

      {/* Curated edit */}
      <section className="py-24 md:py-32 px-5 md:px-16">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h3 className="font-display text-2xl md:text-3xl mb-2">Curated Edit</h3>
            <p className="text-secondary">Selected essentials for the contemporary wardrobe.</p>
          </div>
          <Link href="/products" className="hidden md:flex items-center gap-2 text-xs font-medium tracking-label uppercase hover:gap-4 transition-all">
            View All Products →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <Link href="/products" className="md:hidden mt-10 flex items-center justify-center gap-2 text-xs font-medium tracking-label uppercase">
          View All Products →
        </Link>
      </section>

      {/* Brand ethos */}
      <section className="py-24 md:py-32 px-5 md:px-16 bg-surface-container-low">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-medium tracking-label uppercase text-secondary block mb-6">Our Ethos</span>
            <h2 className="font-display text-3xl md:text-5xl mb-8 leading-tight">
              SUSTAINABLE SOPHISTICATION
            </h2>
            <div className="space-y-6 text-lg text-on-surface-variant max-w-lg">
              <p>
                At NOIR, we believe that the true essence of luxury lies in longevity. Our garments are
                investments in structural design and ethical craftsmanship, not seasonal trends.
              </p>
              <p>
                Every piece is sourced from sustainable mills in North Africa and assembled with meticulous
                attention to detail — durability over speed.
              </p>
              <p className="italic font-display text-primary text-xl">— Excellence in every thread.</p>
            </div>
            <Link href="/about" className="inline-block mt-12 border-b-2 border-primary pb-1 text-sm font-medium tracking-label uppercase hover:text-secondary hover:border-secondary transition-all">
              Read the Full Manifesto
            </Link>
          </div>
          <div className="aspect-4/5 overflow-hidden">
            <Image
              src="/images/product1.jpg"
              alt="Designer portrait in the atelier"
              width={800}
              height={1000}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 md:py-32 px-5 md:px-16 text-center bg-primary text-on-primary">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl mb-4">JOIN THE INNER CIRCLE</h2>
          <p className="text-white/60 mb-10">
            Subscribe to receive early access to new drops and exclusive archival releases.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}

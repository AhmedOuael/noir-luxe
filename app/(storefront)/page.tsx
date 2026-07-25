import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import NewsletterForm from "@/components/NewsletterForm";
import { getAllProducts } from "@/lib/products";

export default function HomePage() {
  const featured = getAllProducts().slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[92vh] w-full overflow-hidden">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdKtin68mPFzO9sym2Ob9V7XjLd6BsNZp9AjbDXXjFzPIoSjfoL0SRc88-tMkC9pvot5EufIYwBTWjGMe137-VcvlepVMh76Ei3xiTdobYStR4seuAlBdXYsR_1rLma3MBw2KrVH71Kn-hsGPGm3qOkj_UzMK5JnEDrajWiqWLtJrk4fC7KGsrbbRZDhYQvHZ1TaCCzAcoQCLLajZJBEJjFVDCeX7_oMr8VCAQF_KmX4TynDU0Jl60yuCFgJsXD2KaVppdu11q0Rsx"
          alt="NOIR Autumn/Winter collection editorial"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5">
          <p className="text-xs tracking-[0.3em] text-white uppercase mb-4">Autumn / Winter 2026</p>
          <h1 className="font-display text-4xl md:text-6xl text-white mb-6 max-w-4xl">
            ESSENTIAL COLLECTION 2026
          </h1>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Engineered silhouettes that redefine modern luxury through structural integrity and archival research.
          </p>
          <Link
            href="/products"
            className="bg-white text-black px-10 py-4 rounded-full text-sm font-medium tracking-label uppercase hover:bg-black hover:text-white transition-all duration-500 scale-100 hover:scale-105 active:scale-95"
          >
            Explore Collection
          </Link>
        </div>
      </section>

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
          <div className="aspect-[4/5] overflow-hidden">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBS0LVlFwuWA88piskq8SHBhDJ8V7n9Dw97Hm8PdCME0r0wknXc8EQnKY1zxsRR062-ZzSoevETWBxNspH1zb6p99smxk5A6pjmMwU0YtMvstpYQPd2BNX2VuM2GXqjZKdvKQ9pjzMn39aYj7Nz5dh_J4YOjMekrLzrQssJ29rYLFuMXDYQEozG_XUjZck-LQDV1Wbz_mF-9upSoHivncq_W5oSmVvcySoXYd4OzGe38ha9rMz_2b0ogdseoQoEIcDMwx39kii8O1"
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

import Image from "next/image";

export default function AboutPage() {
  return (
    <div>
      {/* Editorial split hero */}
      <section className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 h-[70vh] md:h-[calc(100vh-72px)] md:sticky md:top-18 overflow-hidden">
          <Image
            src="/images/product4.jpg"
            alt="NOIR editorial portrait"
            fill
            className="object-cover grayscale"
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center px-5 md:px-16 py-20">
          <span className="text-xs tracking-label uppercase text-secondary mb-4">Est. 2024</span>
          <h1 className="font-display text-4xl md:text-6xl mb-8">
            Quiet Luxury, <br />
            <span className="italic">Loud Precision.</span>
          </h1>
          <div className="space-y-10 max-w-xl">
            <p className="text-lg leading-relaxed">
              NOIR is a dialogue between Scandinavian functionalism and the raw energy of urban streetwear.
              We strip away the unnecessary to reveal the essential — creating a wardrobe that speaks of
              exclusivity through silence.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-outline-variant pt-10">
              <div>
                <h3 className="text-xs font-semibold tracking-label uppercase mb-3">Brand Origin</h3>
                <p className="text-secondary text-sm">
                  Born from a desire to redefine luxury, our pieces are designed in a high-concept studio
                  focusing on architectural silhouettes and enduring forms.
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold tracking-label uppercase mb-3">Crafted in Algeria</h3>
                <p className="text-secondary text-sm">
                  Our local production hub prioritizes ethical labor and artisan mastery, blending heritage
                  techniques with modern digital precision.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Materials */}
      <section className="px-5 md:px-16 py-24 bg-surface-container-low">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl text-primary mb-4">The Materiality of Noir</h2>
            <p className="text-secondary">Every fiber is selected for its sensory impact and longevity.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 bg-surface-container-lowest overflow-hidden group">
            <div className="aspect-video w-full overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPDf61VQHNqDNHuMa-Xmk8rhgcbPrufwcrQ1__nmS8fhKdxh7dZzLvZScldeZA9-ws8FeL4mz8N_ROlPGCGhpFGaA-NAcnAp_ItQqNezJGX1i_hgeQKvJk9dTYxhElR_qajzali589RrndmlRcxVqSTaGXXKoncBJrXKBRjYz2h8ESRmoQiu4Ld01MaJQ9hc47SwKRsjTUsG22Og0zZg846YpRTnS8XBuqTPiOSpvYfqBOt48trbx32cgn0zEcX136bivYPWxH3LIK"
                alt="Raw denim material detail"
                width={1400}
                height={800}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <h4 className="font-display text-xl mb-2">Technical Heavyweights</h4>
              <p className="text-secondary max-w-lg">
                From 400gsm cotton jerseys to technical nylons, our materials are chosen for their structural
                integrity and their ability to age beautifully over time.
              </p>
            </div>
          </div>
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-primary text-on-primary p-10 flex-1 flex flex-col justify-end">
              <span className="text-xs tracking-label uppercase opacity-70 mb-4">01 / Production</span>
              <h4 className="font-display text-xl">Zero Waste Philosophy</h4>
            </div>
            <div className="bg-surface-container-highest p-10 flex-1 flex flex-col justify-end">
              <span className="text-xs tracking-label uppercase text-secondary mb-4">02 / Logistics</span>
              <h4 className="font-display text-xl">Seamless Local Fulfillment</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto quote */}
      <section className="py-24 flex flex-col items-center text-center px-5">
        <div className="max-w-4xl space-y-8">
          <blockquote className="font-display text-3xl md:text-5xl leading-tight">
            &ldquo;Luxury is not an ornament. <br />
            It is the <span className="italic font-normal">absolute clarity</span> of purpose.&rdquo;
          </blockquote>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary">The NOIR Manifesto</p>
        </div>
      </section>

      {/* Local logistics */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-t border-outline-variant">
        <div className="p-5 md:p-16 border-b md:border-b-0 md:border-r border-outline-variant flex flex-col justify-center">
          <h3 className="font-display text-3xl mb-6">Designed for the Modern Algiers.</h3>
          <p className="text-secondary mb-10 max-w-md">
            Our logistical partnership with Yalidine ensures that high-fashion is accessible across every
            wilaya, matching global aesthetic standards with local operational excellence.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">📦</div>
              <p className="text-xs font-medium tracking-label uppercase">58 Wilayas Covered</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">💳</div>
              <p className="text-xs font-medium tracking-label uppercase">Cash on Delivery</p>
            </div>
          </div>
        </div>
        <div className="h-[60vh] md:h-auto">
          <Image
            src="/images/annaba.jpg"
            alt="Algiers modernist architecture"
            width={1200}
            height={900}
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    </div>
  );
}

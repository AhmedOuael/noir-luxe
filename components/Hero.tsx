import Image from "next/image";
import Link from "next/link";
import { imageUrl } from "@/lib/images";

// Everything that changes with a new campaign image lives here.
// `src` is a /public path for now; later a CDN key like "campaign/aw26/01.jpg".
// `focal` frames the photo per screen: phones show the wardrobe and shirts,
// wide screens the whole room. The text sits where the photo is darkest:
// the wardrobe floor on phones/tablets, the upper wall on desktop. A new
// photo with a different layout may need these positions adjusted.
const HERO = {
  src: "/images/hero-wardrobe.jpg",
  alt: "Dark jackets and white shirts in a softly lit wardrobe, late sun on the wall",
  focal: "object-[18%_center] md:object-[22%_center] lg:object-center",
  title: "Autumn–Winter 2026",
  text: "Heavyweight cotton, wool and nylon, cut and finished in Algeria.",
  link: { label: "Shop the collection", href: "/products" },
};

export default function Hero() {
  const src = imageUrl(HERO.src);

  return (
    <section className="relative isolate h-[calc(100svh-4.5rem)] min-h-136 overflow-hidden bg-umber">
      {src && (
        <Image
          src={src}
          alt={HERO.alt}
          fill
          preload
          quality={90}
          // On screens taller than 16:9 the photo fills the height, so it renders
          // wider than the screen (~178vh). Telling the browser so makes phones
          // download the full-resolution file instead of a too-small one.
          sizes="(max-aspect-ratio: 16/9) 178vh, 100vw"
          className={`-z-10 object-cover motion-safe:animate-hero-photo ${HERO.focal}`}
        />
      )}
      {/* Phones/tablets: deepen the wardrobe floor under the text. Desktop text sits on the dark wall and needs none. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-umber/85 via-umber/30 via-45% to-transparent lg:hidden" />

      <div className="absolute inset-x-5 bottom-12 md:inset-x-16 md:bottom-16 lg:inset-x-auto lg:bottom-auto lg:left-[46%] lg:top-[13%] lg:right-16 max-w-xl">
        <h1 className="font-display font-normal text-ivory text-[2.75rem] leading-[1.02] tracking-[-0.015em] md:text-[4rem] lg:text-[clamp(3.5rem,4.6vw,5.25rem)] motion-safe:animate-hero-text">
          {HERO.title}
        </h1>
        <p className="mt-5 max-w-[34ch] text-[1.0625rem] leading-relaxed text-ivory-muted md:text-lg motion-safe:animate-hero-text motion-safe:[animation-delay:150ms]">
          {HERO.text}
        </p>
        <Link
          href={HERO.link.href}
          className="mt-9 inline-block rounded-xs bg-ivory px-7 py-3.5 text-[0.9375rem] font-medium text-black transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory motion-safe:animate-hero-text motion-safe:[animation-delay:300ms]"
        >
          {HERO.link.label}
        </Link>
      </div>
    </section>
  );
}

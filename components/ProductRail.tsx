"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import Reveal from "./motion/Reveal";
import type { CatalogProduct } from "@/lib/catalog";

// Horizontal product row: native overflow scrolling with snap points, so touch
// swiping is the browser's own (fastest possible); arrows and mouse-drag are
// added for desktop. No carousel library.
export default function ProductRail({ products, label, header }: { products: CatalogProduct[]; label: string; header?: React.ReactNode }) {
  const rail = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const updateEnds = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    updateEnds();
    el.addEventListener("scroll", updateEnds, { passive: true });
    window.addEventListener("resize", updateEnds);
    return () => {
      el.removeEventListener("scroll", updateEnds);
      window.removeEventListener("resize", updateEnds);
    };
  }, [updateEnds]);

  const page = (dir: -1 | 1) => {
    const el = rail.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
  };

  // Mouse drag (touch already scrolls natively). Snapping is paused while dragging.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !rail.current) return;
    drag.current = { x: e.clientX, left: rail.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = rail.current;
    if (!drag.current || !el) return;
    const dx = e.clientX - drag.current.x;
    if (!drag.current.moved && Math.abs(dx) > 5) {
      drag.current.moved = true;
      el.setPointerCapture(e.pointerId);
      el.style.scrollSnapType = "none";
      el.style.cursor = "grabbing";
    }
    if (drag.current.moved) el.scrollLeft = drag.current.left - dx;
  };
  const endDrag = (e: React.PointerEvent) => {
    const el = rail.current;
    if (!drag.current || !el) return;
    const wasDrag = drag.current.moved;
    drag.current = null;
    if (!wasDrag) return;
    el.releasePointerCapture?.(e.pointerId);
    el.style.cursor = "";
    // Re-enable snapping and settle on the nearest card.
    const left = el.scrollLeft;
    el.style.scrollSnapType = "";
    el.scrollLeft = left;
    // Swallow the click that follows a drag so it doesn't open a product.
    el.addEventListener("click", (ev) => ev.preventDefault(), { capture: true, once: true });
  };

  const arrow =
    "w-11 h-11 rounded-full border border-outline-variant flex items-center justify-center transition-colors hover:border-primary disabled:opacity-30 disabled:hover:border-outline-variant";

  return (
    <div>
      {/* Section header with the arrows on the same line (arrows are desktop-only; touch swipes) */}
      <div className="flex items-end justify-between gap-6 mb-12">
        <div className="flex-1 min-w-0">{header}</div>
        <div className="hidden md:flex gap-2 shrink-0">
          <button type="button" onClick={() => page(-1)} disabled={atStart} aria-label="Previous products" className={arrow}>
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => page(1)} disabled={atEnd} aria-label="Next products" className={arrow}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <ul
        ref={rail}
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="hide-scrollbar flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory overscroll-x-contain -mx-5 px-5 scroll-px-5 md:-mx-16 md:px-16 md:scroll-px-16 select-none"
      >
        {products.map((p, i) => (
          <Reveal
            key={p.id}
            as="li"
            delay={(i % 4) * 120}
            className="snap-start shrink-0 w-[72%] sm:w-[44%] md:w-[31%] lg:w-[calc((100%-6rem)/4)]"
          >
            <div draggable={false} onDragStart={(e) => e.preventDefault()}>
              <ProductCard product={p} />
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

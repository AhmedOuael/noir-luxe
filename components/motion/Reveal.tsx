"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

// Fades content in as it scrolls into view (opacity + transform only, so it
// runs on the compositor and never blocks scrolling). Progressive enhancement:
// the server renders everything visible; only elements that are still below
// the fold when the page loads get hidden, so there is no flash, nothing is
// lost without JavaScript, and above-the-fold content (LCP) is never delayed.

let observer: IntersectionObserver | null = null;
function getObserver() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.reveal = "shown";
        observer!.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0 }
  );
  return observer;
}

export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  delay?: number; // ms, for staggering siblings
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return; // already on screen: leave it be
    el.dataset.reveal = "hidden";
    const io = getObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  return (
    <Tag ref={ref} className={className} style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}>
      {children}
    </Tag>
  );
}

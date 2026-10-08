"use client";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

// Smooths mouse-wheel scrolling on desktop. Touch scrolling stays native
// (syncTouch is off by default) and Lenis disables itself for visitors who
// ask for reduced motion (respectReducedMotion defaults to true).
export default function SmoothScroll() {
  return <ReactLenis root options={{ lerp: 0.1, stopInertiaOnNavigate: true }} />;
}

"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return <p className="text-white/80">Thanks — you&apos;re on the list.</p>;
  }

  return (
    <form
      className="flex flex-col md:flex-row gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <input
        type="email"
        required
        placeholder="EMAIL ADDRESS"
        className="flex-1 bg-transparent border-b border-white/30 text-white text-xs tracking-label px-4 py-4 focus:outline-none focus:border-white transition-colors placeholder:text-white/30"
      />
      <button className="bg-white text-black px-12 py-4 rounded-full text-sm font-medium tracking-label uppercase hover:bg-surface-variant transition-all">
        Subscribe
      </button>
    </form>
  );
}

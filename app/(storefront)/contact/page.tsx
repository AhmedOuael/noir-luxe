"use client";

import { useState, FormEvent } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="px-5 md:px-16 py-20">
      <div className="max-w-xl mb-16">
        <h1 className="font-display text-3xl md:text-5xl mb-6">Connect with NOIR</h1>
        <p className="text-secondary text-lg">
          Our team is available to assist with inquiries regarding limited drops, private showings, and
          bespoke tailoring services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field label="Name" name="name" type="text" required />
            <Field label="Email" name="email" type="email" required />
          </div>
          <Field label="Phone (Optional)" name="phone" type="tel" />
          <Field label="Subject" name="subject" type="text" required />
          <div className="floating-label-group relative">
            <textarea
              name="message"
              required
              placeholder=" "
              rows={5}
              className="w-full bg-transparent border-b border-outline pt-6 pb-2 focus:outline-none focus:border-primary transition-colors peer"
            />
            <label className="absolute top-1 left-0 text-xs text-secondary peer-focus:text-primary">
              Message
            </label>
          </div>

          <button
            disabled={status === "sending"}
            className="bg-primary text-on-primary px-10 py-4 rounded-full text-sm font-medium tracking-label uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Send Message →"}
          </button>

          {status === "sent" && <p className="text-sm text-accent">Thanks — we&apos;ll get back to you shortly.</p>}
          {status === "error" && (
            <p className="text-sm text-error">
              Something went wrong. Try again, or email concierge@noirluxe.com directly.
            </p>
          )}
          <p className="text-xs text-secondary">🔒 Secure messaging via SSL</p>
        </form>

        {/* Details */}
        <div className="space-y-12">
          <div>
            <h3 className="text-xs font-semibold tracking-label uppercase mb-3">General Inquiries</h3>
            <a href="mailto:concierge@noirluxe.com" className="text-lg hover:underline">
              concierge@noirluxe.com
            </a>
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-label uppercase mb-3">Customer Service Hours</h3>
            <p className="text-secondary">Sunday – Thursday: 09:00 – 18:00 (Algiers time)</p>
            <p className="text-secondary">Friday – Saturday: Closed</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-label uppercase mb-3">Studio &amp; Fulfillment</h3>
            <p className="text-secondary">Algiers, Algeria</p>
            <p className="text-secondary">Nationwide delivery via Yalidine — all 58 wilayas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  required,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <input
        name={name}
        type={type}
        required={required}
        placeholder=" "
        className="peer w-full bg-transparent border-b border-outline pt-6 pb-2 focus:outline-none focus:border-primary transition-colors"
      />
      <label className="absolute top-1 left-0 text-xs text-secondary peer-focus:text-primary">
        {label}
      </label>
    </div>
  );
}

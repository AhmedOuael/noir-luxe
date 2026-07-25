import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-outline-variant bg-surface">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-5 md:px-16 py-20">
        <div className="space-y-6">
          <h2 className="font-display text-3xl text-primary">NOIR</h2>
          <p className="text-sm text-secondary max-w-xs">
            The intersection of archival research and modern streetwear utility. Designed in Algiers.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold tracking-label uppercase mb-6">Client Services</h4>
          <ul className="space-y-4 text-sm text-secondary">
            <li><Link href="/contact" className="hover:underline">Contact Us</Link></li>
            <li><Link href="#" className="hover:underline">Shipping Policy</Link></li>
            <li><Link href="#" className="hover:underline">Returns &amp; Exchanges</Link></li>
            <li><Link href="#" className="hover:underline">Size Guide</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold tracking-label uppercase mb-6">The Brand</h4>
          <ul className="space-y-4 text-sm text-secondary">
            <li><Link href="/about" className="hover:underline">About Us</Link></li>
            <li><Link href="#" className="hover:underline">Sustainability</Link></li>
            <li><Link href="#" className="hover:underline">Terms of Service</Link></li>
            <li><Link href="#" className="hover:underline">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold tracking-label uppercase mb-6">Secure Payments</h4>
          <p className="text-sm text-secondary mb-6">We support local and international payment methods.</p>
          <div className="grid grid-cols-4 gap-3">
            {["CIB", "BaridiMob", "eCCP", "COD"].map((m) => (
              <div key={m} className="h-9 bg-surface-container rounded-sm flex items-center justify-center text-[9px] font-bold">
                {m}
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-secondary italic">Shipping nationwide via Yalidine — 58 wilayas covered.</p>
        </div>
      </div>

      <div className="px-5 md:px-16 py-6 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-2">
        <p className="text-[10px] tracking-label text-secondary">© {new Date().getFullYear()} NOIR LUXE. ALL RIGHTS RESERVED.</p>
        <p className="text-[10px] tracking-label text-secondary">DESIGNED IN ALGIERS</p>
      </div>
    </footer>
  );
}

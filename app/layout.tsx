import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOIR | Luxury Streetwear",
  description: "Engineered silhouettes that redefine modern luxury through structural integrity and archival research.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen antialiased bg-surface text-on-surface" suppressHydrationWarning>{children}</body>
    </html>
  );
}

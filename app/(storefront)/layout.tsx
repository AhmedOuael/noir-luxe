import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pt-[72px]">{children}</main>
      <Footer />
    </>
  );
}

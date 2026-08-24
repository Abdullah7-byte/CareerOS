import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#e9e7e2] p-2 sm:p-5 lg:p-8">
      <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[28px] border border-white/80 bg-[#f7f5f1] shadow-[0_28px_90px_rgba(43,42,38,0.11)] sm:rounded-[38px]">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}

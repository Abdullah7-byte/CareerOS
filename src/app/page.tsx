import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#e9e7e2] px-3 py-3 sm:px-6 sm:py-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[30px] border border-white/70 bg-[#f5f3ef] shadow-[0_24px_70px_rgba(43,42,38,0.10)] sm:rounded-[42px]">
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

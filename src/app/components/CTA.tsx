import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="px-3 pb-3 pt-6 sm:px-5 sm:pb-5 sm:pt-8 lg:px-7">
      <div className="mx-auto max-w-6xl rounded-[25px] border border-white/[0.08] bg-[#252a28] px-6 py-11 text-center text-white shadow-[0_20px_42px_rgba(42,39,35,0.16)] sm:rounded-[30px] sm:px-10 sm:py-14">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">One connected workflow</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">Built around the match.</h2>

        <div className="mx-auto mb-8 mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-2 text-xs font-medium text-white/70 sm:gap-3">
          <div className="flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] px-4">
            Build Resume
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-white/35" />
          <div className="flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] px-4">
            Discover
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-white/35" />
          <div className="flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] px-4">
            Match
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-white/35" />
          <div className="flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] px-4">
            Apply
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-white/35" />
          <div className="flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] px-4">
            Track
          </div>
        </div>

        <Link href="/register">
          <Button className="h-10 rounded-full bg-white px-5 text-xs text-foreground hover:bg-white/90">
            Create an account
          </Button>
        </Link>
      </div>
    </section>
  );
}

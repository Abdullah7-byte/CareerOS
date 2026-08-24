import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { MatchAnalysisPreview } from "@/components/dashboard/candidate/match-analysis";

export default function Hero() {
  return (
    <section className="px-2 pb-5 pt-5 sm:px-5 sm:pb-8 sm:pt-8 lg:px-7">
      <div className="relative isolate overflow-hidden rounded-[24px] border border-white/90 bg-[#e9e8e4]/95 px-6 py-12 sm:rounded-[32px] sm:px-10 sm:py-16 lg:min-h-[570px] lg:px-16 lg:py-18">
        <div className="absolute bottom-0 left-[48%] h-px w-2/5 bg-black/[0.07]" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-16">
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">A considered career workspace</p>
            <h1 className="mt-6 text-[2.7rem] font-bold leading-[0.98] tracking-[-0.065em] text-foreground sm:text-6xl lg:text-[4.5rem]">
              Your career,<br />in one workspace.
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-text-secondary sm:text-lg">
              Build the right resume, find better-fit roles, and track every application in one place.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/register"><Button size="lg" className="rounded-full px-6 text-sm">Get started <ArrowUpRight className="ml-1 h-4 w-4" /></Button></Link>
              <span className="text-xs text-text-muted">For candidates and employers</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[410px] lg:mr-10 lg:rotate-[1.5deg]">
            <div className="absolute inset-5 translate-x-4 translate-y-5 rounded-[22px] border border-black/[0.06] bg-[#d8d7d1]" />
            <div className="relative rounded-[22px] shadow-[0_26px_55px_rgba(42,39,35,0.16)]">
              <MatchAnalysisPreview showExampleLabel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

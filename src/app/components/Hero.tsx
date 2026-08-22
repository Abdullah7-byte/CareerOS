import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { MatchAnalysisPreview } from "@/components/dashboard/candidate/match-analysis";

export default function Hero() {
  return (
    <section className="px-3 pb-3 pt-5 sm:px-5 sm:pb-5 sm:pt-8 lg:px-7">
      <div className="relative overflow-hidden rounded-[25px] border border-white bg-[#e9e8e4] px-6 py-12 sm:rounded-[34px] sm:px-10 sm:py-16 lg:min-h-[570px] lg:px-16 lg:py-20">
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div className="max-w-xl">
            <h1 className="mt-7 text-[2.7rem] font-bold leading-[0.98] tracking-[-0.065em] text-foreground sm:text-6xl lg:text-[4.35rem]">
              Your career,<br />in one workspace.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-text-secondary sm:text-lg">
              Build your resume. Discover relevant jobs. Apply with the right resume. Track it.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/register"><Button size="lg" className="rounded-full px-6 text-sm">Get started <ArrowUpRight className="ml-1 h-4 w-4" /></Button></Link>
              <span className="text-xs text-text-muted">For candidates and employers</span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[390px] lg:rotate-[2deg]">
            <MatchAnalysisPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

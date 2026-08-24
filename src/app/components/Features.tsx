import Image, { type StaticImageData } from "next/image";
import { ArrowDownRight, Briefcase, CheckSquare, FileText, Search } from "lucide-react";
import resumeBuilderScreenshot from "../../../docs/screenshots/ResumeBuilder_ss.png";
import jobBoardScreenshot from "../../../docs/screenshots/Job_board_ss.png";
import applicationsScreenshot from "../../../docs/screenshots/Application_ss.png";
import recruiterScreenshot from "../../../docs/screenshots/recruiter_dashboard_ss.png";

type ProductStoryProps = {
  eyebrow: string;
  title: string;
  description: string;
  screenshot: StaticImageData;
  alt: string;
  icon: React.ComponentType<{ className?: string }>;
  reverse?: boolean;
  emphasis?: boolean;
};

function ProductStory({ eyebrow, title, description, screenshot, alt, icon: Icon, reverse = false, emphasis = false }: ProductStoryProps) {
  return (
    <article className="grid items-center gap-6 border-t border-black/[0.08] py-9 first:pt-0 sm:gap-8 sm:py-12 lg:grid-cols-[.82fr_1.18fr] lg:gap-14 lg:py-16">
      <div className={reverse ? "lg:order-2 lg:pl-8" : "lg:pr-8"}>
        <div className={`grid h-10 w-10 place-items-center rounded-full border shadow-[0_4px_12px_rgba(42,39,35,0.05)] ${emphasis ? "border-[#252a28] bg-[#252a28]" : "border-black/[0.08] bg-white"}`}><Icon className={`h-4 w-4 ${emphasis ? "text-white" : "text-foreground"}`} /></div>
        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.17em] text-text-muted">{eyebrow}</p>
        <h3 className="mt-3 max-w-sm text-[2rem] font-semibold leading-[1.05] tracking-[-0.055em] text-foreground sm:text-[2.5rem]">{title}</h3>
        <p className="mt-5 max-w-sm text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">{description}</p>
      </div>

      <div className={reverse ? "lg:order-1" : undefined}>
        <div className={reverse ? "relative lg:-ml-10" : "relative lg:ml-3"}>
          <div className={`absolute inset-4 translate-x-3 translate-y-4 rounded-[22px] border sm:rounded-[28px] ${emphasis ? "border-[#252a28]/10 bg-[#d4d6d2]" : "border-black/[0.05] bg-[#deddd7]"}`} />
          <div className={`relative overflow-hidden rounded-[22px] border bg-[#f8f7f4] p-1.5 sm:rounded-[28px] sm:p-2 ${emphasis ? "border-[#252a28]/15 shadow-[0_24px_52px_rgba(42,39,35,0.14)]" : "border-black/[0.1] shadow-[0_20px_46px_rgba(42,39,35,0.11)]"}`}>
            <Image src={screenshot} alt={alt} loading="eager" className="h-auto w-full rounded-[15px] border border-black/[0.05] sm:rounded-[20px]" sizes="(min-width: 1024px) 52vw, (min-width: 640px) 82vw, 100vw" />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Features() {
  return (
    <section className="px-5 pb-6 pt-9 sm:px-10 sm:pb-6 sm:pt-12 lg:px-16 lg:pb-8 lg:pt-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 border-b border-black/[0.08] pb-12 sm:pb-16 lg:grid-cols-[1fr_.62fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-text-muted">Built for both sides of the search</p>
            <h2 className="mt-4 max-w-xl text-[2.35rem] font-semibold leading-[1.02] tracking-[-0.06em] text-foreground sm:text-[3.25rem]">One system. Two clear paths.</h2>
          </div>
          <p className="max-w-sm text-base leading-7 text-text-secondary">A shared view of resume-to-role fit, with the workflows each side needs to act on it.</p>
        </div>

        <div className="grid border-b border-black/[0.08] lg:grid-cols-2">
          <div className="group border-b border-black/[0.08] py-8 sm:py-12 lg:border-b-0 lg:border-r lg:pr-14">
            <div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-text-muted">For candidates</p><ArrowDownRight className="h-4 w-4 text-text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1" /></div>
            <h3 className="mt-5 text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">Build, discover, match, track.</h3>
            <p className="mt-4 max-w-md text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">Build your resume. Find relevant roles. See your match. Track applications.</p>
          </div>
          <div className="group py-8 sm:py-12 lg:pl-14">
            <div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-text-muted">For employers</p><ArrowDownRight className="h-4 w-4 text-text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1" /></div>
            <h3 className="mt-5 text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">Publish, review, compare, manage.</h3>
            <p className="mt-4 max-w-md text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">Publish roles. Review candidates. Compare matches. Manage your pipeline.</p>
          </div>
        </div>

        <div className="pt-9 sm:pt-12 lg:pt-16">
        <ProductStory eyebrow="Resume" title="Build an ATS-ready foundation." description="Create, customize, and optimize your resume with the live preview always in sync." screenshot={resumeBuilderScreenshot} alt="CareerOS resume builder with editing controls and a live resume preview" icon={FileText} />
        <ProductStory eyebrow="Discover & match" title="Find work that fits your experience." description="See how well your resume fits each role before you apply, then focus your effort where it matters." screenshot={jobBoardScreenshot} alt="CareerOS job board showing job discovery and match details" icon={Search} reverse />
        <ProductStory eyebrow="Application workflow" title="Keep every next step in view." description="Track applications in one calm workspace, from the first submission through the next decision." screenshot={applicationsScreenshot} alt="CareerOS application tracker showing applications and their statuses" icon={CheckSquare} />
        <ProductStory eyebrow="Employer workspace" title="A calmer hiring workflow." description="Publish roles, review submitted profiles, and prioritize people with real alignment." screenshot={recruiterScreenshot} alt="CareerOS employer dashboard for managing hiring activity" icon={Briefcase} reverse emphasis />
        </div>
      </div>
    </section>
  );
}

import { Briefcase, User } from "lucide-react";
import type { ReactNode } from "react";
import { MatchAnalysisPreview } from "@/components/dashboard/candidate/match-analysis";
import Logo from "./Logo";

type AuthShellProps = {
  children: ReactNode;
  context: "login" | "register";
};

function LoginContext() {
  return (
    <div className="flex h-full flex-col">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">CareerOS</p>
        <h2 className="mt-3 text-3xl font-bold leading-[1.02] tracking-[-0.055em] text-foreground lg:text-4xl">Resume, jobs,<br />applications.</h2>
      </div>
      <MatchAnalysisPreview className="mt-24 ml-8 max-w-[380px] shadow-[0_12px_26px_rgba(38,37,33,0.08)]" />
    </div>
  );
}

function RegisterContext() {
  const paths = [
    { icon: User, title: "Candidate", flow: "Resume → Discover → Match → Track" },
    { icon: Briefcase, title: "Employer", flow: "Jobs → Candidates → Match → Pipeline" },
  ];

  return (
    <div className="flex h-full flex-col">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">CareerOS</p>
        <h2 className="mt-3 text-3xl font-bold leading-[1.02] tracking-[-0.055em] text-foreground lg:text-4xl">One system.<br />Two paths.</h2>
        <div className="mt-7 divide-y divide-black/[0.08] border-y border-black/[0.08]">{paths.map(({ icon: Icon, title, flow }) => <div key={title} className="py-3.5"><div className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-text-muted" /><p className="text-sm font-semibold text-foreground">{title}</p></div><p className="mt-1.5 text-[11px] text-text-secondary">{flow.replaceAll(" → ", " · ")}</p></div>)}</div>
      </div>
      <MatchAnalysisPreview className="mt-20 ml-8 max-w-[380px] shadow-[0_12px_26px_rgba(38,37,33,0.08)]" />
    </div>
  );
}

export function AuthShell({ children, context }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#e9e7e2] px-3 py-3 sm:px-6 sm:py-6 lg:flex lg:items-center lg:px-10 lg:py-10">
      <div className="mx-auto grid w-full max-w-[1160px] overflow-hidden rounded-[28px] border border-white/80 bg-[#fbfaf8] shadow-[0_24px_70px_rgba(43,42,38,0.10)] lg:min-h-[680px] lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:rounded-[38px]">
        <section className="flex min-h-[580px] flex-col p-6 sm:p-10 lg:min-h-0 lg:p-12">
          <Logo />
          <div className="mx-auto flex w-full max-w-[370px] flex-1 flex-col justify-center py-12 lg:py-8">{children}</div>
        </section>
        <aside className="hidden border-l border-white bg-[#e8e7e3] p-10 lg:block lg:p-12">
          {context === "login" ? <LoginContext /> : <RegisterContext />}
        </aside>
      </div>
    </main>
  );
}

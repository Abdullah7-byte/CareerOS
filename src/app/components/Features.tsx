import { Briefcase, FileText, Search, Users, Activity, BarChart, CheckSquare, Target, ArrowUpRight } from "lucide-react";

const candidateItems = [[FileText, "Resume", "Build an ATS-ready foundation."], [Search, "Discover", "Find work that fits your experience."], [Target, "Match", "See alignment before you apply."], [CheckSquare, "Track", "Keep every next step in view."]] as const;
const employerItems = [[Briefcase, "Jobs", "Publish roles with clear requirements."], [Users, "Candidates", "Review submitted profiles in one place."], [BarChart, "Match", "Prioritize people with real alignment."], [Activity, "Pipeline", "Move hiring forward with context."]] as const;

export default function Features() {
  return (
    <section className="px-3 py-10 sm:px-5 sm:py-14 lg:px-7">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Built for both sides</p><h2 className="mt-2 text-2xl font-bold tracking-[-0.045em] text-foreground sm:text-3xl">One system. Two clear paths.</h2></div>
          <p className="max-w-xs text-sm leading-6 text-text-secondary">The same match workflow, with the tools each side needs to move forward.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[{ title: "Candidate", label: "A focused job search", icon: FileText, items: candidateItems, tone: "bg-[#fdfcf9]" }, { title: "Employer", label: "A calmer hiring workflow", icon: Briefcase, items: employerItems, tone: "bg-[#e7e8e4]" }].map(({ title, label, icon: Icon, items, tone }) => (
            <div key={title} className={`rounded-[25px] border border-white p-5 shadow-[0_8px_24px_rgba(42,39,35,0.035)] sm:rounded-[30px] sm:p-7 ${tone}`}>
              <div className="flex items-start justify-between border-b border-black/[0.07] pb-5"><div><div className="grid h-9 w-9 place-items-center rounded-xl border border-black/[0.07] bg-white/70"><Icon className="h-4 w-4" /></div><h3 className="mt-4 text-xl font-bold tracking-[-0.04em]">{title}</h3><p className="mt-1 text-xs text-text-secondary">{label}</p></div><ArrowUpRight className="h-4 w-4 text-text-muted" /></div>
              <div className="mt-3 grid grid-cols-2 gap-x-4">{items.map(([ItemIcon, name, description]) => <div key={name} className="border-b border-black/[0.06] py-4 last:border-b-0"><ItemIcon className="h-3.5 w-3.5 text-text-muted" /><p className="mt-2 text-sm font-semibold">{name}</p><p className="mt-1 max-w-[160px] text-[11px] leading-4 text-text-secondary">{description}</p></div>)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

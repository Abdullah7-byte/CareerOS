"use client";

import { saveResume } from "@/app/action/resume";
import { updateCandidateProfile } from "@/app/action/profile";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { enhanceSummary } from "@/app/action/ai";
import PDFDownload from "./PDFDownload";
import ResumePreview from "./ResumePreview";
import type { ResumeContent } from "@/lib/validations/resume";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, X, Save, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
type ResumeFormProps = {
    candidateName: string | null;
    profile?: {
        headline?: string | null;
    };
    resumeId?: string | null;
    resume: {
        id?: string;
        title: string;
        summary: string | null;
        resume_experiences?: {
            company: string;
            position: string;
            location: string | null;
            start_date: string;
            end_date: string | null;
            is_current: boolean;
            description: string | null;
        }[];
        resume_education?: {
            institution: string;
            degree: string;
            field_of_study: string | null;
            start_date: string | null;
            end_date: string | null;
            grade: string | null;
        }[];
        resume_skills?: { skill: string }[];
        resume_projects?: {
            title: string;
            description: string | null;
            technologies: string | null;
            github_url: string | null;
            live_url: string | null;
        }[];
    } | null;
};

// ── Shared style tokens ────────────────────────────────────────────────────
const fieldCls =
    "h-11 text-[14px] text-foreground bg-white border-border placeholder:text-text-muted/60 " +
    "focus-visible:ring-1 focus-visible:ring-foreground/20 focus-visible:ring-offset-0 " +
    "transition-shadow rounded-lg shadow-[0_1px_0_rgba(17,17,17,0.02)]";
const textareaCls =
    "text-[14px] text-foreground bg-white border-border placeholder:text-text-muted/60 " +
    "focus-visible:ring-1 focus-visible:ring-foreground/20 focus-visible:ring-offset-0 " +
    "resize-none leading-relaxed transition-shadow rounded-lg shadow-[0_1px_0_rgba(17,17,17,0.02)]";
const labelCls = "text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted";

// ── Section header ─────────────────────────────────────────────────────────
function SectionHead({
    label,
    onAdd,
    addLabel,
}: {
    label: string;
    onAdd?: () => void;
    addLabel?: string;
}) {
    return (
        <div className="mb-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">{label}</h2>
                {onAdd && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:text-foreground"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        {addLabel}
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Entry row (Experience / Education / Projects) ──────────────────────────
function EntryRow({
    index,
    onRemove,
    children,
}: {
    index: number;
    onRemove: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="group mb-5 flex gap-4 border-b border-border/40 pb-5 last:mb-0 last:border-0 last:pb-0">
            <span className="w-5 shrink-0 pt-[7px] select-none text-[11px] font-mono font-medium text-text-muted/55 tabular-nums">
                {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">{children}</div>
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove entry ${index + 1}`}
                className="mt-[5px] flex h-6 w-6 shrink-0 items-center justify-center rounded text-text-muted opacity-0 transition-all hover:bg-error/10 hover:text-error group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function ResumeForm({ resume, resumeId, candidateName, profile }: ResumeFormProps) {
    const router = useRouter();
    const [fullName, setFullName] = useState(candidateName ?? "");
    const headline = profile?.headline ?? "";
    const [resumeTitle] = useState(resume?.title ?? "Untitled Resume");
    const [summary, setSummary] = useState(resume?.summary ?? "");
    const [enhancedSummary, setEnhancedSummary] = useState("");
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [enhanceError, setEnhanceError] = useState("");

    const [experience, setExperience] = useState(
        resume?.resume_experiences?.map((e) => ({
            company: e.company,
            position: e.position,
            location: e.location ?? "",
            startDate: e.start_date,
            endDate: e.end_date ?? "",
            isCurrent: e.is_current,
            description: e.description ?? "",
        })) ?? []
    );

    const [education, setEducation] = useState(
        resume?.resume_education?.map((e) => ({
            institution: e.institution,
            degree: e.degree,
            fieldOfStudy: e.field_of_study ?? "",
            startDate: e.start_date ?? "",
            endDate: e.end_date ?? "",
            grade: e.grade ?? "",
        })) ?? []
    );

    const [skills, setSkills] = useState(
        resume?.resume_skills?.map((s) => ({ skill: s.skill })) ?? []
    );
    const [newSkill, setNewSkill] = useState("");
    const skillInputRef = useRef<HTMLInputElement>(null);

    const [projects, setProjects] = useState(
        resume?.resume_projects?.map((p) => ({
            title: p.title,
            description: p.description ?? "",
            technologies: p.technologies ?? "",
            githubUrl: p.github_url ?? "",
            liveUrl: p.live_url ?? "",
        })) ?? []
    );

    const [isSaving, startSaving] = useTransition();
    const [saveMessage, setSaveMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    // Live resume — passed directly to ResumePreview (pure HTML, instant, no flicker)
    const currentResume: ResumeContent = { title: resumeTitle, summary, experience, education, skills, projects };

    // ── Actions ──────────────────────────────────────────────────────────────
    function handleSubmit(e?: React.FormEvent<HTMLFormElement>) {
        if (e) e.preventDefault();
        setSaveMessage(null);
        startSaving(async () => {
            const resumeResult = await saveResume({
                resumeId: resumeId ?? undefined,
                title: resumeTitle,
                summary,
                experience,
                education,
                skills,
                projects,
            });

            if (!resumeResult.success) {
                setSaveMessage({ type: "error", text: resumeResult.error });
                return;
            }

            const profileResult = await updateCandidateProfile({
                fullName,
                headline: headline ?? "",
            });

            if (!profileResult.success) {
                setSaveMessage({ type: "success", text: "Resume saved. Profile name could not be updated." });
            } else {
                setSaveMessage({ type: "success", text: "Saved" });
            }

            if (!resumeId && resumeResult.data.id) {
                router.replace(`/dashboard/candidate/resume?resume=${resumeResult.data.id}`);
            }

            if (resumeResult.success) {
                setTimeout(() => setSaveMessage(null), 2500);
                return;
            }
        });
    }

    async function handleEnhance() {
        if (!summary.trim()) {
            setEnhanceError("Add a summary first.");
            return;
        }
        setIsEnhancing(true);
        setEnhanceError("");
        try {
            const r = await enhanceSummary(summary);
            if (r.success && r.data) setEnhancedSummary(r.data.summary);
            else setEnhanceError(r.error ?? "Failed to enhance.");
        } finally {
            setIsEnhancing(false);
        }
    }

    function addSkill() {
        const v = newSkill.trim();
        if (!v) return;
        setSkills((prev) => [...prev, { skill: v }]);
        setNewSkill("");
        skillInputRef.current?.focus();
    }

    const sectionLinks = [
        { label: "Personal Information", id: "resume-personal-information" },
        { label: "Summary", id: "resume-summary" },
        { label: "Experience", id: "resume-experience" },
        { label: "Education", id: "resume-education" },
        { label: "Skills", id: "resume-skills" },
        { label: "Projects", id: "resume-projects" },
    ];

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <form
            onSubmit={handleSubmit}
            className="relative min-h-screen w-full bg-background lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(380px,1fr)]"
        >
            <div className="min-w-0 border-r border-border/80 bg-[#f7f6f3]">
                <div className="flex flex-col gap-4 border-b border-border/80 px-8 pb-4 pt-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <h1 className="text-[20px] font-semibold tracking-[-0.03em] text-foreground sm:text-[24px]">
                                Resume Builder
                            </h1>
                            <p className="mt-1 text-sm text-text-secondary">
                                Edit your resume and keep the live preview in sync.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 self-start">
                            {saveMessage && (
                                <span
                                    className={cn(
                                        "motion-status mr-1 text-[12px] font-medium",
                                        saveMessage.type === "success" ? "text-success" : "text-error"
                                    )}
                                >
                                    {saveMessage.text}
                                </span>
                            )}
                            <Button
                                type="submit"
                                variant="default"
                                size="default"
                                disabled={isSaving}
                                className="gap-2 font-medium"
                            >
                                {saveMessage?.type === "success" && !isSaving ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                <span key={isSaving ? "saving" : saveMessage?.type === "success" ? "saved" : "save"} className={isSaving || saveMessage?.type === "success" ? "motion-status" : undefined}>
                                    {isSaving ? "Saving…" : saveMessage?.type === "success" ? "Saved" : "Save"}
                                </span>
                            </Button>
                            <PDFDownload resume={currentResume} candidateName={fullName || undefined} />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-border/80 pt-3">
                        {sectionLinks.map((section) => (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                                className="rounded-full border border-border bg-background/35 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-text-secondary transition-colors hover:border-border-strong hover:bg-accent-soft hover:text-foreground"
                            >
                                {section.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Editor Body ── */}
                <div>
                    <div className="space-y-8 px-8 py-8">
                        <section id="resume-personal-information">
                            <SectionHead label="Personal Information" />
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="candidate-full-name" className={labelCls}>Full name</Label>
                                    <Input
                                        id="candidate-full-name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className={fieldCls}
                                        placeholder="Abdullah Aftab"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ── Professional Summary ── */}
                        <section id="resume-summary">
                            <SectionHead label="Professional Summary" />
                            <Textarea
                                aria-label="Professional summary"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="A concise professional summary…"
                                rows={5}
                                className={textareaCls}
                            />
                            <div className="flex items-center justify-between mt-3">
                                <button
                                    type="button"
                                    onClick={handleEnhance}
                                    disabled={isEnhancing}
                                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-secondary hover:text-foreground transition-colors disabled:opacity-50"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {isEnhancing ? "Enhancing…" : "Enhance with AI"}
                                </button>
                                {enhanceError && (
                                    <span className="text-[12px] text-error">{enhanceError}</span>
                                )}
                            </div>

                            {enhancedSummary && (
                                <div className="mt-4 rounded-md border border-border bg-background p-4">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                                            Suggestion
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSummary(enhancedSummary);
                                                    setEnhancedSummary("");
                                                }}
                                                className="inline-flex items-center gap-1 text-[12px] font-medium text-foreground hover:underline"
                                            >
                                                <Check className="h-3.5 w-3.5" /> Apply
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEnhancedSummary("")}
                                                className="text-[12px] text-text-secondary hover:text-foreground transition-colors"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[14px] text-foreground leading-relaxed">
                                        {enhancedSummary}
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* ── Experience ── */}
                        <section id="resume-experience">
                            <SectionHead
                                label="Experience"
                                onAdd={() =>
                                    setExperience((p) => [
                                        ...p,
                                        { company: "", position: "", location: "", startDate: "", endDate: "", isCurrent: false, description: "" },
                                    ])
                                }
                                addLabel="Add Role"
                            />
                            <div className="space-y-0">
                                {experience.length === 0 && (
                                    <p className="text-[14px] text-text-muted py-2">No experience added.</p>
                                )}
                                {experience.map((item, i) => (
                                    <EntryRow
                                        key={i}
                                        index={i}
                                        onRemove={() => setExperience((p) => p.filter((_, j) => j !== i))}
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`experience-${i}-company`} className={labelCls}>Company</Label>
                                                <Input
                                                    id={`experience-${i}-company`}
                                                    value={item.company}
                                                    onChange={(e) => {
                                                        const n = [...experience];
                                                        n[i].company = e.target.value;
                                                        setExperience(n);
                                                    }}
                                                    className={fieldCls}
                                                    placeholder="Company name"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`experience-${i}-position`} className={labelCls}>Position</Label>
                                                <Input
                                                    id={`experience-${i}-position`}
                                                    value={item.position}
                                                    onChange={(e) => {
                                                        const n = [...experience];
                                                        n[i].position = e.target.value;
                                                        setExperience(n);
                                                    }}
                                                    className={fieldCls}
                                                    placeholder="Job title"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`experience-${i}-location`} className={labelCls}>Location</Label>
                                                <Input
                                                    id={`experience-${i}-location`}
                                                    value={item.location}
                                                    onChange={(e) => {
                                                        const n = [...experience];
                                                        n[i].location = e.target.value;
                                                        setExperience(n);
                                                    }}
                                                    className={fieldCls}
                                                    placeholder="City, Country"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`experience-${i}-start-date`} className={labelCls}>Start Date</Label>
                                                <Input
                                                    id={`experience-${i}-start-date`}
                                                    value={item.startDate}
                                                    onChange={(e) => {
                                                        const n = [...experience];
                                                        n[i].startDate = e.target.value;
                                                        setExperience(n);
                                                    }}
                                                    className={fieldCls}
                                                    placeholder="Jan 2022"
                                                />
                                            </div>
                                            <div className="space-y-1.5 col-span-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor={`experience-${i}-end-date`} className={labelCls}>End Date</Label>
                                                    <label className="flex items-center gap-2 text-[12px] font-medium text-text-secondary cursor-pointer hover:text-foreground transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.isCurrent}
                                                            onChange={(e) => {
                                                                const n = [...experience];
                                                                n[i].isCurrent = e.target.checked;
                                                                if (e.target.checked) n[i].endDate = "";
                                                                setExperience(n);
                                                            }}
                                                            className="h-3.5 w-3.5 accent-foreground rounded-sm"
                                                        />
                                                        Current
                                                    </label>
                                                </div>
                                                {!item.isCurrent && (
                                                    <Input
                                                        id={`experience-${i}-end-date`}
                                                        value={item.endDate}
                                                        onChange={(e) => {
                                                            const n = [...experience];
                                                            n[i].endDate = e.target.value;
                                                            setExperience(n);
                                                        }}
                                                        className={fieldCls}
                                                        placeholder="Jun 2024"
                                                    />
                                                )}
                                            </div>
                                            <div className="space-y-1.5 col-span-2">
                                                <Label htmlFor={`experience-${i}-description`} className={labelCls}>Description</Label>
                                                <Textarea
                                                    id={`experience-${i}-description`}
                                                    value={item.description}
                                                    onChange={(e) => {
                                                        const n = [...experience];
                                                        n[i].description = e.target.value;
                                                        setExperience(n);
                                                    }}
                                                    rows={4}
                                                    className={textareaCls}
                                                    placeholder="Key responsibilities and impact…"
                                                />
                                            </div>
                                        </div>
                                    </EntryRow>
                                ))}
                            </div>
                        </section>

                        {/* ── Education ── */}
                        <section id="resume-education">
                            <SectionHead
                                label="Education"
                                onAdd={() =>
                                    setEducation((p) => [
                                        ...p,
                                        { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", grade: "" },
                                    ])
                                }
                                addLabel="Add Degree"
                            />
                            <div className="space-y-0">
                                {education.length === 0 && (
                                    <p className="text-[14px] text-text-muted py-2">No education added.</p>
                                )}
                                {education.map((item, i) => (
                                    <EntryRow
                                        key={i}
                                        index={i}
                                        onRemove={() => setEducation((p) => p.filter((_, j) => j !== i))}
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                                            <div className="space-y-1.5 col-span-2">
                                                <Label htmlFor={`education-${i}-institution`} className={labelCls}>Institution</Label>
                                                <Input
                                                    id={`education-${i}-institution`}
                                                    value={item.institution}
                                                    onChange={(e) => {
                                                        const n = [...education];
                                                        n[i].institution = e.target.value;
                                                        setEducation(n);
                                                    }}
                                                    className={fieldCls}
                                                    placeholder="University"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`education-${i}-degree`} className={labelCls}>Degree</Label>
                                                <Input
                                                    id={`education-${i}-degree`}
                                                    value={item.degree}
                                                    onChange={(e) => {
                                                        const n = [...education];
                                                        n[i].degree = e.target.value;
                                                        setEducation(n);
                                                    }}
                                                    className={fieldCls}
                                                    placeholder="B.Sc"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`education-${i}-field-of-study`} className={labelCls}>Field of Study</Label>
                                                <Input
                                                    id={`education-${i}-field-of-study`}
                                                    value={item.fieldOfStudy}
                                                    onChange={(e) => {
                                                        const n = [...education];
                                                        n[i].fieldOfStudy = e.target.value;
                                                        setEducation(n);
                                                    }}
                                                    className={fieldCls}
                                                    placeholder="Computer Science"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`education-${i}-start-date`} className={labelCls}>Start</Label>
                                                <Input
                                                    id={`education-${i}-start-date`}
                                                    value={item.startDate}
                                                    onChange={(e) => {
                                                        const n = [...education];
                                                        n[i].startDate = e.target.value;
                                                        setEducation(n);
                                                    }}
                                                    className={fieldCls}
                                                    placeholder="2020"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`education-${i}-end-date`} className={labelCls}>End</Label>
                                                <Input
                                                    id={`education-${i}-end-date`}
                                                    value={item.endDate}
                                                    onChange={(e) => {
                                                        const n = [...education];
                                                        n[i].endDate = e.target.value;
                                                        setEducation(n);
                                                    }}
                                                    className={fieldCls}
                                                    placeholder="2024"
                                                />
                                            </div>
                                            <div className="space-y-1.5 col-span-2">
                                                <Label htmlFor={`education-${i}-grade`} className={labelCls}>Grade</Label>
                                                <Input
                                                    id={`education-${i}-grade`}
                                                    value={item.grade}
                                                    onChange={(e) => {
                                                        const n = [...education];
                                                        n[i].grade = e.target.value;
                                                        setEducation(n);
                                                    }}
                                                    className={fieldCls}
                                                    placeholder="3.8 / 4.0"
                                                />
                                            </div>
                                        </div>
                                    </EntryRow>
                                ))}
                            </div>
                        </section>

                        {/* ── Skills ── */}
                        <section id="resume-skills">
                            <SectionHead label="Skills" />
                            <div className="flex gap-4">
                                <div className="w-5 shrink-0" />
                                <div className="min-w-0 flex-1 space-y-3">
                                    <div className="flex min-h-[40px] flex-wrap items-center gap-2 py-0.5">
                                        {skills.length === 0 && (
                                            <span className="text-[14px] text-text-muted">No skills added.</span>
                                        )}
                                        {skills.map((s, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-background px-2.5 py-1.5 text-[13px] font-medium text-foreground shadow-[0_1px_0_rgba(17,17,17,0.02)]"
                                            >
                                                {s.skill}
                                                <button
                                                    type="button"
                                                    onClick={() => setSkills((p) => p.filter((_, j) => j !== i))}
                                                    aria-label={`Remove ${s.skill}`}
                                                    className="flex h-4 w-4 items-center justify-center rounded text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                                        <Input
                                            ref={skillInputRef}
                                            aria-label="Add a skill"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addSkill();
                                                }
                                            }}
                                            placeholder="Add a skill..."
                                            className={cn(fieldCls, "w-full")}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addSkill}
                                            className="h-11 shrink-0 px-4 text-[13px]"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── Projects ── */}
                        <section id="resume-projects" className="pb-16">
                            <SectionHead
                                label="Projects"
                                onAdd={() =>
                                    setProjects((p) => [
                                        ...p,
                                        { title: "", description: "", technologies: "", githubUrl: "", liveUrl: "" },
                                    ])
                                }
                                addLabel="Add Project"
                            />
                            <div className="space-y-0">
                                {projects.length === 0 && (
                                    <p className="text-[14px] text-text-muted py-2">No projects added.</p>
                                )}
                                {projects.map((item, i) => (
                                    <EntryRow
                                        key={i}
                                        index={i}
                                        onRemove={() => setProjects((p) => p.filter((_, j) => j !== i))}
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                                            <div className="space-y-1.5 col-span-2">
                                                <Label htmlFor={`project-${i}-title`} className={labelCls}>Project Name</Label>
                                                <Input
                                                    id={`project-${i}-title`}
                                                    value={item.title}
                                                    onChange={(e) => {
                                                        const n = [...projects];
                                                        n[i].title = e.target.value;
                                                        setProjects(n);
                                                    }}
                                                    className={fieldCls}
                                                    placeholder="Project title"
                                                />
                                            </div>
                                            <div className="space-y-1.5 col-span-2">
                                                <Label htmlFor={`project-${i}-description`} className={labelCls}>Description</Label>
                                                <Textarea
                                                    id={`project-${i}-description`}
                                                    value={item.description}
                                                    onChange={(e) => {
                                                        const n = [...projects];
                                                        n[i].description = e.target.value;
                                                        setProjects(n);
                                                    }}
                                                    rows={3}
                                                    className={textareaCls}
                                                    placeholder="What it does, what you built…"
                                                />
                                            </div>
                                            <div className="space-y-1.5 col-span-2">
                                                <Label htmlFor={`project-${i}-technologies`} className={labelCls}>Technologies</Label>
                                                <Input
                                                    id={`project-${i}-technologies`}
                                                    value={item.technologies}
                                                    onChange={(e) => {
                                                        const n = [...projects];
                                                        n[i].technologies = e.target.value;
                                                        setProjects(n);
                                                    }}
                                                    className={fieldCls}
                                                    placeholder="React, TypeScript, Supabase"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`project-${i}-github-url`} className={labelCls}>GitHub URL</Label>
                                                <Input
                                                    id={`project-${i}-github-url`}
                                                    value={item.githubUrl}
                                                    onChange={(e) => {
                                                        const n = [...projects];
                                                        n[i].githubUrl = e.target.value;
                                                        setProjects(n);
                                                    }}
                                                    className={fieldCls}
                                                    placeholder="github.com/…"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`project-${i}-live-url`} className={labelCls}>Live URL</Label>
                                                <Input
                                                    id={`project-${i}-live-url`}
                                                    value={item.liveUrl}
                                                    onChange={(e) => {
                                                        const n = [...projects];
                                                        n[i].liveUrl = e.target.value;
                                                        setProjects(n);
                                                    }}
                                                    className={fieldCls}
                                                    placeholder="https://…"
                                                />
                                            </div>
                                        </div>
                                    </EntryRow>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                RIGHT — LIVE PREVIEW (approx 41%)
            ═══════════════════════════════════════════════════════════ */}
            <div className="hidden min-w-0 border-l border-border/40 bg-[#f7f6f3] lg:block">
                <div className="sticky top-0 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
                    <ResumePreview resume={currentResume} candidateName={fullName || undefined} />
                </div>
            </div>

            <div className="mt-8 border-t border-border bg-background pt-6 lg:hidden">
                <div className="h-[700px]">
                    <ResumePreview resume={currentResume} candidateName={fullName || undefined} />
                </div>
            </div>
        </form>
    );
}

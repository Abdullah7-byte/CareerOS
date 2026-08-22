"use client";

import type { ResumeContent } from "@/lib/validations/resume";

interface ResumePreviewProps {
    resume: ResumeContent;
    candidateName?: string | null;
}

// ── Shared typography and layout tokens for Preview ──
// These match the PDF geometry conceptually.
const pt = (n: number) => `${n * 1.33}px`; // Approx mapping pt to px for web preview. 10pt = ~13.3px

const sectionHeading: React.CSSProperties = {
    fontFamily: "'Lato', sans-serif",
    fontSize: pt(11),
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#222",
    borderBottom: "1.2px solid #222",
    paddingBottom: pt(2.5),
    marginBottom: pt(8),
    marginTop: pt(16),
};

const entryTitle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: pt(10),
    color: "#111",
    lineHeight: 1.3,
};

const entryMeta: React.CSSProperties = {
    fontSize: pt(9),
    color: "#555",
    marginTop: pt(1),
};

const bodyText: React.CSSProperties = {
    fontSize: pt(9.5),
    color: "#333",
    lineHeight: 1.5,
    marginTop: pt(3),
};

export default function ResumePreview({ resume, candidateName }: ResumePreviewProps) {
    const displayName = candidateName?.trim() ?? "";

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background: "#f7f6f3",
                overflowY: "auto",
                padding: "32px 24px 64px",
                boxSizing: "border-box",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400&display=swap');
            `}} />
            {/* Paper */}
            <div
                style={{
                    background: "#ffffff",
                    width: "100%",
                    maxWidth: "794px",
                    minHeight: "1123px",
                    padding: "48px 56px",
                    boxSizing: "border-box",
                    boxShadow: "0 1px 2px rgba(17,17,17,0.04), 0 12px 24px rgba(17,17,17,0.02)",
                    fontFamily: "'Lato', sans-serif",
                    fontSize: pt(10),
                    color: "#222",
                    lineHeight: 1.5,
                }}
            >
                {/* ── Header ── */}
                <div style={{ marginBottom: pt(12), textAlign: "center" }}>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: pt(28),
                            fontWeight: 700,
                            color: "#111",
                            letterSpacing: "-0.04em",
                            lineHeight: 1.1,
                        }}
                    >
                        {displayName}
                    </h1>
                </div>

                {resume.summary && (
                    <div style={{ marginBottom: pt(12) }}>
                        <p style={{ margin: 0, ...bodyText }}>
                            {resume.summary}
                        </p>
                    </div>
                )}

                {/* ── Experience ── */}
                {resume.experience.length > 0 && (
                    <section>
                        <h2 style={sectionHeading}>Experience</h2>
                        {resume.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: i < resume.experience.length - 1 ? pt(12) : 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                                    <span style={entryTitle}>
                                        {exp.position || "Position"}
                                        {exp.company && (
                                            <span style={{ fontWeight: 400 }}> — {exp.company}</span>
                                        )}
                                    </span>
                                    <span style={{ ...entryMeta, flexShrink: 0, fontWeight: 700 }}>
                                        {[
                                            exp.startDate,
                                            exp.isCurrent ? "Present" : exp.endDate,
                                        ].filter(Boolean).join(" – ")}
                                    </span>
                                </div>
                                {exp.location && (
                                    <div style={{ ...entryMeta, fontStyle: "italic" }}>{exp.location}</div>
                                )}
                                {exp.description && (
                                    <p style={bodyText}>{exp.description}</p>
                                )}
                            </div>
                        ))}
                    </section>
                )}

                {/* ── Education ── */}
                {resume.education.length > 0 && (
                    <section>
                        <h2 style={sectionHeading}>Education</h2>
                        {resume.education.map((edu, i) => (
                            <div key={i} style={{ marginBottom: i < resume.education.length - 1 ? pt(10) : 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                                    <span style={entryTitle}>
                                        {edu.degree || "Degree"}
                                        {edu.institution && (
                                            <span style={{ fontWeight: 400 }}> — {edu.institution}</span>
                                        )}
                                    </span>
                                    <span style={{ ...entryMeta, flexShrink: 0, fontWeight: 700 }}>
                                        {[edu.startDate, edu.endDate].filter(Boolean).join(" – ")}
                                    </span>
                                </div>
                                {edu.fieldOfStudy && <div style={entryMeta}>{edu.fieldOfStudy}</div>}
                                {edu.grade && <div style={{ ...entryMeta, fontStyle: "italic" }}>Grade: {edu.grade}</div>}
                            </div>
                        ))}
                    </section>
                )}

                {/* ── Skills ── */}
                {resume.skills.filter(s => s.skill).length > 0 && (
                    <section>
                        <h2 style={sectionHeading}>Skills</h2>
                        <p style={{ margin: 0, ...bodyText }}>
                            {resume.skills.map(s => s.skill).filter(Boolean).join("  •  ")}
                        </p>
                    </section>
                )}

                {/* ── Projects ── */}
                {resume.projects.length > 0 && (
                    <section>
                        <h2 style={sectionHeading}>Projects</h2>
                        {resume.projects.map((proj, i) => (
                            <div key={i} style={{ marginBottom: i < resume.projects.length - 1 ? pt(10) : 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                                    <span style={entryTitle}>{proj.title || "Project"}</span>
                                    {proj.technologies && (
                                        <span style={{ ...entryMeta, flexShrink: 0, fontStyle: "italic" }}>{proj.technologies}</span>
                                    )}
                                </div>
                                {proj.description && <p style={bodyText}>{proj.description}</p>}
                                {(proj.githubUrl || proj.liveUrl) && (
                                    <div style={{ ...entryMeta, marginTop: pt(2) }}>
                                        {[
                                            proj.githubUrl ? proj.githubUrl.replace(/^https?:\/\//, "") : null,
                                            proj.liveUrl ? proj.liveUrl.replace(/^https?:\/\//, "") : null,
                                        ].filter(Boolean).join("  •  ")}
                                    </div>
                                )}
                            </div>
                        ))}
                    </section>
                )}

                {/* Empty state */}
                {!resume.summary &&
                    resume.experience.length === 0 &&
                    resume.education.length === 0 &&
                    resume.skills.length === 0 &&
                    resume.projects.length === 0 && (
                        <div
                            style={{
                                textAlign: "center",
                                color: "#aaa",
                                fontSize: pt(10),
                                marginTop: pt(40),
                                fontStyle: "italic"
                            }}
                        >
                            Start editing to see your resume
                        </div>
                    )}
            </div>
        </div>
    );
}

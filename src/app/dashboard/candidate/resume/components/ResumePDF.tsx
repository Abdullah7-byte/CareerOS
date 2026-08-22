import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from "@react-pdf/renderer";

import type { ResumeContent } from "@/lib/validations/resume";

// Register the same Lato font used in the HTML preview.
Font.register({
    family: "Lato",
    fonts: [
        { src: "/fonts/Lato-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/Lato-Bold.ttf", fontWeight: 700 },
        { src: "/fonts/Lato-Italic.ttf", fontStyle: "italic", fontWeight: 400 },
    ],
});

// Exact matches to ResumePreview pt values, converted where necessary.
// Live preview uses 48px / 56px padding. In pt (px / 1.33): 36pt / 42pt.
const styles = StyleSheet.create({
    page: {
        paddingTop: 36,
        paddingBottom: 36,
        paddingLeft: 42,
        paddingRight: 42,
        fontFamily: "Lato",
        fontSize: 10,
        color: "#222",
        lineHeight: 1.5,
    },
    headerContainer: {
        marginBottom: 12,
        textAlign: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        color: "#111",
        letterSpacing: -0.24, // -0.01em * 24pt
        lineHeight: 1.2,
    },
    summaryContainer: {
        marginBottom: 12,
    },
    section: {
        // margin-top handled on heading
    },
    sectionHeading: {
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        color: "#222",
        borderBottomWidth: 1.1, // 1.5px in web = ~1.1pt
        borderBottomColor: "#222",
        borderBottomStyle: "solid",
        paddingBottom: 3,
        marginBottom: 8,
        marginTop: 16,
        letterSpacing: 0.55, // 0.05em * 11pt
    },
    entryContainer: {
        // marginBottom applied dynamically
    },
    entryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
    },
    entryTitle: {
        fontWeight: 700,
        fontSize: 10,
        color: "#111",
        lineHeight: 1.3,
    },
    entryTitleCompany: {
        fontWeight: 400,
    },
    entryMetaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    entryMeta: {
        fontSize: 9,
        color: "#555",
        marginTop: 1,
    },
    entryMetaBold: {
        fontWeight: 700,
    },
    entryMetaItalic: {
        fontStyle: "italic",
    },
    bodyText: {
        fontSize: 9.5,
        color: "#333",
        lineHeight: 1.5,
        marginTop: 3,
    },
});

interface ResumePDFProps {
    resume: ResumeContent;
    candidateName?: string | null;
}

export default function ResumePDF({ resume, candidateName }: ResumePDFProps) {
    const displayName = candidateName?.trim() ?? "";

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* ── Header ── */}
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>{displayName}</Text>
                </View>

                {resume.summary && (
                    <View style={styles.summaryContainer}>
                        <Text style={styles.bodyText}>{resume.summary}</Text>
                    </View>
                )}

                {/* ── Experience ── */}
                {resume.experience.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeading}>Experience</Text>
                        {resume.experience.map((exp, i) => (
                            <View
                                key={i}
                                style={{
                                    ...styles.entryContainer,
                                    marginBottom: i < resume.experience.length - 1 ? 12 : 0,
                                }}
                            >
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>
                                        {exp.position || "Position"}
                                        {exp.company && (
                                            <Text style={styles.entryTitleCompany}> — {exp.company}</Text>
                                        )}
                                    </Text>
                                    <Text style={{ ...styles.entryMeta, ...styles.entryMetaBold }}>
                                        {[
                                            exp.startDate,
                                            exp.isCurrent ? "Present" : exp.endDate,
                                        ]
                                            .filter(Boolean)
                                            .join(" – ")}
                                    </Text>
                                </View>

                                {exp.location && (
                                    <Text style={{ ...styles.entryMeta, ...styles.entryMetaItalic }}>
                                        {exp.location}
                                    </Text>
                                )}

                                {exp.description && (
                                    <Text style={styles.bodyText}>{exp.description}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Education ── */}
                {resume.education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeading}>Education</Text>
                        {resume.education.map((edu, i) => (
                            <View
                                key={i}
                                style={{
                                    ...styles.entryContainer,
                                    marginBottom: i < resume.education.length - 1 ? 10 : 0,
                                }}
                            >
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>
                                        {edu.degree || "Degree"}
                                        {edu.institution && (
                                            <Text style={styles.entryTitleCompany}> — {edu.institution}</Text>
                                        )}
                                    </Text>
                                    <Text style={{ ...styles.entryMeta, ...styles.entryMetaBold }}>
                                        {[edu.startDate, edu.endDate]
                                            .filter(Boolean)
                                            .join(" – ")}
                                    </Text>
                                </View>

                                {edu.fieldOfStudy && (
                                    <Text style={styles.entryMeta}>{edu.fieldOfStudy}</Text>
                                )}

                                {edu.grade && (
                                    <Text style={{ ...styles.entryMeta, ...styles.entryMetaItalic }}>
                                        Grade: {edu.grade}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Skills ── */}
                {resume.skills.filter((s) => s.skill).length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeading}>Skills</Text>
                        <Text style={styles.bodyText}>
                            {resume.skills
                                .map((s) => s.skill)
                                .filter(Boolean)
                                .join("  •  ")}
                        </Text>
                    </View>
                )}

                {/* ── Projects ── */}
                {resume.projects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeading}>Projects</Text>
                        {resume.projects.map((proj, i) => (
                            <View
                                key={i}
                                style={{
                                    ...styles.entryContainer,
                                    marginBottom: i < resume.projects.length - 1 ? 10 : 0,
                                }}
                            >
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>{proj.title || "Project"}</Text>
                                    {proj.technologies && (
                                        <Text style={{ ...styles.entryMeta, ...styles.entryMetaItalic }}>
                                            {proj.technologies}
                                        </Text>
                                    )}
                                </View>

                                {proj.description && (
                                    <Text style={styles.bodyText}>{proj.description}</Text>
                                )}

                                {(proj.githubUrl || proj.liveUrl) && (
                                    <Text style={{ ...styles.entryMeta, marginTop: 2 }}>
                                        {[
                                            proj.githubUrl
                                                ? proj.githubUrl.replace(/^https?:\/\//, "")
                                                : null,
                                            proj.liveUrl
                                                ? proj.liveUrl.replace(/^https?:\/\//, "")
                                                : null,
                                        ]
                                            .filter(Boolean)
                                            .join("  •  ")}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    );
}
"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import ResumePDF from "./ResumePDF";
import type { ResumeContent } from "@/lib/validations/resume";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface PDFDownloadProps {
    resume: ResumeContent;
    candidateName?: string | null;
}

/**
 * On-demand PDF download.
 * Generates the PDF only when the button is clicked — no background blob
 * generation, no re-renders triggered by resume prop changes, no flicker.
 */
export default function PDFDownload({ resume, candidateName }: PDFDownloadProps) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const blob = await pdf(<ResumePDF resume={resume} candidateName={candidateName} />).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${resume.title || "resume"}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("PDF generation failed", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={loading}
            className="h-8 text-xs gap-1.5"
        >
            <Download className="h-3.5 w-3.5" />
            {loading ? "Generating…" : "Download"}
        </Button>
    );
}

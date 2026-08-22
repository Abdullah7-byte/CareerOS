"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import ResumePDF from "./ResumePDF";
import type { ResumeContent } from "@/lib/validations/resume";

const DEBOUNCE_MS = 400;   // ms idle before PDF is regenerated
const SETTLE_MS   = 200;   // ms after onLoad before we start the crossfade
const FADE_MS     = 150;   // CSS transition duration

type Slot = "A" | "B";
const OTHER: Record<Slot, Slot> = { A: "B", B: "A" };

function LivePreviewInner({ resume }: { resume: ResumeContent }) {
    // ── 1. Debounce: generate PDF only when user is idle ─────────────────
    const [pdfResume, setPdfResume] = useState<ResumeContent>(resume);
    const latestResume = useRef(resume);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Run on EVERY render (no dep array) so the debounce always resets
    // when the parent re-renders with new data.
    useEffect(() => {
        latestResume.current = resume;
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setPdfResume({ ...latestResume.current });
        }, DEBOUNCE_MS);
        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
    });

    // ── 2. PDF blob generation ────────────────────────────────────────────
    const doc = useMemo(() => <ResumePDF resume={pdfResume} />, [pdfResume]);
    const genId = useRef(0);

    // ── 3. Double-buffer state ────────────────────────────────────────────
    // Two iframe slots: A and B. One is always visible (front), the other
    // loads the next PDF silently (back). Roles swap after each crossfade.
    const [initialized, setInitialized] = useState(false);
    const [srcA, setSrcA] = useState<string | null>(null);
    const [srcB, setSrcB] = useState<string | null>(null);
    const [opA, setOpA] = useState(0);
    const [opB, setOpB] = useState(0);
    const [frontSlot, setFrontSlot] = useState<Slot>("A");

    // Refs for synchronous access inside callbacks/effects
    const frontRef  = useRef<Slot>("A");
    const isBusy    = useRef(false);     // true while crossfade is in progress
    const backSrc   = useRef<string | null>(null); // URL we put into the back slot
    const blobUrls  = useRef<Record<Slot, string | null>>({ A: null, B: null });

    // Revoke all owned blobs on unmount
    useEffect(() => () => {
        Object.values(blobUrls.current).forEach((u) => { if (u) URL.revokeObjectURL(u); });
    }, []);

    // ── 4. Generate new PDF, put it in the back slot ──────────────────────
    useEffect(() => {
        const id = ++genId.current;

        pdf(doc).toBlob().then((blob) => {
            if (id !== genId.current) return; // stale generation, discard
            const url = URL.createObjectURL(blob);

            const front = frontRef.current;

            if (!initialized) {
                // Very first blob: show immediately in slot A (front)
                blobUrls.current.A = url;
                setSrcA(url);
                setOpA(1);
                setInitialized(true);
                return;
            }

            // Subsequent blobs: load silently into back slot
            const back = OTHER[front];

            // Revoke whatever was in back slot before (it's hidden, safe)
            const prev = blobUrls.current[back];
            if (prev) URL.revokeObjectURL(prev);

            blobUrls.current[back] = url;
            backSrc.current = url;

            if (back === "A") setSrcA(url);
            else              setSrcB(url);
            // opacity stays 0 — handleLoad will trigger the crossfade
        });
    }, [doc, initialized]);

    // ── 5. Cross-fade on back-slot load ───────────────────────────────────
    const handleLoad = useCallback((slot: Slot) => {
        const front = frontRef.current;
        if (slot === front)            return; // front slot reload, ignore
        if (isBusy.current)            return; // crossfade already in progress
        const slotSrc = slot === "A" ? srcA : srcB;
        if (slotSrc !== backSrc.current) return; // stale onLoad, ignore

        isBusy.current = true;

        setTimeout(() => {
            // Step 1: reveal back slot (both fully visible — no black gap)
            if (slot === "A") setOpA(1);
            else              setOpB(1);

            setTimeout(() => {
                // Step 2: collapse old front slot
                const oldFront = front;
                frontRef.current = slot;
                setFrontSlot(slot);

                if (oldFront === "A") setOpA(0);
                else                  setOpB(0);

                // Revoke old front URL after it's fully hidden
                const oldUrl = blobUrls.current[oldFront];
                if (oldUrl) {
                    setTimeout(() => URL.revokeObjectURL(oldUrl), 500);
                    blobUrls.current[oldFront] = null;
                }

                backSrc.current = null;
                isBusy.current  = false;
            }, FADE_MS);
        }, SETTLE_MS);
    }, [srcA, srcB]);

    // ── 6. Render ─────────────────────────────────────────────────────────
    if (!initialized) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-white">
                <span className="text-xs text-text-muted">Generating preview…</span>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full overflow-hidden bg-white">
            <iframe
                src={srcA ? `${srcA}#toolbar=0&navpanes=0&scrollbar=0` : undefined}
                title="resume-preview-A"
                onLoad={() => handleLoad("A")}
                className="absolute inset-0 h-full w-full border-none bg-white"
                style={{
                    opacity: opA,
                    transition: `opacity ${FADE_MS}ms ease`,
                    pointerEvents: frontSlot === "A" ? "auto" : "none",
                }}
            />
            <iframe
                src={srcB ? `${srcB}#toolbar=0&navpanes=0&scrollbar=0` : undefined}
                title="resume-preview-B"
                onLoad={() => handleLoad("B")}
                className="absolute inset-0 h-full w-full border-none bg-white"
                style={{
                    opacity: opB,
                    transition: `opacity ${FADE_MS}ms ease`,
                    pointerEvents: frontSlot === "B" ? "auto" : "none",
                }}
            />
        </div>
    );
}

// Always re-render so the internal debounce receives every keystroke.
export default React.memo(LivePreviewInner, () => false);

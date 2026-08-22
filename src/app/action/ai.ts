"use server";

import groq from "@/lib/ai/groq";
import { createClient } from "@/lib/supabase/server";
import { summaryEnhancementInputSchema, summaryEnhancementSchema } from "@/lib/validations/resume";

export async function enhanceSummary(input: unknown) {
    const validation = summaryEnhancementInputSchema.safeParse({ summary: input });
    if (!validation.success) {
        return { success: false, error: "Write 15 to 2,000 characters so AI can improve it." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Please sign in again to use AI assistance." };

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
    if (profileError || profile?.role !== "candidate") {
        return { success: false, error: "Only candidates can use AI assistance." };
    }

    const { data: resumes, error: resumeError } = await supabase
        .from("resumes")
        .select("id")
        .eq("profile_id", user.id)
        .limit(1);
    if (resumeError || !resumes || resumes.length === 0) {
        return { success: false, error: "Create a resume before using AI assistance." };
    }

    const summary = validation.data.summary;
    try {
        const response = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content:
                    "You are a professional resume editor. Your task is to rewrite the user's resume summary to be a concise, professional 2-4 sentence paragraph. Improve structure, clarity, and technical keyword placement. Remove filler and redundancy.\n\nCRITICAL CLAIM-PRESERVATION PROCEDURE:\n1. Before rewriting, identify EVERY factual claim in the input.\n2. Preserve each claim's original strength and certainty perfectly.\n3. DO NOT infer experience, proficiency, expertise, ownership, seniority, achievements, duration, or qualifications that are not explicitly stated.\n4. Treat vague statements conservatively. If ambiguous, preserve the ambiguity rather than interpreting it strongly.\n5. NEVER strengthen claims (e.g. 'I know React' -> 'experienced with React').\n6. Do not invent any numbers, metrics, or years of experience.",
            },
            {
                role: "user",
                content: `Improve this resume summary following the strict claim-preservation procedure:

${summary}

Return JSON in exactly this format:
{"summary":"improved summary"}`,
            },
        ],
        model: "openai/gpt-oss-120b",
        response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content;

        if (!content) return { success: false, error: "AI could not produce a suggestion. Please try again." };

        const parsed = JSON.parse(content);
        const result = summaryEnhancementSchema.safeParse(parsed);

        if (!result.success) return { success: false, error: "AI returned an invalid suggestion. Please try again." };

        // Sanity Check: Ensure the AI didn't invent new numbers (metrics, years of experience)
        const inputNumbers: string[] = summary.match(/\d+/g) || [];
        const outputNumbers: string[] = result.data.summary.match(/\d+/g) || [];
        const hasInventedNumbers = outputNumbers.some(num => !inputNumbers.includes(num));

        if (hasInventedNumbers) {
            return {
                success: false,
                error: "AI produced an unsupported metric or number. Please try again.",
            };
        }

        return {
            success: true,
            data: result.data,
        };
    } catch {
        return { success: false, error: "AI assistance is temporarily unavailable. Please try again." };
    }
}

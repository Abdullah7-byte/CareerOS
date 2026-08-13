"use client";

import { saveResume } from "@/app/action/resume";
import { useState } from "react";

type ResumeFormProps = {
    resume: {
        title: string;
        summary: string | null;
    } | null;
};

export default function ResumeForm({ resume }: ResumeFormProps) {
    const [title, setTitle] = useState(resume?.title ?? "");
    const [summary, setSummary] = useState(resume?.summary ?? "");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const resumeData = {
            title,
            summary,
            experience: [],
            education: [],
            skills: [],
            projects: [],
        };

        const result = await saveResume(resumeData);

        console.log(result);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="title">Resume title</label>
                <input
                    id="title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />
            </div>

            <div>
                <label htmlFor="summary">Summary</label>
                <textarea
                    id="summary"
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                />
            </div>

            <button type="submit">Save</button>
        </form>
    );
}
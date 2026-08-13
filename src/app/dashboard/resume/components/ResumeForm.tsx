"use client";
import { saveResume } from "@/app/action/resume";
import { useState } from "react";

export default function ResumeForm() {
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");

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
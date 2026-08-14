"use client";

import { saveResume } from "@/app/action/resume";
import { useState } from "react";

type ResumeFormProps = {
    resume: {
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
        resume_skills?: {
            skill: string;
        }[];
        resume_projects?: {
            title: string;
            description: string | null;
            technologies: string | null;
            github_url: string | null;
            live_url: string | null;
        }[];
    } | null;
};

export default function ResumeForm({ resume }: ResumeFormProps) {
    const [title, setTitle] = useState(resume?.title ?? "");
    const [summary, setSummary] = useState(resume?.summary ?? "");

    const initialExperience = resume?.resume_experiences && resume.resume_experiences.length > 0
        ? resume.resume_experiences.map((exp) => ({
            company: exp.company,
            position: exp.position,
            location: exp.location ?? "",
            startDate: exp.start_date,
            endDate: exp.end_date ?? "",
            isCurrent: exp.is_current,
            description: exp.description ?? "",
        }))
        : [
            {
                company: "",
                position: "",
                location: "",
                startDate: "",
                endDate: "",
                isCurrent: false,
                description: "",
            }
        ];

    const [experience, setExperience] = useState(initialExperience);

    const initialEducation = resume?.resume_education && resume.resume_education.length > 0
        ? resume.resume_education.map((edu) => ({
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.field_of_study ?? "",
            startDate: edu.start_date ?? "",
            endDate: edu.end_date ?? "",
            grade: edu.grade ?? "",
        }))
        : [
            {
                institution: "",
                degree: "",
                fieldOfStudy: "",
                startDate: "",
                endDate: "",
                grade: "",
            }
        ];

    const [education, setEducation] = useState(initialEducation);

    const initialSkills = resume?.resume_skills && resume.resume_skills.length > 0
        ? resume.resume_skills.map((s) => ({
            skill: s.skill,
        }))
        : [
            {
                skill: "",
            }
        ];

    const [skills, setSkills] = useState(initialSkills);

    const initialProjects = resume?.resume_projects && resume.resume_projects.length > 0
        ? resume.resume_projects.map((p) => ({
            title: p.title,
            description: p.description ?? "",
            technologies: p.technologies ?? "",
            githubUrl: p.github_url ?? "",
            liveUrl: p.live_url ?? "",
        }))
        : [
            {
                title: "",
                description: "",
                technologies: "",
                githubUrl: "",
                liveUrl: "",
            }
        ];

    const [projects, setProjects] = useState(initialProjects);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const resumeData = {
            title,
            summary,
            experience,
            education,
            skills,
            projects,
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
                    className="border"
                    onChange={(event) => setTitle(event.target.value)}
                />
            </div>

            <div>
                <label htmlFor="summary">Summary</label>
                <textarea
                    id="summary"
                    value={summary}
                    className="border"
                    onChange={(event) => setSummary(event.target.value)}
                />
            </div>

            <div>
                <h2>Experience</h2>

                {experience.map((item, index) => (
                    <div key={index}>
                        <div>
                            <label htmlFor={`company-${index}`}>Company</label>
                            <input
                                id={`company-${index}`}
                                value={item.company}
                                className="border"
                                onChange={(event) =>
                                    setExperience((current) =>
                                        current.map((experienceItem, experienceIndex) =>
                                            experienceIndex === index
                                                ? {
                                                    ...experienceItem,
                                                    company: event.target.value,
                                                }
                                                : experienceItem
                                        )
                                    )
                                }
                            />
                        </div>

                        <div>
                            <label htmlFor={`position-${index}`}>Position</label>
                            <input
                                id={`position-${index}`}
                                value={item.position}
                                className="border"
                                onChange={(event) =>
                                    setExperience((current) =>
                                        current.map((experienceItem, experienceIndex) =>
                                            experienceIndex === index
                                                ? {
                                                    ...experienceItem,
                                                    position: event.target.value,
                                                }
                                                : experienceItem
                                        )
                                    )
                                }
                            />
                        </div>

                        <div>
                            <label htmlFor={`location-${index}`}>Location</label>
                            <input
                                id={`location-${index}`}
                                value={item.location}
                                className="border"
                                onChange={(event) =>
                                    setExperience((current) =>
                                        current.map((experienceItem, experienceIndex) =>
                                            experienceIndex === index
                                                ? {
                                                    ...experienceItem,
                                                    location: event.target.value,
                                                }
                                                : experienceItem
                                        )
                                    )
                                }
                            />
                        </div>

                        <div>
                            <label htmlFor={`startDate-${index}`}>Start date</label>
                            <input
                                id={`startDate-${index}`}
                                value={item.startDate}
                                className="border"
                                onChange={(event) =>
                                    setExperience((current) =>
                                        current.map((experienceItem, experienceIndex) =>
                                            experienceIndex === index
                                                ? {
                                                    ...experienceItem,
                                                    startDate: event.target.value,
                                                }
                                                : experienceItem
                                        )
                                    )
                                }
                            />
                        </div>

                        <div>
                            <label htmlFor={`endDate-${index}`}>End date</label>
                            <input
                                id={`endDate-${index}`}
                                value={item.endDate}
                                className="border"
                                onChange={(event) =>
                                    setExperience((current) =>
                                        current.map((experienceItem, experienceIndex) =>
                                            experienceIndex === index
                                                ? {
                                                    ...experienceItem,
                                                    endDate: event.target.value,
                                                }
                                                : experienceItem
                                        )
                                    )
                                }
                            />
                        </div>

                        <div>
                            <label htmlFor={`isCurrent-${index}`}>
                                Currently working here
                            </label>
                            <input
                                id={`isCurrent-${index}`}
                                type="checkbox"
                                checked={item.isCurrent}
                                className="border"
                                onChange={(event) =>
                                    setExperience((current) =>
                                        current.map((experienceItem, experienceIndex) =>
                                            experienceIndex === index
                                                ? {
                                                    ...experienceItem,
                                                    isCurrent: event.target.checked,
                                                }
                                                : experienceItem
                                        )
                                    )
                                }
                            />
                        </div>

                        <div>
                            <label htmlFor={`description-${index}`}>Description</label>
                            <textarea
                                id={`description-${index}`}
                                value={item.description}
                                className="border"
                                onChange={(event) =>
                                    setExperience((current) =>
                                        current.map((experienceItem, experienceIndex) =>
                                            experienceIndex === index
                                                ? {
                                                    ...experienceItem,
                                                    description: event.target.value,
                                                }
                                                : experienceItem
                                        )
                                    )
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <h2>Education</h2>
                {education.map((item, index) => (
                    <div key={index}>
                        <div>
                            <label htmlFor={`institution-${index}`}>Institution</label>
                            <input
                                id={`institution-${index}`}
                                value={item.institution}
                                className="border"
                                onChange={(event) =>
                                    setEducation((current) =>
                                        current.map((eduItem, eduIndex) =>
                                            eduIndex === index
                                                ? { ...eduItem, institution: event.target.value }
                                                : eduItem
                                        )
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label htmlFor={`degree-${index}`}>Degree</label>
                            <input
                                id={`degree-${index}`}
                                value={item.degree}
                                className="border"
                                onChange={(event) =>
                                    setEducation((current) =>
                                        current.map((eduItem, eduIndex) =>
                                            eduIndex === index
                                                ? { ...eduItem, degree: event.target.value }
                                                : eduItem
                                        )
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label htmlFor={`fieldOfStudy-${index}`}>Field of Study</label>
                            <input
                                id={`fieldOfStudy-${index}`}
                                value={item.fieldOfStudy}
                                className="border"
                                onChange={(event) =>
                                    setEducation((current) =>
                                        current.map((eduItem, eduIndex) =>
                                            eduIndex === index
                                                ? { ...eduItem, fieldOfStudy: event.target.value }
                                                : eduItem
                                        )
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label htmlFor={`eduStartDate-${index}`}>Start Date</label>
                            <input
                                id={`eduStartDate-${index}`}
                                value={item.startDate}
                                className="border"
                                onChange={(event) =>
                                    setEducation((current) =>
                                        current.map((eduItem, eduIndex) =>
                                            eduIndex === index
                                                ? { ...eduItem, startDate: event.target.value }
                                                : eduItem
                                        )
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label htmlFor={`eduEndDate-${index}`}>End Date</label>
                            <input
                                id={`eduEndDate-${index}`}
                                value={item.endDate}
                                className="border"
                                onChange={(event) =>
                                    setEducation((current) =>
                                        current.map((eduItem, eduIndex) =>
                                            eduIndex === index
                                                ? { ...eduItem, endDate: event.target.value }
                                                : eduItem
                                        )
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label htmlFor={`grade-${index}`}>Grade</label>
                            <input
                                id={`grade-${index}`}
                                value={item.grade}
                                className="border"
                                onChange={(event) =>
                                    setEducation((current) =>
                                        current.map((eduItem, eduIndex) =>
                                            eduIndex === index
                                                ? { ...eduItem, grade: event.target.value }
                                                : eduItem
                                        )
                                    )
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <h2>Skills</h2>
                {skills.map((item, index) => (
                    <div key={index}>
                        <div>
                            <label htmlFor={`skill-${index}`}>Skill</label>
                            <input
                                id={`skill-${index}`}
                                value={item.skill}
                                className="border"
                                onChange={(event) =>
                                    setSkills((current) =>
                                        current.map((skillItem, skillIndex) =>
                                            skillIndex === index
                                                ? { ...skillItem, skill: event.target.value }
                                                : skillItem
                                        )
                                    )
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <h2>Projects</h2>
                {projects.map((item, index) => (
                    <div key={index}>
                        <div>
                            <label htmlFor={`projectTitle-${index}`}>Title</label>
                            <input
                                id={`projectTitle-${index}`}
                                value={item.title}
                                className="border"
                                onChange={(event) =>
                                    setProjects((current) =>
                                        current.map((projItem, projIndex) =>
                                            projIndex === index
                                                ? { ...projItem, title: event.target.value }
                                                : projItem
                                        )
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label htmlFor={`projectDescription-${index}`}>Description</label>
                            <textarea
                                id={`projectDescription-${index}`}
                                value={item.description}
                                className="border"
                                onChange={(event) =>
                                    setProjects((current) =>
                                        current.map((projItem, projIndex) =>
                                            projIndex === index
                                                ? { ...projItem, description: event.target.value }
                                                : projItem
                                        )
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label htmlFor={`projectTechnologies-${index}`}>Technologies</label>
                            <input
                                id={`projectTechnologies-${index}`}
                                value={item.technologies}
                                className="border"
                                onChange={(event) =>
                                    setProjects((current) =>
                                        current.map((projItem, projIndex) =>
                                            projIndex === index
                                                ? { ...projItem, technologies: event.target.value }
                                                : projItem
                                        )
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label htmlFor={`githubUrl-${index}`}>GitHub URL</label>
                            <input
                                id={`githubUrl-${index}`}
                                value={item.githubUrl}
                                className="border"
                                onChange={(event) =>
                                    setProjects((current) =>
                                        current.map((projItem, projIndex) =>
                                            projIndex === index
                                                ? { ...projItem, githubUrl: event.target.value }
                                                : projItem
                                        )
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label htmlFor={`liveUrl-${index}`}>Live URL</label>
                            <input
                                id={`liveUrl-${index}`}
                                value={item.liveUrl}
                                className="border"
                                onChange={(event) =>
                                    setProjects((current) =>
                                        current.map((projItem, projIndex) =>
                                            projIndex === index
                                                ? { ...projItem, liveUrl: event.target.value }
                                                : projItem
                                        )
                                    )
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button type="submit">Save</button>
        </form>
    );
}
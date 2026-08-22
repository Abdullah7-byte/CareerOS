-- Employer server actions authorize ownership before using the trusted server client.
-- These grants do not expose any data to browser clients or change authenticated RLS.
grant select on table
    public.jobs,
    public.applications,
    public.profiles,
    public.resumes,
    public.resume_experiences,
    public.resume_education,
    public.resume_skills,
    public.resume_projects
    to service_role;

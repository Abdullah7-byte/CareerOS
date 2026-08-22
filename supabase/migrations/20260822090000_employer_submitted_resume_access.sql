-- Employers may read only resumes attached to applications for their own jobs.
create policy "Job owners can view submitted resumes"
on public.resumes
for select
to authenticated
using (
    exists (
        select 1
        from public.applications
        join public.jobs on jobs.id = applications.job_id
        where applications.resume_id = resumes.id
          and jobs.profile_id = (select auth.uid())
    )
);

create policy "Job owners can view submitted resume experiences"
on public.resume_experiences
for select
to authenticated
using (
    exists (
        select 1
        from public.applications
        join public.jobs on jobs.id = applications.job_id
        where applications.resume_id = resume_experiences.resume_id
          and jobs.profile_id = (select auth.uid())
    )
);

create policy "Job owners can view submitted resume education"
on public.resume_education
for select
to authenticated
using (
    exists (
        select 1
        from public.applications
        join public.jobs on jobs.id = applications.job_id
        where applications.resume_id = resume_education.resume_id
          and jobs.profile_id = (select auth.uid())
    )
);

create policy "Job owners can view submitted resume skills"
on public.resume_skills
for select
to authenticated
using (
    exists (
        select 1
        from public.applications
        join public.jobs on jobs.id = applications.job_id
        where applications.resume_id = resume_skills.resume_id
          and jobs.profile_id = (select auth.uid())
    )
);

create policy "Job owners can view submitted resume projects"
on public.resume_projects
for select
to authenticated
using (
    exists (
        select 1
        from public.applications
        join public.jobs on jobs.id = applications.job_id
        where applications.resume_id = resume_projects.resume_id
          and jobs.profile_id = (select auth.uid())
    )
);
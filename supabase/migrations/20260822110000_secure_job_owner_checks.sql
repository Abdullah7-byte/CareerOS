-- Resolve job ownership inside a narrowly scoped security-definer helper.
-- This prevents application/resume policies from recursively evaluating jobs
-- policies while still requiring the caller to be the job owner.
create or replace function public.is_job_owner(p_job_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
    select exists (
        select 1
        from public.jobs
        where jobs.id = p_job_id
          and jobs.profile_id = (select auth.uid())
    );
$$;

revoke all on function public.is_job_owner(uuid) from public;
grant execute on function public.is_job_owner(uuid) to authenticated;

drop policy if exists "Users can view their own applications" on public.applications;
create policy "Users can view their own applications"
on public.applications
for select
to authenticated
using (
    (select auth.uid()) = profile_id
    or public.is_job_owner(job_id)
);

drop policy if exists "Job owners can view applications for their jobs" on public.applications;
create policy "Job owners can view applications for their jobs"
on public.applications
for select
to authenticated
using (public.is_job_owner(job_id));

drop policy if exists "Job owners can update applications for their jobs" on public.applications;
create policy "Job owners can update applications for their jobs"
on public.applications
for update
to authenticated
using (public.is_job_owner(job_id));

drop policy if exists "Employers can update applications for their own jobs" on public.applications;
create policy "Employers can update applications for their own jobs"
on public.applications
for update
to authenticated
using (
    public.is_job_owner(job_id)
    and exists (
        select 1
        from public.profiles
        where profiles.id = (select auth.uid())
          and profiles.role = 'employer'
    )
)
with check (public.is_job_owner(job_id));

drop policy if exists "Job owners can view submitted resumes" on public.resumes;
create policy "Job owners can view submitted resumes"
on public.resumes
for select
to authenticated
using (
    exists (
        select 1
        from public.applications
        where applications.resume_id = resumes.id
          and public.is_job_owner(applications.job_id)
    )
);

drop policy if exists "Job owners can view submitted resume experiences" on public.resume_experiences;
create policy "Job owners can view submitted resume experiences"
on public.resume_experiences
for select
to authenticated
using (
    exists (
        select 1
        from public.applications
        where applications.resume_id = resume_experiences.resume_id
          and public.is_job_owner(applications.job_id)
    )
);

drop policy if exists "Job owners can view submitted resume education" on public.resume_education;
create policy "Job owners can view submitted resume education"
on public.resume_education
for select
to authenticated
using (
    exists (
        select 1
        from public.applications
        where applications.resume_id = resume_education.resume_id
          and public.is_job_owner(applications.job_id)
    )
);

drop policy if exists "Job owners can view submitted resume skills" on public.resume_skills;
create policy "Job owners can view submitted resume skills"
on public.resume_skills
for select
to authenticated
using (
    exists (
        select 1
        from public.applications
        where applications.resume_id = resume_skills.resume_id
          and public.is_job_owner(applications.job_id)
    )
);

drop policy if exists "Job owners can view submitted resume projects" on public.resume_projects;
create policy "Job owners can view submitted resume projects"
on public.resume_projects
for select
to authenticated
using (
    exists (
        select 1
        from public.applications
        where applications.resume_id = resume_projects.resume_id
          and public.is_job_owner(applications.job_id)
    )
);
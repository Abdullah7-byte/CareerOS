-- Application status mutation is split by actor. Candidates can only withdraw
-- their own active application; employers can update applications for jobs they own.
drop policy if exists "Applicants can update their own applications" on public.applications;
drop policy if exists "Job owners can update applications for their jobs" on public.applications;

-- Restrict authenticated application mutations to status so a permitted
-- transition cannot also change ownership or match data.
revoke update on table public.applications from authenticated;
grant update (status) on table public.applications to authenticated;

create policy "Candidates can withdraw their own eligible applications"
on public.applications
for update
to authenticated
using (
    profile_id = (select auth.uid())
    and status in ('applied', 'reviewing')
    and exists (
        select 1
        from public.profiles
        where profiles.id = (select auth.uid())
        and profiles.role = 'candidate'
    )
)
with check (
    profile_id = (select auth.uid())
    and status = 'withdrawn'
    and exists (
        select 1
        from public.profiles
        where profiles.id = (select auth.uid())
        and profiles.role = 'candidate'
    )
);

create policy "Employers can update applications for their own jobs"
on public.applications
for update
to authenticated
using (
    exists (
        select 1
        from public.jobs
        where jobs.id = applications.job_id
        and jobs.profile_id = (select auth.uid())
    )
    and exists (
        select 1
        from public.profiles
        where profiles.id = (select auth.uid())
        and profiles.role = 'employer'
    )
)
with check (
    exists (
        select 1
        from public.jobs
        where jobs.id = applications.job_id
        and jobs.profile_id = (select auth.uid())
    )
    and exists (
        select 1
        from public.profiles
        where profiles.id = (select auth.uid())
        and profiles.role = 'employer'
    )
);

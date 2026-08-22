-- The authenticated role needs table-level SELECT before jobs RLS can evaluate.
grant select on table public.jobs to authenticated;

-- Candidates may browse jobs; employers may read only jobs they own.
drop policy if exists "Authenticated users can view jobs" on public.jobs;

create policy "Candidates can browse jobs"
on public.jobs
for select
to authenticated
using (
    exists (
        select 1
        from public.profiles
        where profiles.id = (select auth.uid())
          and profiles.role = 'candidate'
    )
    or profile_id = (select auth.uid())
);

alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_experiences enable row level security;
alter table public.resume_education enable row level security;
alter table public.resume_projects enable row level security;
alter table public.resume_skills enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (
    (select auth.uid()) = id
);

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (
    (select auth.uid()) = id
);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (
    (select auth.uid()) = id
)
with check (
    (select auth.uid()) = id
);

create policy "Users can delete their own profile"
on public.profiles
for delete
to authenticated
using (
    (select auth.uid()) = id
);

create policy "Users can view their own resumes"
on public.resumes
for select
to authenticated
using (
    (select auth.uid()) = profile_id
);

create policy "Users can create their own resumes"
on public.resumes
for insert
to authenticated
with check (
    (select auth.uid()) = profile_id
);

create policy "Users can update their own resumes"
on public.resumes
for update
to authenticated
using (
    (select auth.uid()) = profile_id
)
with check (
    (select auth.uid()) = profile_id
);

create policy "Users can delete their own resumes"
on public.resumes
for delete
to authenticated
using (
    (select auth.uid()) = profile_id
);

create policy "Users can view their own resume experiences"
on public.resume_experiences
for select
to authenticated
using (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_experiences.resume_id
        and resumes.profile_id = (select auth.uid())
    )
);

create policy "Users can create their own resume experiences"
on public.resume_experiences
for insert
to authenticated
with check (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_experiences.resume_id
        and resumes.profile_id = (select auth.uid())
    )
);

create policy "Users can update their own resume experiences"
on public.resume_experiences
for update
to authenticated
using (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_experiences.resume_id
        and resumes.profile_id = (select auth.uid())
    )
)
with check (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_experiences.resume_id
        and resumes.profile_id = (select auth.uid())
    )
);

create policy "Users can delete their own resume experiences"
on public.resume_experiences
for delete
to authenticated
using (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_experiences.resume_id
        and resumes.profile_id = (select auth.uid())
    )
);

create policy "Users can view their own resume education"
on public.resume_education
for select
to authenticated
using (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_education.resume_id
        and resumes.profile_id = (select auth.uid())
    )
);

create policy "Users can create their own resume education"
on public.resume_education
for insert
to authenticated
with check (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_education.resume_id
        and resumes.profile_id = (select auth.uid())
    )
);

create policy "Users can update their own resume education"
on public.resume_education
for update
to authenticated
using (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_education.resume_id
        and resumes.profile_id = (select auth.uid())
    )
)
with check (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_education.resume_id
        and resumes.profile_id = (select auth.uid())
    )
);

create policy "Users can delete their own resume education"
on public.resume_education
for delete
to authenticated
using (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_education.resume_id
        and resumes.profile_id = (select auth.uid())
    )
);

create policy "Users can view their own resume projects"
on public.resume_projects
for select
to authenticated
using (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_projects.resume_id
        and resumes.profile_id = (select auth.uid())
    )
);

create policy "Users can create their own resume projects"
on public.resume_projects
for insert
to authenticated
with check (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_projects.resume_id
        and resumes.profile_id = (select auth.uid())
    )
);

create policy "Users can update their own resume projects"
on public.resume_projects
for update
to authenticated
using (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_projects.resume_id
        and resumes.profile_id = (select auth.uid())
    )
)
with check (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_projects.resume_id
        and resumes.profile_id = (select auth.uid())
    )
);

create policy "Users can delete their own resume projects"
on public.resume_projects
for delete
to authenticated
using (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_projects.resume_id
        and resumes.profile_id = (select auth.uid())
    )
);

create policy "Users can view their own resume skills"
on public.resume_skills
for select
to authenticated
using (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_skills.resume_id
        and resumes.profile_id = (select auth.uid())
    )
);

create policy "Users can create their own resume skills"
on public.resume_skills
for insert
to authenticated
with check (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_skills.resume_id
        and resumes.profile_id = (select auth.uid())
    )
);

create policy "Users can update their own resume skills"
on public.resume_skills
for update
to authenticated
using (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_skills.resume_id
        and resumes.profile_id = (select auth.uid())
    )
)
with check (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_skills.resume_id
        and resumes.profile_id = (select auth.uid())
    )
);

create policy "Users can delete their own resume skills"
on public.resume_skills
for delete
to authenticated
using (
    exists (
        select 1
        from public.resumes
        where resumes.id = resume_skills.resume_id
        and resumes.profile_id = (select auth.uid())
    )
);

create policy "Authenticated users can view jobs"
on public.jobs
for select
to authenticated
using (
    true
);

create policy "Users can create their own jobs"
on public.jobs
for insert
to authenticated
with check (
    (select auth.uid()) = profile_id
);

create policy "Users can update their own jobs"
on public.jobs
for update
to authenticated
using (
    (select auth.uid()) = profile_id
)
with check (
    (select auth.uid()) = profile_id
);

create policy "Users can delete their own jobs"
on public.jobs
for delete
to authenticated
using (
    (select auth.uid()) = profile_id
);

create policy "Users can view their own applications"
on public.applications
for select
to authenticated
using (
    (select auth.uid()) = profile_id
    or exists (
        select 1
        from public.jobs
        where jobs.id = applications.job_id
        and jobs.profile_id = (select auth.uid())
    )
);

create policy "Users can create their own applications"
on public.applications
for insert
to authenticated
with check (
    (select auth.uid()) = profile_id
);

create policy "Applicants can update their own applications"
on public.applications
for update
to authenticated
using (
    (select auth.uid()) = profile_id
)
with check (
    (select auth.uid()) = profile_id
);

create policy "Users can delete their own applications"
on public.applications
for delete
to authenticated
using (
    (select auth.uid()) = profile_id
);
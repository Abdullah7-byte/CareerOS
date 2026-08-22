alter table public.applications
    add column if not exists resume_id uuid references public.resumes(id) on delete set null;

create index if not exists applications_resume_id_idx
    on public.applications (resume_id);

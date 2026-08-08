grant select, insert, update, delete
on public.profiles,
   public.resumes,
   public.resume_experiences,
   public.resume_education,
   public.resume_projects,
   public.resume_skills,
   public.jobs,
   public.applications
to authenticated;
-- Keep the application candidate and submitted resume relationship consistent.
create or replace function public.validate_application_resume_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if new.resume_id is not null and not exists (
        select 1
        from public.resumes
        where resumes.id = new.resume_id
          and resumes.profile_id = new.profile_id
    ) then
        raise exception 'submitted resume does not belong to application candidate';
    end if;

    return new;
end;
$$;

drop trigger if exists validate_application_resume_owner on public.applications;
create trigger validate_application_resume_owner
before insert or update of profile_id, resume_id on public.applications
for each row execute function public.validate_application_resume_owner();
-- Change the candidate default resume in one database transaction.
create or replace function public.set_candidate_default_resume(p_resume_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if auth.uid() is null then
        raise exception 'not authenticated';
    end if;

    if not exists (
        select 1
        from public.resumes
        where id = p_resume_id
          and profile_id = auth.uid()
    ) then
        raise exception 'resume not found';
    end if;

    update public.resumes
    set is_default = false
    where profile_id = auth.uid()
      and is_default = true;

    update public.resumes
    set is_default = true,
        updated_at = now()
    where id = p_resume_id
      and profile_id = auth.uid();
end;
$$;

revoke all on function public.set_candidate_default_resume(uuid) from public;
grant execute on function public.set_candidate_default_resume(uuid) to authenticated;

-- Replace the legacy default-resume-only RPC with an atomic selected-resume save.
drop function if exists public.save_candidate_resume(jsonb);
drop function if exists public.save_candidate_resume(uuid, jsonb);

create function public.save_candidate_resume(p_resume_id uuid, p_resume jsonb)
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
    set title = coalesce(nullif(trim(p_resume->>'title'), ''), 'Untitled Resume'),
        summary = nullif(p_resume->>'summary', ''),
        updated_at = now()
    where id = p_resume_id
      and profile_id = auth.uid();

    delete from public.resume_experiences where resume_id = p_resume_id;
    delete from public.resume_education where resume_id = p_resume_id;
    delete from public.resume_skills where resume_id = p_resume_id;
    delete from public.resume_projects where resume_id = p_resume_id;

    insert into public.resume_experiences (
        resume_id, company, position, location, start_date, end_date, is_current, description
    )
    select
        p_resume_id,
        item.company,
        item.position,
        nullif(item.location, ''),
        nullif(item.start_date, ''),
        nullif(item.end_date, ''),
        item.is_current = 'true',
        nullif(item.description, '')
    from jsonb_to_recordset(coalesce(p_resume->'experience', '[]'::jsonb)) as item(
        company text, position text, location text, start_date text, end_date text,
        is_current text, description text
    );

    insert into public.resume_education (
        resume_id, institution, degree, field_of_study, start_date, end_date, grade
    )
    select
        p_resume_id,
        item.institution,
        item.degree,
        nullif(item.field_of_study, ''),
        nullif(item.start_date, ''),
        nullif(item.end_date, ''),
        nullif(item.grade, '')
    from jsonb_to_recordset(coalesce(p_resume->'education', '[]'::jsonb)) as item(
        institution text, degree text, field_of_study text, start_date text,
        end_date text, grade text
    );

    insert into public.resume_skills (resume_id, skill)
    select p_resume_id, item.skill
    from jsonb_to_recordset(coalesce(p_resume->'skills', '[]'::jsonb)) as item(skill text);

    insert into public.resume_projects (
        resume_id, title, description, technologies, github_url, live_url
    )
    select
        p_resume_id,
        item.title,
        nullif(item.description, ''),
        nullif(item.technologies, ''),
        nullif(item.github_url, ''),
        nullif(item.live_url, '')
    from jsonb_to_recordset(coalesce(p_resume->'projects', '[]'::jsonb)) as item(
        title text, description text, technologies text, github_url text, live_url text
    );
end;
$$;

revoke all on function public.save_candidate_resume(uuid, jsonb) from public;
grant execute on function public.save_candidate_resume(uuid, jsonb) to authenticated;

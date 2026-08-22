-- Roles are assigned at signup by the security-definer trigger and are not
-- mutable by ordinary authenticated users.
revoke update on table public.profiles from authenticated;
grant update (full_name, headline, location, phone, avatar_url)
on table public.profiles to authenticated;

-- Application status and score are calculated by the trusted server action.
-- A candidate JWT must not be able to create application rows directly.
drop policy if exists "Candidates can create applications" on public.applications;
revoke insert on table public.applications from authenticated;

create or replace function public.save_candidate_resume(p_resume jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_resume_id uuid;
begin
    if auth.uid() is null then
        raise exception 'not authenticated';
    end if;

    insert into public.resumes (profile_id, title, summary, is_default)
    values (auth.uid(), p_resume->>'title', nullif(p_resume->>'summary', ''), true)
    on conflict (profile_id) where is_default = true
    do update set
        title = excluded.title,
        summary = excluded.summary
    returning id into v_resume_id;

    delete from public.resume_experiences where resume_id = v_resume_id;
    delete from public.resume_education where resume_id = v_resume_id;
    delete from public.resume_skills where resume_id = v_resume_id;
    delete from public.resume_projects where resume_id = v_resume_id;

    insert into public.resume_experiences (
        resume_id, company, position, location, start_date, end_date, is_current, description
    )
    select
        v_resume_id, item.company, item.position, nullif(item.location, ''),
        item.start_date, item.end_date, item.is_current, nullif(item.description, '')
    from jsonb_to_recordset(coalesce(p_resume->'experience', '[]'::jsonb)) as item(
        company text, position text, location text, start_date date, end_date date,
        is_current boolean, description text
    );

    insert into public.resume_education (
        resume_id, institution, degree, field_of_study, start_date, end_date, grade
    )
    select
        v_resume_id, item.institution, item.degree, nullif(item.field_of_study, ''),
        item.start_date, item.end_date, nullif(item.grade, '')
    from jsonb_to_recordset(coalesce(p_resume->'education', '[]'::jsonb)) as item(
        institution text, degree text, field_of_study text, start_date date, end_date date, grade text
    );

    insert into public.resume_skills (resume_id, skill)
    select v_resume_id, item.skill
    from jsonb_to_recordset(coalesce(p_resume->'skills', '[]'::jsonb)) as item(skill text);

    insert into public.resume_projects (
        resume_id, title, description, technologies, github_url, live_url
    )
    select
        v_resume_id, item.title, nullif(item.description, ''), nullif(item.technologies, ''),
        nullif(item.github_url, ''), nullif(item.live_url, '')
    from jsonb_to_recordset(coalesce(p_resume->'projects', '[]'::jsonb)) as item(
        title text, description text, technologies text, github_url text, live_url text
    );
end;
$$;

revoke all on function public.save_candidate_resume(jsonb) from public;
grant execute on function public.save_candidate_resume(jsonb) to authenticated;

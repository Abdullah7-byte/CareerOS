-- Durable application submission, explainable scoring, and optimistic resume saves.
-- This is forward-only: pre-existing applications are explicitly marked legacy
-- because their submitted job/resume contents cannot be reconstructed exactly.

alter table public.resumes
    add column if not exists version bigint not null default 1;

alter table public.applications
    add column if not exists resume_snapshot jsonb,
    add column if not exists job_snapshot jsonb,
    add column if not exists score_status text not null default 'pending',
    add column if not exists score_breakdown jsonb,
    add column if not exists score_rubric_version text,
    add column if not exists score_model_version text,
    add column if not exists score_attempts integer not null default 0,
    add column if not exists score_next_retry_at timestamptz,
    add column if not exists score_started_at timestamptz,
    add column if not exists score_completed_at timestamptz,
    add column if not exists score_last_error_code text;

alter table public.applications
    drop constraint if exists applications_score_status_check;
alter table public.applications
    add constraint applications_score_status_check check (
        score_status in ('pending', 'processing', 'scored', 'insufficient', 'failed', 'legacy')
    );

grant update (
    match_score, resume_snapshot, job_snapshot, score_status, score_breakdown,
    score_rubric_version, score_model_version, score_attempts, score_next_retry_at,
    score_started_at, score_completed_at, score_last_error_code
) on public.applications to service_role;

-- Old scores lack immutable inputs and cannot be explained honestly.
update public.applications
set score_status = 'legacy',
    score_last_error_code = 'snapshot_unavailable'
where resume_snapshot is null
  and job_snapshot is null
  and created_at < transaction_timestamp();

-- Canonical names are used going forward while preserving the historical data
-- values during the migration.
update public.applications set status = 'interview' where status = 'interviewing';
update public.applications set status = 'offer' where status = 'offered';
alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications add constraint applications_status_check check (
    status in ('applied', 'reviewing', 'interview', 'offer', 'rejected', 'hired', 'withdrawn')
);

create table if not exists public.application_scoring_events (
    id uuid primary key default gen_random_uuid(),
    application_id uuid not null references public.applications(id) on delete cascade,
    profile_id uuid not null references public.profiles(id) on delete cascade,
    attempt integer not null,
    event_type text not null check (event_type in ('attempt_started', 'scored', 'insufficient', 'failed', 'usage_limited')),
    error_code text,
    created_at timestamptz not null default now()
);

alter table public.application_scoring_events enable row level security;
revoke all on public.application_scoring_events from anon, authenticated;
grant select, insert, update, delete on public.application_scoring_events to service_role;

-- A dispatcher claims exactly one due application. `FOR UPDATE SKIP LOCKED`
-- makes concurrent workers and repeated submissions idempotent.
create or replace function public.claim_application_scoring(p_application_id uuid default null)
returns table (
    application_id uuid,
    profile_id uuid,
    resume_snapshot jsonb,
    job_snapshot jsonb,
    attempt integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_application public.applications%rowtype;
    v_attempt integer;
begin
    select * into v_application
    from public.applications
    where (p_application_id is null or id = p_application_id)
      and (
        (score_status in ('pending', 'failed') and (score_next_retry_at is null or score_next_retry_at <= now()))
        or (score_status = 'processing' and score_started_at < now() - interval '10 minutes')
      )
    order by created_at
    for update skip locked
    limit 1;

    if not found then return; end if;

    if (select count(*) from public.application_scoring_events
        where profile_id = v_application.profile_id
          and event_type = 'attempt_started'
          and created_at >= now() - interval '24 hours') >= 20 then
        update public.applications
        set score_status = 'failed', score_next_retry_at = null,
            score_last_error_code = 'usage_limit'
        where id = v_application.id;
        insert into public.application_scoring_events(application_id, profile_id, attempt, event_type, error_code)
        values (v_application.id, v_application.profile_id, v_application.score_attempts, 'usage_limited', 'usage_limit');
        return;
    end if;

    v_attempt := v_application.score_attempts + 1;
    update public.applications
    set score_status = 'processing', score_attempts = v_attempt,
        score_started_at = now(), score_next_retry_at = null, score_last_error_code = null
    where id = v_application.id;
    insert into public.application_scoring_events(application_id, profile_id, attempt, event_type)
    values (v_application.id, v_application.profile_id, v_attempt, 'attempt_started');

    return query select v_application.id, v_application.profile_id,
        v_application.resume_snapshot, v_application.job_snapshot, v_attempt;
end;
$$;
revoke all on function public.claim_application_scoring(uuid) from public, anon, authenticated;
grant execute on function public.claim_application_scoring(uuid) to service_role;

-- The complete resume replacement remains atomic and rejects stale editors.
drop function if exists public.save_candidate_resume(uuid, jsonb);
create or replace function public.save_candidate_resume(
    p_resume_id uuid,
    p_resume jsonb,
    p_expected_version bigint default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare v_version bigint;
begin
    if auth.uid() is null then raise exception 'not authenticated'; end if;
    select version into v_version from public.resumes
    where id = p_resume_id and profile_id = auth.uid() for update;
    if not found then raise exception 'resume not found'; end if;
    if p_expected_version is not null and v_version <> p_expected_version then
        raise exception 'resume version conflict' using errcode = '40001';
    end if;

    update public.resumes
    set title = coalesce(nullif(trim(p_resume->>'title'), ''), 'Untitled Resume'),
        summary = nullif(p_resume->>'summary', ''), updated_at = now(), version = version + 1
    where id = p_resume_id and profile_id = auth.uid()
    returning version into v_version;

    delete from public.resume_experiences where resume_id = p_resume_id;
    delete from public.resume_education where resume_id = p_resume_id;
    delete from public.resume_skills where resume_id = p_resume_id;
    delete from public.resume_projects where resume_id = p_resume_id;

    insert into public.resume_experiences (resume_id, company, position, location, start_date, end_date, is_current, description)
    select p_resume_id, item.company, item.position, nullif(item.location, ''), nullif(item.start_date, ''), nullif(item.end_date, ''), item.is_current = 'true', nullif(item.description, '')
    from jsonb_to_recordset(coalesce(p_resume->'experience', '[]'::jsonb)) as item(company text, position text, location text, start_date text, end_date text, is_current text, description text);
    insert into public.resume_education (resume_id, institution, degree, field_of_study, start_date, end_date, grade)
    select p_resume_id, item.institution, item.degree, nullif(item.field_of_study, ''), nullif(item.start_date, ''), nullif(item.end_date, ''), nullif(item.grade, '')
    from jsonb_to_recordset(coalesce(p_resume->'education', '[]'::jsonb)) as item(institution text, degree text, field_of_study text, start_date text, end_date text, grade text);
    insert into public.resume_skills (resume_id, skill)
    select p_resume_id, item.skill from jsonb_to_recordset(coalesce(p_resume->'skills', '[]'::jsonb)) as item(skill text);
    insert into public.resume_projects (resume_id, title, description, technologies, github_url, live_url)
    select p_resume_id, item.title, nullif(item.description, ''), nullif(item.technologies, ''), nullif(item.github_url, ''), nullif(item.live_url, '')
    from jsonb_to_recordset(coalesce(p_resume->'projects', '[]'::jsonb)) as item(title text, description text, technologies text, github_url text, live_url text);
    return v_version;
end;
$$;
revoke all on function public.save_candidate_resume(uuid, jsonb, bigint) from public;
grant execute on function public.save_candidate_resume(uuid, jsonb, bigint) to authenticated;

create or replace function public.create_candidate_resume(p_resume jsonb)
returns table (id uuid, version bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare v_id uuid; v_version bigint;
begin
    if auth.uid() is null then raise exception 'not authenticated'; end if;
    insert into public.resumes(profile_id, title, summary, is_default)
    values (auth.uid(), coalesce(nullif(trim(p_resume->>'title'), ''), 'Untitled Resume'), nullif(p_resume->>'summary', ''), false)
    returning resumes.id into v_id;
    v_version := public.save_candidate_resume(v_id, p_resume, null);
    return query select v_id, v_version;
end;
$$;
revoke all on function public.create_candidate_resume(jsonb) from public;
grant execute on function public.create_candidate_resume(jsonb) to authenticated;

#!/usr/bin/env bash
set -euo pipefail

# This script targets only `supabase start` local containers. It never accepts
# a remote URL, linked project, or production credential.
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required for isolated Supabase verification." >&2
  exit 2
fi

supabase db reset --local --no-seed
eval "$(supabase status -o env)"
: "${DB_URL:?Supabase did not return a local DB_URL}"

# Prove the upgrade path from the last audited migration before the new one.
supabase db reset --local --no-seed --version 20260824000000
eval "$(supabase status -o env)"

psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
set session_replication_role = replica;
insert into public.profiles (id, role, full_name, phone) values
  ('00000000-0000-0000-0000-000000000101', 'candidate', 'Synthetic Candidate', '5550101'),
  ('00000000-0000-0000-0000-000000000102', 'employer', 'Synthetic Owner', '5550102'),
  ('00000000-0000-0000-0000-000000000103', 'employer', 'Synthetic Stranger', '5550103');
insert into public.jobs (id, profile_id, title, company, description) values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000102', 'Synthetic role', 'CareerOS Test', 'Requires React');
insert into public.resumes (id, profile_id, title, summary) values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101', 'Synthetic résumé', 'React developer');
insert into public.applications (id, profile_id, job_id, resume_id, status, match_score) values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', 'interviewing', 19);
set session_replication_role = origin;
SQL

supabase migration up --local

psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
do $$ begin
  if (select count(*) from public.applications where id = '00000000-0000-0000-0000-000000000401') <> 1 then raise exception 'historical application was lost'; end if;
  if (select status from public.applications where id = '00000000-0000-0000-0000-000000000401') <> 'interview' then raise exception 'status alias was not canonicalized'; end if;
  if (select score_status from public.applications where id = '00000000-0000-0000-0000-000000000401') <> 'legacy' then raise exception 'historical score is not marked legacy'; end if;
end $$;

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
do $$ begin
  if (select count(*) from public.applications) <> 1 then raise exception 'candidate cannot read own application'; end if;
  if (select count(*) from public.resumes) <> 1 then raise exception 'candidate cannot read own resume'; end if;
end $$;
rollback;

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
do $$ begin
  if (select count(*) from public.applications) <> 1 then raise exception 'owner cannot read application'; end if;
  if (select count(*) from public.resumes) <> 1 then raise exception 'owner cannot read submitted resume'; end if;
  if (select count(*) from public.profiles where id = '00000000-0000-0000-0000-000000000101') <> 0 then raise exception 'owner can directly read candidate phone/profile'; end if;
end $$;
rollback;

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000103', true);
do $$ begin
  if (select count(*) from public.applications) <> 0 then raise exception 'unrelated employer reads application'; end if;
  if (select count(*) from public.resumes) <> 0 then raise exception 'unrelated employer reads resume'; end if;
end $$;
rollback;
SQL

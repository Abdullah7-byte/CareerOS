-- Historical withdrawals may coexist, but a candidate can have only one
-- non-withdrawn application for a given job at any time.
create unique index applications_one_active_per_candidate_job_idx
on public.applications (profile_id, job_id)
where status <> 'withdrawn';

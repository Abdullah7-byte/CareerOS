-- Run with `supabase test db` after loading disposable synthetic fixtures.
-- Fixture IDs are intentionally supplied by the test runner, never production.
begin;
select plan(3);

-- The harness must set these settings for candidate, job-owner employer, and
-- unrelated employer before executing the corresponding assertions.
-- Example: select set_config('request.jwt.claim.sub', :'candidate_id', true);
--          set local role authenticated;

select has_function('public', 'is_job_owner', 'job ownership helper exists');
select policies_are('public', 'applications', array[
  'Users can view their own applications',
  'Job owners can view applications for their jobs',
  'Employers can update applications for their own jobs'
], 'application read/update policies are explicit');
select has_policy('public', 'resumes', 'Job owners can view submitted resumes', 'submitted résumé policy exists');

select * from finish();
rollback;

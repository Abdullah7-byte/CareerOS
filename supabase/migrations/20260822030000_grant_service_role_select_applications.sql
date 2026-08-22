-- Grant the trusted server role permission to select application rows
-- This is required because the server-side insert uses a returning/select
-- operation after the insert (`.select(...).single()`), which requires SELECT
-- privilege for the executing DB role.

grant select on table public.applications to service_role;

-- Grant the trusted server role permission to insert application rows
-- Keep authenticated revoked (candidates cannot directly insert)

grant insert on table public.applications to service_role;

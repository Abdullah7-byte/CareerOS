-- Keep profile updates scoped to the authenticated user's own row.
-- The role column is protected separately by the column-level grant.
drop policy if exists "Users can update their own profile without changing role" on public.profiles;

create policy "Users can update their own profile without changing role"
on public.profiles
for update
to authenticated
using (
    id = (select auth.uid())
)
with check (
    id = (select auth.uid())
);
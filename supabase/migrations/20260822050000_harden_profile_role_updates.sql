drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can create candidate profiles"
on public.profiles
for insert
to authenticated
with check (
    id = (select auth.uid())
    and role = 'candidate'
);

create policy "Users can update their own profile without changing role"
on public.profiles
for update
to authenticated
using (
    id = (select auth.uid())
)
with check (
    id = (select auth.uid())
    and role = (
        select role
        from public.profiles
        where id = (select auth.uid())
    )
);

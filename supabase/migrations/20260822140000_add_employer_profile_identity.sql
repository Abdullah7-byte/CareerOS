alter table public.profiles
    add column if not exists organization_name varchar(150),
    add column if not exists organization_website varchar(200),
    add column if not exists recruiter_name varchar(120),
    add column if not exists recruiter_title varchar(120);

grant update (organization_name, organization_website, recruiter_name, recruiter_title)
on table public.profiles to authenticated;
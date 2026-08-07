create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    full_name varchar(120),
    headline varchar(120),
    location varchar(150),
    phone varchar(20),
    avatar_url text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.resumes (
    id uuid primary key default gen_random_uuid(),

    profile_id uuid not null
        references public.profiles(id)
        on delete cascade,

    title varchar(120) not null,
    summary text,
    is_default boolean not null default false,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.resume_experiences (
    id uuid primary key default gen_random_uuid(),

    resume_id uuid not null
        references public.resumes(id)
        on delete cascade,

    company varchar(150) not null,
    position varchar(150) not null,
    location varchar(150),

    start_date date not null,
    end_date date,

    is_current boolean not null default false,
    description text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    check (
        end_date is null
        or end_date >= start_date
    )
);

create table public.resume_education (
    id uuid primary key default gen_random_uuid(),

    resume_id uuid not null
        references public.resumes(id)
        on delete cascade,

    institution varchar(200) not null,
    degree varchar(150) not null,
    field_of_study varchar(150),

    start_date date,
    end_date date,

    grade varchar(50),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    check (
        start_date is null
        or end_date is null
        or end_date >= start_date
    )
);

create table public.resume_projects (
    id uuid primary key default gen_random_uuid(),

    resume_id uuid not null
        references public.resumes(id)
        on delete cascade,

    title varchar(200) not null,
    description text,
    technologies text,
    github_url text,
    live_url text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.resume_skills (
    id uuid primary key default gen_random_uuid(),

    resume_id uuid not null
        references public.resumes(id)
        on delete cascade,

    skill varchar(100) not null,

    created_at timestamptz not null default now()
);

create table public.jobs (
    id uuid primary key default gen_random_uuid(),

    profile_id uuid not null
        references public.profiles(id)
        on delete cascade,

    title varchar(150) not null,
    company varchar(150) not null,
    location varchar(150),
    description text,

    employment_type text
        check (
            employment_type in (
                'full_time',
                'part_time',
                'internship',
                'contract',
                'freelance'
            )
        ),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.applications (
    id uuid primary key default gen_random_uuid(),

    profile_id uuid not null
        references public.profiles(id)
        on delete cascade,

    job_id uuid not null
        references public.jobs(id)
        on delete cascade,

    status text not null
        default 'applied'
        check (
            status in (
                'applied',
                'interview',
                'offer',
                'rejected'
            )
        ),

    applied_at timestamptz not null default now(),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
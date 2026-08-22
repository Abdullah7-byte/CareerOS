-- 1. Add role column with check constraint
ALTER TABLE public.profiles 
  ADD COLUMN role text NOT NULL DEFAULT 'candidate' 
  CHECK (role IN ('candidate', 'employer'));

-- 2. Backfill existing job creators to 'employer'
UPDATE public.profiles
SET role = 'employer'
WHERE id IN (
  SELECT DISTINCT profile_id FROM public.jobs
);

-- 3. Update signup trigger to capture role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES (
        new.id,
        coalesce(new.raw_user_meta_data->>'role', 'candidate')
    );
    RETURN new;
END;
$$;

-- 4. Restrict jobs insert to employers
DROP POLICY IF EXISTS "Users can create their own jobs" ON public.jobs;

CREATE POLICY "Employers can create jobs"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT auth.uid()) = profile_id
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND role = 'employer'
    )
);

-- 5. Restrict applications insert to candidates
DROP POLICY IF EXISTS "Users can create their own applications" ON public.applications;

CREATE POLICY "Candidates can create applications"
ON public.applications
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT auth.uid()) = profile_id
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND role = 'candidate'
    )
);

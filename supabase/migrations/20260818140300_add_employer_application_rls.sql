-- Job owners can view applications for their jobs
CREATE POLICY "Job owners can view applications for their jobs"
ON public.applications
FOR SELECT
TO authenticated
USING (
    job_id IN (
        SELECT id FROM public.jobs WHERE profile_id = (SELECT auth.uid())
    )
);

-- Job owners can update applications for their jobs
CREATE POLICY "Job owners can update applications for their jobs"
ON public.applications
FOR UPDATE
TO authenticated
USING (
    job_id IN (
        SELECT id FROM public.jobs WHERE profile_id = (SELECT auth.uid())
    )
);

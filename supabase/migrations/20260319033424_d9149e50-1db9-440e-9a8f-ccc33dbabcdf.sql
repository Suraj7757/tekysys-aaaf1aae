
-- Add ON DELETE CASCADE to payments.repair_job_id so permanent delete of jobs cascades
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_repair_job_id_fkey;
ALTER TABLE public.payments ADD CONSTRAINT payments_repair_job_id_fkey 
  FOREIGN KEY (repair_job_id) REFERENCES public.repair_jobs(id) ON DELETE CASCADE;

-- Allow admins to view all profiles (for user management)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage roles
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

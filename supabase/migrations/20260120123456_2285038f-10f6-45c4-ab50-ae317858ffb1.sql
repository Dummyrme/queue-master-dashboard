-- Fix workers table RLS policies - remove overly permissive policies
DROP POLICY IF EXISTS "Allow public delete workers" ON public.workers;
DROP POLICY IF EXISTS "Allow public insert workers" ON public.workers;
DROP POLICY IF EXISTS "Allow public read workers" ON public.workers;
DROP POLICY IF EXISTS "Allow public update workers" ON public.workers;

-- Workers are now managed through profiles, so only admins can manage workers table
CREATE POLICY "Admins can view workers"
ON public.workers FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert workers"
ON public.workers FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update workers"
ON public.workers FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete workers"
ON public.workers FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Approved users can view workers for selection dropdown
CREATE POLICY "Approved users can view workers"
ON public.workers FOR SELECT
TO authenticated
USING (public.is_approved(auth.uid()));
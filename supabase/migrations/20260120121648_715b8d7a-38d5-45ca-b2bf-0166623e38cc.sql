-- Create workers table
CREATE TABLE public.workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create queue_items table
CREATE TABLE public.queue_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  claimed_by TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on both tables (but allow public access for now since no auth)
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for this dashboard)
CREATE POLICY "Allow public read workers" ON public.workers FOR SELECT USING (true);
CREATE POLICY "Allow public insert workers" ON public.workers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update workers" ON public.workers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete workers" ON public.workers FOR DELETE USING (true);

CREATE POLICY "Allow public read queue_items" ON public.queue_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert queue_items" ON public.queue_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update queue_items" ON public.queue_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete queue_items" ON public.queue_items FOR DELETE USING (true);

-- Enable realtime for queue_items
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workers;

-- Insert initial workers
INSERT INTO public.workers (name) VALUES 
  ('_h2o');

-- Insert sample queue items
INSERT INTO public.queue_items (title, description, price, status, claimed_by, deadline, created_at, completed_at) VALUES
  ('Test', 'Test', 1, 'completed', '_h2o', '2024-01-20'::timestamp, '2024-01-15'::timestamp, '2024-01-18'::timestamp);
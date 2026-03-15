
-- Speakers table
CREATE TABLE public.speakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  expertise text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  photo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read speakers" ON public.speakers FOR SELECT TO authenticated USING (true);

-- Mentors table
CREATE TABLE public.mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  area text NOT NULL DEFAULT '',
  years integer NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  photo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read mentors" ON public.mentors FOR SELECT TO authenticated USING (true);

-- Communities table
CREATE TABLE public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  members integer NOT NULL DEFAULT 0,
  icon text NOT NULL DEFAULT 'Globe',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read communities" ON public.communities FOR SELECT TO authenticated USING (true);

-- Catering companies table
CREATE TABLE public.catering_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Coffee',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.catering_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read catering" ON public.catering_companies FOR SELECT TO authenticated USING (true);

-- Insert speakers data
INSERT INTO public.speakers (name, expertise, company, bio) VALUES
('Sarah Chen', 'AI & Machine Learning', 'OpenAI', 'AI engineer passionate about making machine learning accessible to developer communities worldwide.'),
('David Martinez', 'Startup Growth', 'YC Alumni', 'Serial entrepreneur and YC alum who loves sharing lessons on building products and scaling teams.'),
('Anna Petrova', 'Developer Relations', 'Google', 'DevRel lead focused on building bridges between engineering teams and developer communities.');

-- Insert mentors data
INSERT INTO public.mentors (name, area, years, description) VALUES
('James Okafor', 'Leadership & Scaling', 12, 'Helps community leaders develop strategies for sustainable growth and member engagement.'),
('Priya Sharma', 'Product Management', 8, 'Guides founders and community builders on product thinking and user-centric development.'),
('Erik Lindqvist', 'Community Building', 15, 'Veteran community builder with experience growing developer communities from zero to thousands.');

-- Insert communities data
INSERT INTO public.communities (name, description, members, icon) VALUES
('GDG Baku', 'Developer community focused on Google technologies.', 1240, 'Globe'),
('Cursor Community', 'AI and developer tool enthusiasts.', 890, 'Code'),
('Startup Azerbaijan', 'Startup founders and builders community.', 2100, 'Rocket');

-- Insert catering data
INSERT INTO public.catering_companies (name, type, location, icon) VALUES
('BrewBox', 'Coffee & Beverages', 'San Francisco, CA', 'Coffee'),
('FeastMode Catering', 'Full Meals', 'New York, NY', 'UtensilsCrossed'),
('SnackStack', 'Snacks & Light Bites', 'Austin, TX', 'Sandwich');

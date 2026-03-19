
-- 1. Add image_url to trips
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Storage Setup for Trip Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trip-images', 'trip-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for trip-images
CREATE POLICY "Trip images are publicly accessible" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'trip-images');

CREATE POLICY "Staff can upload trip images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'trip-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Staff can update/delete trip images" 
  ON storage.objects FOR ALL 
  USING (
    bucket_id = 'trip-images' 
    AND auth.role() = 'authenticated'
  );

-- 3. Database Automation: Trigger for Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Assign 'diver' role by default in user_roles
  -- We use ON CONFLICT DO NOTHING to avoid issues if the frontend already did this
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'diver')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- 2. Create entry in diver_profiles
  -- We use ON CONFLICT DO NOTHING to avoid issues if the frontend already did this
  INSERT INTO public.diver_profiles (user_id, full_name, certification)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'none'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger on auth.users (requires superuser or bypassrls, but usually fine in migrations)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

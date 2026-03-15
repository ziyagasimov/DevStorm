
-- Allow authenticated users to read all profiles (needed for user search in messages)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Authenticated can read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

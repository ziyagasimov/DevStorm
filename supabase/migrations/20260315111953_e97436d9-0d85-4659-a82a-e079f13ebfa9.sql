
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );

  -- Insert user role from metadata
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'user'::app_role)
  );

  -- Insert role-specific profile based on metadata
  IF NEW.raw_user_meta_data->>'role' = 'speaker' THEN
    INSERT INTO public.speaker_profiles (user_id, first_name, last_name, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'first_name', ''), COALESCE(NEW.raw_user_meta_data->>'last_name', ''), NEW.email);
  ELSIF NEW.raw_user_meta_data->>'role' = 'mentor' THEN
    INSERT INTO public.mentor_profiles (user_id, first_name, last_name, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'first_name', ''), COALESCE(NEW.raw_user_meta_data->>'last_name', ''), NEW.email);
  ELSIF NEW.raw_user_meta_data->>'role' = 'catering' THEN
    INSERT INTO public.catering_profiles (user_id, manager_first_name, manager_last_name, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'first_name', ''), COALESCE(NEW.raw_user_meta_data->>'last_name', ''), NEW.email);
  ELSIF NEW.raw_user_meta_data->>'role' = 'community' THEN
    INSERT INTO public.community_profiles (user_id, leader_first_name, leader_last_name, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'first_name', ''), COALESCE(NEW.raw_user_meta_data->>'last_name', ''), NEW.email);
  END IF;

  RETURN NEW;
END;
$$;

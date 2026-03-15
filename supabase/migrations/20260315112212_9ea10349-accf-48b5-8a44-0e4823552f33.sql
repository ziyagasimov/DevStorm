
-- Fix existing users: insert missing roles
INSERT INTO public.user_roles (user_id, role) VALUES
  ('fbe80c93-636c-4628-8f8d-8a6487e1382b', 'user'),
  ('a79bc111-e3e4-4484-9dd3-95af285b55c3', 'user'),
  ('611d061f-5aeb-4913-b8a0-07514c1623a9', 'speaker')
ON CONFLICT DO NOTHING;

-- Fix existing speaker: insert missing speaker_profile
INSERT INTO public.speaker_profiles (user_id, first_name, last_name, email)
VALUES ('611d061f-5aeb-4913-b8a0-07514c1623a9', 'Ziya', 'Qasimov', 'ziyaqasimov7@gmail.com')
ON CONFLICT DO NOTHING;

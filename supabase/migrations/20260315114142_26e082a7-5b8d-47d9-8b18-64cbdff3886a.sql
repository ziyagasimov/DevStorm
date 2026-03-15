
-- Create a function to atomically create a conversation with participants
CREATE OR REPLACE FUNCTION public.create_conversation(other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_conv_id uuid;
BEGIN
  -- Create conversation
  INSERT INTO public.conversations DEFAULT VALUES
  RETURNING id INTO new_conv_id;

  -- Add both participants
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES
    (new_conv_id, auth.uid()),
    (new_conv_id, other_user_id);

  RETURN new_conv_id;
END;
$$;

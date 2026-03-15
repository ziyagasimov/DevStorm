
-- Enable RLS on tables that are missing it (some may already be enabled, using IF NOT EXISTS pattern)
DO $$ BEGIN
  ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- RLS policies for conversations (drop if exists first)
DROP POLICY IF EXISTS "Members can read conversations" ON public.conversations;
CREATE POLICY "Members can read conversations" ON public.conversations FOR SELECT TO authenticated
  USING (public.is_conversation_member(auth.uid(), id));

DROP POLICY IF EXISTS "Authenticated can create conversations" ON public.conversations;
CREATE POLICY "Authenticated can create conversations" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (true);

-- RLS policies for conversation_participants
DROP POLICY IF EXISTS "Members can read participants" ON public.conversation_participants;
CREATE POLICY "Members can read participants" ON public.conversation_participants FOR SELECT TO authenticated
  USING (public.is_conversation_member(auth.uid(), conversation_id));

DROP POLICY IF EXISTS "Authenticated can insert participants" ON public.conversation_participants;
CREATE POLICY "Authenticated can insert participants" ON public.conversation_participants FOR INSERT TO authenticated
  WITH CHECK (true);

-- RLS policies for messages
DROP POLICY IF EXISTS "Members can read messages" ON public.messages;
CREATE POLICY "Members can read messages" ON public.messages FOR SELECT TO authenticated
  USING (public.is_conversation_member(auth.uid(), conversation_id));

DROP POLICY IF EXISTS "Members can send messages" ON public.messages;
CREATE POLICY "Members can send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND public.is_conversation_member(auth.uid(), conversation_id));

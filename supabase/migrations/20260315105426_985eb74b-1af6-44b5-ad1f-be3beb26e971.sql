
-- Create role enum
create type public.app_role as enum ('user', 'speaker', 'mentor', 'catering', 'community');

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'user',
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- Security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

-- Security definer function to get user role
create or replace function public.get_user_role(_user_id uuid)
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_roles where user_id = _user_id limit 1
$$;

-- RLS for user_roles
create policy "Users can read own role" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own role" on public.user_roles for insert to authenticated with check (auth.uid() = user_id);

-- Speaker profiles
create table public.speaker_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  first_name text not null default '',
  last_name text not null default '',
  email text,
  experience text not null default '',
  expertise text not null default '',
  company text not null default '',
  years_of_experience integer not null default 0,
  bio text not null default '',
  photo_url text,
  created_at timestamptz not null default now()
);
alter table public.speaker_profiles enable row level security;
create policy "Anyone can read speaker profiles" on public.speaker_profiles for select to authenticated using (true);
create policy "Users can insert own speaker profile" on public.speaker_profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own speaker profile" on public.speaker_profiles for update to authenticated using (auth.uid() = user_id);

-- Mentor profiles
create table public.mentor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  first_name text not null default '',
  last_name text not null default '',
  email text,
  experience text not null default '',
  expertise_area text not null default '',
  years_of_experience integer not null default 0,
  description text not null default '',
  photo_url text,
  created_at timestamptz not null default now()
);
alter table public.mentor_profiles enable row level security;
create policy "Anyone can read mentor profiles" on public.mentor_profiles for select to authenticated using (true);
create policy "Users can insert own mentor profile" on public.mentor_profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own mentor profile" on public.mentor_profiles for update to authenticated using (auth.uid() = user_id);

-- Catering profiles
create table public.catering_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  company_name text not null default '',
  services_offered text not null default '',
  pricing text not null default '',
  location text not null default '',
  manager_first_name text not null default '',
  manager_last_name text not null default '',
  email text,
  photo_url text,
  created_at timestamptz not null default now()
);
alter table public.catering_profiles enable row level security;
create policy "Anyone can read catering profiles" on public.catering_profiles for select to authenticated using (true);
create policy "Users can insert own catering profile" on public.catering_profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own catering profile" on public.catering_profiles for update to authenticated using (auth.uid() = user_id);

-- Community profiles
create table public.community_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  community_name text not null default '',
  description text not null default '',
  num_events integer not null default 0,
  locations text not null default '',
  leader_first_name text not null default '',
  leader_last_name text not null default '',
  email text,
  photo_url text,
  created_at timestamptz not null default now()
);
alter table public.community_profiles enable row level security;
create policy "Anyone can read community profiles" on public.community_profiles for select to authenticated using (true);
create policy "Users can insert own community profile" on public.community_profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own community profile" on public.community_profiles for update to authenticated using (auth.uid() = user_id);

-- Conversations
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);
alter table public.conversations enable row level security;

-- Conversation participants
create table public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (conversation_id, user_id)
);
alter table public.conversation_participants enable row level security;

-- Messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;

-- Security definer function for conversation membership
create or replace function public.is_conversation_member(_user_id uuid, _conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_participants
    where user_id = _user_id and conversation_id = _conversation_id
  )
$$;

-- RLS for conversations
create policy "Users can read own conversations" on public.conversations for select to authenticated
  using (public.is_conversation_member(auth.uid(), id));
create policy "Authenticated users can create conversations" on public.conversations for insert to authenticated
  with check (true);

-- RLS for conversation_participants
create policy "Users can read participants of own conversations" on public.conversation_participants for select to authenticated
  using (public.is_conversation_member(auth.uid(), conversation_id));
create policy "Users can add participants" on public.conversation_participants for insert to authenticated
  with check (true);

-- RLS for messages
create policy "Users can read messages in own conversations" on public.messages for select to authenticated
  using (public.is_conversation_member(auth.uid(), conversation_id));
create policy "Users can send messages to own conversations" on public.messages for insert to authenticated
  with check (auth.uid() = sender_id and public.is_conversation_member(auth.uid(), conversation_id));

-- Enable realtime for messages
alter publication supabase_realtime add table messages;

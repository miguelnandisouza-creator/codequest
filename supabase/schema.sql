-- CodeQuest Supabase schema
-- Run this in the Supabase SQL editor before enabling the Supabase repository.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.codequest_users (
  id uuid primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  password_salt text not null,
  password_version integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.player_progress (
  user_id uuid primary key,
  player jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.progress_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  player jsonb not null,
  reason text not null default 'before_write',
  created_at timestamptz not null default now()
);

create table if not exists public.player_inventory (
  user_id uuid primary key,
  owned_reward_ids text[] not null default '{}',
  equipped_avatar_id text,
  equipped_pet_id text,
  equipped_theme_id text,
  equipped_frame_id text,
  equipped_effect_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.surprise_exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  question text not null,
  options jsonb not null,
  correct_answer text not null,
  reward_xp integer not null default 0,
  reward_coins integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  assigned_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  stage_id text,
  step_title text,
  answer text not null,
  success boolean not null,
  feedback text,
  created_at timestamptz not null default now()
);

alter table public.attempts
add column if not exists step_title text;

create table if not exists public.student_notes (
  user_id uuid not null,
  stage_id text not null,
  content text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, stage_id)
);

create table if not exists public.admin_roles (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_type text not null default 'global' check (room_type in ('global', 'private')),
  sender_id uuid not null,
  receiver_id uuid,
  sender_name text not null,
  body text not null,
  attachment_type text check (attachment_type in ('video')),
  attachment_url text,
  attachment_name text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.chat_messages
add column if not exists attachment_type text check (attachment_type in ('video')),
add column if not exists attachment_url text,
add column if not exists attachment_name text;

create index if not exists chat_messages_global_idx
on public.chat_messages (created_at desc)
where room_type = 'global' and deleted_at is null;

create index if not exists chat_messages_private_idx
on public.chat_messages (sender_id, receiver_id, created_at desc)
where room_type = 'private' and deleted_at is null;

insert into public.admin_roles (email)
values ('miguelnandisouza@gmail.com')
on conflict (email) do nothing;

alter table public.profiles enable row level security;
alter table public.codequest_users enable row level security;
alter table public.player_progress enable row level security;
alter table public.progress_snapshots enable row level security;
alter table public.player_inventory enable row level security;
alter table public.surprise_exams enable row level security;
alter table public.attempts enable row level security;
alter table public.admin_roles enable row level security;
alter table public.chat_messages enable row level security;
alter table public.student_notes enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "player_progress_select_own" on public.player_progress;
drop policy if exists "player_progress_write_own" on public.player_progress;
drop policy if exists "progress_snapshots_select_own" on public.progress_snapshots;
drop policy if exists "player_inventory_select_own" on public.player_inventory;
drop policy if exists "player_inventory_write_own" on public.player_inventory;
drop policy if exists "surprise_exams_select_own" on public.surprise_exams;
drop policy if exists "attempts_select_own" on public.attempts;
drop policy if exists "attempts_insert_own" on public.attempts;
drop policy if exists "student_notes_select_own" on public.student_notes;
drop policy if exists "student_notes_write_own" on public.student_notes;
drop policy if exists "chat_messages_select_visible" on public.chat_messages;
drop policy if exists "chat_messages_insert_own" on public.chat_messages;

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "player_progress_select_own"
on public.player_progress for select
using (auth.uid() = user_id);

create policy "player_progress_write_own"
on public.player_progress for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "progress_snapshots_select_own"
on public.progress_snapshots for select
using (auth.uid() = user_id);

create policy "player_inventory_select_own"
on public.player_inventory for select
using (auth.uid() = user_id);

create policy "player_inventory_write_own"
on public.player_inventory for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "surprise_exams_select_own"
on public.surprise_exams for select
using (auth.uid() = user_id);

create policy "attempts_select_own"
on public.attempts for select
using (auth.uid() = user_id);

create policy "attempts_insert_own"
on public.attempts for insert
with check (auth.uid() = user_id);

create policy "student_notes_select_own"
on public.student_notes for select
using (auth.uid() = user_id);

create policy "student_notes_write_own"
on public.student_notes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "chat_messages_select_visible"
on public.chat_messages for select
using (
  room_type = 'global'
  or auth.uid() = sender_id
  or auth.uid() = receiver_id
);

create policy "chat_messages_insert_own"
on public.chat_messages for insert
with check (auth.uid() = sender_id);

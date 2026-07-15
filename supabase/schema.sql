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
  answer text not null,
  success boolean not null,
  feedback text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_roles (
  email text primary key,
  created_at timestamptz not null default now()
);

insert into public.admin_roles (email)
values ('miguelnandisouza@gmail.com')
on conflict (email) do nothing;

alter table public.profiles enable row level security;
alter table public.codequest_users enable row level security;
alter table public.player_progress enable row level security;
alter table public.player_inventory enable row level security;
alter table public.surprise_exams enable row level security;
alter table public.attempts enable row level security;
alter table public.admin_roles enable row level security;

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

-- Run this entire script in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.food_entries (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  food_id text not null,
  food_name text not null,
  quantity numeric not null check (quantity > 0),
  kcal numeric not null check (kcal >= 0),
  protein numeric not null default 0 check (protein >= 0),
  meal text not null default 'Lunch',
  created_at_ms bigint not null
);

create index if not exists food_entries_user_date_idx
  on public.food_entries(user_id, entry_date);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_target integer not null default 1500 check (daily_target between 500 and 10000),
  updated_at timestamptz not null default now()
);

create table if not exists public.custom_foods (
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id text not null,
  name text not null,
  category text not null default 'My foods',
  kcal_per_100 numeric not null check (kcal_per_100 >= 0),
  protein_per_100 numeric not null default 0 check (protein_per_100 >= 0),
  unit text not null check (unit in ('g','ml','piece')),
  basis text not null,
  aliases text[] not null default '{}',
  primary key (user_id, food_id)
);

alter table public.food_entries enable row level security;
alter table public.user_settings enable row level security;
alter table public.custom_foods enable row level security;

drop policy if exists "Users manage their own food entries" on public.food_entries;
create policy "Users manage their own food entries"
on public.food_entries for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage their own settings" on public.user_settings;
create policy "Users manage their own settings"
on public.user_settings for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage their own custom foods" on public.custom_foods;
create policy "Users manage their own custom foods"
on public.custom_foods for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Required for realtime subscriptions on food entries.
alter publication supabase_realtime add table public.food_entries;

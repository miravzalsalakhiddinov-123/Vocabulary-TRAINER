-- ============================================================
-- Vocabulary Trainer — Telegram login / stats / referrals
-- Run this ONCE in Supabase → SQL Editor → New query, AFTER schema.sql.
-- Adds: app_users, sessions, study_events.
--
-- Security model: these tables have NO public policies. RLS is on and
-- deliberately has zero "using(true)" rules, so anon/authenticated
-- clients cannot read or write them directly, even with the anon key.
-- All access goes through the Edge Functions (telegram-auth,
-- resume-session, log-event, get-stats, send-reminders), which use the
-- service_role key server-side and therefore bypass RLS. Never expose
-- the service_role key in any client-side file.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  username text,
  first_name text not null default 'Student',
  photo_url text,
  referral_code text unique not null,
  referred_by uuid references app_users(id) on delete set null,
  referral_count integer not null default 0,
  bonus_unlocked boolean not null default false,
  xp integer not null default 0,
  streak_count integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  token text primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists study_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  word_en text not null,
  word_ru text,
  category text,
  book_title text,
  item_title text,
  result text not null check (result in ('known','weak')),
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_id_idx on sessions(user_id);
create index if not exists study_events_user_id_created_idx on study_events(user_id, created_at);
create index if not exists app_users_referral_code_idx on app_users(referral_code);

alter table app_users enable row level security;
alter table sessions enable row level security;
alter table study_events enable row level security;
-- No policies added on purpose — see note above.

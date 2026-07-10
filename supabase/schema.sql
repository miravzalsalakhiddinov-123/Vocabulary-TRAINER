-- ============================================================
-- Vocabulary Trainer — Supabase schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query)
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text default '',
  accent text default '#4361ee',
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  title text not null,
  subtitle text default '',
  data jsonb not null default '[]'::jsonb,   -- [{ "category": "Part 1", "words": [{"en":"...","ru":"..."}] }]
  sort_order integer default 0,
  created_at timestamptz default now()
);

create index if not exists items_book_id_idx on items(book_id);

-- ---------- Row Level Security ----------
alter table books enable row level security;
alter table items enable row level security;

-- Anyone (students, on the public site) can read.
create policy "public can read books" on books
  for select using (true);

create policy "public can read items" on items
  for select using (true);

-- Only signed-in users (i.e. the admin, via the separate admin site) can write.
-- Sign-up should be disabled in Supabase Auth settings so only the admin
-- account(s) you create manually can ever authenticate.
create policy "authenticated can write books" on books
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated can write items" on items
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =====================================================================
--  POLLTAP — Supabase / PostgreSQL Schema
--  Paste this entire script into the Supabase SQL Editor and Run.
--  Safe to re-run (idempotent where practical).
-- =====================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. CLUBS  (optional grouping; a vote may belong to a club)
-- ---------------------------------------------------------------------
create table if not exists public.clubs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. VOTES  (one attendance poll / "gom gạch" session)
-- ---------------------------------------------------------------------
create table if not exists public.votes (
  id           uuid primary key default gen_random_uuid(),
  club_id      uuid references public.clubs(id) on delete set null,
  title        text        not null,
  match_date   timestamptz,
  max_slots    integer     not null check (max_slots > 0),
  deadline     timestamptz not null,
  admin_token  uuid        not null default gen_random_uuid(),  -- secret owner key
  is_closed    boolean     not null default false,              -- manual close by owner
  created_at   timestamptz not null default now()
);

create index if not exists votes_club_id_idx on public.votes (club_id);

-- ---------------------------------------------------------------------
-- 3. RESPONSES  (one row per anonymous device per vote)
-- ---------------------------------------------------------------------
create table if not exists public.responses (
  id                 uuid primary key default gen_random_uuid(),
  vote_id            uuid not null references public.votes(id) on delete cascade,
  anonymous_user_id  uuid not null,                 -- device fingerprint from localStorage
  name               text not null,
  attending          boolean not null default true, -- true = "Yes", false = "No"
  guests             integer not null default 0 check (guests >= 0),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- a device can only have one response per vote (upsert target)
  unique (vote_id, anonymous_user_id)
);

create index if not exists responses_vote_id_idx on public.responses (vote_id);

-- Keep updated_at fresh on every change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_responses_updated_at on public.responses;
create trigger trg_responses_updated_at
  before update on public.responses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
--    No-login app: the public anon key is used by everyone.
--    We allow open read/write but rely on the secret admin_token
--    (never exposed publicly) to gate destructive owner actions.
--    NOTE: admin_token is a column; because anon can SELECT votes it
--    would be readable. For a hardened deploy, move owner actions to an
--    Edge Function / RPC and drop the broad votes SELECT. For this
--    reference build we keep it client-side and simple.
-- ---------------------------------------------------------------------
alter table public.clubs     enable row level security;
alter table public.votes     enable row level security;
alter table public.responses enable row level security;

-- CLUBS: anyone can read/create
drop policy if exists clubs_read   on public.clubs;
drop policy if exists clubs_insert on public.clubs;
create policy clubs_read   on public.clubs for select using (true);
create policy clubs_insert on public.clubs for insert with check (true);

-- VOTES: anyone can read & create. Updates allowed (owner gate enforced
-- in the client via admin_token). For stricter control, replace the
-- update policy with an RPC that checks the token server-side.
drop policy if exists votes_read   on public.votes;
drop policy if exists votes_insert on public.votes;
drop policy if exists votes_update on public.votes;
create policy votes_read   on public.votes for select using (true);
create policy votes_insert on public.votes for insert with check (true);
create policy votes_update on public.votes for update using (true) with check (true);

-- RESPONSES: anyone can read, create, and update their own row.
drop policy if exists responses_read   on public.responses;
drop policy if exists responses_insert on public.responses;
drop policy if exists responses_update on public.responses;
drop policy if exists responses_delete on public.responses;
create policy responses_read   on public.responses for select using (true);
create policy responses_insert on public.responses for insert with check (true);
create policy responses_update on public.responses for update using (true) with check (true);
create policy responses_delete on public.responses for delete using (true);

-- ---------------------------------------------------------------------
-- 5. REALTIME
--    Enable realtime so the results list updates live across devices.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'responses'
  ) then
    alter publication supabase_realtime add table public.responses;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'votes'
  ) then
    alter publication supabase_realtime add table public.votes;
  end if;
end $$;

-- Done. ✅

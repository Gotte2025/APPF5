-- ============================================================
-- futbol5-saas · schema.sql
-- Multi-tenant: cada "complex" pertenece a un owner (profile).
-- ============================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------
-- profiles: extiende auth.users con datos de la app
-- ----------------------------------------------------------
create type user_role as enum ('owner', 'player');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  role user_role not null default 'player',
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Datos de perfil de cada usuario autenticado.';

-- ----------------------------------------------------------
-- complexes: el "tenant". Cada owner tiene uno o más.
-- ----------------------------------------------------------
create table public.complexes (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  address text,
  phone text,
  created_at timestamptz not null default now()
);

create index complexes_owner_id_idx on public.complexes(owner_id);

-- ----------------------------------------------------------
-- fields: canchas dentro de un complex
-- ----------------------------------------------------------
create table public.fields (
  id uuid primary key default uuid_generate_v4(),
  complex_id uuid not null references public.complexes(id) on delete cascade,
  name text not null,
  capacity int not null default 10 check (capacity between 2 and 22),
  surface text default 'sintético',
  created_at timestamptz not null default now()
);

create index fields_complex_id_idx on public.fields(complex_id);

-- ----------------------------------------------------------
-- matches: un turno/partido en una cancha, en fecha+hora
-- ----------------------------------------------------------
create type match_status as enum ('open', 'full', 'cancelled', 'finished');

create table public.matches (
  id uuid primary key default uuid_generate_v4(),
  field_id uuid not null references public.fields(id) on delete cascade,
  complex_id uuid not null references public.complexes(id) on delete cascade,
  starts_at timestamptz not null,
  duration_minutes int not null default 60,
  capacity int not null default 10 check (capacity between 2 and 22),
  status match_status not null default 'open',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index matches_field_id_idx on public.matches(field_id);
create index matches_complex_id_idx on public.matches(complex_id);
create index matches_starts_at_idx on public.matches(starts_at);

-- ----------------------------------------------------------
-- match_players: jugadores confirmados en un partido
-- ----------------------------------------------------------
create table public.match_players (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (match_id, player_id)
);

create index match_players_match_id_idx on public.match_players(match_id);

-- ----------------------------------------------------------
-- waiting_list: cola de espera cuando el partido está lleno
-- ----------------------------------------------------------
create table public.waiting_list (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.profiles(id) on delete cascade,
  requested_at timestamptz not null default now(),
  unique (match_id, player_id)
);

create index waiting_list_match_id_idx on public.waiting_list(match_id);

-- ----------------------------------------------------------
-- Vista de conveniencia: cupos ocupados por partido
-- ----------------------------------------------------------
create view public.match_occupancy as
select
  m.id as match_id,
  m.capacity,
  count(mp.id) as players_count,
  (count(mp.id) >= m.capacity) as is_full
from public.matches m
left join public.match_players mp on mp.match_id = m.id
group by m.id, m.capacity;

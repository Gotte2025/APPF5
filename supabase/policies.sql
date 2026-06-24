-- ============================================================
-- futbol5-saas · policies.sql
-- Multi-tenant: cada owner administra sus propios complejos.
-- Los jugadores tienen lectura pública de partidos/canchas
-- para poder anotarse, pero solo escriben su propia fila.
-- ============================================================

alter table public.profiles enable row level security;
alter table public.complexes enable row level security;
alter table public.fields enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.waiting_list enable row level security;

-- ----------------------------------------------------------
-- profiles
-- ----------------------------------------------------------
create policy "Cualquiera puede ver perfiles básicos"
  on public.profiles for select
  using (true);

create policy "Un usuario edita solo su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Un usuario inserta solo su propio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ----------------------------------------------------------
-- complexes (tenant)
-- ----------------------------------------------------------
create policy "Cualquiera puede ver complejos"
  on public.complexes for select
  using (true);

create policy "Un owner crea complejos a su propio nombre"
  on public.complexes for insert
  with check (
    auth.uid() = owner_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
  );

create policy "Un owner edita solo sus complejos"
  on public.complexes for update
  using (auth.uid() = owner_id);

create policy "Un owner elimina solo sus complejos"
  on public.complexes for delete
  using (auth.uid() = owner_id);

-- ----------------------------------------------------------
-- fields
-- ----------------------------------------------------------
create policy "Cualquiera puede ver canchas"
  on public.fields for select
  using (true);

create policy "El owner del complejo crea sus canchas"
  on public.fields for insert
  with check (
    exists (
      select 1 from public.complexes c
      where c.id = complex_id and c.owner_id = auth.uid()
    )
  );

create policy "El owner del complejo edita sus canchas"
  on public.fields for update
  using (
    exists (
      select 1 from public.complexes c
      where c.id = complex_id and c.owner_id = auth.uid()
    )
  );

create policy "El owner del complejo elimina sus canchas"
  on public.fields for delete
  using (
    exists (
      select 1 from public.complexes c
      where c.id = complex_id and c.owner_id = auth.uid()
    )
  );

-- ----------------------------------------------------------
-- matches
-- ----------------------------------------------------------
create policy "Cualquiera puede ver partidos"
  on public.matches for select
  using (true);

create policy "El owner del complejo crea partidos en sus canchas"
  on public.matches for insert
  with check (
    exists (
      select 1 from public.complexes c
      where c.id = complex_id and c.owner_id = auth.uid()
    )
  );

create policy "El owner del complejo edita sus partidos"
  on public.matches for update
  using (
    exists (
      select 1 from public.complexes c
      where c.id = complex_id and c.owner_id = auth.uid()
    )
  );

create policy "El owner del complejo elimina sus partidos"
  on public.matches for delete
  using (
    exists (
      select 1 from public.complexes c
      where c.id = complex_id and c.owner_id = auth.uid()
    )
  );

-- ----------------------------------------------------------
-- match_players
-- ----------------------------------------------------------
create policy "Cualquiera puede ver quién está anotado"
  on public.match_players for select
  using (true);

create policy "Un jugador se anota a sí mismo"
  on public.match_players for insert
  with check (auth.uid() = player_id);

create policy "Un jugador se borra a sí mismo, o el owner del partido lo borra"
  on public.match_players for delete
  using (
    auth.uid() = player_id
    or exists (
      select 1 from public.matches m
      join public.complexes c on c.id = m.complex_id
      where m.id = match_id and c.owner_id = auth.uid()
    )
  );

-- ----------------------------------------------------------
-- waiting_list
-- ----------------------------------------------------------
create policy "Cualquiera puede ver la lista de espera"
  on public.waiting_list for select
  using (true);

create policy "Un jugador se anota a sí mismo en la lista de espera"
  on public.waiting_list for insert
  with check (auth.uid() = player_id);

create policy "Un jugador se quita a sí mismo de la lista de espera"
  on public.waiting_list for delete
  using (auth.uid() = player_id);

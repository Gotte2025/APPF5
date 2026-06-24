-- ============================================================
-- futbol5-saas · triggers.sql
-- ============================================================

-- ----------------------------------------------------------
-- 1. Crear automáticamente un profile cuando se registra un
--    usuario en auth.users (lee metadata enviada en el signUp).
-- ----------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Jugador'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'player')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------
-- 2. Mantener el status del match sincronizado con la
--    cantidad de jugadores anotados (open <-> full).
-- ----------------------------------------------------------
create or replace function public.sync_match_status()
returns trigger as $$
declare
  v_match_id uuid;
  v_capacity int;
  v_count int;
begin
  v_match_id := coalesce(new.match_id, old.match_id);

  select capacity into v_capacity from public.matches where id = v_match_id;
  select count(*) into v_count from public.match_players where match_id = v_match_id;

  if v_count >= v_capacity then
    update public.matches set status = 'full' where id = v_match_id and status = 'open';
  else
    update public.matches set status = 'open' where id = v_match_id and status = 'full';
  end if;

  return null;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_match_players_change on public.match_players;
create trigger on_match_players_change
  after insert or delete on public.match_players
  for each row execute procedure public.sync_match_status();

-- ----------------------------------------------------------
-- 3. Al liberarse un lugar (delete en match_players), promover
--    automáticamente al primero de la waiting_list si existe.
-- ----------------------------------------------------------
create or replace function public.promote_from_waiting_list()
returns trigger as $$
declare
  v_capacity int;
  v_count int;
  v_next record;
begin
  select capacity into v_capacity from public.matches where id = old.match_id;
  select count(*) into v_count from public.match_players where match_id = old.match_id;

  if v_count < v_capacity then
    select * into v_next
    from public.waiting_list
    where match_id = old.match_id
    order by requested_at asc
    limit 1;

    if v_next.id is not null then
      insert into public.match_players (match_id, player_id)
      values (v_next.match_id, v_next.player_id)
      on conflict do nothing;

      delete from public.waiting_list where id = v_next.id;
    end if;
  end if;

  return old;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_match_player_leave on public.match_players;
create trigger on_match_player_leave
  after delete on public.match_players
  for each row execute procedure public.promote_from_waiting_list();

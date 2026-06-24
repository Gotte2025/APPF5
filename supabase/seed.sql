-- ============================================================
-- futbol5-saas · seed.sql
-- Datos de ejemplo para desarrollo local.
--
-- IMPORTANTE: los profiles dependen de usuarios reales en auth.users
-- (Supabase los crea automáticamente al hacer signUp). Por eso este
-- seed NO crea usuarios — primero registrate desde /register con
-- al menos una cuenta "owner" y una "player", y reemplazá los UUIDs
-- de ejemplo abajo por los reales (los podés ver en
-- Authentication > Users dentro del dashboard de Supabase, o con:
--   select id, email from auth.users;
-- ============================================================

-- Reemplazá este UUID por el id real de tu usuario owner:
-- (ej: '11111111-1111-1111-1111-111111111111')
do $$
declare
  v_owner_id uuid := '00000000-0000-0000-0000-000000000001'; -- ← reemplazar
  v_complex_id uuid;
  v_field_id uuid;
begin
  insert into public.complexes (id, owner_id, name, address, phone)
  values (uuid_generate_v4(), v_owner_id, 'Complejo La Bombonerita', 'Av. Siempre Viva 123', '+54 11 5555-5555')
  returning id into v_complex_id;

  insert into public.fields (id, complex_id, name, capacity, surface)
  values (uuid_generate_v4(), v_complex_id, 'Cancha 1', 10, 'sintético')
  returning id into v_field_id;

  insert into public.fields (complex_id, name, capacity, surface)
  values (v_complex_id, 'Cancha 2', 10, 'sintético');

  insert into public.matches (field_id, complex_id, starts_at, duration_minutes, capacity, created_by)
  values
    (v_field_id, v_complex_id, now() + interval '2 days' + interval '20 hours', 60, 10, v_owner_id),
    (v_field_id, v_complex_id, now() + interval '4 days' + interval '21 hours', 60, 10, v_owner_id);
end $$;

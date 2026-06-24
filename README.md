# Turnos F5 · SaaS multi-tenant para fútbol 5

App para organizar complejos, canchas y turnos de fútbol 5. Cada
organizador ("owner") administra sus propios complejos y canchas;
los jugadores se anotan a los partidos hasta completar el cupo, con
lista de espera automática cuando un turno ya está lleno.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Supabase** (Postgres + Auth + Realtime + RLS)
- **Tailwind CSS** con paleta de marca propia
- **Zod** para validaciones

## 1. Setup de Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. Andá a **SQL Editor** y corré, en este orden:
   - `supabase/schema.sql`
   - `supabase/triggers.sql`
   - `supabase/policies.sql`
3. (Opcional) Para datos de prueba: registrate primero desde la app
   con una cuenta "owner", copiá su UUID desde
   **Authentication → Users**, pegalo en `supabase/seed.sql`
   reemplazando el UUID de ejemplo, y corré ese archivo.
4. Copiá `Project URL` y `anon public key` desde
   **Settings → API**.

## 2. Variables de entorno

Completá `.env.local` (ya está en el repo como plantilla):

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. Instalación y desarrollo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## 4. Flujo de uso

1. **Registrate** en `/register` eligiendo tipo de cuenta:
   - **Organizador (owner)**: puede crear complejos, canchas y partidos.
   - **Jugador (player)**: puede ver y anotarse a partidos.
2. Como owner: `Mis complejos → + Nuevo complejo`, luego agregá
   canchas desde `Canchas → + Nueva cancha`, y programá turnos
   desde `Partidos → + Nuevo partido`.
3. Como jugador: entrá a `Partidos`, elegí un turno y tocá
   **"Anotarme a este partido"**. Si ya está completo, quedás en
   lista de espera y se te promueve automáticamente si alguien se baja.

## Estructura del proyecto

```
src/
├── app/            # Rutas (App Router): auth, dashboard, complexes, fields, matches, api
├── components/      # UI base, layout y componentes de cada dominio
├── lib/             # Clientes de Supabase, lógica de negocio, validaciones Zod
├── hooks/           # useAuth, useMatches
├── types/           # Tipos compartidos (user, complex, field, match)
└── middleware.ts     # Protección de rutas privadas + refresh de sesión

supabase/
├── schema.sql        # Tablas, vistas, índices
├── triggers.sql       # Auto-profile, sync de status, promoción de waiting list
├── policies.sql        # RLS multi-tenant
└── seed.sql            # Datos de ejemplo
```

## Notas de seguridad multi-tenant

Toda la separación entre organizadores está garantizada por **Row
Level Security** en Postgres (`supabase/policies.sql`), no solo por
lógica de la app: un owner únicamente puede crear/editar/borrar
complejos, canchas y partidos donde figure como `owner_id`, sin
importar qué pida el cliente. La lectura de partidos y canchas es
pública para que cualquier jugador pueda verlos y anotarse.

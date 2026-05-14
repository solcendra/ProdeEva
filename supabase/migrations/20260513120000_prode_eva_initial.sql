-- =============================================================================
-- El Prode de Eva — esquema inicial Supabase (Postgres)
-- Alineado con src/types/index.ts y estado del MVP (matches, predictions, etc.)
-- =============================================================================

-- Extensión para gen_random_uuid() (habitual en proyectos Supabase nuevos)
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Perfiles (1:1 con auth.users). Eva NO va acá: se modela con columnas en matches.
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  team text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Datos de jugador; id = auth.users.id';
comment on column public.profiles.team is 'Área / equipo funcional';
comment on column public.profiles.role is 'admin: panel partidos/resultados/bonus';

create index profiles_role_idx on public.profiles (role);

-- -----------------------------------------------------------------------------
-- Fechas / jornadas (consigna creativa "Prompt del partido")
-- -----------------------------------------------------------------------------
create table public.rounds (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  label text not null,
  creative_prompt text not null,
  created_at timestamptz not null default now()
);

comment on table public.rounds is 'Jornada; slug opcional para mapear seed mock (ej. round-1)';

-- -----------------------------------------------------------------------------
-- Partidos + pick de Eva en columnas (equivalente a Match.eva en TypeScript)
-- -----------------------------------------------------------------------------
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds (id) on delete restrict,
  home_team text not null,
  away_team text not null,
  kickoff_at timestamptz not null,
  predictions_open boolean not null default true,
  actual_home smallint,
  actual_away smallint,
  eva_home smallint not null,
  eva_away smallint not null,
  eva_probability smallint not null check (eva_probability between 0 and 100),
  eva_commentary text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_actual_pair check (
    (actual_home is null and actual_away is null)
    or (actual_home is not null and actual_away is not null)
  )
);

comment on table public.matches is 'Partidos; resultado oficial en actual_* cuando exista';
create index matches_round_kickoff_idx on public.matches (round_id, kickoff_at);

-- -----------------------------------------------------------------------------
-- Predicciones (única por usuario y partido)
-- -----------------------------------------------------------------------------
create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  home smallint not null check (home >= 0 and home <= 30),
  away smallint not null check (away >= 0 and away <= 30),
  submitted_at timestamptz not null default now(),
  unique (match_id, user_id)
);

comment on table public.predictions is 'Pronóstico por usuario; upsert por (match_id, user_id)';
create index predictions_match_idx on public.predictions (match_id);
create index predictions_user_idx on public.predictions (user_id);

-- -----------------------------------------------------------------------------
-- Respuestas al prompt + bonus manual (admin)
-- -----------------------------------------------------------------------------
create table public.prompt_responses (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  bonus_points smallint not null default 0 check (bonus_points between 0 and 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.prompt_responses.bonus_points is 'Suma manual desde panel admin';

create index prompt_responses_round_idx on public.prompt_responses (round_id);
create index prompt_responses_user_idx on public.prompt_responses (user_id);

-- -----------------------------------------------------------------------------
-- Snapshot de ranking (tendencia sube/baja vs última visita)
-- -----------------------------------------------------------------------------
create table public.user_rank_snapshots (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  last_position int not null check (last_position > 0),
  updated_at timestamptz not null default now()
);

comment on table public.user_rank_snapshots is 'Última posición conocida en tabla (cliente puede refrescar al salir de /ranking)';

-- -----------------------------------------------------------------------------
-- updated_at automático
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger matches_set_updated_at
before update on public.matches
for each row execute procedure public.set_updated_at();

create trigger prompt_responses_set_updated_at
before update on public.prompt_responses
for each row execute procedure public.set_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.rounds enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.prompt_responses enable row level security;
alter table public.user_rank_snapshots enable row level security;

-- Helper: usuario actual es admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.role = 'admin' from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- profiles: cada uno lee/actualiza su fila; lectura pública de nombres para ranking (ajustable)
create policy profiles_select_own
on public.profiles for select
to authenticated
using (id = auth.uid() or true);

create policy profiles_insert_own
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy profiles_update_own
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Opcional: permitir que admin actualice role/team de otros (descomentar si lo necesitás)
-- create policy profiles_admin_all on public.profiles for all to authenticated using (public.is_admin());

-- rounds: lectura para autenticados; escritura solo admin
create policy rounds_select_auth
on public.rounds for select
to authenticated
using (true);

create policy rounds_admin_write
on public.rounds for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- matches: lectura autenticados; escritura admin
create policy matches_select_auth
on public.matches for select
to authenticated
using (true);

create policy matches_admin_write
on public.matches for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- predictions: lectura propia + admin ve todas (policy separada); ranking suele calcularse en servidor
create policy predictions_select_own_or_admin
on public.predictions for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy predictions_insert_own
on public.predictions for insert
to authenticated
with check (user_id = auth.uid());

create policy predictions_update_own
on public.predictions for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy predictions_delete_own
on public.predictions for delete
to authenticated
using (user_id = auth.uid());

-- prompt_responses
create policy prompt_responses_select_own_or_admin
on public.prompt_responses for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy prompt_responses_insert_own
on public.prompt_responses for insert
to authenticated
with check (user_id = auth.uid());

create policy prompt_responses_update_admin_bonus
on public.prompt_responses for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- snapshots: cada usuario su fila; admin podría leer todas si hiciera falta
create policy rank_snapshots_select_own
on public.user_rank_snapshots for select
to authenticated
using (user_id = auth.uid());

create policy rank_snapshots_upsert_own
on public.user_rank_snapshots for insert
to authenticated
with check (user_id = auth.uid());

create policy rank_snapshots_update_own
on public.user_rank_snapshots for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Trigger: al crear usuario en auth, crear profile (nombre/team desde metadata JWT)
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, team, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'team', 'Sin área'),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$;

create trigger on_prode_eva_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Nota: si preferís crear el profile desde la app (sin trigger), eliminá este trigger
-- y manejá el insert en el cliente tras signUp.

-- Seed opcional: una jornada + un partido de ejemplo.
-- Ejecutá en SQL Editor (idealmente una sola vez) o integralo a tu pipeline de seed.

insert into public.rounds (slug, label, creative_prompt)
values (
  'round-1',
  'Fase de grupos — Jornada 1',
  'Describí este partido como si fuera una reunión corporativa (máx. 2 frases).'
)
on conflict (slug) do nothing;

insert into public.matches (
  round_id,
  home_team,
  away_team,
  kickoff_at,
  predictions_open,
  actual_home,
  actual_away,
  eva_home,
  eva_away,
  eva_probability,
  eva_commentary
)
select
  r.id,
  'Argentina',
  'Brasil',
  timestamptz '2026-06-14 18:00:00-03',
  false,
  2,
  1,
  2,
  1,
  67,
  'Riesgo alto de sufrimiento innecesario.'
from public.rounds r
where r.slug = 'round-1'
  and not exists (
    select 1 from public.matches m
    where m.round_id = r.id and m.home_team = 'Argentina' and m.away_team = 'Brasil'
  );

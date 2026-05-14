# Supabase (El Prode de Eva)

## Aplicar migración

Con [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <tu-ref>
supabase db push
```

O copiá el SQL de `migrations/20260513120000_prode_eva_initial.sql` al **SQL Editor** del dashboard y ejecutalo en orden.

## Seed de ejemplo

`seed.sql` inserta la ronda `round-1` y un partido Argentina–Brasil si aún no existe.

## Auth corporativo

Ver `docs/supabase-auth.md` (magic link, metadata para `profiles`, rol admin).

# Supabase: auth corporativo y dominio Bayer

Este documento describe cómo encajar **login por email corporativo** con el esquema de `profiles` y las políticas RLS del proyecto.

## Objetivo

- Solo cuentas con dominios permitidos (p. ej. `bayer.com`, `bayer.com.ar`).
- Perfil con **nombre** y **área/equipo** alineado a `public.profiles`.
- Opcional: rol `admin` para cargar partidos, resultados y bonus sin exponer un PIN en el cliente.

## Opción A — Magic link + validación en Edge Function (recomendada)

1. En Supabase Dashboard: **Authentication → Providers → Email** (magic link).
2. Crear una **Edge Function** `sign-in-validate-domain` que:
   - Reciba el email del intento de login (o se apoye en el flujo de `signInWithOtp`).
   - Rechace con 403 si el dominio no está en la lista permitida (misma lógica que `getAllowedEmailDomains()` en el front).
3. El front solo llama a `signInWithOtp` después de validar en cliente; la función actúa como red de seguridad adicional.

Ventaja: el dominio queda validado también del lado servidor, no solo en React.

## Opción B — Dominio vía `auth.users` + Postgres (ligera)

1. Mantener magic link estándar.
2. Política adicional: un trigger **antes** de `auth.users` insert no es soportado directamente en planes hosted para usuarios finales; por eso la opción A o validación en **Database Webhook** / **Auth Hook** (Supabase Auth Hooks) es más clara.

## Metadatos al registrarse

Al enviar OTP, pasá metadata para el trigger `handle_new_user`:

```ts
await supabase.auth.signInWithOtp({
  email,
  options: {
    data: {
      display_name: "María García",
      team: "Marketing",
      role: "user",
    },
  },
});
```

El trigger `public.handle_new_user` lee `raw_user_meta_data` y crea la fila en `profiles`.

Para promover admins, actualizá `profiles.role = 'admin'` con **service role** desde un script interno o panel interno; no expongas esto al cliente sin controles.

## Variables de entorno (Next.js)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo servidor: scripts, webhooks, nunca en el bundle del cliente)

## Eva en ranking

Eva **no** es fila en `profiles`: sus picks viven en `matches.eva_*`. El ranking que incluye a Eva se calcula en:

- una **vista materializada** / **RPC** en Postgres, o
- una **Route Handler** de Next.js con `service_role` que lea `matches` + `predictions` y devuelva la tabla final.

El MVP en cliente (`computeRanking`) ya separa Eva del resto; al migrar, replicá esa lógica en SQL o en el servidor.

## Lectura pública del ranking

Las políticas actuales permiten `select` de `profiles` a cualquier `authenticated` para facilitar nombres en tabla. Si querés ocultar emails u otros campos, exponé solo una **vista** `public.leaderboard_players` con columnas mínimas y RLS propia.

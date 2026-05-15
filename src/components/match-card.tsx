"use client";

import { useEffect, useMemo, useState } from "react";
import type { Match } from "@/types";
import { EVA_USER_ID } from "@/types";
import { EvaBadge } from "@/components/eva-badge";
import { useApp } from "@/context/app-provider";
import { findPrediction } from "@/lib/scoring";

function formatKickoff(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = { match: Match };

/** Card de partido: mercado, pick de Eva, formulario de predicción. */
function clampScore(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(20, Math.round(n)));
}

export function MatchCard({ match }: Props) {
  const { currentUser, state, submitPrediction } = useApp();
  /** Texto en inputs: evita el bug del input number controlado que no deja borrar el 0. */
  const [homeStr, setHomeStr] = useState("0");
  const [awayStr, setAwayStr] = useState("0");
  const [sending, setSending] = useState(false);
  const [burst, setBurst] = useState(false);

  const mine = useMemo(() => {
    if (!currentUser) return undefined;
    return findPrediction(state.predictions, match.id, currentUser.id);
  }, [state.predictions, match.id, currentUser]);

  useEffect(() => {
    if (mine) {
      setHomeStr(String(mine.home));
      setAwayStr(String(mine.away));
    } else {
      setHomeStr("0");
      setAwayStr("0");
    }
  }, [mine, match.id]);

  const disabledEva = currentUser?.isEva || currentUser?.id === EVA_USER_ID;

  const open = match.predictionsOpen && !match.actual;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || disabledEva || !open) return;
    const home = clampScore(parseInt(homeStr, 10));
    const away = clampScore(parseInt(awayStr, 10));
    setSending(true);
    const { evaLine: line } = submitPrediction(match.id, home, away);
    setHomeStr(String(home));
    setAwayStr(String(away));
    window.dispatchEvent(
      new CustomEvent("prode-eva-activity", {
        detail: { type: "prediction-submitted", matchId: match.id, evaLine: line },
      }),
    );
    setBurst(true);
    window.setTimeout(() => setBurst(false), 650);
    window.setTimeout(() => setSending(false), 400);
  };

  const onScoreInput = (raw: string, setter: (v: string) => void) => {
    if (raw === "") {
      setter("");
      return;
    }
    if (!/^\d{1,2}$/.test(raw)) return;
    const n = parseInt(raw, 10);
    if (n > 20) return;
    setter(raw);
  };

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition ${
        burst ? "ring-2 ring-[#00A94F]/40" : ""
      }`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#00A94F]/[0.07]" />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            {formatKickoff(match.kickoffAt)}
          </p>
          <h3 className="mt-1 font-display text-2xl tracking-tight text-neutral-900 sm:text-3xl">
            {match.homeTeam}{" "}
            <span className="text-neutral-400 font-sans text-lg font-normal">vs</span>{" "}
            {match.awayTeam}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
              open
                ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                : "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200"
            }`}
          >
            {open ? "Mercado abierto" : "Mercado cerrado"}
          </span>
          {match.actual && (
            <span className="text-xs font-semibold text-neutral-600">
              Resultado: {match.actual.home} — {match.actual.away}
            </span>
          )}
        </div>
      </div>

      {!open && (
        <p className="relative mt-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm leading-snug text-neutral-700">
          {match.actual ? (
            <>
              <strong>Partido cerrado:</strong> ya hay <strong>resultado oficial</strong> (
              {match.actual.home}—{match.actual.away}). Las predicciones no se pueden cambiar: así
              el ranking queda fijo (regla del prode).
            </>
          ) : (
            <>
              <strong>Mercado cerrado</strong> (sin resultado todavía). Un admin puede reabrirlo
              desde el panel Admin si corresponde.
            </>
          )}
        </p>
      )}

      <div className="relative mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <EvaBadge />
            <span className="text-xs font-medium text-neutral-500">
              Confianza ficticia {match.eva.probability}%
            </span>
          </div>
          <p className="font-display text-3xl text-neutral-900">
            {match.eva.home}
            <span className="mx-2 text-neutral-300">—</span>
            {match.eva.away}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">{match.eva.commentary}</p>
        </div>

        <div className="rounded-xl border border-neutral-900/5 bg-white p-4 ring-1 ring-black/[0.04]">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Tu predicción
          </p>
          {mine && (
            <p className="mt-1 text-sm text-neutral-600">
              Cargada:{" "}
              <span className="font-semibold text-neutral-900">
                {mine.home} — {mine.away}
              </span>
            </p>
          )}
          {!currentUser && (
            <p className="mt-3 text-sm text-neutral-500">Iniciá sesión para cargar tu pronóstico.</p>
          )}
          {disabledEva && currentUser && (
            <p className="mt-3 text-sm text-amber-800">
              Ingresaste como <strong>Eva</strong>: acá no cargás pronósticos (competís desde el ranking
              con el pick publicado). Usá tu usuario corporativo personal.
            </p>
          )}
          {currentUser && !disabledEva && (
            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              {open && (
                <p className="text-xs text-neutral-500">
                  Mercado abierto: podés cambiar el resultado y volver a enviar hasta el cierre.
                </p>
              )}
              <div className="flex items-end gap-3">
                <label className="flex-1 text-xs font-semibold text-neutral-600">
                  {match.homeTeam}
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    value={homeStr}
                    onChange={(e) => onScoreInput(e.target.value, setHomeStr)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-lg font-semibold outline-none ring-[#00A94F]/0 transition focus:border-[#00A94F] focus:ring-4 focus:ring-[#00A94F]/15"
                    disabled={!open}
                  />
                </label>
                <label className="flex-1 text-xs font-semibold text-neutral-600">
                  {match.awayTeam}
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    value={awayStr}
                    onChange={(e) => onScoreInput(e.target.value, setAwayStr)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-lg font-semibold outline-none transition focus:border-[#00A94F] focus:ring-4 focus:ring-[#00A94F]/15"
                    disabled={!open}
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={!open || sending}
                className="w-full rounded-xl bg-[#00A94F] py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#009046] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Enviar predicción
              </button>
            </form>
          )}
        </div>
      </div>
    </article>
  );
}

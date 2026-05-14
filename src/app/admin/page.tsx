"use client";

import { useEffect, useMemo, useState } from "react";
import type { Match } from "@/types";
import { AppShell } from "@/components/layout/app-shell";
import { AdminRankingHistoryPanel } from "@/components/admin/admin-ranking-history-panel";
import { useApp } from "@/context/app-provider";
import { getAdminPin } from "@/lib/config";

/** Panel admin — PIN demo (`NEXT_PUBLIC_ADMIN_PIN`, default en config). */
export default function AdminPage() {
  const {
    state,
    unlockAdmin,
    lockAdmin,
    adminSetActual,
    adminSetPredictionsOpen,
    adminSetBonus,
    adminUpsertMatch,
    resetDemoData,
    adminAppendRankingSnapshot,
    adminDeleteRankingSnapshot,
  } = useApp();
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string>(state.matches[0]?.id ?? "");

  const unlocked = state.adminUnlocked;

  const match = state.matches.find((m) => m.id === selectedMatch);

  const predsForMatch = useMemo(
    () => state.predictions.filter((p) => p.matchId === selectedMatch),
    [state.predictions, selectedMatch],
  );

  const tryUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = unlockAdmin(pin);
    setPinError(!ok);
  };

  const userName = (id: string) => state.users.find((u) => u.id === id)?.name ?? id;

  if (!unlocked) {
    return (
      <AppShell>
        <h1 className="font-display text-3xl text-neutral-900">Admin</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Ingresá el PIN de demo. Variable{" "}
          <code className="rounded bg-neutral-100 px-1">NEXT_PUBLIC_ADMIN_PIN</code> en Vercel.
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Valor local por defecto: <span className="font-mono">{getAdminPin()}</span>
        </p>
        <form onSubmit={tryUnlock} className="mt-6 max-w-sm space-y-3">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            placeholder="PIN"
          />
          {pinError && <p className="text-sm text-rose-600">PIN incorrecto.</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-bold text-white"
          >
            Desbloquear
          </button>
        </form>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-neutral-900">Panel admin</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => lockAdmin()}
            className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold uppercase"
          >
            Bloquear panel
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Resetea todos los datos a la semilla mock?")) resetDemoData();
            }}
            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold uppercase text-rose-800"
          >
            Reset demo
          </button>
        </div>
      </div>

      <p className="mt-2 text-sm text-neutral-600">
        Participantes registrados:{" "}
        <span className="font-semibold text-neutral-900">{state.users.length}</span> · Predicciones
        totales:{" "}
        <span className="font-semibold text-neutral-900">{state.predictions.length}</span>
      </p>

      <AdminRankingHistoryPanel
        history={state.rankingHistory ?? []}
        onCapture={adminAppendRankingSnapshot}
        onDelete={adminDeleteRankingSnapshot}
      />

      <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Partidos</h2>
          <div className="mt-3 space-y-3">
            {state.matches.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMatch(m.id)}
                className={`flex w-full flex-col rounded-xl border px-4 py-3 text-left text-sm transition ${
                  m.id === selectedMatch
                    ? "border-[#00A94F] bg-[#00A94F]/5"
                    : "border-neutral-200 bg-white hover:border-neutral-400"
                }`}
              >
                <span className="font-semibold">
                  {m.homeTeam} vs {m.awayTeam}
                </span>
                <span className="text-xs text-neutral-500">
                  {m.predictionsOpen ? "Mercado abierto" : "Mercado cerrado"}
                  {m.actual ? ` · Resultado ${m.actual.home}-${m.actual.away}` : ""}
                </span>
              </button>
            ))}
          </div>
        </div>

        {match && (
          <MatchAdminForm
            key={match.id}
            match={match}
            onSaveActual={(actual) => adminSetActual(match.id, actual)}
            onToggleOpen={(open) => adminSetPredictionsOpen(match.id, open)}
          />
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
          Predicciones del partido seleccionado
        </h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-100 text-xs uppercase text-neutral-600">
              <tr>
                <th className="px-3 py-2">Usuario</th>
                <th className="px-3 py-2">Pronóstico</th>
              </tr>
            </thead>
            <tbody>
              {predsForMatch.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-3 py-4 text-neutral-500">
                    Sin predicciones todavía.
                  </td>
                </tr>
              )}
              {predsForMatch.map((p) => (
                <tr key={`${p.userId}-${p.matchId}`} className="border-t border-neutral-100">
                  <td className="px-3 py-2">{userName(p.userId)}</td>
                  <td className="px-3 py-2 font-mono">
                    {p.home} — {p.away}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
          Respuestas al prompt · bonus manual
        </h2>
        <div className="mt-3 space-y-3">
          {state.promptResponses.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-neutral-500">{userName(r.userId)}</p>
                <p className="text-sm text-neutral-800">{r.text}</p>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-500">
                Bonus
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={r.bonusPoints}
                  onChange={(e) => adminSetBonus(r.id, Number(e.target.value))}
                  className="w-16 rounded border border-neutral-200 px-2 py-1 text-sm"
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
          Crear partido (demo)
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Se agrega a la jornada mock <span className="font-mono">round-1</span> con mercado abierto.
        </p>
        <CreateMatchPanel
          onCreate={(m) => {
            adminUpsertMatch(m);
            setSelectedMatch(m.id);
          }}
        />
      </section>
    </AppShell>
  );
}

function CreateMatchPanel({ onCreate }: { onCreate: (m: Match) => void }) {
  const [homeTeam, setHomeTeam] = useState("Local");
  const [awayTeam, setAwayTeam] = useState("Visitante");
  const [kickoff, setKickoff] = useState("");
  const [eh, setEh] = useState(1);
  const [ea, setEa] = useState(1);
  const [prob, setProb] = useState(55);
  const [com, setCom] = useState("Análisis en proceso.");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? `m-${crypto.randomUUID().slice(0, 8)}`
        : `m-${Date.now()}`;
    const kickoffAt =
      kickoff.trim() !== ""
        ? new Date(kickoff).toISOString()
        : new Date(Date.now() + 86400000).toISOString();
    const match: Match = {
      id,
      roundId: "round-1",
      homeTeam: homeTeam.trim() || "Local",
      awayTeam: awayTeam.trim() || "Visitante",
      kickoffAt,
      predictionsOpen: true,
      actual: null,
      eva: {
        home: eh,
        away: ea,
        probability: Math.min(99, Math.max(1, prob)),
        commentary: com.trim() || "Listo para el análisis.",
      },
    };
    onCreate(match);
  };

  return (
    <form
      onSubmit={submit}
      className="mt-4 grid max-w-xl gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-bold uppercase text-neutral-500">
          Equipo A (local)
          <input
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-bold uppercase text-neutral-500">
          Equipo B (visitante)
          <input
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="text-xs font-bold uppercase text-neutral-500">
        Fecha y hora (opcional)
        <input
          type="datetime-local"
          value={kickoff}
          onChange={(e) => setKickoff(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-bold uppercase text-neutral-500">
          Eva — local
          <input
            type="number"
            min={0}
            value={eh}
            onChange={(e) => setEh(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-bold uppercase text-neutral-500">
          Eva — visitante
          <input
            type="number"
            min={0}
            value={ea}
            onChange={(e) => setEa(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-bold uppercase text-neutral-500">
          Prob. ficticia %
          <input
            type="number"
            min={1}
            max={99}
            value={prob}
            onChange={(e) => setProb(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="text-xs font-bold uppercase text-neutral-500">
        Comentario de Eva
        <input
          value={com}
          onChange={(e) => setCom(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        className="rounded-full bg-[#00A94F] px-5 py-2 text-xs font-bold uppercase text-white"
      >
        Crear partido
      </button>
    </form>
  );
}

function MatchAdminForm({
  match,
  onSaveActual,
  onToggleOpen,
}: {
  match: Match;
  onSaveActual: (actual: { home: number; away: number } | null) => void;
  onToggleOpen: (open: boolean) => void;
}) {
  const [h, setH] = useState(match.actual?.home ?? 0);
  const [a, setA] = useState(match.actual?.away ?? 0);

  useEffect(() => {
    setH(match.actual?.home ?? 0);
    setA(match.actual?.away ?? 0);
  }, [match.id, match.actual?.home, match.actual?.away]);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
        Editar partido
      </h2>
      <p className="mt-2 font-semibold text-neutral-900">
        {match.homeTeam} vs {match.awayTeam}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onToggleOpen(!match.predictionsOpen)}
          className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-bold uppercase text-white"
        >
          {match.predictionsOpen ? "Cerrar mercado" : "Abrir mercado"}
        </button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-neutral-600">
        <strong>Abrir mercado</strong> también <strong>quita el resultado oficial</strong> si existía,
        para que el partido vuelva a aceptar pronósticos (regla del prode: sin marcador cargado =
        mercado activo).
      </p>
      <div className="mt-6 border-t border-neutral-100 pt-4">
        <p className="text-xs font-bold uppercase text-neutral-500">Resultado real</p>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold text-neutral-600">
            Local
            <input
              type="number"
              min={0}
              className="mt-1 block w-20 rounded-lg border border-neutral-200 px-2 py-1"
              value={h}
              onChange={(e) => setH(Number(e.target.value))}
            />
          </label>
          <label className="text-xs font-semibold text-neutral-600">
            Visitante
            <input
              type="number"
              min={0}
              className="mt-1 block w-20 rounded-lg border border-neutral-200 px-2 py-1"
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
            />
          </label>
          <button
            type="button"
            onClick={() => onSaveActual({ home: h, away: a })}
            className="rounded-full bg-[#00A94F] px-4 py-2 text-xs font-bold uppercase text-white"
          >
            Guardar resultado
          </button>
          <button
            type="button"
            onClick={() => onSaveActual(null)}
            className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold uppercase"
          >
            Limpiar resultado
          </button>
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          El ranking se recalcula automáticamente al guardar el resultado (partidos con marcador
          oficial suman puntos).
        </p>
      </div>
    </div>
  );
}

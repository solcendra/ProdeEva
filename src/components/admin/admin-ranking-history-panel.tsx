"use client";

import { Fragment, useMemo, useState } from "react";
import type { RankingHistoryPlayerRow, RankingHistorySnapshot } from "@/lib/ranking-history";

type Props = {
  history: RankingHistorySnapshot[];
  onCapture: () => void;
  onDelete: (id: string) => void;
};

function formatCaptured(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

/** Admin: histórico de rankings por día con detalle por usuario y partido. */
export function AdminRankingHistoryPanel({ history, onCapture, onDelete }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [openUserId, setOpenUserId] = useState<string | null>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, RankingHistorySnapshot[]>();
    const sorted = [...history].sort(
      (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime(),
    );
    for (const snap of sorted) {
      const list = map.get(snap.dayKey) ?? [];
      list.push(snap);
      map.set(snap.dayKey, list);
    }
    const days = [...map.keys()].sort((a, b) => b.localeCompare(a));
    return { map, days };
  }, [history]);

  return (
    <section className="mt-12 border-t border-neutral-200 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Histórico de ranking (base por día)
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-neutral-600">
            Cada vez que registrás un snapshot se guarda la tabla completa: posición, puntos totales,
            bonus, aciertos exactos y <strong>detalle partido a partido</strong> (pronóstico vs
            resultado y puntos obtenidos). Podés generar varios el mismo día para ver la evolución.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onCapture()}
          className="rounded-full bg-[#00A94F] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm hover:bg-[#009046]"
        >
          Registrar snapshot ahora
        </button>
      </div>

      {history.length === 0 && (
        <p className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-sm text-neutral-600">
          Todavía no hay snapshots. Pulsá <strong>Registrar snapshot ahora</strong> después de cargar
          resultados o cuando quieras congelar el estado del ranking.
        </p>
      )}

      <div className="mt-8 space-y-10">
        {byDay.days.map((day) => (
          <div key={day}>
            <h3 className="font-display text-xl text-neutral-900">
              Día {day}{" "}
              <span className="text-sm font-sans font-normal text-neutral-500">
                ({byDay.map.get(day)?.length ?? 0} registro
                {(byDay.map.get(day)?.length ?? 0) === 1 ? "" : "s"})
              </span>
            </h3>
            <div className="mt-4 space-y-4">
              {(byDay.map.get(day) ?? []).map((snap) => (
                <article
                  key={snap.id}
                  className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                        Capturado
                      </p>
                      <p className="text-sm font-semibold text-neutral-900">
                        {formatCaptured(snap.capturedAt)}
                      </p>
                      <p className="text-[11px] text-neutral-500">id: {snap.id}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenId((cur) => {
                            if (cur === snap.id) {
                              setOpenUserId(null);
                              return null;
                            }
                            setOpenUserId(null);
                            return snap.id;
                          });
                        }}
                        className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold uppercase text-neutral-800 hover:border-neutral-400"
                      >
                        {openId === snap.id ? "Ocultar detalle" : "Ver detalle"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("¿Borrar este snapshot del histórico?")) onDelete(snap.id);
                        }}
                        className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold uppercase text-rose-800"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {openId === snap.id && (
                    <SnapshotDetailTable
                      rows={snap.rows}
                      expandedUserId={openUserId}
                      onToggleUser={(uid) =>
                        setOpenUserId((x) => (x === uid ? null : uid))
                      }
                    />
                  )}
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SnapshotDetailTable({
  rows,
  expandedUserId,
  onToggleUser,
}: {
  rows: RankingHistoryPlayerRow[];
  expandedUserId: string | null;
  onToggleUser: (userId: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-neutral-950 text-[11px] font-bold uppercase tracking-widest text-white">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Jugador</th>
            <th className="px-3 py-2">Área</th>
            <th className="px-3 py-2 text-right">Pts</th>
            <th className="px-3 py-2 text-right">Bonus</th>
            <th className="px-3 py-2 text-right">Exactos</th>
            <th className="px-3 py-2 text-center">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <Fragment key={r.userId}>
              <tr
                className={`border-t border-neutral-100 ${
                  r.isEva ? "bg-[#00A94F]/[0.06]" : "hover:bg-neutral-50"
                }`}
              >
                <td className="px-3 py-2 font-display text-lg">{r.rank}</td>
                <td className="px-3 py-2 font-semibold text-neutral-900">
                  {r.displayName}
                  {r.isEva && (
                    <span className="ml-2 rounded bg-[#00A94F] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                      IA
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-neutral-600">{r.team}</td>
                <td className="px-3 py-2 text-right font-display text-lg">{r.totalPoints}</td>
                <td className="px-3 py-2 text-right text-neutral-700">{r.bonusPoints}</td>
                <td className="px-3 py-2 text-right text-neutral-700">{r.exactHits}</td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleUser(r.userId)}
                    className="text-xs font-bold uppercase text-[#007A38] underline-offset-2 hover:underline"
                  >
                    {expandedUserId === r.userId ? "Cerrar" : "Partidos"}
                  </button>
                </td>
              </tr>
              {expandedUserId === r.userId && (
                <tr className="border-t border-neutral-100 bg-neutral-50">
                  <td colSpan={7} className="px-3 py-4">
                    <MatchBreakdownMini rows={r.matches} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatchBreakdownMini({ rows }: { rows: RankingHistoryPlayerRow["matches"] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead className="bg-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
          <tr>
            <th className="px-2 py-2">Partido</th>
            <th className="px-2 py-2">Pronóstico</th>
            <th className="px-2 py-2">Resultado</th>
            <th className="px-2 py-2 text-right">Pts</th>
            <th className="px-2 py-2">Origen</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.matchId} className="border-t border-neutral-100">
              <td className="px-2 py-2 font-medium text-neutral-900">
                {m.homeTeam} vs {m.awayTeam}
              </td>
              <td className="px-2 py-2 font-mono text-neutral-800">
                {m.predHome != null && m.predAway != null ? (
                  <>
                    {m.predHome} — {m.predAway}
                  </>
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </td>
              <td className="px-2 py-2 font-mono text-neutral-800">
                {m.actualHome != null && m.actualAway != null ? (
                  <>
                    {m.actualHome} — {m.actualAway}
                  </>
                ) : (
                  <span className="text-neutral-400">Sin resultado</span>
                )}
              </td>
              <td className="px-2 py-2 text-right font-semibold text-neutral-900">{m.points}</td>
              <td className="px-2 py-2 text-neutral-600">{m.source === "eva" ? "Eva" : "Usuario"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

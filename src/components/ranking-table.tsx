"use client";

import type { RankRow } from "@/types";
import { EVA_USER_ID } from "@/types";

function TrendGlyph({ trend }: { trend: RankRow["trend"] }) {
  if (trend === "up") return <span className="text-emerald-600">▲</span>;
  if (trend === "down") return <span className="text-rose-600">▼</span>;
  return <span className="text-neutral-400">◆</span>;
}

type Props = { rows: RankRow[] };

/** Tabla de posiciones estilo broadcast deportivo. */
export function RankingTable({ rows }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-neutral-950 text-[11px] font-bold uppercase tracking-widest text-white">
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Jugador</th>
            <th className="hidden px-4 py-3 sm:table-cell">Área / equipo</th>
            <th className="px-4 py-3 text-right">Pts</th>
            <th className="hidden px-4 py-3 text-right md:table-cell">Exactos</th>
            <th className="px-4 py-3 text-center">Tend.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const eva = row.user.id === EVA_USER_ID || row.user.isEva;
            return (
              <tr
                key={row.user.id}
                className={`border-t border-neutral-100 ${
                  eva ? "bg-[#00A94F]/[0.06]" : "hover:bg-neutral-50"
                }`}
              >
                <td className="px-4 py-3 font-display text-lg text-neutral-900">{row.position}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-neutral-900">
                    {eva ? "Eva" : row.user.name}
                    {eva && (
                      <span className="ml-2 rounded bg-[#00A94F] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        IA
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-500 sm:hidden">{row.user.team}</div>
                </td>
                <td className="hidden px-4 py-3 text-neutral-600 sm:table-cell">{row.user.team}</td>
                <td className="px-4 py-3 text-right font-display text-xl text-neutral-900">
                  {row.points}
                </td>
                <td className="hidden px-4 py-3 text-right text-neutral-700 md:table-cell">
                  {row.exactHits}
                </td>
                <td className="px-4 py-3 text-center text-lg">
                  <TrendGlyph trend={row.trend} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

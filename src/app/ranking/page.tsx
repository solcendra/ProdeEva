"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RankingTable } from "@/components/ranking-table";
import { useApp } from "@/context/app-provider";

export default function RankingPage() {
  const { captureRankingSnapshot, getRanking } = useApp();
  const rows = getRanking();
  const participants = rows.length;

  useEffect(() => {
    return () => {
      captureRankingSnapshot();
    };
  }, [captureRankingSnapshot]);

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-neutral-900">Ranking</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {participants} participantes · tendencia vs. tu última visita a esta pantalla
          </p>
        </div>
      </div>

      <div className="mt-8">
        <RankingTable rows={rows} />
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-white/60 p-4 text-sm text-neutral-600">
        <p className="font-semibold text-neutral-900">Cómo leer la tendencia</p>
        <p className="mt-1">
          ▲ subiste posiciones desde la última vez que estuviste acá. ▼ bajaste. ◆ sin cambio o
          primera lectura.
        </p>
      </div>
    </AppShell>
  );
}

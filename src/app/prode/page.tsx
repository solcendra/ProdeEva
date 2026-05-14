"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { MatchCard } from "@/components/match-card";
import { useApp } from "@/context/app-provider";

export default function ProdePage() {
  const { currentUser, hydrated, state, rounds, submitPromptResponse } = useApp();
  const router = useRouter();
  const [promptText, setPromptText] = useState("");
  const [sentPrompt, setSentPrompt] = useState(false);

  useEffect(() => {
    if (hydrated && !currentUser) router.replace("/login");
  }, [hydrated, currentUser, router]);

  const round = rounds[0];

  if (!hydrated || !currentUser) {
    return (
      <AppShell>
        <p className="text-sm text-neutral-500">Cargando…</p>
      </AppShell>
    );
  }

  const onPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!round) return;
    submitPromptResponse(round.id, promptText);
    setPromptText("");
    setSentPrompt(true);
    window.setTimeout(() => setSentPrompt(false), 3000);
  };

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-neutral-900">Predicciones</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Hola, <span className="font-semibold">{currentUser.name}</span> · {currentUser.team}
          </p>
        </div>
        <Link href="/ranking" className="text-sm font-semibold text-[#007A38] hover:underline">
          Ir al ranking →
        </Link>
      </div>

      <section className="mt-10 space-y-6">
        {state.matches.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </section>

      {round && (
        <section className="mt-14 rounded-2xl border border-neutral-900 bg-neutral-950 p-6 text-neutral-100 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#7CFFAC]">
            Prompt del partido
          </p>
          <p className="mt-3 text-lg font-semibold leading-snug">{round.creativePrompt}</p>
          <p className="mt-2 text-sm text-neutral-400">
            Respondé con creatividad. Los puntos bonus los asigna admin desde el panel.
          </p>
          <form onSubmit={onPrompt} className="mt-6 space-y-3">
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-[#00A94F] focus:ring-4 focus:ring-[#00A94F]/20"
              placeholder="Tu respuesta…"
            />
            <button
              type="submit"
              className="rounded-full bg-[#00A94F] px-6 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#009046]"
            >
              Enviar respuesta
            </button>
            {sentPrompt && (
              <p className="text-sm text-[#7CFFAC]">Listo. Eva lo revisará cuando tenga un segundo.</p>
            )}
          </form>
        </section>
      )}
    </AppShell>
  );
}

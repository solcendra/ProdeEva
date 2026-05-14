"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useApp } from "@/context/app-provider";
import { isCorporateEmail } from "@/lib/config";
import { MOCK_USERS } from "@/lib/mock-data";
import { EVA_USER_ID } from "@/types";

export default function LoginPage() {
  const { login, currentUser, hydrated } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [team, setTeam] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && currentUser) router.replace("/prode");
  }, [hydrated, currentUser, router]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isCorporateEmail(email)) {
      setError("Usá tu email corporativo Bayer (dominio permitido).");
      return;
    }
    if (!name.trim() || !team.trim()) {
      setError("Completá nombre y área/equipo.");
      return;
    }
    login({ name, email, team });
    router.push("/prode");
  };

  const quickFill = (id: string) => {
    const u = MOCK_USERS.find((x) => x.id === id);
    if (!u || u.isEva || u.id === EVA_USER_ID) return;
    setName(u.name);
    setEmail(u.email);
    setTeam(u.team);
  };

  if (hydrated && currentUser) {
    return (
      <AppShell>
        <p className="text-sm text-neutral-500">Redirigiendo…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-4xl text-neutral-900">Ingresá al prode</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Validamos dominio corporativo. Los datos se guardan en este navegador (demo).
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500">
            Nombre y apellido
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-[#00A94F] focus:ring-4 focus:ring-[#00A94F]/15"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500">
            Email corporativo
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-[#00A94F] focus:ring-4 focus:ring-[#00A94F]/15"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500">
            Área / equipo
            <input
              required
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-[#00A94F] focus:ring-4 focus:ring-[#00A94F]/15"
            />
          </label>
          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-neutral-800"
          >
            Entrar
          </button>
        </form>

        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Demo rápida</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {MOCK_USERS.filter((u) => !u.isEva).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => quickFill(u.id)}
                className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-[#00A94F]"
              >
                {u.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

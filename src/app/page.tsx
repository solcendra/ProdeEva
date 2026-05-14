import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";

export default function HomePage() {
  return (
    <AppShell>
      <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#00A94F]">
            Bayer · adopción de Eva
          </p>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] text-neutral-900 sm:text-6xl">
            El Prode de Eva
          </h1>
          <p className="mt-4 max-w-xl text-xl font-medium text-neutral-600">¿Le podés ganar a Eva?</p>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-neutral-600">
            Eva es la analista oficial de esta jornada: predice cada partido, comenta resultados y
            te recuerda que la IA interna no vino a reemplazar al equipo.{" "}
            <span className="font-semibold text-neutral-900">
              Vino a hacerlo jugar mejor.
            </span>
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-[#00A94F] px-8 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#00A94F]/25 transition hover:bg-[#009046]"
            >
              Jugar ahora
            </Link>
            <Link
              href="/ranking"
              className="inline-flex items-center justify-center rounded-full border border-neutral-900 px-8 py-3 text-sm font-bold uppercase tracking-wide text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
            >
              Ver ranking
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_20px_60px_rgb(0,0,0,0.06)]">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Nuevo fichaje del equipo
            </p>
            <p className="mt-3 text-lg font-semibold text-neutral-900">Eva también predice cada partido.</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Competís contra colegas y contra su modelo de pronósticos. Humor seco, métricas claras,
              cero flyer mundialista.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-6 text-neutral-100 shadow-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7CFFAC]">Reglas rápidas</p>
            <ul className="mt-4 space-y-2 text-sm text-neutral-300">
              <li>
                <span className="font-semibold text-white">5 pts</span> — resultado exacto
              </li>
              <li>
                <span className="font-semibold text-white">3 pts</span> — ganador o empate
              </li>
              <li>
                <span className="font-semibold text-white">+1 pt</span> — goles de un equipo bien
                pronosticados
              </li>
            </ul>
            <p className="mt-4 text-xs text-neutral-500">
              Bonus manual vía consigna creativa (admin).
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

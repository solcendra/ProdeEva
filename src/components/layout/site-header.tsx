"use client";

import Link from "next/link";
import { useApp } from "@/context/app-provider";
import { FLASH_HEADLINES } from "@/lib/eva-copy";

/** Cabecera estilo transmisión deportiva + marca Eva. */
export function SiteHeader() {
  const { currentUser, logout } = useApp();
  const ticker = FLASH_HEADLINES.join("   •   ");

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00A94F] font-display text-xl font-bold tracking-tight text-white shadow-sm ring-1 ring-black/5">
            E
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg tracking-wide text-neutral-900">EVA</p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
              Prode interno
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-xs font-semibold text-neutral-700 sm:gap-6 sm:text-sm">
          <Link className="hover:text-[#00A94F]" href="/prode">
            Predicciones
          </Link>
          <Link className="hover:text-[#00A94F]" href="/ranking">
            Ranking
          </Link>
          <Link className="hover:text-[#00A94F]" href="/admin">
            Admin
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <span className="hidden max-w-[160px] truncate text-right text-xs text-neutral-600 sm:block">
                {currentUser.name}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>
      <div className="border-t border-neutral-100 bg-neutral-950 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white">
        <div className="overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-[#7CFFAC]">Último momento</span>
            <span className="mx-3 text-neutral-500">|</span>
            <span>{ticker}</span>
            <span className="mx-8 text-neutral-600" aria-hidden>
              ·
            </span>
            <span className="text-[#7CFFAC]">Último momento</span>
            <span className="mx-3 text-neutral-500">|</span>
            <span>{ticker}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

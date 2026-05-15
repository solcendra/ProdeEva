"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/context/app-provider";
import { findPrediction } from "@/lib/scoring";
import { EVA_USER_ID } from "@/types";

const EVA_AVATAR = "/eva-assistant.png";

type AssistBlock = { title: string; body: string; hint?: string };

function buildContextualMessage(
  pathname: string,
  opts: {
    hydrated: boolean;
    userName: string | null;
    isEva: boolean;
    openMatchesWithoutPred: number;
    openMatchesTotal: number;
    finishedWithResult: number;
  },
): AssistBlock {
  if (!opts.hydrated) {
    return { title: "Eva", body: "Cargando datos del prode…" };
  }

  if (pathname === "/") {
    return {
      title: "Eva · analista",
      body: "Arrancá por “Jugar ahora” o revisá el ranking. Yo ya tengo mis picks; ahora falta el tuyo.",
      hint: "Tip: el mercado se cierra cuando hay resultado oficial.",
    };
  }

  if (pathname.startsWith("/login")) {
    return {
      title: "Eva · acceso",
      body: "Usá mail corporativo Bayer. Si entrás con un demo rápido, es solo para probar la experiencia.",
    };
  }

  if (pathname.startsWith("/prode")) {
    if (!opts.userName) {
      return {
        title: "Eva",
        body: "Primero ingresá: sin sesión no puedo guardar tu pronóstico (ni culpar al VAR).",
      };
    }
    if (opts.isEva) {
      return {
        title: "Eva",
        body: "Estás como Eva: mirá el ranking para ver cómo rinde mi modelo frente al equipo.",
      };
    }
    if (opts.openMatchesTotal === 0) {
      return {
        title: "Eva",
        body: "No hay partidos con mercado abierto. Si es admin: revisá fechas o reabrí mercados.",
      };
    }
    if (opts.openMatchesWithoutPred > 0) {
      return {
        title: "Eva",
        body: `Te quedan ${opts.openMatchesWithoutPred} partido${
          opts.openMatchesWithoutPred === 1 ? "" : "s"
        } con mercado abierto sin tu pronóstico. Cerrá la fecha antes que cierre el mercado.`,
      };
    }
    return {
      title: "Eva",
      body: "Mercados abiertos cubiertos con tu marca. Podés ajustar mientras siga abierto el mercado.",
      hint: "No abras otro Excel. Ya lo tengo.",
    };
  }

  if (pathname.startsWith("/ranking")) {
    return {
      title: "Eva · ranking",
      body: "La tendencia compara con tu última visita a esta pantalla. Si empatamos puntos, gana quien tenga más exactos.",
    };
  }

  if (pathname.startsWith("/admin")) {
    return {
      title: "Eva · admin",
      body: "Acá se cargan resultados, mercados y el histórico de ranking. Cuidado: abrir mercado borra el resultado oficial en esta demo.",
    };
  }

  return {
    title: "Eva",
    body: "Seguimos en el prode. Si necesitás algo, volvé al inicio o a predicciones.",
  };
}

/** Asistente flotante con avatar de Eva y tips según pantalla y acciones. */
export function EvaFloatingAssistant() {
  const pathname = usePathname() ?? "/";
  const { hydrated, currentUser, state } = useApp();
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  /** Comentario irónico de Eva tras guardar pronóstico (se muestra en este popup). */
  const [evaPostSubmit, setEvaPostSubmit] = useState<string | null>(null);
  const clearEvaTimer = useRef<number | null>(null);

  const isEva = Boolean(
    currentUser?.isEva || currentUser?.id === EVA_USER_ID,
  );

  const { openMatchesWithoutPred, openMatchesTotal, finishedWithResult } = useMemo(() => {
    const uid = currentUser?.id;
    const open = state.matches.filter((m) => m.predictionsOpen && !m.actual);
    let missing = 0;
    if (uid && !isEva) {
      for (const m of open) {
        if (!findPrediction(state.predictions, m.id, uid)) missing += 1;
      }
    } else if (!uid) {
      missing = open.length;
    }
    const finished = state.matches.filter((m) => m.actual).length;
    return {
      openMatchesWithoutPred: missing,
      openMatchesTotal: open.length,
      finishedWithResult: finished,
    };
  }, [state.matches, state.predictions, currentUser?.id, isEva]);

  const block = useMemo(
    () =>
      buildContextualMessage(pathname, {
        hydrated,
        userName: currentUser?.name ?? null,
        isEva,
        openMatchesWithoutPred,
        openMatchesTotal,
        finishedWithResult,
      }),
    [
      pathname,
      hydrated,
      currentUser?.name,
      isEva,
      openMatchesWithoutPred,
      openMatchesTotal,
      finishedWithResult,
    ],
  );

  const onActivity = (e: Event) => {
    const d = (e as CustomEvent<{ type?: string; evaLine?: string }>).detail;
    if (d?.type !== "prediction-submitted") return;
    const line =
      typeof d.evaLine === "string" && d.evaLine.trim() !== ""
        ? d.evaLine.trim()
        : "Listo. Dato guardado.";
    if (clearEvaTimer.current) window.clearTimeout(clearEvaTimer.current);
    setEvaPostSubmit(line);
    setOpen(true);
    setPulse(true);
    window.setTimeout(() => setPulse(false), 900);
    clearEvaTimer.current = window.setTimeout(() => {
      setEvaPostSubmit(null);
      clearEvaTimer.current = null;
    }, 18000);
  };

  useEffect(() => {
    window.addEventListener("prode-eva-activity", onActivity);
    return () => {
      window.removeEventListener("prode-eva-activity", onActivity);
      if (clearEvaTimer.current) window.clearTimeout(clearEvaTimer.current);
    };
  }, []);

  const showEvaReply = evaPostSubmit != null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div
          className="pointer-events-auto max-w-[min(100vw-2rem,22rem)] rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl ring-1 ring-black/5"
          role="dialog"
          aria-label="Asistente Eva"
        >
          <div className="flex items-start gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-[#00A94F]/40">
              <Image
                src={EVA_AVATAR}
                alt="Eva"
                width={48}
                height={48}
                className="h-full w-full object-cover object-top"
                priority={false}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-sm font-semibold tracking-wide text-neutral-900">
                  {showEvaReply ? "Eva · comentario" : block.title}
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="-mr-1 -mt-1 rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                  aria-label="Cerrar panel de Eva"
                >
                  ✕
                </button>
              </div>
              {showEvaReply ? (
                <>
                  <p className="mt-2 text-base font-medium leading-snug text-neutral-900">
                    “{evaPostSubmit}”
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                    Tu predicción ya quedó guardada. Esto es solo humor de equipo: podés seguir
                    ajustando y reenviar mientras el mercado esté abierto.
                  </p>
                  <p className="mt-3 border-t border-neutral-100 pt-2 text-[11px] text-neutral-500">
                    {block.body}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">{block.body}</p>
                  {block.hint && (
                    <p className="mt-2 border-t border-neutral-100 pt-2 text-xs italic text-neutral-500">
                      {block.hint}
                    </p>
                  )}
                </>
              )}
              {pathname === "/" && !showEvaReply && (
                <Link
                  href="/login"
                  className="mt-3 inline-flex rounded-full bg-[#00A94F] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#009046]"
                  onClick={() => setOpen(false)}
                >
                  Ir a jugar
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-[#00A94F]/35 transition hover:ring-[#00A94F]/60 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00A94F]/30 ${
          pulse ? "scale-105 ring-[#00A94F]" : ""
        }`}
        aria-expanded={open}
        aria-label={open ? "Cerrar asistente Eva" : "Abrir asistente Eva"}
      >
        <span className="relative h-12 w-12 overflow-hidden rounded-full">
          <Image
            src={EVA_AVATAR}
            alt="Eva"
            width={48}
            height={48}
            className="h-full w-full object-cover object-top"
            priority
          />
        </span>
        {!open && openMatchesWithoutPred > 0 && pathname.startsWith("/prode") && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#00A94F] px-1 text-[10px] font-bold text-white">
            {openMatchesWithoutPred > 9 ? "9+" : openMatchesWithoutPred}
          </span>
        )}
      </button>
    </div>
  );
}

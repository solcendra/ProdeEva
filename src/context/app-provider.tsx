"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Match, Prediction, PromptResponse, User } from "@/types";
import { getAdminPin, STORAGE_KEY } from "@/lib/config";
import {
  MOCK_MATCHES,
  MOCK_ROUNDS,
  MOCK_USERS,
  seedPredictions,
  seedPromptResponses,
} from "@/lib/mock-data";
import { computeRanking, type RankingInput } from "@/lib/ranking";
import {
  buildDetailedRankingSnapshot,
  type RankingHistorySnapshot,
} from "@/lib/ranking-history";
import { randomPostSubmitQuip } from "@/lib/eva-copy";

export type PersistedState = {
  version: 1;
  matches: Match[];
  predictions: Prediction[];
  users: User[];
  promptResponses: PromptResponse[];
  /** Histórico de rankings guardados desde Admin (por día + timestamp). */
  rankingHistory: RankingHistorySnapshot[];
  /** Posición en ranking la última vez que el usuario abrió /ranking */
  lastRankSnapshot: Record<string, number>;
  sessionUserId: string | null;
  adminUnlocked: boolean;
};

function buildSeed(): PersistedState {
  return {
    version: 1,
    matches: MOCK_MATCHES.map((m) => ({ ...m })),
    predictions: seedPredictions(),
    users: MOCK_USERS.map((u) => ({ ...u })),
    promptResponses: seedPromptResponses().map((p) => ({ ...p })),
    rankingHistory: [],
    lastRankSnapshot: {},
    sessionUserId: null,
    adminUnlocked: false,
  };
}

function loadPersisted(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed?.version !== 1) return null;
    return {
      ...parsed,
      rankingHistory: Array.isArray(parsed.rankingHistory) ? parsed.rankingHistory : [],
    };
  } catch {
    return null;
  }
}

function savePersisted(state: PersistedState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

type AppContextValue = {
  state: PersistedState;
  hydrated: boolean;
  currentUser: User | null;
  rounds: typeof MOCK_ROUNDS;
  login: (payload: { name: string; email: string; team: string }) => void;
  logout: () => void;
  submitPrediction: (
    matchId: string,
    home: number,
    away: number,
  ) => { evaLine: string };
  submitPromptResponse: (roundId: string, text: string) => void;
  /** Llamar al montar /ranking para tendencias sube/baja */
  captureRankingSnapshot: () => void;
  getRanking: () => ReturnType<typeof computeRanking>;
  /** Admin */
  unlockAdmin: (pin: string) => boolean;
  lockAdmin: () => void;
  adminUpsertMatch: (match: Match) => void;
  adminSetActual: (matchId: string, actual: { home: number; away: number } | null) => void;
  adminSetPredictionsOpen: (matchId: string, open: boolean) => void;
  adminSetBonus: (responseId: string, bonus: number) => void;
  adminAppendRankingSnapshot: () => void;
  adminDeleteRankingSnapshot: (snapshotId: string) => void;
  resetDemoData: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => buildSeed());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted) setState(persisted);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    savePersisted(state);
  }, [state, hydrated]);

  const currentUser = useMemo(() => {
    if (!state.sessionUserId) return null;
    return state.users.find((u) => u.id === state.sessionUserId) ?? null;
  }, [state.sessionUserId, state.users]);

  const login = useCallback((payload: { name: string; email: string; team: string }) => {
    const email = payload.email.trim().toLowerCase();
    setState((s) => {
      const existing = s.users.find((u) => u.email.toLowerCase() === email);
      if (existing) {
        return { ...s, sessionUserId: existing.id };
      }
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? `user-${crypto.randomUUID()}`
          : `user-${Date.now()}`;
      const user: User = {
        id,
        name: payload.name.trim(),
        email,
        team: payload.team.trim(),
      };
      return { ...s, users: [...s.users, user], sessionUserId: id };
    });
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, sessionUserId: null }));
  }, []);

  const submitPrediction = useCallback((matchId: string, home: number, away: number) => {
    const evaLine = randomPostSubmitQuip();
    const now = new Date().toISOString();
    setState((s) => {
      const uid = s.sessionUserId;
      if (!uid) return s;
      const m = s.matches.find((x) => x.id === matchId);
      // Misma regla que la UI: mercado abierto y sin resultado oficial todavía.
      if (!m?.predictionsOpen || m.actual != null) return s;
      const nextPreds = s.predictions.filter(
        (p) => !(p.matchId === matchId && p.userId === uid),
      );
      nextPreds.push({ matchId, userId: uid, home, away, submittedAt: now });
      return { ...s, predictions: nextPreds };
    });
    return { evaLine };
  }, []);

  const submitPromptResponse = useCallback((roundId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? `pr-${crypto.randomUUID()}`
        : `pr-${Date.now()}`;
    setState((s) => {
      const uid = s.sessionUserId;
      if (!uid) return s;
      return {
        ...s,
        promptResponses: [
          ...s.promptResponses,
          { id, roundId, userId: uid, text: trimmed, bonusPoints: 0 },
        ],
      };
    });
  }, []);

  const getRankingInput = useCallback((): RankingInput => {
    return {
      matches: state.matches,
      predictions: state.predictions,
      users: state.users,
      promptResponses: state.promptResponses,
      previousPositionByUserId: state.lastRankSnapshot,
    };
  }, [
    state.matches,
    state.predictions,
    state.users,
    state.promptResponses,
    state.lastRankSnapshot,
  ]);

  const getRanking = useCallback(() => computeRanking(getRankingInput()), [getRankingInput]);

  const captureRankingSnapshot = useCallback(() => {
    const table = computeRanking({
      matches: state.matches,
      predictions: state.predictions,
      users: state.users,
      promptResponses: state.promptResponses,
      previousPositionByUserId: undefined,
    });
    const snap: Record<string, number> = {};
    for (const row of table) snap[row.user.id] = row.position;
    setState((s) => ({ ...s, lastRankSnapshot: snap }));
  }, [state.matches, state.predictions, state.users, state.promptResponses]);

  const unlockAdmin = useCallback((pin: string) => {
    const ok = pin === getAdminPin();
    if (ok) setState((s) => ({ ...s, adminUnlocked: true }));
    return ok;
  }, []);

  const lockAdmin = useCallback(() => {
    setState((s) => ({ ...s, adminUnlocked: false }));
  }, []);

  const adminUpsertMatch = useCallback((match: Match) => {
    setState((s) => ({
      ...s,
      matches: s.matches.some((m) => m.id === match.id)
        ? s.matches.map((m) => (m.id === match.id ? match : m))
        : [...s.matches, match],
    }));
  }, []);

  const adminSetActual = useCallback(
    (matchId: string, actual: { home: number; away: number } | null) => {
      setState((s) => ({
        ...s,
        matches: s.matches.map((m) => (m.id === matchId ? { ...m, actual } : m)),
      }));
    },
    [],
  );

  const adminSetPredictionsOpen = useCallback((matchId: string, open: boolean) => {
    setState((s) => ({
      ...s,
      matches: s.matches.map((m) => {
        if (m.id !== matchId) return m;
        if (open) {
          // Con resultado oficial el prode sigue “cerrado” para cargas nuevas.
          // Al reabrir mercado limpiamos el marcador para que vuelva a haber pronósticos.
          return { ...m, predictionsOpen: true, actual: null };
        }
        return { ...m, predictionsOpen: false };
      }),
    }));
  }, []);

  const adminSetBonus = useCallback((responseId: string, bonus: number) => {
    const b = Math.max(0, Math.min(50, Math.round(bonus)));
    setState((s) => ({
      ...s,
      promptResponses: s.promptResponses.map((p) =>
        p.id === responseId ? { ...p, bonusPoints: b } : p,
      ),
    }));
  }, []);

  const adminAppendRankingSnapshot = useCallback(() => {
    setState((s) => {
      const snap = buildDetailedRankingSnapshot({
        matches: s.matches,
        predictions: s.predictions,
        users: s.users,
        promptResponses: s.promptResponses,
      });
      return { ...s, rankingHistory: [snap, ...(s.rankingHistory ?? [])] };
    });
  }, []);

  const adminDeleteRankingSnapshot = useCallback((snapshotId: string) => {
    setState((s) => ({
      ...s,
      rankingHistory: (s.rankingHistory ?? []).filter((x) => x.id !== snapshotId),
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    setState(buildSeed());
  }, []);

  const value: AppContextValue = {
    state,
    hydrated,
    currentUser,
    rounds: MOCK_ROUNDS,
    login,
    logout,
    submitPrediction,
    submitPromptResponse,
    captureRankingSnapshot,
    getRanking,
    unlockAdmin,
    lockAdmin,
    adminUpsertMatch,
    adminSetActual,
    adminSetPredictionsOpen,
    adminSetBonus,
    adminAppendRankingSnapshot,
    adminDeleteRankingSnapshot,
    resetDemoData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider");
  return ctx;
}

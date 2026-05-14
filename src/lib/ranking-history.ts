import type { Match, Prediction, PromptResponse, User } from "@/types";
import { EVA_USER_ID } from "@/types";
import { findPrediction, scorePrediction } from "@/lib/scoring";

/** Una fila de partido dentro del histórico de un usuario. */
export type RankingHistoryMatchBreakdown = {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  actualHome: number | null;
  actualAway: number | null;
  predHome: number | null;
  predAway: number | null;
  points: number;
  exact: boolean;
  source: "eva" | "user";
};

/** Un jugador en un snapshot de ranking guardado. */
export type RankingHistoryPlayerRow = {
  userId: string;
  displayName: string;
  team: string;
  isEva: boolean;
  /** Posición en tabla en el momento del snapshot */
  rank: number;
  totalPoints: number;
  exactHits: number;
  bonusPoints: number;
  matches: RankingHistoryMatchBreakdown[];
};

/**
 * Captura completa del ranking + detalle de pronósticos y puntos por partido.
 * Varios snapshots por día permiten ver evolución intradiaria.
 */
export type RankingHistorySnapshot = {
  id: string;
  /** Día calendario (Argentina) para agrupar histórico */
  dayKey: string;
  /** ISO al momento de guardar */
  capturedAt: string;
  rows: RankingHistoryPlayerRow[];
};

function evaPickToPred(match: Match) {
  return { home: match.eva.home, away: match.eva.away };
}

/** YYYY-MM-DD en zona Buenos Aires (para “base por día”). */
export function dayKeyArgentina(isoDate: string | Date = new Date()): string {
  const d = typeof isoDate === "string" ? new Date(isoDate) : isoDate;
  return d.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
}

type SnapshotInput = {
  matches: Match[];
  predictions: Prediction[];
  users: User[];
  promptResponses: PromptResponse[];
};

/**
 * Arma un snapshot con ranking y detalle partido a partido (alineado a computeRanking).
 */
export function buildDetailedRankingSnapshot(input: SnapshotInput): RankingHistorySnapshot {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? `rh-${crypto.randomUUID()}`
      : `rh-${Date.now()}`;
  const capturedAt = new Date().toISOString();
  const dayKey = dayKeyArgentina(capturedAt);

  const bonusByUser: Record<string, number> = {};
  for (const r of input.promptResponses) {
    bonusByUser[r.userId] = (bonusByUser[r.userId] ?? 0) + (r.bonusPoints ?? 0);
  }

  const matchesSorted = [...input.matches].sort(
    (a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime(),
  );

  const draft: RankingHistoryPlayerRow[] = input.users.map((user) => {
    const isEva = Boolean(user.isEva || user.id === EVA_USER_ID);
    const bonusPoints = bonusByUser[user.id] ?? 0;
    const matches: RankingHistoryMatchBreakdown[] = [];
    let totalPoints = bonusPoints;
    let exactHits = 0;

    for (const m of matchesSorted) {
      const actual = m.actual;
      let pred: { home: number; away: number } | null = null;
      const source: "eva" | "user" = isEva ? "eva" : "user";

      if (isEva) {
        pred = evaPickToPred(m);
      } else {
        const p = findPrediction(input.predictions, m.id, user.id);
        if (p) pred = { home: p.home, away: p.away };
      }

      if (!actual) {
        matches.push({
          matchId: m.id,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          actualHome: null,
          actualAway: null,
          predHome: pred?.home ?? null,
          predAway: pred?.away ?? null,
          points: 0,
          exact: false,
          source,
        });
        continue;
      }

      if (!pred) {
        matches.push({
          matchId: m.id,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          actualHome: actual.home,
          actualAway: actual.away,
          predHome: null,
          predAway: null,
          points: 0,
          exact: false,
          source,
        });
        continue;
      }

      const s = scorePrediction(pred, actual);
      totalPoints += s.points;
      if (s.exact) exactHits += 1;
      matches.push({
        matchId: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        actualHome: actual.home,
        actualAway: actual.away,
        predHome: pred.home,
        predAway: pred.away,
        points: s.points,
        exact: s.exact,
        source,
      });
    }

    return {
      userId: user.id,
      displayName: user.name,
      team: user.team,
      isEva,
      rank: 0,
      totalPoints,
      exactHits,
      bonusPoints,
      matches,
    };
  });

  draft.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.exactHits !== a.exactHits) return b.exactHits - a.exactHits;
    return a.displayName.localeCompare(b.displayName, "es");
  });

  draft.forEach((row, i) => {
    row.rank = i + 1;
  });

  return { id, dayKey, capturedAt, rows: draft };
}

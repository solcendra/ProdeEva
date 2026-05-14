import type { Match, Prediction, PromptResponse, RankRow, Trend, User } from "@/types";
import { EVA_USER_ID } from "@/types";
import { findPrediction, scorePrediction } from "@/lib/scoring";

export type RankingInput = {
  matches: Match[];
  predictions: Prediction[];
  users: User[];
  promptResponses: PromptResponse[];
  /** Posición previa por userId (desde última visita al ranking). */
  previousPositionByUserId?: Record<string, number>;
};

function evaPickToPred(match: Match) {
  return { home: match.eva.home, away: match.eva.away };
}

function trendForUser(
  userId: string,
  currentPos: number,
  prev?: Record<string, number>,
): Trend {
  if (!prev || prev[userId] === undefined) return "same";
  const before = prev[userId]!;
  if (currentPos < before) return "up";
  if (currentPos > before) return "down";
  return "same";
}

/**
 * Calcula puntos y tabla. Eva compite con su pick publicado en cada partido.
 */
export function computeRanking(input: RankingInput): RankRow[] {
  const finished = input.matches.filter((m) => m.actual);
  const bonusByUser: Record<string, number> = {};
  for (const r of input.promptResponses) {
    bonusByUser[r.userId] = (bonusByUser[r.userId] ?? 0) + (r.bonusPoints ?? 0);
  }

  const prev = input.previousPositionByUserId;

  const rows = input.users.map((user) => {
    let points = bonusByUser[user.id] ?? 0;
    let exactHits = 0;
    for (const m of finished) {
      const actual = m.actual!;
      let pred: { home: number; away: number } | null = null;
      if (user.isEva || user.id === EVA_USER_ID) {
        pred = evaPickToPred(m);
      } else {
        const p = findPrediction(input.predictions, m.id, user.id);
        if (p) pred = { home: p.home, away: p.away };
      }
      if (!pred) continue;
      const s = scorePrediction(pred, actual);
      points += s.points;
      if (s.exact) exactHits += 1;
    }
    return { user, points, exactHits };
  });

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.exactHits !== a.exactHits) return b.exactHits - a.exactHits;
    return a.user.name.localeCompare(b.user.name, "es");
  });

  return rows.map((r, i) => {
    const position = i + 1;
    return {
      position,
      user: r.user,
      points: r.points,
      exactHits: r.exactHits,
      trend: trendForUser(r.user.id, position, prev),
    };
  });
}

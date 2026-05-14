import type { Prediction } from "@/types";

/**
 * Reglas de puntuación (MVP):
 * - Resultado exacto: 5 pts
 * - Acierta ganador o empate: 3 pts
 * - +1 pt por cada equipo cuya cantidad de goles predicha coincide con el resultado real
 * (si hubo resultado exacto, el total es 5 y no se suman extras encima).
 */
export function scorePrediction(
  pred: { home: number; away: number },
  actual: { home: number; away: number },
): { points: number; exact: boolean } {
  const exact = pred.home === actual.home && pred.away === actual.away;
  if (exact) return { points: 5, exact: true };

  const outcome = (h: number, a: number) =>
    h === a ? "draw" : h > a ? "home" : "away";
  const oP = outcome(pred.home, pred.away);
  const oA = outcome(actual.home, actual.away);
  let points = 0;
  if (oP === oA) points += 3;
  if (pred.home === actual.home) points += 1;
  if (pred.away === actual.away) points += 1;
  return { points, exact: false };
}

export function findPrediction(
  predictions: Prediction[],
  matchId: string,
  userId: string,
): Prediction | undefined {
  return predictions.find((p) => p.matchId === matchId && p.userId === userId);
}

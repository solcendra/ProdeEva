/**
 * Modelo de datos — MVP "El Prode de Eva".
 * Pensado para migrar a Supabase: mismas entidades y campos.
 */

export type Trend = "up" | "down" | "same";

export type User = {
  id: string;
  name: string;
  email: string;
  /** Área / equipo funcional */
  team: string;
  /** Participante sintético (Eva) */
  isEva?: boolean;
};

export type EvaPick = {
  home: number;
  away: number;
  /** Probabilidad ficticia 0–100 */
  probability: number;
  commentary: string;
};

export type Match = {
  id: string;
  roundId: string;
  homeTeam: string;
  awayTeam: string;
  /** ISO 8601 */
  kickoffAt: string;
  /** Si false, no se aceptan predicciones (mercado cerrado). */
  predictionsOpen: boolean;
  /** Resultado oficial una vez cargado por admin. */
  actual: { home: number; away: number } | null;
  eva: EvaPick;
};

export type Prediction = {
  matchId: string;
  userId: string;
  home: number;
  away: number;
  submittedAt: string;
};

export type PromptResponse = {
  id: string;
  roundId: string;
  userId: string;
  text: string;
  /** Puntos bonus asignados desde admin */
  bonusPoints: number;
};

export type Round = {
  id: string;
  label: string;
  /** Consigna creativa de la fecha */
  creativePrompt: string;
};

export type RankRow = {
  position: number;
  user: User;
  points: number;
  exactHits: number;
  trend: Trend;
};

export const EVA_USER_ID = "user-eva";

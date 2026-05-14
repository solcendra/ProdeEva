/**
 * Mapeo filas Supabase ↔ tipos de app (`src/types`).
 * Usar cuando conectes el cliente `@supabase/supabase-js` al backend real.
 */

import type { Match, Prediction, PromptResponse, Round, User } from "@/types";

/** Fila típica de `public.rounds` */
export type DbRound = {
  id: string;
  slug: string | null;
  label: string;
  creative_prompt: string;
};

/** Fila típica de `public.matches` */
export type DbMatch = {
  id: string;
  round_id: string;
  home_team: string;
  away_team: string;
  kickoff_at: string;
  predictions_open: boolean;
  actual_home: number | null;
  actual_away: number | null;
  eva_home: number;
  eva_away: number;
  eva_probability: number;
  eva_commentary: string;
};

export type DbProfile = {
  id: string;
  display_name: string;
  team: string;
  role: "user" | "admin";
};

export type DbPrediction = {
  id: string;
  match_id: string;
  user_id: string;
  home: number;
  away: number;
  submitted_at: string;
};

export type DbPromptResponse = {
  id: string;
  round_id: string;
  user_id: string;
  body: string;
  bonus_points: number;
};

export function dbRoundToRound(row: DbRound): Round {
  return {
    id: row.slug ?? row.id,
    label: row.label,
    creativePrompt: row.creative_prompt,
  };
}

/**
 * @param roundSlug - `rounds.slug` (ej. round-1). Si omitís, se usa el UUID de `round_id`.
 */
export function dbMatchToMatch(row: DbMatch, roundSlug?: string | null): Match {
  return {
    id: row.id,
    roundId: roundSlug ?? row.round_id,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    kickoffAt: row.kickoff_at,
    predictionsOpen: row.predictions_open,
    actual:
      row.actual_home != null && row.actual_away != null
        ? { home: row.actual_home, away: row.actual_away }
        : null,
    eva: {
      home: row.eva_home,
      away: row.eva_away,
      probability: row.eva_probability,
      commentary: row.eva_commentary,
    },
  };
}

export function dbProfileToUser(row: DbProfile): User {
  return {
    id: row.id,
    name: row.display_name,
    email: "",
    team: row.team,
    isEva: false,
  };
}

export function dbPredictionToPrediction(row: DbPrediction): Prediction {
  return {
    matchId: row.match_id,
    userId: row.user_id,
    home: row.home,
    away: row.away,
    submittedAt: row.submitted_at,
  };
}

export function dbPromptResponseToPromptResponse(row: DbPromptResponse): PromptResponse {
  return {
    id: row.id,
    roundId: row.round_id,
    userId: row.user_id,
    text: row.body,
    bonusPoints: row.bonus_points,
  };
}

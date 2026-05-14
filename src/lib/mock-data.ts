import type { Match, Prediction, PromptResponse, Round, User } from "@/types";
import { EVA_USER_ID } from "@/types";

/** Jornada / fecha con consigna creativa */
export const MOCK_ROUNDS: Round[] = [
  {
    id: "round-1",
    label: "Fase de grupos — Jornada 1",
    creativePrompt:
      "Describí este partido como si fuera una reunión corporativa (máx. 2 frases).",
  },
];

export const MOCK_USERS: User[] = [
  { id: "user-1", name: "Lucía Fernández", email: "lucia.fernandez@bayer.com", team: "Marketing" },
  { id: "user-2", name: "Martín Costa", email: "martin.costa@bayer.com", team: "Ventas Sur" },
  { id: "user-3", name: "Paula Gómez", email: "paula.gomez@bayer.com", team: "Supply Chain" },
  { id: "user-4", name: "Diego Ríos", email: "diego.rios@bayer.com", team: "IT" },
  { id: "user-5", name: "Valentina Soto", email: "valentina.soto@bayer.com", team: "RR.HH." },
  { id: "user-6", name: "Andrés Méndez", email: "andres.mendez@bayer.com", team: "Regulatorio" },
  { id: "user-7", name: "Camila Ruiz", email: "camila.ruiz@bayer.com", team: "Finanzas" },
  { id: "user-8", name: "Javier Núñez", email: "javier.nunez@bayer.com", team: "R&D" },
  { id: "user-9", name: "Sofía Herrera", email: "sofia.herrera@bayer.com", team: "Legal" },
  { id: "user-10", name: "Nicolás Vega", email: "nicolas.vega@bayer.com", team: "Operaciones" },
  {
    id: EVA_USER_ID,
    name: "Eva",
    email: "eva@bayer.com",
    team: "IA interna — analista oficial",
    isEva: true,
  },
];

const iso = (d: string) => new Date(d).toISOString();

/** 6 partidos: 3 con resultado (ranking con datos), 3 mercado abierto. */
export const MOCK_MATCHES: Match[] = [
  {
    id: "m-1",
    roundId: "round-1",
    homeTeam: "Argentina",
    awayTeam: "Brasil",
    kickoffAt: iso("2026-06-14T18:00:00-03:00"),
    predictionsOpen: false,
    actual: { home: 2, away: 1 },
    eva: {
      home: 2,
      away: 1,
      probability: 67,
      commentary: "Riesgo alto de sufrimiento innecesario.",
    },
  },
  {
    id: "m-2",
    roundId: "round-1",
    homeTeam: "Alemania",
    awayTeam: "Francia",
    kickoffAt: iso("2026-06-15T16:00:00-03:00"),
    predictionsOpen: false,
    actual: { home: 1, away: 1 },
    eva: {
      home: 0,
      away: 2,
      probability: 54,
      commentary: "Clásico europeo: mucha estructura, poco margen de error.",
    },
  },
  {
    id: "m-3",
    roundId: "round-1",
    homeTeam: "España",
    awayTeam: "Italia",
    kickoffAt: iso("2026-06-16T15:00:00-03:00"),
    predictionsOpen: false,
    actual: { home: 3, away: 0 },
    eva: {
      home: 2,
      away: 0,
      probability: 58,
      commentary: "Predicción conservadora. El talento joven pide revisión del modelo.",
    },
  },
  {
    id: "m-4",
    roundId: "round-1",
    homeTeam: "Inglaterra",
    awayTeam: "Portugal",
    kickoffAt: iso("2026-06-20T13:00:00-03:00"),
    predictionsOpen: true,
    actual: null,
    eva: {
      home: 1,
      away: 2,
      probability: 61,
      commentary: "Partido de transiciones: ojo con el contragolpe emocional.",
    },
  },
  {
    id: "m-5",
    roundId: "round-1",
    homeTeam: "México",
    awayTeam: "Uruguay",
    kickoffAt: iso("2026-06-21T17:00:00-03:00"),
    predictionsOpen: true,
    actual: null,
    eva: {
      home: 1,
      away: 1,
      probability: 49,
      commentary: "Empate táctico con aroma a overtime no facturado.",
    },
  },
  {
    id: "m-6",
    roundId: "round-1",
    homeTeam: "Japón",
    awayTeam: "Corea del Sur",
    kickoffAt: iso("2026-06-22T14:00:00-03:00"),
    predictionsOpen: true,
    actual: null,
    eva: {
      home: 2,
      away: 1,
      probability: 55,
      commentary: "Ritmo alto, posesiones cortas. Como un stand-up diario bien llevado.",
    },
  },
];

/** Predicciones iniciales solo sobre partidos ya cerrados (demo). */
export function seedPredictions(): Prediction[] {
  const closed = MOCK_MATCHES.filter((m) => m.actual);
  const preds: Prediction[] = [];
  const now = iso("2026-05-10T10:00:00-03:00");

  const matrix: Record<string, { home: number; away: number }[]> = {
    "m-1": [
      { home: 2, away: 1 },
      { home: 1, away: 1 },
      { home: 2, away: 0 },
      { home: 0, away: 2 },
      { home: 3, away: 1 },
      { home: 1, away: 0 },
      { home: 2, away: 2 },
      { home: 2, away: 1 },
      { home: 1, away: 2 },
      { home: 0, away: 1 },
    ],
    "m-2": [
      { home: 1, away: 1 },
      { home: 2, away: 1 },
      { home: 0, away: 0 },
      { home: 1, away: 2 },
      { home: 2, away: 2 },
      { home: 1, away: 0 },
      { home: 0, away: 1 },
      { home: 1, away: 1 },
      { home: 2, away: 0 },
      { home: 1, away: 3 },
    ],
    "m-3": [
      { home: 2, away: 0 },
      { home: 3, away: 0 },
      { home: 1, away: 1 },
      { home: 2, away: 1 },
      { home: 3, away: 1 },
      { home: 0, away: 0 },
      { home: 4, away: 0 },
      { home: 2, away: 2 },
      { home: 1, away: 0 },
      { home: 0, away: 1 },
    ],
  };

  for (const m of closed) {
    MOCK_USERS.filter((u) => !u.isEva).forEach((u, idx) => {
      const pick = matrix[m.id]?.[idx] ?? { home: 1, away: 1 };
      preds.push({
        matchId: m.id,
        userId: u.id,
        home: pick.home,
        away: pick.away,
        submittedAt: now,
      });
    });
  }

  return preds;
}

export function seedPromptResponses(): PromptResponse[] {
  return [
    {
      id: "pr-1",
      roundId: "round-1",
      userId: "user-1",
      text: "Como cuando Finanzas pide el deck 5 minutos antes del steering.",
      bonusPoints: 2,
    },
    {
      id: "pr-2",
      roundId: "round-1",
      userId: "user-4",
      text: "Mucha posesión de balón, poca decisión en el área: típico comité eterno.",
      bonusPoints: 1,
    },
  ];
}

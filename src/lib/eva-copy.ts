/** Comentarios automáticos tras enviar predicción (tono Eva). */
export const POST_SUBMIT_QUIPS = [
  "Muy optimista lo tuyo.",
  "Voy a asumir que esto lo cargaste emocionalmente.",
  "Predicción arriesgada. Me gusta.",
  "Dato guardado. La mufa queda bajo tu responsabilidad.",
  "Eva ya tomó nota. Ahora no te borres del ranking.",
  "Te guardé la predicción. El VAR emocional no aplica.",
  "Buena jugada. Riesgo alto, potencial alto.",
  "Esto parece más fe que análisis, pero lo respeto.",
  "No abras otro Excel. Ya lo tengo.",
] as const;

export function randomPostSubmitQuip(): string {
  const i = Math.floor(Math.random() * POST_SUBMIT_QUIPS.length);
  return POST_SUBMIT_QUIPS[i] ?? POST_SUBMIT_QUIPS[0];
}

/** Ticker estilo “último momento” para header / home. */
export const FLASH_HEADLINES = [
  "Último momento: Eva analiza el mercado de pases con más rigor que un comité de compras.",
  "Corte al estudio: la tabla de posiciones no perdona ni al área de Finanzas.",
  "Alerta táctica: predicción cerrada = mercado cerrado. Sin excepciones de calendario.",
  "Eva confirma: el ranking se actualiza con cada resultado oficial cargado por admin.",
] as const;

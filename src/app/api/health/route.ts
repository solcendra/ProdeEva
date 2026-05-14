import { NextResponse } from "next/server";

/** Endpoint liviano para smoke tests / Vercel. Sin base de datos en MVP. */
export function GET() {
  return NextResponse.json({ ok: true, app: "prode-eva", ts: new Date().toISOString() });
}

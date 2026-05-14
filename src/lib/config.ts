/**
 * Configuración demo — en producción usar variables de entorno en Vercel.
 */
export const STORAGE_KEY = "prode-eva-state-v1";

/** Dominios de email permitidos (coma-separados en env). */
export function getAllowedEmailDomains(): string[] {
  const raw =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS
      ? process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS
      : "bayer.com,bayer.cn,bayer.com.ar,bayer.co";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isCorporateEmail(email: string): boolean {
  const lower = email.trim().toLowerCase();
  const at = lower.lastIndexOf("@");
  if (at < 0) return false;
  const domain = lower.slice(at + 1);
  return getAllowedEmailDomains().some((d) => domain === d || domain.endsWith(`.${d}`));
}

/** PIN simple para panel admin (solo demo interna). */
export function getAdminPin(): string {
  return (
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_ADMIN_PIN) ||
    "bayer-prode"
  );
}

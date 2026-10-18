const TZ = "America/Sao_Paulo";

/** Data de hoje (AAAA-MM-DD) no fuso de Brasília. */
export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "2026-03-05" → "05/03/2026" */
export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return d && m && y ? `${d}/${m}/${y}` : "";
}

export function formatDateTimeBR(iso: string | Date | null | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

export function ageLabel(birthISO: string | null | undefined, now = new Date()): string {
  if (!birthISO) return "";
  const birth = new Date(`${birthISO}T12:00:00Z`);
  let months = (now.getUTCFullYear() - birth.getUTCFullYear()) * 12 + (now.getUTCMonth() - birth.getUTCMonth());
  if (now.getUTCDate() < birth.getUTCDate()) months -= 1;
  if (months < 0) return "";
  if (months < 12) return months <= 1 ? `${Math.max(months, 0)} mês` : `${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 ano" : `${years} anos`;
}

// Formattazione di date, orari e nomi in italiano.

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const DAY_LONG = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
const MONTH_SHORT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
const MONTH_LONG = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Data locale da "YYYY-MM-DD" (senza fuso orario). */
export function parseDate(iso: string, time = "0:00"): Date {
  const [y, m, d] = iso.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0);
}

/** "Gio 12 nov, 10:30" */
export function shortDateTime(iso: string, time: string) {
  const d = parseDate(iso);
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}, ${time}`;
}

/** "Giovedì 12 novembre, 10:30" */
export function longDateTime(iso: string, time: string) {
  const d = parseDate(iso);
  return `${cap(DAY_LONG[d.getDay()])} ${d.getDate()} ${MONTH_LONG[d.getMonth()]}, ${time}`;
}

/** "12 novembre" */
export function dayMonth(iso: string) {
  const d = parseDate(iso);
  return `${d.getDate()} ${MONTH_LONG[d.getMonth()]}`;
}

/** { dn: "gio", d: 12, mon: "nov" } per il badge calendario. */
export function dateBadge(iso: string) {
  const d = parseDate(iso);
  return { dn: DAY_SHORT[d.getDay()].toLowerCase(), d: d.getDate(), mon: MONTH_SHORT[d.getMonth()] };
}

/** "Oggi, 9:41", "Ieri, 18:02" o "3 novembre, 9:41" per i messaggi. */
export function messageTime(isoDateTime: string, nowDate = new Date()) {
  const d = new Date(isoDateTime);
  const hm = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (nowDate.getTime() - d.getTime() < 60_000) return "Adesso";
  if (sameDay(d, nowDate)) return `Oggi, ${hm}`;
  const y = new Date(nowDate);
  y.setDate(y.getDate() - 1);
  if (sameDay(d, y)) return `Ieri, ${hm}`;
  return `${d.getDate()} ${MONTH_LONG[d.getMonth()]}, ${hm}`;
}

/** Iniziali per gli avatar di coppia: "Giulia e Marco" → ["G", "M"]. */
export function coupleInitials(name: string, email = ""): string[] {
  const parts = name
    .split(/\s+(?:e|&|and)\s+|\s*,\s*|\s*\+\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) return [parts[0][0], parts[1][0]].map((c) => c.toUpperCase());
  const one = (parts[0] || email || "?").trim();
  return [one[0]?.toUpperCase() ?? "?"];
}

/** Nome da mostrare: nome della coppia o, in mancanza, l’email. */
export function displayName(name: string, email: string) {
  return name.trim() || email;
}

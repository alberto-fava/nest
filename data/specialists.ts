// Specialisti e calendario, presi da design/Abbinamento.dc.html.
// Le foto in public/medici/ sono stock, da sostituire.

export type SpecialistId = "em" | "lf" | "mb" | "sc";
export type StudioHours = "am" | "pm" | "all" | "none";
export type VisitMode = "online" | "studio";

export interface Specialist {
  id: SpecialistId;
  /** f = femminile, m = maschile: serve per articoli e accordi ("la vostra specialista"). */
  g: "f" | "m";
  name: string;
  /** "la Dott.ssa Marchetti" */
  short: string;
  /** "Dott.ssa Marchetti" */
  title: string;
  initials: string;
  role: string;
  /** Ruolo breve per le card dell’area personale. */
  roleShort: string;
  line: string;
  tags: string[];
  bio: string;
  /** Motivi generici: valgono per qualunque coppia. */
  reasons: string[];
  /** Motivi personalizzati del design (vedi reasonsFor in data/matching.ts). */
  matchReasons?: string[];
  online: boolean;
  studio: StudioHours;
  /** Orari per i 10 giorni lavorativi di DAYS. */
  cal: string[][];
  photo: string;
}

export const SPECIALISTS: Specialist[] = [
  {
    id: "em",
    g: "f",
    name: "Dott.ssa Elena Marchetti",
    short: "la Dott.ssa Marchetti",
    title: "Dott.ssa Marchetti",
    initials: "EM",
    role: "Ginecologa, esperta in fertilità di coppia",
    roleShort: "Ginecologa",
    line: "Prima valutazione di coppia, cicli irregolari, PCOS",
    tags: ["Prima valutazione", "Cicli irregolari", "PCOS"],
    bio: "Ginecologa specializzata in medicina della riproduzione. Da oltre dieci anni segue coppie all’inizio del percorso, dalla prima valutazione alla scelta del trattamento.",
    reasons: [
      "Con lei fate una prima valutazione completa, per entrambi.",
      "Segue soprattutto coppie all’inizio del percorso.",
      "Lavora con un andrologo di fiducia, se serve approfondire il fattore maschile.",
    ],
    // Testi del design, validi per chi cerca da più di un anno e non ha ancora fatto esami.
    matchReasons: [
      "Cercate da più di un anno: con lei fate una valutazione completa, per entrambi.",
      "Segue soprattutto coppie che non hanno ancora fatto esami, come voi.",
      "Lavora con un andrologo di fiducia, se serve approfondire il fattore maschile.",
    ],
    online: true,
    studio: "am",
    cal: [["9:00", "11:30"], ["15:00", "16:30"], ["9:00"], ["10:30", "16:00"], ["9:30", "12:00"], ["9:00", "18:00"], ["11:00", "15:30"], [], ["10:30", "14:30", "17:00"], ["9:30"]],
    photo: "/medici/marchetti.jpg",
  },
  {
    id: "lf",
    g: "m",
    name: "Dott. Luca Ferri",
    short: "il Dott. Ferri",
    title: "Dott. Ferri",
    initials: "LF",
    role: "Andrologo",
    roleShort: "Andrologo",
    line: "Fertilità maschile e spermiogramma",
    tags: ["Spermiogramma", "Fattore maschile"],
    bio: "Andrologo, si occupa di fertilità maschile. Collabora con ginecologi e centri di procreazione assistita per una valutazione di coppia completa.",
    reasons: [
      "Valuta la fertilità di lui, spesso esaminata per ultima.",
      "Legge con voi lo spermiogramma e decide gli approfondimenti.",
      "Visita in studio, anche in orario serale.",
    ],
    online: false,
    studio: "all",
    cal: [["17:00"], [], ["18:00"], ["17:30", "19:00"], [], ["18:00"], ["18:30"], ["17:00"], ["17:00", "19:00"], []],
    photo: "/medici/ferri.jpg",
  },
  {
    id: "mb",
    g: "m",
    name: "Dott. Marco Bellini",
    short: "il Dott. Bellini",
    title: "Dott. Bellini",
    initials: "MB",
    role: "Specialista in procreazione assistita",
    roleShort: "Specialista in PMA",
    line: "Inseminazione, FIVET e ICSI",
    tags: ["Inseminazione", "FIVET e ICSI"],
    bio: "Specialista in procreazione assistita. Accompagna le coppie nella scelta tra inseminazione, FIVET e ICSI, e nei rapporti con il centro.",
    reasons: [
      "Vi aiuta a capire se la procreazione assistita fa per voi.",
      "Conosce bene inseminazione, FIVET e ICSI.",
      "Prima visita online, poi in studio se serve.",
    ],
    online: true,
    studio: "pm",
    cal: [["9:00", "14:00"], ["11:30"], ["14:00", "16:00"], [], ["11:30"], ["10:00"], ["9:00", "15:00"], ["14:00"], [], ["11:30", "16:30"]],
    photo: "/medici/bellini.jpg",
  },
  {
    id: "sc",
    g: "f",
    name: "Dott.ssa Sara Conti",
    short: "la Dott.ssa Conti",
    title: "Dott.ssa Conti",
    initials: "SC",
    role: "Psicologa della fertilità",
    roleShort: "Psicologa",
    line: "Sostegno di coppia durante il percorso",
    tags: ["Sostegno di coppia", "Attesa dei risultati"],
    bio: "Psicologa e psicoterapeuta. Lavora con coppie che affrontano un percorso di fertilità, prima, durante e dopo i trattamenti.",
    reasons: [
      "Vi aiuta ad affrontare insieme lo stress del percorso.",
      "Si affianca a qualsiasi specialista, in ogni fase.",
      "Colloqui online, anche la sera.",
    ],
    online: true,
    studio: "none",
    cal: [["19:00"], ["18:30", "20:00"], ["19:00"], ["20:00"], [], ["19:30"], ["18:00"], ["19:00", "20:30"], ["19:00"], []],
    photo: "/medici/conti.jpg",
  },
];

export function getSpecialist(id: string | null | undefined): Specialist {
  return SPECIALISTS.find((s) => s.id === id) ?? SPECIALISTS[0];
}

/** "La vostra specialista" / "Il vostro specialista" */
export function yourSpecialist(s: Specialist, capitalized = true): string {
  const t = s.g === "f" ? "la vostra specialista" : "il vostro specialista";
  return capitalized ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

/** "con la specialista" / "con lo specialista" */
export function withSpecialist(s: Specialist): string {
  return s.g === "f" ? "con la specialista" : "con lo specialista";
}

// Calendario: due settimane di novembre 2026, come nel design.
export interface CalendarDay {
  dn: string;
  ln: string;
  d: number;
  /** Data ISO (YYYY-MM-DD). */
  date: string;
}

export const DAYS: CalendarDay[] = [
  { dn: "Lun", ln: "lunedì", d: 9, date: "2026-11-09" },
  { dn: "Mar", ln: "martedì", d: 10, date: "2026-11-10" },
  { dn: "Mer", ln: "mercoledì", d: 11, date: "2026-11-11" },
  { dn: "Gio", ln: "giovedì", d: 12, date: "2026-11-12" },
  { dn: "Ven", ln: "venerdì", d: 13, date: "2026-11-13" },
  { dn: "Lun", ln: "lunedì", d: 16, date: "2026-11-16" },
  { dn: "Mar", ln: "martedì", d: 17, date: "2026-11-17" },
  { dn: "Mer", ln: "mercoledì", d: 18, date: "2026-11-18" },
  { dn: "Gio", ln: "giovedì", d: 19, date: "2026-11-19" },
  { dn: "Ven", ln: "venerdì", d: 20, date: "2026-11-20" },
];

export const WEEKS = ["Dal 9 al 13 novembre", "Dal 16 al 20 novembre"];

function hourOf(t: string) {
  return parseInt(t.split(":")[0], 10);
}

/** Orari di un giorno per specialista e modalità, con le stesse regole del design. */
export function slotsFor(s: Specialist, dayIndex: number, mode: VisitMode): string[] {
  const base = s.cal[dayIndex] ?? [];
  if (mode === "online") return s.online ? base : [];
  if (s.studio === "all") return base;
  if (s.studio === "am") return base.filter((t) => hourOf(t) < 13);
  if (s.studio === "pm") return base.filter((t) => hourOf(t) >= 13);
  return [];
}

export function canOnline(s: Specialist) {
  return s.online;
}
export function canStudio(s: Specialist) {
  return s.studio !== "none";
}

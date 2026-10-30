// Esami, documenti e messaggi di esempio dell’area personale (design/Piattaforma.dc.html).
// {lei} e {lui} vengono sostituiti con i nomi della coppia, se ricavabili.

export type ExamStatus = "ready" | "work" | "booked" | "todo";
export type ExamFilter = "all" | "todo" | "progress" | "ready";

export interface Exam {
  name: string;
  meta: string;
  s: ExamStatus;
}

export const EXAMS: Exam[] = [
  { name: "AMH, riserva ovarica", meta: "{lei}, prelievo del 3 novembre", s: "ready" },
  { name: "Emocromo e TSH", meta: "{lei}, referto del 3 novembre", s: "ready" },
  { name: "Spermiogramma", meta: "{lui}, consegnato il 4 novembre", s: "work" },
  { name: "Ecografia pelvica", meta: "{lei}, lunedì 16 novembre in studio", s: "booked" },
  { name: "Profilo ormonale", meta: "{lei}, al 3° giorno del ciclo", s: "todo" },
  { name: "Esami infettivologici", meta: "Entrambi, prima di eventuali trattamenti", s: "todo" },
];

/** Etichette brevi per la card "Esami" del percorso. */
export const EXAM_SHORT_DATE: Partial<Record<string, string>> = {
  "Ecografia pelvica": "Lun 16 nov",
};

export const EXAM_STATUS_LABEL: Record<ExamStatus, string> = {
  ready: "Referto pronto",
  work: "In lavorazione",
  booked: "Prenotato",
  todo: "Da prenotare",
};

export const EXAM_ACTIONS: Record<ExamStatus, string[]> = {
  ready: ["Vedi referto", "Scarica il PDF"],
  work: ["Dettagli dell’esame"],
  booked: ["Sposta", "Aggiungi al calendario"],
  todo: ["Prenota", "Carica un referto"],
};

export const EXAM_FILTERS: { id: ExamFilter; label: string }[] = [
  { id: "all", label: "Tutti" },
  { id: "todo", label: "Da fare" },
  { id: "progress", label: "In corso" },
  { id: "ready", label: "Pronti" },
];

export function inFilter(e: Exam, f: ExamFilter): boolean {
  if (f === "all") return true;
  if (f === "todo") return e.s === "todo";
  if (f === "progress") return e.s === "work" || e.s === "booked";
  return e.s === "ready";
}

export interface SampleDoc {
  name: string;
  meta: string;
}

export const DOCS: SampleDoc[] = [
  { name: "Referto AMH.pdf", meta: "{lei}, 3 novembre" },
  { name: "Emocromo e TSH.pdf", meta: "{lei}, 3 novembre" },
  // {daSpecialista}: "Dalla Dott.ssa Marchetti" o "Dal Dott. Ferri"
  { name: "Impegnativa ecografia.pdf", meta: "{daSpecialista}, 5 novembre" },
];

/** Primi messaggi dello specialista, creati alla prima apertura dell’area personale. */
export const WELCOME_MESSAGES = [
  "Buongiorno {coppia}, ho visto il referto dell’AMH: è nella norma per la vostra età.",
  "Giovedì lo guardiamo insieme allo spermiogramma e decidiamo i prossimi passi.",
];

/** Ricava i nomi di lei e lui da "Giulia e Marco". */
export function partnerNames(coupleName: string): { lei: string; lui: string } {
  const parts = coupleName
    .split(/\s+(?:e|&|and)\s+|\s*,\s*|\s*\+\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) return { lei: parts[0], lui: parts[1] };
  return { lei: "Lei", lui: "Lui" };
}

export function fillNames(text: string, names: { lei: string; lui: string }, extra: Record<string, string> = {}): string {
  let out = text.replace(/\{lei\}/g, names.lei).replace(/\{lui\}/g, names.lui);
  for (const [k, v] of Object.entries(extra)) out = out.split(`{${k}}`).join(v);
  return out;
}

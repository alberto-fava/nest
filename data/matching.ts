// Regole di abbinamento, dalle logiche in design/Main, Questionario e Abbinamento.
import { MINI_REASONS_1, MINI_REASONS_2, type Answer } from "./questions";
import { getSpecialist, type Specialist, type SpecialistId, type VisitMode } from "./specialists";

export type PathKey = "gyn" | "pma" | "pres" | "psy";

/** Chiave di percorso dalle prime tre risposte (identica a landing e questionario). */
export function pathKey(ans: Answer[]): PathKey {
  if (ans[0] === 3) return "pres";
  if (ans[2] === 3) return "psy";
  if (ans[1] === 3 || ans[2] === 2) return "pma";
  return "gyn";
}

/** Testo della mini-quiz in landing: "Un buon punto di partenza: …". */
export const LANDING_PATH: Record<PathKey, string> = {
  gyn: "una prima valutazione di coppia",
  pma: "una valutazione per la procreazione assistita",
  pres: "la preservazione della fertilità",
  psy: "un supporto psicologico, insieme ai primi esami",
};

const QUESTIONNAIRE_PATH: Record<PathKey, string> = {
  gyn: "prima valutazione di coppia",
  pma: "valutazione per la procreazione assistita",
  pres: "preservazione della fertilità",
  psy: "supporto psicologico e primi esami",
};

function list(a: Answer): number[] {
  return Array.isArray(a) ? a : [];
}

/** Fattore maschile: spermiogramma alterato o varicocele. */
export function hasMaleFactor(ans: Answer[]): boolean {
  return ans[4] === 2 || list(ans[5]).includes(0);
}

/** Diagnosi ginecologiche note: endometriosi o PCOS. */
export function hasGynDiagnosis(ans: Answer[]): boolean {
  const d = list(ans[8]);
  return d.includes(0) || d.includes(1);
}

/** "Primo orientamento: …" alla fine del questionario. */
export function pathText(ans: Answer[]): string {
  const key = pathKey(ans);
  if (key === "gyn" && hasMaleFactor(ans)) return "valutazione di coppia, partendo dal fattore maschile";
  if (key === "gyn" && hasGynDiagnosis(ans)) return "valutazione ginecologica mirata";
  return QUESTIONNAIRE_PATH[key];
}

/** Terza riga della schermata di preparazione. */
export function whereText(ans: Answer[], city: string): string {
  const c = city.trim();
  if (ans[10] === 0) return "Specialisti disponibili online";
  if (c) return (ans[10] === 1 ? "Specialisti disponibili in studio a " : "Specialisti disponibili online e a ") + c;
  return "Specialisti disponibili online e in studio";
}

/**
 * Specialista proposto da Nest.
 * - preservazione o prima valutazione: ginecologa (Marchetti);
 * - fattore maschile: andrologo (Ferri), salvo chi vuole solo visite online;
 * - PMA: specialista in procreazione assistita (Bellini);
 * - sostegno emotivo: psicologa (Conti).
 */
export function proposeSpecialist(ans: Answer[]): SpecialistId {
  const key = pathKey(ans);
  if (key === "pma") return "mb";
  if (key === "psy") return "sc";
  if (key === "gyn" && hasMaleFactor(ans) && ans[10] !== 0) return "lf";
  return "em";
}

/** Modalità preferita dal questionario, se compatibile con lo specialista. */
export function preferredMode(ans: Answer[], s: Specialist): VisitMode {
  const wantsStudio = ans[10] === 1;
  const wantsOnline = ans[10] === 0;
  if (wantsStudio && s.studio !== "none") return "studio";
  if (wantsOnline && s.online) return "online";
  return s.online ? "online" : "studio";
}

/**
 * Motivi mostrati nel passo 1 dell’abbinamento.
 * Per lo specialista proposto si parte dalle risposte (testi della landing);
 * con le risposte del design (più di un anno, nessun esame) restano i testi originali.
 */
export function reasonsFor(s: Specialist, ans: Answer[], proposed: boolean): string[] {
  if (!proposed) return s.reasons;
  if (s.matchReasons && ans[0] === 2 && ans[1] === 0) return s.matchReasons;
  const out: string[] = [];
  if (typeof ans[0] === "number") out.push(MINI_REASONS_1[ans[0]]);
  if (typeof ans[1] === "number") out.push(MINI_REASONS_2[ans[1]]);
  if (s.id === "lf" && hasMaleFactor(ans)) out.unshift(s.reasons[0]);
  for (const r of s.reasons) {
    if (out.length >= 3) break;
    if (!out.includes(r)) out.push(r);
  }
  return out.slice(0, 3);
}

export function specialistFor(ans: Answer[]): Specialist {
  return getSpecialist(proposeSpecialist(ans));
}

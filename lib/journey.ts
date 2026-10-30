// Passaggi del percorso che toccano più parti dello store.
import { emptyAnswers, type Answer } from "@/data/questions";
import { proposeSpecialist } from "@/data/matching";
import type { SpecialistId } from "@/data/specialists";
import { store, type Match, type Questionnaire } from "@/lib/store";

/** Salva il questionario completato, calcola l’abbinamento e svuota la bozza. */
export async function completeQuestionnaire(accountId: string, answers: Answer[], city: string): Promise<Match> {
  const q: Questionnaire = { answers, city, status: "completato", completedAt: new Date().toISOString() };
  await store.saveQuestionnaire(accountId, q);
  const proposedId = proposeSpecialist(answers);
  const prev = await store.getMatch(accountId);
  // Se la coppia aveva già scelto qualcun altro, la scelta resta sua.
  const keepChoice = prev && prev.chosenBy === "coppia";
  const match: Match = {
    proposedId,
    chosenId: keepChoice ? prev.chosenId : proposedId,
    chosenBy: keepChoice ? "coppia" : "nest",
    updatedAt: new Date().toISOString(),
  };
  await store.saveMatch(accountId, match);
  await store.clearDraft();
  return match;
}

/** Abbinamento dell’account; se manca lo ricava dal questionario (o propone la ginecologa). */
export async function ensureMatch(accountId: string): Promise<{ match: Match; answers: Answer[]; city: string }> {
  const q = await store.getQuestionnaire(accountId);
  const answers = q?.answers ?? emptyAnswers();
  const city = q?.city ?? "";
  let match = await store.getMatch(accountId);
  if (!match) {
    const proposedId = proposeSpecialist(answers);
    match = { proposedId, chosenId: proposedId, chosenBy: "nest", updatedAt: new Date().toISOString() };
    await store.saveMatch(accountId, match);
  }
  return { match, answers, city };
}

/** Sceglie uno specialista: "nest" se coincide con quello proposto, altrimenti "coppia". */
export async function chooseSpecialist(accountId: string, current: Match, id: SpecialistId): Promise<Match> {
  const match: Match = { ...current, chosenId: id, chosenBy: id === current.proposedId ? "nest" : "coppia", updatedAt: new Date().toISOString() };
  await store.saveMatch(accountId, match);
  return match;
}

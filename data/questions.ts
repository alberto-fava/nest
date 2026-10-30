// Domande del questionario (12) e della mini-quiz in landing (le prime 3).
// Testi e ordine presi da design/Questionario.dc.html e design/Main.dc.html.

export type Answer = number | number[] | null;

export interface Question {
  sec: number;
  short: string;
  t: string;
  help?: string;
  multi?: boolean;
  city?: boolean;
  o: string[];
}

export const SECTIONS = ["Da dove partite", "Lui", "Lei", "Insieme", "Il vostro profilo"] as const;

export const QUESTIONS: Question[] = [
  { sec: 0, short: "Da quanto cercate", t: "Da quanto tempo state cercando una gravidanza?", o: ["Meno di 6 mesi", "Da 6 a 12 mesi", "Da più di un anno", "Vogliamo rimandare"] },
  { sec: 0, short: "Esami già fatti", t: "Avete già fatto esami di fertilità?", o: ["Non ancora", "Sì, uno di noi", "Sì, entrambi", "Già provato la PMA"] },
  { sec: 0, short: "Di cosa avete bisogno", t: "Di cosa avete più bisogno adesso?", o: ["Capire da dove partire", "Un parere sugli esami", "Valutare la PMA", "Sostegno emotivo"] },
  { sec: 1, short: "Età di lui", t: "Quanti anni ha lui?", help: "L’età di lui influisce sulla fertilità della coppia.", o: ["Meno di 35", "Da 35 a 39", "Da 40 a 44", "45 o più"] },
  { sec: 1, short: "Spermiogramma", t: "Lui ha già fatto uno spermiogramma?", help: "È l’esame di base per valutare la fertilità maschile.", o: ["Non ancora", "Sì, nella norma", "Sì, con valori alterati", "Non ricordiamo l’esito"] },
  { sec: 1, short: "Salute di lui", t: "Ci sono condizioni note per lui?", help: "Potete sceglierne più di una.", multi: true, o: ["Varicocele", "Interventi o infezioni urogenitali", "Terapie in corso", "Nessuna, o non lo sappiamo"] },
  { sec: 2, short: "Età di lei", t: "Quanti anni ha lei?", help: "L’età di lei è il dato che orienta di più i primi esami.", o: ["Meno di 30", "Da 30 a 34", "Da 35 a 37", "Da 38 a 40", "Più di 40"] },
  { sec: 2, short: "Ciclo mestruale", t: "Il ciclo mestruale di lei è regolare?", help: "Ci aiuta a capire quale specialista coinvolgere per primo.", o: ["Sì, regolare", "Irregolare o assente", "Regolare ma molto doloroso", "Non saprei"] },
  { sec: 2, short: "Diagnosi di lei", t: "Ci sono diagnosi già note per lei?", help: "Potete sceglierne più di una.", multi: true, o: ["Endometriosi", "Ovaio policistico (PCOS)", "Problemi alle tube", "Nessuna, o non lo sappiamo"] },
  { sec: 3, short: "Gravidanze precedenti", t: "Ci sono state gravidanze in passato?", help: "Se preferite, ne parlerete direttamente con lo specialista.", o: ["No", "Sì, e abbiamo un figlio", "Sì, ma si sono interrotte", "Preferiamo non rispondere"] },
  { sec: 3, short: "Prima visita", t: "Come preferite fare la prima visita?", help: "Potete cambiare idea anche dopo la prenotazione.", city: true, o: ["Online", "In studio", "Vanno bene entrambe"] },
  { sec: 3, short: "Supporto psicologico", t: "Vi farebbe piacere anche un supporto psicologico?", help: "È un servizio a parte, che potete attivare quando volete.", o: ["Sì, fin da subito", "Forse più avanti", "No, grazie"] },
];

/** Gruppi della barra laterale: indice 12 = "Crea il profilo". */
export const SIDE_GROUPS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12]];

export const MINI_COUNT = 3;
export const TOTAL_QUESTIONS = QUESTIONS.length;

export function emptyAnswers(): Answer[] {
  return QUESTIONS.map((q) => (q.multi ? [] : null));
}

export function isAnswered(a: Answer | undefined): boolean {
  return Array.isArray(a) ? a.length > 0 : typeof a === "number";
}

/** Riassunto di una risposta per la barra laterale. */
export function summarize(i: number, a: Answer | undefined, city = ""): string {
  const q = QUESTIONS[i];
  if (Array.isArray(a)) return a.map((k) => q.o[k]).join(", ");
  if (typeof a === "number") {
    let s = q.o[a];
    if (i === 10 && city.trim()) s = `${s}, ${city.trim()}`;
    return s;
  }
  return "";
}

/** Primo orientamento della mini-quiz in landing. */
export const MINI_REASONS_1 = [
  "Cercate da meno di sei mesi: un primo confronto vi aiuta a partire con le idee chiare.",
  "Cercate da 6 a 12 mesi: è il momento giusto per una prima valutazione.",
  "Cercate da più di un anno: serve un quadro completo, per entrambi.",
  "Volete rimandare: si può valutare come preservare la fertilità.",
];
export const MINI_REASONS_2 = [
  "Nessun esame ancora: partirete da quelli di base, senza doppioni.",
  "Esami fatti da uno di voi: si completa il quadro con l’altro.",
  "Esami già fatti da entrambi: si parte dai vostri referti.",
  "Avete già provato la PMA: serve chi conosce bene i trattamenti.",
];

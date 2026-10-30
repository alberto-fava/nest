import type { Answer } from "@/data/questions";
import type { SpecialistId, VisitMode } from "@/data/specialists";

export interface Account {
  id: string;
  /** Nome della coppia, per esempio "Giulia e Marco". */
  name: string;
  email: string;
  createdAt: string;
  consent: {
    /** Consenso al trattamento dei dati sanitari. */
    healthData: true;
    at: string;
  };
}

/** Bozza anonima: mini-quiz della landing e questionario in corso. */
export interface QuestionnaireDraft {
  answers: Answer[];
  city: string;
  /** Domanda corrente (0-11), 12 = creazione del profilo. */
  step: number;
  /** La mini-quiz della landing è arrivata al "Primo orientamento". */
  miniDone: boolean;
  status: "bozza";
  updatedAt: string;
}

export interface Questionnaire {
  answers: Answer[];
  city: string;
  status: "completato";
  completedAt: string;
}

export interface Match {
  proposedId: SpecialistId;
  chosenId: SpecialistId;
  chosenBy: "nest" | "coppia";
  updatedAt: string;
}

export type BookingStatus = "confermata" | "annullata";

export interface Booking {
  id: string;
  accountId: string;
  specialistId: SpecialistId;
  /** Data ISO, YYYY-MM-DD. */
  date: string;
  /** "10:30" */
  time: string;
  mode: VisitMode;
  status: BookingStatus;
  createdAt: string;
}

export interface Message {
  id: string;
  accountId: string;
  from: "coppia" | "specialista";
  specialistId: SpecialistId;
  text: string;
  at: string;
  read: boolean;
}

export interface UploadedDoc {
  id: string;
  name: string;
  at: string;
}

export type RegisterResult =
  | { ok: true; account: Account }
  | { ok: false; error: "email-exists" | "invalid" };

export type LoginResult = { ok: true; account: Account } | { ok: false; error: "invalid-credentials" };

export type BookingResult = { ok: true; booking: Booking } | { ok: false; error: "slot-taken" };

export interface NewBooking {
  specialistId: SpecialistId;
  date: string;
  time: string;
  mode: VisitMode;
}

/**
 * Interfaccia unica dei dati di Nest. Oggi è implementata su localStorage
 * (lib/store/local.ts); un backend potrà sostituirla senza toccare i componenti.
 * Tutti i metodi sono asincroni proprio per questo.
 */
export interface NestStore {
  // Bozza del questionario (anonima, una per browser)
  getDraft(): Promise<QuestionnaireDraft>;
  saveDraft(draft: QuestionnaireDraft): Promise<void>;
  clearDraft(): Promise<void>;

  // Account e sessione
  register(input: { name: string; email: string; password: string; consent: boolean }): Promise<RegisterResult>;
  login(email: string, password: string): Promise<LoginResult>;
  logout(): Promise<void>;
  /** Account della sessione attiva, o null. */
  currentAccount(): Promise<Account | null>;

  // Questionario completato
  getQuestionnaire(accountId: string): Promise<Questionnaire | null>;
  saveQuestionnaire(accountId: string, q: Questionnaire): Promise<void>;

  // Abbinamento
  getMatch(accountId: string): Promise<Match | null>;
  saveMatch(accountId: string, match: Match): Promise<void>;

  // Prenotazioni
  listBookings(accountId: string): Promise<Booking[]>;
  /** Visita confermata più recente dell’account. */
  activeBooking(accountId: string): Promise<Booking | null>;
  /** Orari già prenotati per uno specialista (da qualunque account). */
  takenSlots(specialistId: SpecialistId): Promise<{ date: string; time: string; accountId: string }[]>;
  /** Prenota e annulla l’eventuale visita confermata precedente dello stesso account. */
  book(accountId: string, input: NewBooking): Promise<BookingResult>;
  cancelBooking(accountId: string, bookingId: string): Promise<void>;

  // Messaggi
  listMessages(accountId: string): Promise<Message[]>;
  addMessage(accountId: string, msg: Omit<Message, "id" | "accountId" | "at"> & { at?: string }): Promise<Message>;
  markMessagesRead(accountId: string): Promise<void>;

  // Documenti caricati (solo nome e data: i file non vengono salvati)
  listDocs(accountId: string): Promise<UploadedDoc[]>;
  addDoc(accountId: string, name: string): Promise<UploadedDoc>;

  /** Cancella tutte le chiavi "nest:". */
  resetDemo(): Promise<void>;

  /** Notifica ogni modifica (anche da altre schede). */
  subscribe(listener: () => void): () => void;
}

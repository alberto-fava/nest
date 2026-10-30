// Implementazione di NestStore su localStorage. Solo lato client.
import { emptyAnswers } from "@/data/questions";
import type { SpecialistId } from "@/data/specialists";
import type {
  Account,
  Booking,
  BookingResult,
  LoginResult,
  Match,
  Message,
  NestStore,
  NewBooking,
  Questionnaire,
  QuestionnaireDraft,
  RegisterResult,
  UploadedDoc,
} from "./types";

const PREFIX = "nest:";

const KEY = {
  accounts: `${PREFIX}accounts`,
  session: `${PREFIX}session`,
  draft: `${PREFIX}draft`,
  bookings: `${PREFIX}bookings`,
  questionnaire: (id: string) => `${PREFIX}questionnaire:${id}`,
  match: (id: string) => `${PREFIX}match:${id}`,
  messages: (id: string) => `${PREFIX}messages:${id}`,
  docs: (id: string) => `${PREFIX}docs:${id}`,
};

interface StoredAccount extends Account {
  passwordHash: string;
  salt: string;
}

interface StoredSession {
  accountId: string;
  startedAt: string;
}

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function read<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (!hasStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  emit();
}

function remove(key: string) {
  if (!hasStorage()) return;
  window.localStorage.removeItem(key);
  emit();
}

function now() {
  return new Date().toISOString();
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toHex(buf: ArrayBuffer | Uint8Array) {
  return Array.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** SHA-256 (Web Crypto) di sale + password. */
async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

function newSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

function publicAccount(a: StoredAccount): Account {
  return { id: a.id, name: a.name, email: a.email, createdAt: a.createdAt, consent: a.consent };
}

function accounts(): Record<string, StoredAccount> {
  return read<Record<string, StoredAccount>>(KEY.accounts, {});
}

function startSession(accountId: string) {
  write(KEY.session, { accountId, startedAt: now() } satisfies StoredSession);
}

function newDraft(): QuestionnaireDraft {
  return { answers: emptyAnswers(), city: "", step: 0, miniDone: false, status: "bozza", updatedAt: now() };
}

function allBookings(): Booking[] {
  return read<Booking[]>(KEY.bookings, []);
}

export const localStore: NestStore = {
  async getDraft() {
    const d = read<QuestionnaireDraft | null>(KEY.draft, null);
    if (!d) return newDraft();
    const base = emptyAnswers();
    return { ...newDraft(), ...d, answers: base.map((v, i) => d.answers?.[i] ?? v) };
  },

  async saveDraft(draft) {
    write(KEY.draft, { ...draft, status: "bozza", updatedAt: now() });
  },

  async clearDraft() {
    remove(KEY.draft);
  },

  async register({ name, email, password, consent }): Promise<RegisterResult> {
    const mail = normalizeEmail(email);
    if (!mail || password.length < 8 || !consent) return { ok: false, error: "invalid" };
    const all = accounts();
    if (Object.values(all).some((a) => a.email === mail)) return { ok: false, error: "email-exists" };
    const salt = newSalt();
    const at = now();
    const account: StoredAccount = {
      id: uid(),
      name: name.trim(),
      email: mail,
      createdAt: at,
      consent: { healthData: true, at },
      salt,
      passwordHash: await hashPassword(password, salt),
    };
    write(KEY.accounts, { ...all, [account.id]: account });
    startSession(account.id);
    return { ok: true, account: publicAccount(account) };
  },

  async login(email, password): Promise<LoginResult> {
    const mail = normalizeEmail(email);
    const account = Object.values(accounts()).find((a) => a.email === mail);
    if (!account) return { ok: false, error: "invalid-credentials" };
    const hash = await hashPassword(password, account.salt);
    if (hash !== account.passwordHash) return { ok: false, error: "invalid-credentials" };
    startSession(account.id);
    return { ok: true, account: publicAccount(account) };
  },

  async logout() {
    remove(KEY.session);
  },

  async currentAccount() {
    const s = read<StoredSession | null>(KEY.session, null);
    if (!s) return null;
    const a = accounts()[s.accountId];
    return a ? publicAccount(a) : null;
  },

  async getQuestionnaire(accountId) {
    return read<Questionnaire | null>(KEY.questionnaire(accountId), null);
  },

  async saveQuestionnaire(accountId, q) {
    write(KEY.questionnaire(accountId), q);
  },

  async getMatch(accountId) {
    return read<Match | null>(KEY.match(accountId), null);
  },

  async saveMatch(accountId, match) {
    write(KEY.match(accountId), { ...match, updatedAt: now() });
  },

  async listBookings(accountId) {
    return allBookings().filter((b) => b.accountId === accountId);
  },

  async activeBooking(accountId) {
    const mine = allBookings().filter((b) => b.accountId === accountId && b.status === "confermata");
    return mine.length ? mine[mine.length - 1] : null;
  },

  async takenSlots(specialistId: SpecialistId) {
    return allBookings()
      .filter((b) => b.specialistId === specialistId && b.status === "confermata")
      .map((b) => ({ date: b.date, time: b.time, accountId: b.accountId }));
  },

  async book(accountId, input: NewBooking): Promise<BookingResult> {
    const list = allBookings();
    const taken = list.some(
      (b) =>
        b.status === "confermata" &&
        b.accountId !== accountId &&
        b.specialistId === input.specialistId &&
        b.date === input.date &&
        b.time === input.time,
    );
    if (taken) return { ok: false, error: "slot-taken" };
    const next = list.map((b) =>
      b.accountId === accountId && b.status === "confermata" ? { ...b, status: "annullata" as const } : b,
    );
    const booking: Booking = { id: uid(), accountId, ...input, status: "confermata", createdAt: now() };
    write(KEY.bookings, [...next, booking]);
    return { ok: true, booking };
  },

  async cancelBooking(accountId, bookingId) {
    write(
      KEY.bookings,
      allBookings().map((b) => (b.id === bookingId && b.accountId === accountId ? { ...b, status: "annullata" } : b)),
    );
  },

  async listMessages(accountId) {
    return read<Message[]>(KEY.messages(accountId), []);
  },

  async addMessage(accountId, msg) {
    const m: Message = { id: uid(), accountId, at: msg.at ?? now(), from: msg.from, specialistId: msg.specialistId, text: msg.text, read: msg.read };
    write(KEY.messages(accountId), [...read<Message[]>(KEY.messages(accountId), []), m]);
    return m;
  },

  async markMessagesRead(accountId) {
    const list = read<Message[]>(KEY.messages(accountId), []);
    if (list.every((m) => m.read)) return;
    write(KEY.messages(accountId), list.map((m) => ({ ...m, read: true })));
  },

  async listDocs(accountId) {
    return read<UploadedDoc[]>(KEY.docs(accountId), []);
  },

  async addDoc(accountId, name) {
    const doc: UploadedDoc = { id: uid(), name, at: now() };
    write(KEY.docs(accountId), [...read<UploadedDoc[]>(KEY.docs(accountId), []), doc]);
    return doc;
  },

  async resetDemo() {
    if (!hasStorage()) return;
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    for (const k of keys) window.localStorage.removeItem(k);
    emit();
  },

  subscribe(listener) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key.startsWith(PREFIX)) listener();
    };
    if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
    };
  },
};

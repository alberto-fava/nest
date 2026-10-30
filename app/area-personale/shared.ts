import type { Specialist } from "@/data/specialists";
import type { Account, Booking, Message, UploadedDoc } from "@/lib/store";

export type View = "percorso" | "esami" | "visite" | "documenti" | "messaggi";
export const VIEWS: View[] = ["percorso", "esami", "visite", "documenti", "messaggi"];

export interface AreaData {
  account: Account;
  /** Nome da mostrare (nome della coppia o email). */
  name: string;
  names: { lei: string; lui: string };
  specialist: Specialist;
  /** Visita confermata più recente. */
  booking: Booking | null;
  /** La visita confermata, se è ancora da fare. */
  upcoming: Booking | null;
  /** Visite confermate già passate. */
  past: Booking[];
  messages: Message[];
  docs: UploadedDoc[];
  now: Date;
  go: (v: View) => void;
}

/** "Dalla Dott.ssa Marchetti" / "Dal Dott. Ferri" */
export function fromSpecialist(s: Specialist) {
  return `${s.g === "f" ? "Dalla" : "Dal"} ${s.title}`;
}

export function modeLabel(mode: "online" | "studio") {
  return mode === "online" ? "online" : "in studio";
}

"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { SpecialistPhoto } from "@/components/SpecialistPhoto";
import { IconArrowRight } from "@/components/icons";
import { messageTime } from "@/lib/format";
import { store } from "@/lib/store";
import type { AreaData } from "./shared";
import s from "./area.module.css";

export function Messaggi({ d }: { d: AreaData }) {
  const [draft, setDraft] = useState("");
  const lastRef = useRef<HTMLDivElement>(null);
  const sentRef = useRef(false);
  const canSend = draft.trim().length > 0;
  const count = d.messages.length;

  // Dopo un invio, porta in vista l’ultimo messaggio.
  useEffect(() => {
    if (!sentRef.current) return;
    sentRef.current = false;
    lastRef.current?.scrollIntoView({ block: "nearest" });
  }, [count]);

  async function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    sentRef.current = true;
    await store.addMessage(d.account.id, { from: "coppia", specialistId: d.specialist.id, text, read: true });
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send();
    }
  }

  const nowDate = new Date(Math.max(d.now.getTime(), ...d.messages.map((m) => new Date(m.at).getTime())));

  return (
    <div className={s.section}>
      <h1 className={s.h1}>Messaggi</h1>
      <div className={s.chat}>
        <div className={s.chatHead}>
          <SpecialistPhoto specialist={d.specialist} size={44} />
          <span className={s.whoText}>
            <span className={s.chatHeadName}>{d.specialist.name}</span>
            <span className={s.whoRole}>{d.specialist.roleShort}, di solito risponde in giornata</span>
          </span>
        </div>
        <div className={s.chatList} role="log" aria-label="Conversazione" aria-live="polite">
          {d.messages.map((m, i) => {
            const mine = m.from === "coppia";
            return (
              <div key={m.id} ref={i === count - 1 ? lastRef : undefined} className={`${s.bubbleRow} ${mine ? s.bubbleRowMine : ""}`}>
                <div className={`anim-in ${s.bubble} ${mine ? s.bubbleMine : ""}`}>
                  <span className="sr-only">{mine ? "Voi: " : `${d.specialist.title}: `}</span>
                  <span className={s.bubbleText}>{m.text}</span>
                  <span className={s.bubbleTime}>{messageTime(m.at, nowDate)}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className={s.composer}>
          <input
            className={s.composerInput}
            type="text"
            aria-label="Scrivete un messaggio"
            placeholder="Scrivete un messaggio"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
          />
          <button type="button" className={`btn ${s.sendBtn}`} aria-label="Invia il messaggio" disabled={!canSend} onClick={() => void send()}>
            <IconArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}

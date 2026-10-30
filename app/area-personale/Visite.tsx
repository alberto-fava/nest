"use client";

import Link from "next/link";
import { SpecialistPhoto } from "@/components/SpecialistPhoto";
import { IconCalendarPlus } from "@/components/icons";
import { getSpecialist } from "@/data/specialists";
import { dayMonth, longDateTime } from "@/lib/format";
import { store } from "@/lib/store";
import { modeLabel, type AreaData } from "./shared";
import s from "./area.module.css";

export function Visite({ d }: { d: AreaData }) {
  const { upcoming, specialist } = d;
  const visitSpecialist = upcoming ? getSpecialist(upcoming.specialistId) : specialist;

  async function cancel() {
    if (!upcoming) return;
    const when = longDateTime(upcoming.date, upcoming.time);
    const ok = window.confirm(`Annullare la visita di ${when.charAt(0).toLowerCase()}${when.slice(1)}?`);
    if (ok) await store.cancelBooking(d.account.id, upcoming.id);
  }

  return (
    <div className={s.section}>
      <div className={s.headRow}>
        <div className={s.headText}>
          <h1 className={s.h1}>Visite</h1>
          <p className={s.lead}>Le visite prenotate e quelle già fatte.</p>
        </div>
        <Link className={`btn ${s.darkBtn}`} href="/abbinamento">
          <IconCalendarPlus size={17} />
          <span>Prenota una visita</span>
        </Link>
      </div>

      <div className={s.visitCard}>
        <SpecialistPhoto specialist={visitSpecialist} size={72} ring="0 0 0 4px #FFFFFF" />
        {upcoming ? (
          <>
            <span className={s.visitInfo}>
              <span className={s.visitInfoKicker}>Prossima visita</span>
              <span className={s.visitInfoTitle}>Prima visita con {visitSpecialist.short}</span>
              <span className={s.visitInfoWhen}>
                {longDateTime(upcoming.date, upcoming.time)}, {modeLabel(upcoming.mode)}
              </span>
            </span>
            <span className={s.visitActions}>
              {upcoming.mode === "online" ? (
                <button type="button" className={`btn ${s.darkBtn}`}>
                  Collegati alla visita
                </button>
              ) : null}
              <Link className={`btn ${s.ghostBtn}`} href="/abbinamento">
                Sposta
              </Link>
              <button type="button" className="btn-text" onClick={cancel}>
                Annulla
              </button>
            </span>
          </>
        ) : (
          <>
            <span className={s.visitInfo}>
              <span className={s.visitInfoKicker}>Prossima visita</span>
              <span className={s.visitInfoTitle}>Nessuna visita in programma</span>
              <span className={s.visitInfoWhen}>Prenotate {d.past.length ? "la prossima" : "la prima"} visita con {specialist.short}.</span>
            </span>
            <span className={s.visitActions}>
              <Link className={`btn ${s.darkBtn}`} href="/abbinamento">
                Prenota una visita
              </Link>
            </span>
          </>
        )}
      </div>

      <span className={s.subhead}>Visite passate</span>
      {d.past.length ? (
        d.past.map((b) => (
          <div key={b.id} className={`${s.card} ${s.pastCard}`}>
            <span className={s.pastTop}>
              <span className={s.pastTitle}>Prima visita</span>
              <span className={s.pastWhen}>
                {dayMonth(b.date)}, {modeLabel(b.mode)}
              </span>
            </span>
          </div>
        ))
      ) : (
        <p className={s.muted}>Nessuna visita passata.</p>
      )}
    </div>
  );
}

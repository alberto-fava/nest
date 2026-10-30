"use client";

import Link from "next/link";
import { SpecialistPhoto } from "@/components/SpecialistPhoto";
import { IconCheck, IconUpload } from "@/components/icons";
import { EXAMS, EXAM_SHORT_DATE, EXAM_STATUS_LABEL, fillNames, type Exam } from "@/data/area";
import { getSpecialist, withSpecialist } from "@/data/specialists";
import { dayMonth, longDateTime, messageTime, shortDateTime } from "@/lib/format";
import { modeLabel, type AreaData } from "./shared";
import s from "./area.module.css";

type PhaseState = "done" | "current" | "todo";

/** Esami della card nel percorso, come nel design: AMH, spermiogramma, ecografia. */
const PERCORSO_EXAMS: Exam[] = [EXAMS[0], EXAMS[2], { ...EXAMS[3], meta: "{lei}, in studio" }];

function PhaseMark({ state }: { state: PhaseState }) {
  if (state === "done")
    return (
      <span className={s.stepDone}>
        <IconCheck size={13} />
      </span>
    );
  if (state === "current")
    return (
      <span className={s.stepCur}>
        <span className={s.stepCurDot} />
      </span>
    );
  return <span className={s.stepTodo} />;
}

export function Percorso({ d }: { d: AreaData }) {
  const { specialist, booking, upcoming, now } = d;
  const visitPast = !!booking && !upcoming;
  const greeting = now.getHours() < 18 ? "Buongiorno" : "Buonasera";
  const esito = withSpecialist(specialist);

  const phases: { name: string; sub: string; state: PhaseState }[] = [
    { name: "Questionario", sub: "Completato", state: "done" },
    { name: "Prima visita", sub: booking ? dayMonth(booking.date) : "Da prenotare", state: booking ? (upcoming ? "current" : "done") : "todo" },
    { name: "Esami di base", sub: visitPast ? "In corso" : "Dopo la prima visita", state: visitPast ? "current" : "todo" },
    { name: "Esito", sub: esito.charAt(0).toUpperCase() + esito.slice(1), state: "todo" },
    { name: "Piano", sub: "Da definire", state: "todo" },
  ];
  // Fase su cui puntare l’attenzione: quella in corso, o la prima da fare.
  const focus = Math.max(0, phases.findIndex((p) => p.state !== "done"));
  const n = focus + 1;
  const mobSub = visitPast
    ? `Fase ${n} di 5, poi l’esito ${esito}`
    : booking
      ? `Fase ${n} di 5, il ${dayMonth(booking.date)}`
      : `Fase ${n} di 5, da prenotare`;

  let subtitle = "Prenotate la prima visita per iniziare il percorso.";
  if (upcoming) {
    const when = longDateTime(upcoming.date, upcoming.time).split(", ")[0].toLowerCase();
    subtitle = `La prima visita è ${when} alle ${upcoming.time}. Intanto potete caricare i referti che avete già.`;
  } else if (visitPast) {
    subtitle = "Siete nella fase degli esami di base. Mancano due referti.";
  }

  const visitSpecialist = upcoming ? getSpecialist(upcoming.specialistId) : specialist;
  const lastMsg = [...d.messages].reverse().find((m) => m.from === "specialista");
  const msgSpecialist = lastMsg ? getSpecialist(lastMsg.specialistId) : specialist;
  const circ = 163.4;

  return (
    <div className={s.section}>
      <div className={s.headRow}>
        <div className={s.headText}>
          <h1 className={s.h1}>
            {greeting}, {d.name}
          </h1>
          <p className={s.lead}>{subtitle}</p>
        </div>
        <button type="button" className={`btn ${s.ghostBtn}`} onClick={() => d.go("documenti")}>
          <IconUpload size={17} />
          <span>Carica un referto</span>
        </button>
      </div>

      <ol className={s.steps} aria-label="Fasi del percorso">
        {phases.map((p) => (
          <li key={p.name} className={s.step} aria-current={p.state === "current" ? "step" : undefined}>
            <PhaseMark state={p.state} />
            <span className={s.stepText}>
              <span className={s.stepName}>{p.name}</span>
              <span className={s.stepSub}>{p.sub}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className={s.stepsMob}>
        <span className={s.ring}>
          <svg width="56" height="56" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(29,26,56,0.1)" strokeWidth="6" />
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${((n / 5) * circ).toFixed(1)} ${circ}`}
              transform="rotate(-90 32 32)"
            />
          </svg>
          <span className={s.ringLabel} aria-hidden="true">
            {n}/5
          </span>
        </span>
        <span className={s.examText}>
          <span className={s.mobTitle}>{phases[focus].name}</span>
          <span className={s.examMeta}>{mobSub}</span>
        </span>
      </div>

      <div className={s.grid}>
        <div className={`${s.card} ${s.examsCard}`}>
          <div className={s.cardHead}>
            <span className={s.cardTitle}>Esami</span>
            <button type="button" className={s.linkBtn} onClick={() => d.go("esami")}>
              Vedi tutti
            </button>
          </div>
          {PERCORSO_EXAMS.map((e) => (
            <div key={e.name} className={s.examRow}>
              <span className={s.examText}>
                <span className={s.examName}>{e.name}</span>
                <span className={s.examMeta}>{fillNames(e.meta, d.names)}</span>
              </span>
              <span className={`${s.pill} ${s[`pill_${e.s}`]}`}>{EXAM_SHORT_DATE[e.name] ?? EXAM_STATUS_LABEL[e.s]}</span>
            </div>
          ))}
        </div>

        <div className={s.rightCol}>
          <div className={s.visitDark}>
            <span className={s.visitKicker}>Prossima visita</span>
            {upcoming ? (
              <>
                <span className={s.visitRow}>
                  <SpecialistPhoto specialist={visitSpecialist} size={48} ring="0 0 0 3px rgba(255,255,255,0.25)" />
                  <span className={s.visitText}>
                    <span className={s.visitWhen}>{shortDateTime(upcoming.date, upcoming.time)}</span>
                    <span className={s.visitWho}>
                      Prima visita con {visitSpecialist.short}, {modeLabel(upcoming.mode)}
                    </span>
                  </span>
                </span>
                <button type="button" className={`btn ${s.whiteBtn}`} onClick={() => d.go("visite")}>
                  Dettagli della visita
                </button>
              </>
            ) : (
              <>
                <span className={s.visitRow}>
                  <SpecialistPhoto specialist={specialist} size={48} ring="0 0 0 3px rgba(255,255,255,0.25)" />
                  <span className={s.visitText}>
                    <span className={s.visitWhen}>Nessuna visita in programma</span>
                    <span className={s.visitWho}>
                      {visitPast ? `Prenotate la prossima visita con ${specialist.short}.` : `Prenotate la prima visita con ${specialist.short}.`}
                    </span>
                  </span>
                </span>
                <Link className={`btn ${s.whiteBtn}`} href="/abbinamento">
                  Prenota una visita
                </Link>
              </>
            )}
          </div>

          {lastMsg ? (
            <div className={`${s.card} ${s.msgCard}`}>
              <span className={s.msgFrom}>
                <SpecialistPhoto specialist={msgSpecialist} size={32} />
                <span className={s.msgFromText}>
                  <span className={s.msgFromName}>{msgSpecialist.title}</span>
                  <span className={s.msgFromTime}>{messageTime(lastMsg.at, now)}</span>
                </span>
              </span>
              <p className={s.quote}>“{lastMsg.text}”</p>
              <button type="button" className={s.replyBtn} onClick={() => d.go("messaggi")}>
                Rispondi
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

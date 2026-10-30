"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconCheck } from "@/components/icons";
import { LANDING_PATH, pathKey } from "@/data/matching";
import { MINI_COUNT, MINI_REASONS_1, MINI_REASONS_2, QUESTIONS, type Answer } from "@/data/questions";
import { store, type QuestionnaireDraft } from "@/lib/store";
import { FOCUS_QUIZ_EVENT, prefersReducedMotion } from "./focusQuiz";
import s from "./landing.module.css";

type Mini = [number | null, number | null, number | null];

function miniFrom(answers: Answer[]): Mini {
  return [0, 1, 2].map((i) => (typeof answers[i] === "number" ? (answers[i] as number) : null)) as Mini;
}

/** Mini-quiz di 3 domande: le risposte restano come bozza del questionario. */
export function MiniQuiz() {
  const router = useRouter();
  const [ans, setAns] = useState<Mini>([null, null, null]);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [flash, setFlash] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const draftRef = useRef<QuestionnaireDraft | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  // Il questionario è già pronto al clic su "Continua": niente attesa al cambio pagina.
  useEffect(() => {
    router.prefetch("/questionario");
  }, [router]);

  // Bozza salvata: si riparte da dove si era rimasti.
  useEffect(() => {
    let alive = true;
    store.getDraft().then((d) => {
      if (!alive) return;
      draftRef.current = d;
      const m = miniFrom(d.answers);
      const firstOpen = m.findIndex((v) => v === null);
      setAns(m);
      if (firstOpen === -1 && d.miniDone) {
        setFinished(true);
        setStep(2);
      } else {
        setStep(firstOpen === -1 ? 2 : firstOpen);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  // "Inizia il questionario" porta la card al centro dello schermo.
  useEffect(() => {
    const onFocus = () => {
      const el = cardRef.current;
      if (!el) return;
      el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
      const first = el.querySelector<HTMLElement>("button, a[href]");
      first?.focus({ preventScroll: true });
      setFlash((f) => f + 1);
    };
    window.addEventListener(FOCUS_QUIZ_EVENT, onFocus);
    return () => window.removeEventListener(FOCUS_QUIZ_EVENT, onFocus);
  }, []);

  useEffect(() => {
    if (moved.current) titleRef.current?.focus({ preventScroll: true });
  }, [step, finished]);

  function persist(nextAns: Mini, patch: Partial<QuestionnaireDraft> = {}) {
    const base = draftRef.current;
    if (!base) return Promise.resolve();
    const answers = base.answers.slice();
    nextAns.forEach((v, i) => (answers[i] = v));
    const next: QuestionnaireDraft = { ...base, ...patch, answers };
    draftRef.current = next;
    return store.saveDraft(next);
  }

  const picked = ans[step];
  const has = typeof picked === "number";
  const q = QUESTIONS[step];

  function pick(i: number) {
    const next = ans.slice() as Mini;
    next[step] = i;
    setAns(next);
    persist(next);
  }

  function next() {
    if (!has) return;
    moved.current = true;
    if (step < MINI_COUNT - 1) {
      setStep(step + 1);
    } else {
      setFinished(true);
      persist(ans, { miniDone: true });
    }
  }

  function back() {
    if (step > 0) {
      moved.current = true;
      setStep(step - 1);
    }
  }

  function reset() {
    const empty: Mini = [null, null, null];
    moved.current = true;
    setAns(empty);
    setStep(0);
    setFinished(false);
    persist(empty, { miniDone: false, step: 0 });
  }

  async function continueQuestionnaire(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (leaving) return;
    setLeaving(true);
    await persist(ans, { miniDone: true, step: MINI_COUNT });
    router.push("/questionario");
  }

  const key = pathKey(ans);
  const reasons: string[] = [];
  if (typeof ans[0] === "number") reasons.push(MINI_REASONS_1[ans[0]]);
  if (typeof ans[1] === "number") reasons.push(MINI_REASONS_2[ans[1]]);

  return (
    <div id="quiz" ref={cardRef} className={`anim-rise ${s.quizCard}`} aria-busy={leaving}>
      {flash > 0 ? <span key={flash} aria-hidden="true" className={`${s.flash} ${flash % 2 ? s.flashA : s.flashB}`} /> : null}

      {!finished ? (
        <div className={s.quizBody}>
          <div className={s.quizTop}>
            <span className={s.quizCount} aria-live="polite">
              Domanda {step + 1} di 3
            </span>
            <span aria-hidden="true" className={s.segs}>
              {[0, 1, 2].map((i) => {
                const w = i < step ? "100%" : i === step ? (has ? "66%" : "20%") : "0%";
                return (
                  <span key={i} className={s.seg}>
                    <span className={s.segFill} style={{ width: w }} />
                  </span>
                );
              })}
            </span>
          </div>
          <h2 ref={titleRef} tabIndex={-1} className={s.quizTitle} id="mini-q">
            {q.t}
          </h2>
          <div className={s.opts} role="group" aria-labelledby="mini-q">
            {q.o.map((label, i) => (
              <button key={label} type="button" className="opt" aria-pressed={picked === i} onClick={() => pick(i)}>
                <span aria-hidden="true" className="opt-mark">
                  <span className="opt-mark-dot" />
                </span>
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className={s.quizNav}>
            <button type="button" className={`btn-text ${step > 0 ? "" : s.hidden}`} onClick={back} tabIndex={step > 0 ? 0 : -1} aria-hidden={step === 0}>
              Indietro
            </button>
            <button type="button" className={`btn btn-primary ${s.quizNext}`} onClick={next} disabled={!has}>
              {step < 2 ? "Avanti" : "Vedi il primo orientamento"}
            </button>
          </div>
        </div>
      ) : (
        <div className={`anim-in ${s.quizBody} ${leaving ? s.leaving : ""}`}>
          <span className={s.doneHead}>
            <span className="tick">
              <IconCheck />
            </span>
            <span>Primo orientamento</span>
          </span>
          <h2 ref={titleRef} tabIndex={-1} className={s.doneTitle}>
            Un buon punto di partenza: {LANDING_PATH[key]}.
          </h2>
          <ul className={s.reasons}>
            {reasons.map((r) => (
              <li key={r} className={s.reason}>
                <span className={s.reasonIcon}>
                  <IconCheck size={18} sw={2} />
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <div className={s.progressBox}>
            <span className={s.progressText}>
              <span style={{ fontWeight: 500 }}>3 domande su 12</span>
              <span className={`${s.muted} ${s.progressHint}`}>Circa tre minuti per finire</span>
            </span>
            <span aria-hidden="true" className={s.bar}>
              <span className={s.barFill} style={{ width: "25%" }} />
            </span>
          </div>
          <div className={s.doneActions}>
            <a className="btn btn-primary" href="/questionario" onClick={continueQuestionnaire}>
              Continua il questionario
            </a>
            <button type="button" className={`btn btn-ghost ${s.restart}`} onClick={reset} style={{ background: "rgba(255,255,255,0.55)" }}>
              Ricomincia
            </button>
          </div>
          <p className={s.small}>Alla fine vi proponiamo lo specialista più adatto, con il perché, e potrete sceglierne anche un altro.</p>
        </div>
      )}
    </div>
  );
}

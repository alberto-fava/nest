"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconCheck, IconChevronLeft, IconClose, IconLock, IconReset } from "@/components/icons";
import { SITE_LINKS, SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { UserMenu } from "@/components/UserMenu";
import { pathText, whereText } from "@/data/matching";
import { emptyAnswers, isAnswered, QUESTIONS, SECTIONS, SIDE_GROUPS, summarize, type Answer } from "@/data/questions";
import { completeQuestionnaire } from "@/lib/journey";
import { store, useSession, type QuestionnaireDraft } from "@/lib/store";
import s from "./questionario.module.css";

const PROFILE_STEP = 12;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function firstOpenOf(answers: Answer[]): number {
  const i = answers.findIndex((a) => !isAnswered(a));
  return i === -1 ? PROFILE_STEP : i;
}

function listText(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}

export function QuestionarioClient() {
  const router = useRouter();
  const session = useSession();
  const loggedIn = session.status === "auth";

  const [loaded, setLoaded] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>(emptyAnswers);
  const [city, setCity] = useState("");
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [done, setDone] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<"email-exists" | "invalid" | null>(null);
  const [doneName, setDoneName] = useState("");

  const draftRef = useRef<QuestionnaireDraft | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const userMoved = useRef(false);

  // Carica la bozza dopo il montaggio.
  useEffect(() => {
    let alive = true;
    store.getDraft().then((d) => {
      if (!alive) return;
      draftRef.current = d;
      const open = firstOpenOf(d.answers);
      setAnswers(d.answers);
      setCity(d.city ?? "");
      setStep(d.step >= 0 && d.step <= open ? d.step : open);
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Salvataggio automatico a ogni risposta, città o passo.
  useEffect(() => {
    if (!loaded || done) return;
    const base = draftRef.current;
    const next: QuestionnaireDraft = {
      answers,
      city,
      step,
      miniDone: base?.miniDone ?? false,
      status: "bozza",
      updatedAt: new Date().toISOString(),
    };
    draftRef.current = next;
    void store.saveDraft(next);
  }, [answers, city, step, loaded, done]);

  // Porta il focus sul titolo quando la domanda cambia.
  useEffect(() => {
    if (!userMoved.current) return;
    userMoved.current = false;
    const el = headingRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const top = el.getBoundingClientRect().top;
    if (top < 80 || top > window.innerHeight - 80) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }
  }, [step, done]);

  // Dopo la preparazione, apre l’abbinamento.
  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => router.push("/abbinamento"), 4200);
    return () => window.clearTimeout(t);
  }, [done, router]);

  function goTo(i: number, d: number) {
    userMoved.current = true;
    setDir(d);
    setStep(i);
  }

  const firstOpen = firstOpenOf(answers);
  const answeredCount = answers.filter(isAnswered).length;
  const qi = Math.min(step, 11);
  const q = QUESTIONS[qi];
  const cur = answers[qi];
  const has = isAnswered(cur);

  function pick(i: number) {
    setAnswers((prev) => {
      const next = prev.slice();
      if (q.multi) {
        const none = q.o.length - 1;
        let list = Array.isArray(prev[qi]) ? (prev[qi] as number[]).slice() : [];
        if (i === none) {
          list = list.includes(i) ? [] : [i];
        } else {
          list = list.filter((x) => x !== none);
          const at = list.indexOf(i);
          if (at >= 0) list.splice(at, 1);
          else list.push(i);
        }
        next[qi] = list;
      } else {
        next[qi] = i;
      }
      return next;
    });
  }

  function reset() {
    void store.clearDraft();
    draftRef.current = null;
    setAnswers(emptyAnswers());
    setCity("");
    setName("");
    setEmail("");
    setPw("");
    setConsent(false);
    setError(null);
    goTo(0, -1);
  }

  const emailOk = EMAIL_RE.test(email);
  const pwOk = pw.length >= 8;
  const valid = emailOk && pwOk && consent;
  const missing: string[] = [];
  if (!emailOk) missing.push("un’email valida");
  if (!pwOk) missing.push("una password di almeno 8 caratteri");
  if (!consent) missing.push("il consenso al trattamento dei dati");
  const showHint = !valid && (email.length > 0 || pw.length > 0 || consent);

  async function finish(accountId: string, who: string) {
    await completeQuestionnaire(accountId, answers, city);
    setDoneName(who);
    userMoved.current = true;
    setDone(true);
  }

  async function submit() {
    if (submitting) return;
    setError(null);
    if (loggedIn) {
      setSubmitting(true);
      await finish(session.account.id, session.account.name.trim());
      setSubmitting(false);
      return;
    }
    if (!valid) return;
    setSubmitting(true);
    const res = await store.register({ name, email, password: pw, consent });
    if (!res.ok) {
      setError(res.error);
      setSubmitting(false);
      return;
    }
    await finish(res.account.id, name.trim());
    setSubmitting(false);
  }

  const canReset = answeredCount > 0 || city.trim().length > 0;
  const fin = { path: pathText(answers), where: whereText(answers, city) };

  return (
    <div className="page">
      <div aria-hidden="true" className={`page-bg ${s.bg}`} />
      <div className={s.orb} aria-hidden="true">
        <div className={`spin-slow ${s.orbRing}`}>
          <svg width="620" height="620" viewBox="0 0 620 620">
            <circle cx="310" cy="310" r="306" fill="none" stroke="rgba(29,26,56,0.2)" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="0.1 15" />
          </svg>
        </div>
        <div className={`drift ${s.orbEgg}`} />
      </div>

      <SiteHeader
        right={
          <>
            {canReset ? (
              <button type="button" className={`btn ${s.resetBtn}`} onClick={reset} aria-label="Ricomincia questionario">
                <IconReset />
                <span className={s.resetText}>
                  Ricomincia<span className={s.long}> questionario</span>
                </span>
              </button>
            ) : null}
            <Link className={`btn ${s.exitLink}`} href="/">
              <IconClose />
              <span>
                Esci<span className={s.long}> dal questionario</span>
              </span>
            </Link>
            {loggedIn ? <UserMenu account={session.account} /> : null}
          </>
        }
      />

      <main className={s.main}>
        <div className={s.grid}>
          <aside className={s.aside}>
            <div className={s.intro}>
              <h1 className={s.title}>Il vostro questionario</h1>
              <p className={s.lead}>Dodici domande in tutto, circa quattro minuti. Potete tornare indietro quando volete.</p>
            </div>
            <nav className={s.list} aria-label="Domande del questionario">
              {SIDE_GROUPS.map((g, gi) => (
                <div key={gi} className={s.group}>
                  <span className={s.groupName}>{SECTIONS[gi]}</span>
                  {g.map((i) => {
                    const isQ = i < PROFILE_STEP;
                    const isAns = isQ ? isAnswered(answers[i]) : done;
                    const isCur = loaded && !done && i === step;
                    const isDone = isAns && !isCur;
                    const canJump = loaded && !done && !isCur && i <= firstOpen;
                    let value = "";
                    if (isDone) value = isQ ? summarize(i, answers[i], city) : doneName || email;
                    const cls = [s.step, isCur ? s.stepCur : "", !isDone && !isCur ? s.stepTodo : ""].join(" ");
                    return (
                      <button
                        key={i}
                        type="button"
                        className={cls}
                        disabled={!(canJump || isCur)}
                        aria-current={isCur ? "step" : undefined}
                        onClick={() => canJump && goTo(i, i < step ? -1 : 1)}
                      >
                        <span aria-hidden="true" className={s.stepMark}>
                          {isDone ? (
                            <span className="tick">
                              <IconCheck />
                            </span>
                          ) : isCur ? (
                            <span className={s.markCur}>
                              <span className={s.markCurDot} />
                            </span>
                          ) : (
                            <span className={s.markTodo} />
                          )}
                        </span>
                        <span className={s.stepText}>
                          <span className={s.stepLabel}>{isQ ? QUESTIONS[i].short : "Crea il profilo"}</span>
                          {value ? <span className={s.stepValue}>{value}</span> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>

          <div className={s.cardCol}>
            <div className={s.card}>
              {!loaded ? (
                <div className={s.placeholder} aria-busy="true" />
              ) : done ? (
                <div className={`anim-in ${s.done}`}>
                  <div aria-hidden="true" className={s.loader}>
                    <div className={`spin-fast ${s.loaderRing}`}>
                      <svg width="132" height="132" viewBox="0 0 132 132">
                        <circle cx="66" cy="66" r="63" fill="none" stroke="rgba(29,26,56,0.28)" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="0.1 9" />
                      </svg>
                    </div>
                    <div className={s.loaderEgg} />
                  </div>
                  <div className={s.doneHead}>
                    {doneName ? <span className={s.thanks}>Grazie, {doneName}.</span> : null}
                    <h2 ref={headingRef} tabIndex={-1} className={s.qTitle}>
                      Stiamo preparando il vostro abbinamento
                    </h2>
                    <p className={s.doneText}>Confrontiamo le vostre risposte con i profili degli specialisti verificati.</p>
                  </div>
                  <ul className={s.ticks}>
                    {["Risposte salvate nel vostro profilo", `Primo orientamento: ${fin.path}`, fin.where].map((t, i) => (
                      <li key={i} className={`${s.tickItem} ${s.tickIn}`} style={{ animationDelay: `${[0.3, 1.1, 1.9][i]}s` }}>
                        <span aria-hidden="true" className="tick">
                          <IconCheck />
                        </span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  <Link className={`btn btn-primary ${s.doneCta} ${s.tickIn}`} style={{ animationDelay: "2.6s" }} href="/abbinamento">
                    Vedi il vostro abbinamento
                  </Link>
                </div>
              ) : step === PROFILE_STEP ? (
                <div className={`anim-in ${s.stack24}`}>
                  <div className={s.progressHead}>
                    <div className={s.progressRow}>
                      <span className={s.counter}>Ultimo passo</span>
                      <span className={s.secChip}>Il vostro profilo</span>
                    </div>
                    <span aria-hidden="true" className={s.bar}>
                      <span className={s.barFill} style={{ width: "92%" }} />
                    </span>
                  </div>

                  {loggedIn ? (
                    <>
                      <div className={s.qHead}>
                        <h2 ref={headingRef} tabIndex={-1} className={s.qTitle}>
                          Siete già registrati come {session.account.name.trim() || session.account.email}.
                        </h2>
                        <p className={`${s.qHelp} ${s.qHelpWide}`}>Aggiorniamo le risposte nel vostro profilo e vi mostriamo l’abbinamento.</p>
                      </div>
                      <div className={s.navRow}>
                        <button type="button" className="btn-text" onClick={() => goTo(11, -1)}>
                          <IconChevronLeft />
                          Indietro
                        </button>
                        <button type="button" className={`btn btn-primary ${s.next}`} onClick={submit} disabled={submitting}>
                          Vedi il vostro abbinamento
                        </button>
                      </div>
                    </>
                  ) : (
                    <form
                      className={s.stack24}
                      noValidate
                      onSubmit={(e) => {
                        e.preventDefault();
                        void submit();
                      }}
                    >
                      <div className={s.qHead}>
                        <h2 ref={headingRef} tabIndex={-1} className={s.qTitle}>
                          Create il vostro profilo per vedere l’abbinamento.
                        </h2>
                        <p className={`${s.qHelp} ${s.qHelpWide}`}>
                          Salviamo le risposte e vi mostriamo lo specialista proposto, con il motivo della scelta e le alternative.
                        </p>
                      </div>
                      <div className={s.formGrid}>
                        <div className={`field ${s.full}`}>
                          <label htmlFor="qz-name" className="field-label">
                            Come vi chiamate?
                          </label>
                          <input id="qz-name" className="input" type="text" autoComplete="name" placeholder="Per esempio, Giulia e Marco" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="field">
                          <label htmlFor="qz-email" className="field-label">
                            Email
                          </label>
                          <input
                            id="qz-email"
                            className="input"
                            type="email"
                            autoComplete="email"
                            placeholder="nome@esempio.it"
                            value={email}
                            aria-invalid={error === "email-exists" ? true : undefined}
                            aria-describedby={error ? "qz-error" : undefined}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (error) setError(null);
                            }}
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="qz-pw" className="field-label">
                            Password
                          </label>
                          <input id="qz-pw" className="input" type="password" autoComplete="new-password" placeholder="Almeno 8 caratteri" value={pw} onChange={(e) => setPw(e.target.value)} />
                        </div>
                      </div>
                      <label className={s.consent}>
                        <input type="checkbox" checked={consent} onChange={() => setConsent((c) => !c)} />
                        <span>Acconsento al trattamento dei miei dati sanitari per ricevere l’abbinamento, come descritto nell’informativa privacy.</span>
                      </label>
                      {error ? (
                        <p id="qz-error" role="alert" className={s.error}>
                          {error === "email-exists" ? (
                            <>
                              Esiste già un profilo con questa email. <Link href="/accedi">Accedete</Link> per continuare.
                            </>
                          ) : (
                            "Non siamo riusciti a creare il profilo: controllate i dati e riprovate."
                          )}
                        </p>
                      ) : null}
                      <div className={s.navRow}>
                        <button type="button" className="btn-text" onClick={() => goTo(11, -1)}>
                          <IconChevronLeft />
                          Indietro
                        </button>
                        <button type="submit" className={`btn btn-primary ${s.next}`} disabled={!valid || submitting}>
                          Vedi il vostro abbinamento
                        </button>
                      </div>
                      {showHint ? <p className={s.hint}>Per continuare servono {listText(missing)}.</p> : null}
                    </form>
                  )}
                </div>
              ) : (
                <div className={s.stack26}>
                  <div className={s.progressHead}>
                    <div className={s.progressRow} aria-live="polite">
                      <span className={s.counter}>Domanda {qi + 1} di 12</span>
                      <span className={s.secChip}>{SECTIONS[q.sec]}</span>
                    </div>
                    <span aria-hidden="true" className={s.bar}>
                      <span className={s.barFill} style={{ width: `${Math.round((answeredCount / 13) * 100)}%` }} />
                    </span>
                  </div>

                  <div key={step} className={`${s.stack24} ${dir < 0 ? s.swapBack : s.swapFwd}`}>
                    <div className={s.qHead}>
                      <h2 ref={headingRef} tabIndex={-1} className={s.qTitle}>
                        {q.t}
                      </h2>
                      {q.help ? <p className={s.qHelp}>{q.help}</p> : null}
                    </div>
                    <div role="group" aria-label={q.t} className={s.opts}>
                      {q.o.map((label, i) => {
                        const on = q.multi ? Array.isArray(cur) && cur.includes(i) : cur === i;
                        return (
                          <button key={i} type="button" className="opt" aria-pressed={on} onClick={() => pick(i)}>
                            <span aria-hidden="true" className={`opt-mark ${q.multi ? "opt-mark-box" : ""}`}>
                              {q.multi ? on ? <IconCheck /> : null : <span className="opt-mark-dot" />}
                            </span>
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {q.city ? (
                      <div className="field">
                        <label htmlFor="qz-city" className="field-label">
                          Città o CAP, se preferite uno studio vicino
                        </label>
                        <input id="qz-city" className="input" type="text" autoComplete="address-level2" placeholder="Per esempio, Milano" value={city} onChange={(e) => setCity(e.target.value)} />
                      </div>
                    ) : null}
                  </div>

                  <div className={s.navRow}>
                    <button type="button" className={`btn-text ${step > 0 ? "" : s.hidden}`} onClick={() => step > 0 && goTo(step - 1, -1)} tabIndex={step > 0 ? undefined : -1} aria-hidden={step > 0 ? undefined : true}>
                      <IconChevronLeft />
                      Indietro
                    </button>
                    <button type="button" className={`btn btn-primary ${s.next}`} disabled={!has} onClick={() => has && goTo(step + 1, 1)}>
                      Avanti
                    </button>
                  </div>
                </div>
              )}
            </div>
            <p className={s.note}>
              <IconLock />
              Le risposte restano riservate: le vedrà solo lo specialista che sceglierete.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter links={SITE_LINKS} />
    </div>
  );
}

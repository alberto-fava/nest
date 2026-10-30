"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SpecialistPhoto } from "@/components/SpecialistPhoto";
import { UserMenu } from "@/components/UserMenu";
import {
  IconArrowDown,
  IconCalendar,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconMail,
  IconSwap,
  IconUpload,
} from "@/components/icons";
import { preferredMode, reasonsFor } from "@/data/matching";
import type { Answer } from "@/data/questions";
import {
  DAYS,
  SPECIALISTS,
  WEEKS,
  canOnline,
  canStudio,
  getSpecialist,
  slotsFor,
  type SpecialistId,
  type VisitMode,
} from "@/data/specialists";
import { chooseSpecialist, ensureMatch } from "@/lib/journey";
import { store, type Account, type Booking, type Match } from "@/lib/store";
import s from "./abbinamento.module.css";

const FOOTER_LINKS = [
  { href: "/area-personale", label: "Area personale" },
  { href: "/#domande", label: "Domande frequenti" },
  { href: "/#top", label: "Privacy" },
  { href: "/#top", label: "Termini" },
];

interface Slot {
  di: number;
  t: string;
}

interface Selection extends Slot {
  id: SpecialistId;
  mode: VisitMode;
}

function cap(t: string) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function label(c: Slot) {
  return `${DAYS[c.di].ln} ${DAYS[c.di].d} novembre alle ${c.t}`;
}

function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function scrollToEl(el: HTMLElement | null) {
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

export function AbbinamentoClient() {
  return (
    <div className="page">
      <div aria-hidden="true" className={`page-bg ${s.bg}`} />
      <AuthGate
        fallback={
          <>
            <SiteHeader section={<Link className="flink" href="/area-personale">Area personale</Link>} sectionClassName={s.long} />
            <main className={s.main} />
          </>
        }
      >
        {(account) => <Abbinamento account={account} />}
      </AuthGate>
    </div>
  );
}

function Abbinamento({ account }: { account: Account }) {
  const [match, setMatch] = useState<Match | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [taken, setTaken] = useState<{ date: string; time: string }[]>([]);
  const [booked, setBooked] = useState<Booking | null>(null);
  const [stage, setStage] = useState(1);
  const [week, setWeek] = useState(0);
  const [modes, setModes] = useState<Partial<Record<SpecialistId, VisitMode>>>({});
  const [sel, setSel] = useState<Selection | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [flip, setFlip] = useState(0);
  const [flash, setFlash] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // Conferma a schermo della prenotazione: caricamento, poi spunta verde.
  const [confirm, setConfirm] = useState<{ phase: "loading" | "done"; text: string } | null>(null);
  const closeConfirm = useCallback(() => setConfirm(null), []);

  const oneRef = useRef<HTMLElement>(null);
  const twoRef = useRef<HTMLElement>(null);

  const chosenId = match?.chosenId;

  const loadTaken = useCallback(
    async (id: SpecialistId) => {
      const list = await store.takenSlots(id);
      setTaken(list.filter((x) => x.accountId !== account.id).map(({ date, time }) => ({ date, time })));
    },
    [account.id],
  );

  // Primo caricamento: abbinamento, risposte ed eventuale visita già prenotata.
  useEffect(() => {
    let alive = true;
    (async () => {
      const { match: m, answers: a } = await ensureMatch(account.id);
      const active = await store.activeBooking(account.id);
      if (!alive) return;
      setMatch(m);
      setAnswers(a);
      if (active && active.specialistId === m.chosenId) {
        const di = DAYS.findIndex((d) => d.date === active.date);
        if (di >= 0) {
          setBooked(active);
          setModes({ [m.chosenId]: active.mode });
          setWeek(di >= 5 ? 1 : 0);
          setSel({ id: m.chosenId, mode: active.mode, di, t: active.time });
          setStage(2);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [account.id]);

  // Orari prenotati da altri account per lo specialista scelto.
  useEffect(() => {
    if (!chosenId) return;
    let alive = true;
    store.takenSlots(chosenId).then((list) => {
      if (alive) setTaken(list.filter((x) => x.accountId !== account.id).map(({ date, time }) => ({ date, time })));
    });
    return () => {
      alive = false;
    };
  }, [chosenId, account.id]);

  if (!match) return <main className={s.main} />;

  const f = getSpecialist(match.chosenId);
  const isRec = match.chosenId === match.proposedId;
  const art = f.g === "f" ? "La specialista" : "Lo specialista";
  const onlineOk = canOnline(f);
  const studioOk = canStudio(f);
  let mode: VisitMode = modes[f.id] ?? preferredMode(answers, f);
  if (mode === "online" && !onlineOk) mode = "studio";
  if (mode === "studio" && !studioOk) mode = "online";

  const isTaken = (di: number, t: string) => taken.some((x) => x.date === DAYS[di].date && x.time === t);
  const firstIn = (from: number, to: number): Slot | null => {
    for (let di = from; di < to; di++) {
      const t = slotsFor(f, di, mode).find((x) => !isTaken(di, x));
      if (t) return { di, t };
    }
    return null;
  };

  let cur: Slot | null = null;
  if (sel && sel.id === f.id && sel.mode === mode && slotsFor(f, sel.di, mode).includes(sel.t) && !isTaken(sel.di, sel.t)) {
    cur = { di: sel.di, t: sel.t };
  }
  if (!cur) cur = firstIn(week * 5, week * 5 + 5) || firstIn(0, 10);
  const first = firstIn(0, 10);
  const modeLower = mode === "online" ? "online" : "in studio";

  const isBooked = !!booked;
  const curStage = isBooked ? 3 : stage;
  const bookedDi = booked ? DAYS.findIndex((d) => d.date === booked.date) : -1;
  const bookedText = booked && bookedDi >= 0 ? cap(label({ di: bookedDi, t: booked.time })) : "";
  const bookedModeLower = booked?.mode === "studio" ? "in studio" : "online";

  const kicker = isRec ? `${art} che vi proponiamo` : `${art} che avete scelto`;
  const badge = isRec ? "Proposta da Nest" : "Scelta da voi";
  const whyLabel = isRec ? `Perché è ${f.g === "f" ? "adatta" : "adatto"} a voi` : "Su cosa può aiutarvi";
  const reasons = reasonsFor(f, answers, isRec);
  const swap = flip % 2 ? s.swapA : s.swapB;
  const flashClass = flash === 0 ? "" : flash % 2 === 1 ? s.flashA : s.flashB;

  function pickMode(id: VisitMode, ok: boolean) {
    if (!ok) return;
    setModes((m) => ({ ...m, [f.id]: id }));
    setStage((st) => Math.max(st, 2));
    setError("");
  }

  function pickSlot(di: number, t: string) {
    if (isTaken(di, t)) return;
    setSel({ id: f.id, mode, di, t });
    setStage((st) => Math.max(st, 2));
    setError("");
  }

  function toCal() {
    setStage((st) => Math.max(st, 2));
    setFlash((n) => n + 1);
    scrollToEl(twoRef.current);
  }

  async function book() {
    if (!cur || busy) return;
    setBusy(true);
    const text = `${cap(label(cur))}, ${modeLower}`;
    setConfirm({ phase: "loading", text });
    // Breve attesa voluta: la coppia vede che la prenotazione sta avvenendo.
    const pause = new Promise((r) => setTimeout(r, prefersReducedMotion() ? 300 : 1100));
    const [res] = await Promise.all([store.book(account.id, { specialistId: f.id, date: DAYS[cur.di].date, time: cur.t, mode }), pause]);
    setBusy(false);
    if (!res.ok) {
      setConfirm(null);
      setError("Questo orario è appena stato prenotato. Sceglietene un altro.");
      await loadTaken(f.id);
      return;
    }
    setError("");
    setSel({ id: f.id, mode, di: cur.di, t: cur.t });
    setBooked(res.booking);
    setConfirm({ phase: "done", text });
    scrollToEl(twoRef.current);
  }

  function changeTime() {
    setBooked(null);
    setStage(2);
  }

  async function pickSpecialist(id: SpecialistId) {
    if (!match) return;
    const next = await chooseSpecialist(account.id, match, id);
    const sp = getSpecialist(id);
    setMatch(next);
    setSheetOpen(false);
    setBooked(null);
    setStage(1);
    setWeek(0);
    setSel(null);
    setError("");
    setModes((m) => ({ ...m, [id]: preferredMode(answers, sp) }));
    setFlip((n) => n + 1);
    try {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }

  const trackItems = [
    { n: 1, label: "Chi è", done: curStage > 1, current: curStage === 1 },
    { n: 2, label: isBooked ? "Visita prenotata" : "Prenota la visita", done: isBooked, current: curStage === 2 },
  ];

  function goStep(n: number) {
    if (n === 2) {
      setStage((st) => Math.max(st, 2));
      scrollToEl(twoRef.current);
    } else {
      scrollToEl(oneRef.current);
    }
  }
  const mini = isBooked ? "Visita prenotata" : curStage === 1 ? "Passo 1 di 2: chi è" : "Passo 2 di 2: prenotazione";

  const days = [];
  for (let di = week * 5; di < week * 5 + 5; di++) days.push(di);

  const modeBtns: { id: VisitMode; text: string; ok: boolean }[] = [
    { id: "online", text: "Online", ok: onlineOk },
    { id: "studio", text: "In studio", ok: studioOk },
  ];

  return (
    <>
      <SiteHeader
        section={
          <Link className="flink" href="/area-personale">
            Area personale
          </Link>
        }
        sectionClassName={s.long}
        right={<UserMenu account={account} />}
      />

      <main className={s.main}>
        <div className={s.wrap}>
          <aside className={s.side} aria-label="Lo specialista">
            <div className={s.full}>
              <div className={s.intro}>
                <span className={s.kicker}>{kicker}</span>
                <h1 id="ab-name" className={s.name}>
                  {f.name}
                </h1>
                <span className={s.role}>{f.role}</span>
              </div>

              <ol aria-label="I passaggi" className={s.track}>
                {trackItems.map((tk) => (
                  <li key={tk.n}>
                    <button
                      type="button"
                      className={`${s.trackBtn} ${tk.current ? s.trackBtnOn : ""}`}
                      aria-current={tk.current ? "step" : undefined}
                      onClick={() => goStep(tk.n)}
                    >
                      <span aria-hidden="true" className={`${s.trackMark} ${tk.done ? s.trackDone : tk.current ? s.trackCur : ""}`}>
                        {tk.done ? <IconCheck /> : <span>{tk.n}</span>}
                      </span>
                      <span>{tk.label}</span>
                    </button>
                  </li>
                ))}
              </ol>

              <div className={s.photoWrap}>
                <div aria-hidden="true" className={s.photoHalo} />
                <div aria-hidden="true" className={`spin-slow ${s.photoRing}`}>
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(29,26,56,0.22)" strokeWidth="0.45" strokeLinecap="round" strokeDasharray="0.01 2.4" />
                  </svg>
                </div>
                <div key={`photo-${flip}`} className={`${s.photoBox} ${swap}`}>
                  <SpecialistPhoto specialist={f} priority />
                  <span aria-hidden="true" className={s.photoShade} />
                  <span className={s.badge}>
                    <span aria-hidden="true" className={s.badgeDot} />
                    <span>{badge}</span>
                  </span>
                </div>
              </div>

              <button type="button" className={`btn ${s.changeBtn}`} onClick={() => setSheetOpen(true)}>
                <IconSwap />
                <span>Cambia specialista</span>
              </button>
            </div>

            <div className={s.mini}>
              <SpecialistPhoto specialist={f} size={48} />
              <span className={s.miniText}>
                <span className={s.miniName}>{f.name}</span>
                <span className={s.miniLine}>{mini}</span>
              </span>
              <button type="button" className={s.miniBtn} onClick={() => setSheetOpen(true)}>
                Cambia
              </button>
            </div>
          </aside>

          <div className={s.col}>
            <section ref={oneRef} className={s.card} aria-labelledby="ab-s1">
              <div key={`one-${flip}`} className={`${s.stack26} ${swap}`}>
                <div className={s.stack10}>
                  <span className="chip">Passo 1 di 2</span>
                  <h2 id="ab-s1" className={s.h2}>
                    Conoscete {f.short}
                  </h2>
                </div>
                <div className={s.stack10}>
                  <h3 className={s.h3}>Formazione ed esperienza</h3>
                  <p className={s.bio}>{f.bio}</p>
                  <div className={s.tags}>
                    {f.tags.map((t) => (
                      <span key={t} className={s.tag}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={s.stack10}>
                  <h3 className={s.h3}>{whyLabel}</h3>
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
                </div>
                <div className={s.cardFoot}>
                  <span className={s.pair}>
                    <span className={s.pairLabel}>Prima disponibilità</span>
                    <span className={s.pairValue}>{first ? cap(label(first)) : "Nessuna nelle prossime due settimane"}</span>
                  </span>
                  <button type="button" className="btn btn-primary" onClick={toCal}>
                    <span>Vedi le disponibilità</span>
                    <IconArrowDown />
                  </button>
                </div>
              </div>
            </section>

            <section ref={twoRef} className={s.card} aria-labelledby="ab-s2">
              <span key={`flash-${flash}`} aria-hidden="true" className={`${s.flashRing} ${flashClass}`} />

              {!isBooked ? (
                <div className={s.stack24}>
                  <div className={s.stack10}>
                    <span className="chip">Passo 2 di 2</span>
                    <h2 id="ab-s2" className={s.h2}>
                      Prenota la prima visita
                    </h2>
                  </div>

                  <div className={s.toolbar}>
                    <div role="group" aria-label="Modalità della visita" className={s.modes}>
                      {modeBtns.map((md) => (
                        <button
                          key={md.id}
                          type="button"
                          className={`${s.modeBtn} ${mode === md.id ? s.modeOn : ""}`}
                          aria-pressed={mode === md.id}
                          disabled={!md.ok}
                          onClick={() => pickMode(md.id, md.ok)}
                        >
                          {md.text}
                        </button>
                      ))}
                    </div>
                    <div className={s.week}>
                      <button type="button" className={s.weekBtn} aria-label="Settimana precedente" disabled={week === 0} onClick={() => setWeek(0)}>
                        <IconChevronLeft />
                      </button>
                      <span className={s.weekLabel} aria-live="polite">
                        {WEEKS[week]}
                      </span>
                      <button type="button" className={s.weekBtn} aria-label="Settimana successiva" disabled={week === 1} onClick={() => setWeek(1)}>
                        <IconChevronRight />
                      </button>
                    </div>
                  </div>

                  <div role="group" aria-label="Giorni e orari disponibili" className={s.cal}>
                    {days.map((di) => {
                      const list = slotsFor(f, di, mode);
                      const dayOn = !!cur && cur.di === di;
                      return (
                        <div key={di} className={s.day}>
                          <div className={`${s.dayHead} ${dayOn ? s.dayOn : ""}`}>
                            <span className={s.dn}>{DAYS[di].dn}</span>
                            <span className={s.dd}>{DAYS[di].d}</span>
                          </div>
                          {list.map((t) => {
                            const on = dayOn && cur?.t === t;
                            const tk = isTaken(di, t);
                            const aria = `${cap(DAYS[di].ln)} ${DAYS[di].d} novembre, ${t}${tk ? ", già prenotato" : ""}`;
                            return (
                              <button
                                key={t}
                                type="button"
                                className={`${s.slot} ${on ? s.slotOn : ""} ${tk ? s.slotTaken : ""}`}
                                aria-pressed={on}
                                aria-label={aria}
                                disabled={tk}
                                onClick={() => pickSlot(di, t)}
                              >
                                {t}
                              </button>
                            );
                          })}
                          {list.length === 0 ? (
                            <span className={s.empty}>
                              <span aria-hidden="true" className={s.emptyDash} />
                              <span className="sr-only">Nessun orario</span>
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  {error ? (
                    <p role="alert" className={s.alert}>
                      {error}
                    </p>
                  ) : null}

                  <div className={s.sum}>
                    <span className={s.pair}>
                      <span className={s.pairLabel}>{cur ? "La vostra scelta" : "Nessun orario disponibile"}</span>
                      <span className={s.sumText}>{cur ? `${cap(label(cur))}, ${modeLower}` : "Provate l’altra modalità o la settimana dopo"}</span>
                    </span>
                    <button type="button" className="btn btn-primary" disabled={!cur || busy} onClick={book}>
                      Prenota la prima visita
                    </button>
                  </div>
                  <span className={s.note}>Tariffa della prima visita: [TARIFFA]. Potete spostare o annullare la visita dalla vostra area personale.</span>
                </div>
              ) : (
                <div className={`anim-in ${s.stack22}`}>
                  <span className={s.bookedKicker}>
                    <span aria-hidden="true" className="tick" style={{ width: 24, height: 24 }}>
                      <IconCheck />
                    </span>
                    <span>Prima visita prenotata</span>
                  </span>
                  <div className={s.stack8}>
                    <h2 id="ab-s2" className={s.bookedTitle}>
                      {bookedText}
                    </h2>
                    <span className={s.bookedSub}>
                      Con {f.name}, {bookedModeLower}.
                    </span>
                  </div>
                  <ul className={s.list}>
                    <li className={s.li}>
                      <span className={s.liIcon}>
                        <IconMail />
                      </span>
                      <span>Riceverete una conferma via email, con il link per collegarvi.</span>
                    </li>
                    <li className={s.li}>
                      <span className={s.liIcon}>
                        <IconUpload size={20} sw={1.6} />
                      </span>
                      <span>Prima della visita potete caricare referti ed esami già fatti nella vostra area.</span>
                    </li>
                    <li className={s.li}>
                      <span className={s.liIcon}>
                        <IconCalendar size={20} sw={1.6} />
                      </span>
                      <span>Potete spostare o annullare la visita dalla vostra area personale.</span>
                    </li>
                  </ul>
                  <div className={s.actions}>
                    <Link className="btn btn-primary" href="/area-personale">
                      Vai all’area personale
                    </Link>
                    <button type="button" className="btn btn-ghost" onClick={changeTime}>
                      Cambia orario
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <SiteFooter links={FOOTER_LINKS} />

      {confirm ? <BookingConfirm phase={confirm.phase} text={confirm.text} onClose={closeConfirm} /> : null}

      {sheetOpen ? (
        <AlternativesSheet
          currentId={f.id}
          proposedId={match.proposedId}
          onClose={() => setSheetOpen(false)}
          onPick={pickSpecialist}
        />
      ) : null}
    </>
  );
}

/** Overlay sfocato: "Stiamo prenotando…" e poi "Appuntamento prenotato" con spunta verde. */
function BookingConfirm({ phase, text, onClose }: { phase: "loading" | "done"; text: string; onClose: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Dopo la conferma si chiude da solo; un tocco o Esc lo chiudono prima.
  useEffect(() => {
    if (phase !== "done") return;
    const out = window.setTimeout(() => setLeaving(true), 1900);
    return () => window.clearTimeout(out);
  }, [phase]);

  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(onClose, prefersReducedMotion() ? 0 : 350);
    return () => window.clearTimeout(t);
  }, [leaving, onClose]);

  useEffect(() => {
    if (phase !== "done") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLeaving(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase]);

  const done = phase === "done";
  return (
    <div className={`${s.confirmWrap} ${leaving ? s.confirmLeaving : ""}`} onClick={() => done && setLeaving(true)}>
      <div className={s.confirmCard} role="status" aria-live="assertive">
        <div className={s.confirmIcon} aria-hidden="true">
          {done ? (
            <span className={s.confirmCheck}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.2 4.2L19 7" />
              </svg>
            </span>
          ) : (
            <>
              <svg className={s.confirmSpinner} width="88" height="88" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r="41" fill="none" stroke="rgba(29,26,56,0.1)" strokeWidth="3" />
                <circle cx="44" cy="44" r="41" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray="60 200" />
              </svg>
              <span className={s.confirmOrb} />
            </>
          )}
        </div>
        <p className={s.confirmTitle}>{done ? "Appuntamento prenotato" : "Stiamo prenotando la visita…"}</p>
        <p className={s.confirmText}>{text}</p>
      </div>
    </div>
  );
}

function AlternativesSheet({
  currentId,
  proposedId,
  onClose,
  onPick,
}: {
  currentId: SpecialistId;
  proposedId: SpecialistId;
  onClose: () => void;
  onPick: (id: SpecialistId) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab" && sheetRef.current) {
        const items = sheetRef.current.querySelectorAll<HTMLElement>("button, a[href]");
        if (!items.length) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (opener && document.contains(opener)) opener.focus();
    };
  }, []);

  const items = SPECIALISTS.filter((x) => x.id !== currentId);

  return (
    <div
      className={`anim-fade ${s.sheetWrap}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={sheetRef} className={s.sheet} role="dialog" aria-modal="true" aria-labelledby="ab-alt-title">
        <div className={s.sheetHead}>
          <div className={s.stack4}>
            <h2 id="ab-alt-title" className={s.sheetTitle}>
              Altri specialisti adatti a voi
            </h2>
            <p className={s.sheetSub}>Scegliete chi preferite. Potete cambiare di nuovo in qualsiasi momento.</p>
          </div>
          <button ref={closeRef} type="button" className="icon-btn" aria-label="Chiudi" onClick={onClose}>
            <IconClose size={18} />
          </button>
        </div>
        <div className={s.items}>
          {items.map((sp) => (
            <div key={sp.id} className={s.item}>
              <SpecialistPhoto specialist={sp} size={64} ring="0 0 0 3px #FFFFFF" />
              <span className={s.itemBody}>
                <span className={s.itemNameRow}>
                  <span className={s.itemName}>{sp.name}</span>
                  {sp.id === proposedId ? <span className={s.recTag}>Proposta da Nest</span> : null}
                </span>
                <span className={s.itemRole}>{sp.role}</span>
                <span className={s.itemLine}>{sp.line}</span>
              </span>
              <button type="button" className={`btn ${s.pickBtn}`} aria-label={`Scegli ${sp.name}`} onClick={() => onPick(sp.id)}>
                Scegli
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

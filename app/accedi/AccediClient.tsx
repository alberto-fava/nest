"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconChevronLeft } from "@/components/icons";
import { SiteFooter, SITE_LINKS } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { store, useSession } from "@/lib/store";
import s from "./accedi.module.css";

export function AccediClient() {
  const router = useRouter();
  const session = useSession();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [forgot, setForgot] = useState(false);
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // Con una sessione già attiva si va direttamente all’area personale.
  useEffect(() => {
    if (session.status === "auth" && !busy) router.replace("/area-personale");
  }, [session.status, busy, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setForgot(false);
    if (!email.trim() || !pw) {
      setError("Inserite email e password per accedere.");
      return;
    }
    setBusy(true);
    const res = await store.login(email, pw);
    if (!res.ok) {
      setBusy(false);
      setError("Email e password non corrispondono. Controllate i dati e riprovate.");
      emailRef.current?.focus();
      return;
    }
    router.push("/area-personale");
  }

  const invalid = error !== "";

  return (
    <div className="page">
      <div aria-hidden="true" className={`page-bg ${s.bg}`} />
      <div aria-hidden="true" className={s.orb}>
        <div className={`spin-slow ${s.orbRing}`}>
          <svg width="760" height="760" viewBox="0 0 760 760">
            <circle cx="380" cy="380" r="376" fill="none" stroke="rgba(29,26,56,0.18)" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="0.1 15" />
          </svg>
        </div>
        <div className={`drift ${s.orbEgg}`} />
      </div>

      <SiteHeader
        right={
          <Link className={`btn btn-ghost ${s.back}`} href="/">
            <IconChevronLeft />
            <span>Torna al sito</span>
          </Link>
        }
      />

      <main className={s.main}>
        <form className={s.card} onSubmit={submit} noValidate aria-describedby={invalid ? "ac-error" : undefined}>
          <div className={s.intro}>
            <h1 className={s.h1}>Bentornati</h1>
            <p>Entrate nella vostra area personale per seguire esami, visite e messaggi.</p>
          </div>
          <div className={s.fields}>
            <div className="field">
              <label htmlFor="ac-email" className="field-label">
                Email
              </label>
              <input
                ref={emailRef}
                id="ac-email"
                className={`input ${s.input}`}
                type="email"
                autoComplete="email"
                placeholder="nome@esempio.it"
                value={email}
                aria-invalid={invalid}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
            </div>
            <div className="field">
              <span className={s.labelRow}>
                <label htmlFor="ac-pw" className="field-label">
                  Password
                </label>
                <button type="button" className={`flink ${s.forgot}`} onClick={() => setForgot((f) => !f)} aria-expanded={forgot} aria-controls="ac-forgot">
                  Password dimenticata?
                </button>
              </span>
              <input
                id="ac-pw"
                className={`input ${s.input}`}
                type="password"
                autoComplete="current-password"
                placeholder="La vostra password"
                value={pw}
                aria-invalid={invalid}
                onChange={(e) => {
                  setPw(e.target.value);
                  setError("");
                }}
              />
            </div>
          </div>
          {forgot ? (
            <p id="ac-forgot" className={`anim-in ${s.info}`}>
              In questa demo non possiamo inviarvi un’email: potete creare un nuovo profilo dal questionario, oppure azzerare i dati della demo dal menu del vostro profilo.
            </p>
          ) : null}
          {invalid ? (
            <p id="ac-error" role="alert" className={s.error}>
              {error}
            </p>
          ) : null}
          <button type="submit" className={`btn btn-primary ${s.submit}`} disabled={busy}>
            Accedi
          </button>
          <div className={s.alt}>
            <span>Non avete ancora un profilo?</span>
            <Link className={s.altLink} href="/questionario">
              Iniziate dal questionario
            </Link>
          </div>
        </form>
      </main>

      <SiteFooter links={SITE_LINKS} />
    </div>
  );
}

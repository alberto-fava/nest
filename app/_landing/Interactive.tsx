"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { IconPeople, IconPlus } from "@/components/icons";
import { SiteHeader } from "@/components/SiteHeader";
import { UserMenu } from "@/components/UserMenu";
import { FAQ, PATHS } from "@/data/landing";
import { useSession } from "@/lib/store";
import { focusQuiz } from "./focusQuiz";
import s from "./landing.module.css";

export function StartQuizButton({ className, children = "Inizia il questionario" }: { className?: string; children?: React.ReactNode }) {
  return (
    <button type="button" className={`btn btn-primary ${className ?? ""}`} onClick={focusQuiz}>
      {children}
    </button>
  );
}

export function LandingHeader() {
  const session = useSession();
  return (
    <SiteHeader
      narrow
      homeHref="#top"
      homeLabel="Nest, inizio pagina"
      compactBrand={session.status === "auth"}
      center={
        <div className={s.links}>
          <a className={s.navLink} href="#come-funziona">
            Come funziona
          </a>
          <a className={s.navLink} href="#percorsi">
            Percorsi
          </a>
          <a className={s.navLink} href="#dashboard">
            Area personale
          </a>
          <a className={s.navLink} href="#domande">
            Domande
          </a>
        </div>
      }
      right={
        <div className={s.headRight}>
          {session.status === "auth" ? (
            <UserMenu account={session.account} />
          ) : (
            <Link className={`${s.login} ${s.navLink}`} href="/accedi">
              Accedi
            </Link>
          )}
          <StartQuizButton className={s.headCta} />
        </div>
      }
    />
  );
}

export function PathTabs() {
  const [tab, setTab] = useState(0);
  const id = useId();
  const cur = PATHS[tab];

  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (e.key in keys) {
      e.preventDefault();
      const n = (tab + keys[e.key] + PATHS.length) % PATHS.length;
      setTab(n);
      document.getElementById(`${id}-tab-${n}`)?.focus();
    }
  }

  return (
    <div className={s.pathRow}>
      <div className={s.tabs} role="tablist" aria-label="Percorsi" onKeyDown={onKey}>
        {PATHS.map((p, i) => (
          <button
            key={p.name}
            id={`${id}-tab-${i}`}
            type="button"
            role="tab"
            className={s.tab}
            aria-selected={i === tab}
            aria-controls={`${id}-panel`}
            tabIndex={i === tab ? 0 : -1}
            onClick={() => setTab(i)}
          >
            <span aria-hidden="true" className={s.tabDot} />
            <span>{p.name}</span>
          </button>
        ))}
      </div>
      <div className={s.panel} role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${tab}`}>
        <div className={s.panelHead}>
          <h3 className={s.panelTitle}>{cur.name}</h3>
          <p className={s.desc}>{cur.desc}</p>
          <p className={s.panelLead}>{cur.forWho}</p>
        </div>
        <div className={s.meta}>
          <div className={`${s.metaCol} ${s.forWho}`}>
            <span className={s.metaLabel}>Per chi è</span>
            <span className={s.metaText}>{cur.forWho}</span>
          </div>
          <div className={s.metaCol}>
            <span className={s.metaLabel}>I primi passi</span>
            <ol className={s.firstSteps}>
              {cur.steps.map((t, i) => (
                <li key={t} className={s.firstStep}>
                  <span className={s.firstStepN}>{i + 1}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className={s.who}>
          <IconPeople />
          <span>Vi seguono: {cur.who.join(", ")}.</span>
        </p>
      </div>
    </div>
  );
}

export function Faq() {
  const [open, setOpen] = useState(0);
  const id = useId();
  return (
    <div className={s.faqList}>
      {FAQ.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className={s.faqItem}>
            <h3 className={s.faqQ}>
              <button
                type="button"
                className={s.faqBtn}
                aria-expanded={isOpen}
                aria-controls={`${id}-a-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{f.q}</span>
                <span aria-hidden="true" className={s.faqPlus}>
                  <IconPlus />
                </span>
              </button>
            </h3>
            {isOpen ? (
              <p id={`${id}-a-${i}`} className={`anim-in ${s.faqA}`}>
                {f.a}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

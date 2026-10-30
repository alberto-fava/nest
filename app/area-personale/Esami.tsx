"use client";

import { useEffect, useRef, useState } from "react";
import { IconDots, IconFlask, IconUpload } from "@/components/icons";
import { EXAMS, EXAM_ACTIONS, EXAM_FILTERS, EXAM_STATUS_LABEL, fillNames, inFilter, type ExamFilter, type ExamStatus } from "@/data/area";
import type { AreaData } from "./shared";
import s from "./area.module.css";

const DOT: Record<ExamStatus, string> = {
  ready: "var(--accent)",
  work: "var(--dot-work)",
  booked: "var(--dot-booked)",
  todo: "var(--dot-todo)",
};

export function Esami({ d }: { d: AreaData }) {
  const [filter, setFilter] = useState<ExamFilter>("all");
  const [open, setOpen] = useState(-1);
  const menuRef = useRef<HTMLSpanElement>(null);
  const rows = EXAMS.filter((e) => inFilter(e, filter));

  useEffect(() => {
    if (open < 0) return;
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(-1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const btn = menuRef.current?.querySelector("button");
      setOpen(-1);
      btn?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={s.section}>
      <div className={s.headRow}>
        <div className={s.headText}>
          <h1 className={s.h1}>Esami</h1>
          <p className={s.lead}>Gli esami del vostro percorso, per entrambi.</p>
        </div>
        <button type="button" className={`btn ${s.ghostBtn}`} onClick={() => d.go("documenti")}>
          <IconUpload size={17} />
          <span>Carica un referto</span>
        </button>
      </div>

      <div className={s.filters} role="group" aria-label="Filtra gli esami">
        {EXAM_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={s.filter}
            aria-pressed={filter === f.id}
            onClick={() => {
              setFilter(f.id);
              setOpen(-1);
            }}
          >
            <span>{f.label}</span>
            <span className={s.filterN}>{EXAMS.filter((e) => inFilter(e, f.id)).length}</span>
          </button>
        ))}
      </div>

      <div className={s.listCard}>
        {rows.map((e, i) => {
          const isOpen = open === i;
          const label = `Azioni per ${e.name}`;
          return (
            <div key={e.name} className={s.row}>
              <span aria-hidden="true" className={s.rowIcon}>
                <IconFlask />
              </span>
              <span className={s.rowText}>
                <span className={s.rowName}>{e.name}</span>
                <span className={s.rowMeta}>{fillNames(e.meta, d.names)}</span>
                <span className={s.statusM}>
                  <span aria-hidden="true" className={s.statusDot} style={{ background: DOT[e.s] }} />
                  <span>{EXAM_STATUS_LABEL[e.s]}</span>
                </span>
              </span>
              <span className={`${s.pill} ${s[`pill_${e.s}`]} ${s.pillDesk}`}>{EXAM_STATUS_LABEL[e.s]}</span>
              <span ref={isOpen ? menuRef : undefined} className={s.dots}>
                <button type="button" className={s.dotsBtn} aria-label={label} aria-haspopup="menu" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)}>
                  <IconDots />
                </button>
                {isOpen ? (
                  <span role="menu" aria-label={label} className={`anim-fade ${s.rowMenu}`}>
                    {EXAM_ACTIONS[e.s].map((a) => (
                      <button key={a} type="button" role="menuitem" className="menu-item" onClick={() => setOpen(-1)}>
                        {a}
                      </button>
                    ))}
                  </span>
                ) : null}
              </span>
            </div>
          );
        })}
        {rows.length === 0 ? <p className={s.empty}>Nessun esame in questa categoria.</p> : null}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { getSpecialist, yourSpecialist } from "@/data/specialists";
import { coupleInitials, displayName } from "@/lib/format";
import { store, useStoreQuery, type Account } from "@/lib/store";
import { markLeaving } from "./AuthGate";
import { IconChevronDown, IconGrid, IconLogout, IconStethoscope, IconTrash } from "./icons";
import s from "./header.module.css";

export function CoupleAvatars({ account }: { account: Pick<Account, "name" | "email"> }) {
  const letters = coupleInitials(account.name, account.email);
  return (
    <span aria-hidden="true" className={s.avatars}>
      {letters.map((l, i) => (
        <span key={i} className={s.avatar}>
          {l}
        </span>
      ))}
    </span>
  );
}

/** Menu della coppia: iniziali, nome, link rapidi, azzeramento della demo e uscita. */
export function UserMenu({ account }: { account: Account }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const { data: match } = useStoreQuery(() => store.getMatch(account.id), [account.id]);
  const specialistLabel = match ? yourSpecialist(getSpecialist(match.chosenId)) : "Lo specialista";
  const name = displayName(account.name, account.email);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function logout() {
    setOpen(false);
    markLeaving();
    await store.logout();
    router.push("/");
  }

  async function resetDemo() {
    setOpen(false);
    const ok = window.confirm(
      "Azzerare i dati della demo?\n\nVerranno cancellati da questo browser tutti i profili, le risposte, le prenotazioni e i messaggi di Nest.",
    );
    if (!ok) return;
    markLeaving();
    await store.resetDemo();
    // Ricarica completa voluta: nessun componente deve restare con i dati appena cancellati.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/");
  }

  return (
    <span ref={wrapRef} className={s.userWrap}>
      <button
        ref={btnRef}
        type="button"
        className={`btn ${s.userBtn}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Menu di ${name}`}
        onClick={() => setOpen((o) => !o)}
      >
        <CoupleAvatars account={account} />
        <span className={`${s.userName} ${s.hideSm}`}>{name}</span>
        <IconChevronDown className={`${s.chev} ${open ? s.chevOpen : ""}`} />
      </button>
      {open ? (
        <span id={menuId} role="menu" aria-label="Il vostro profilo" className="menu">
          <span className={s.menuHead}>
            <span className={s.menuHeadName}>{name}</span>
            {account.name.trim() ? <span className={s.menuHeadMail}>{account.email}</span> : null}
          </span>
          <span aria-hidden="true" className="menu-sep" />
          <Link role="menuitem" className="menu-item" href="/area-personale" onClick={() => setOpen(false)}>
            <IconGrid />
            <span>Area personale</span>
          </Link>
          <Link role="menuitem" className="menu-item" href="/abbinamento" onClick={() => setOpen(false)}>
            <IconStethoscope />
            <span>{specialistLabel}</span>
          </Link>
          <span aria-hidden="true" className="menu-sep" />
          <button type="button" role="menuitem" className={`menu-item ${s.menuDanger}`} onClick={resetDemo}>
            <IconTrash />
            <span>Azzera i dati della demo</span>
          </button>
          <button type="button" role="menuitem" className="menu-item" onClick={logout}>
            <IconLogout />
            <span>Esci</span>
          </button>
        </span>
      ) : null}
    </span>
  );
}

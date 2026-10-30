"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AuthGate } from "@/components/AuthGate";
import { SiteHeader } from "@/components/SiteHeader";
import { SpecialistPhoto } from "@/components/SpecialistPhoto";
import { UserMenu } from "@/components/UserMenu";
import { IconBell, IconChat, IconFlask, IconFolder, IconCalendar, IconPath } from "@/components/icons";
import { partnerNames, WELCOME_MESSAGES, fillNames } from "@/data/area";
import { getSpecialist, yourSpecialist, type SpecialistId } from "@/data/specialists";
import { displayName, parseDate } from "@/lib/format";
import { ensureMatch } from "@/lib/journey";
import { store, useStoreQuery, type Account } from "@/lib/store";
import { Documenti } from "./Documenti";
import { Esami } from "./Esami";
import { Messaggi } from "./Messaggi";
import { Percorso } from "./Percorso";
import { Visite } from "./Visite";
import { VIEWS, type AreaData, type View } from "./shared";
import s from "./area.module.css";

const NAV: { id: View; label: string; tab: string; Icon: (p: { size?: number }) => ReactNode }[] = [
  { id: "percorso", label: "Il percorso", tab: "Percorso", Icon: IconPath },
  { id: "esami", label: "Esami", tab: "Esami", Icon: IconFlask },
  { id: "visite", label: "Visite", tab: "Visite", Icon: IconCalendar },
  { id: "documenti", label: "Documenti", tab: "Documenti", Icon: IconFolder },
  { id: "messaggi", label: "Messaggi", tab: "Messaggi", Icon: IconChat },
];

function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

/** Sezione corrente nell’hash dell’URL (#esami, #messaggi…). */
function useHashView(): [View, (v: View) => void] {
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => "",
  );
  const id = hash.replace(/^#/, "");
  const view: View = (VIEWS as string[]).includes(id) ? (id as View) : "percorso";
  const go = useCallback((v: View) => {
    window.history.replaceState(window.history.state, "", `#${v}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    let reduce = false;
    try {
      reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {}
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, []);
  return [view, go];
}

function Shell({ children }: { children?: ReactNode }) {
  return (
    <div className="page">
      <div aria-hidden="true" className={`page-bg ${s.bg}`} />
      {children}
    </div>
  );
}

export function AreaClient() {
  return <AuthGate fallback={<Shell />}>{(account) => <Area account={account} />}</AuthGate>;
}

/** Primi messaggi dello specialista: oggi alle 9:40 e 9:41, o pochi minuti fa se è ancora presto. */
async function seedWelcome(account: Account, specialistId: SpecialistId, now: Date) {
  const at = (h: number, m: number, fallbackMin: number) => {
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    if (d.getTime() > now.getTime()) return new Date(now.getTime() - fallbackMin * 60_000).toISOString();
    return d.toISOString();
  };
  const coppia = displayName(account.name, account.email);
  const times = [at(9, 40, 6), at(9, 41, 5)];
  for (let i = 0; i < WELCOME_MESSAGES.length; i++) {
    await store.addMessage(account.id, {
      from: "specialista",
      specialistId,
      text: fillNames(WELCOME_MESSAGES[i], { lei: "", lui: "" }, { coppia }),
      read: false,
      at: times[i],
    });
  }
}

const seededAccounts = new Set<string>();

function Area({ account }: { account: Account }) {
  const [view, go] = useHashView();
  const [now] = useState(() => new Date());
  const id = account.id;
  const { data: base } = useStoreQuery(() => ensureMatch(id), [id]);
  const { data: booking } = useStoreQuery(() => store.activeBooking(id), [id]);
  const { data: bookings } = useStoreQuery(() => store.listBookings(id), [id]);
  const { data: messages } = useStoreQuery(() => store.listMessages(id), [id]);
  const { data: docs } = useStoreQuery(() => store.listDocs(id), [id]);

  const specialist = getSpecialist(booking?.specialistId ?? base?.match.chosenId);
  const unread = (messages ?? []).filter((m) => m.from === "specialista" && !m.read).length;

  // Messaggi di benvenuto alla prima apertura.
  const seeding = useRef(false);
  useEffect(() => {
    if (!base || !messages || messages.length > 0 || seeding.current || seededAccounts.has(id)) return;
    seeding.current = true;
    seededAccounts.add(id);
    void seedWelcome(account, specialist.id, now);
  }, [base, messages, id, account, specialist.id, now]);

  // Aprire i messaggi li segna come letti.
  useEffect(() => {
    if (view === "messaggi" && unread > 0) void store.markMessagesRead(id);
  }, [view, unread, id]);

  const data: AreaData | null = useMemo(() => {
    if (!base || booking === undefined || !bookings || !messages || !docs) return null;
    const isPast = (b: { date: string; time: string }) => parseDate(b.date, b.time).getTime() <= now.getTime();
    return {
      account,
      name: displayName(account.name, account.email),
      names: partnerNames(account.name),
      specialist,
      booking,
      upcoming: booking && !isPast(booking) ? booking : null,
      past: bookings.filter((b) => b.status === "confermata" && isPast(b)),
      messages,
      docs: [...docs].reverse(),
      now,
      go,
    };
  }, [base, booking, bookings, messages, docs, now, account, specialist, go]);

  const bellLabel = unread > 0 ? `Notifiche, ${unread} ${unread === 1 ? "messaggio non letto" : "messaggi non letti"}` : "Notifiche";

  return (
    <Shell>
      <SiteHeader
        section="Area personale"
        sectionClassName={s.headerSection}
        right={
          <>
            <button type="button" className={`btn ${s.bell}`} aria-label={bellLabel} onClick={() => go("messaggi")}>
              <IconBell size={19} />
              {unread > 0 ? <span aria-hidden="true" className={s.bellDot} /> : null}
            </button>
            <UserMenu account={account} />
          </>
        }
      />

      <div className={s.main}>
        <div className={s.layout}>
          <aside className={s.side}>
            <nav aria-label="Sezioni dell’area personale" className={s.sideNav}>
              {NAV.map((n) => (
                <button key={n.id} type="button" className={s.navBtn} aria-current={view === n.id ? "page" : undefined} onClick={() => go(n.id)}>
                  <span className={s.navIcon}>
                    <n.Icon />
                  </span>
                  <span>{n.label}</span>
                  {n.id === "messaggi" && unread > 0 ? (
                    <span className={s.navBadge}>
                      {unread}
                      <span className="sr-only"> non letti</span>
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>
            <div className={s.sideCard}>
              <span className={s.sideKicker}>{yourSpecialist(specialist)}</span>
              <span className={s.who}>
                <SpecialistPhoto specialist={specialist} size={48} ring="0 0 0 3px #FFFFFF" />
                <span className={s.whoText}>
                  <span className={s.whoName}>{specialist.name}</span>
                  <span className={s.whoRole}>{specialist.roleShort}</span>
                </span>
              </span>
              <Link className={`btn ${s.sideBtnDark}`} href="/abbinamento">
                Profilo e disponibilità
              </Link>
              <button type="button" className={`btn ${s.sideBtnLight}`} onClick={() => go("messaggi")}>
                Scrivi un messaggio
              </button>
            </div>
          </aside>

          <main className={s.content}>
            {data ? (
              <div key={view} className="anim-in">
                {view === "percorso" ? <Percorso d={data} /> : null}
                {view === "esami" ? <Esami d={data} /> : null}
                {view === "visite" ? <Visite d={data} /> : null}
                {view === "documenti" ? <Documenti d={data} /> : null}
                {view === "messaggi" ? <Messaggi d={data} /> : null}
              </div>
            ) : null}
          </main>
        </div>
      </div>

      <nav aria-label="Sezioni dell’area personale" className={s.tabbar}>
        {NAV.map((n) => (
          <button key={n.id} type="button" className={s.tab} aria-current={view === n.id ? "page" : undefined} onClick={() => go(n.id)}>
            <span className={s.tabIcon}>
              <n.Icon size={20} />
              {n.id === "messaggi" && unread > 0 ? <span aria-hidden="true" className={s.tabDot} /> : null}
            </span>
            <span>
              {n.tab}
              {n.id === "messaggi" && unread > 0 ? <span className="sr-only">, {unread} non letti</span> : null}
            </span>
          </button>
        ))}
      </nav>
    </Shell>
  );
}

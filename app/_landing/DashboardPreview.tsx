import { IconBell, IconCalendar, IconChat, IconCheck, IconFlask, IconFolder, IconPath, IconUpload, LogoMark } from "@/components/icons";
import l from "./landing.module.css";
import s from "./preview.module.css";

function Phase({ state, title, sub }: { state: "done" | "cur" | "todo"; title: string; sub: string }) {
  return (
    <li className={s.phase}>
      {state === "done" ? (
        <span className={s.phDone}>
          <IconCheck size={13} />
        </span>
      ) : state === "cur" ? (
        <span className={s.phCur}>
          <span />
        </span>
      ) : (
        <span className={s.phTodo} />
      )}
      <span className={s.phText}>
        <span className={s.t15}>{title}</span>
        <span className={s.t13}>{sub}</span>
      </span>
    </li>
  );
}

function Row({ title, sub, badge, kind }: { title: string; sub: string; badge: string; kind: "bReady" | "bWork" | "bBooked" | "bTodo" }) {
  return (
    <div className={s.row}>
      <span className={s.rowText}>
        <span className={s.t16}>{title}</span>
        <span className={s.t13}>{sub}</span>
      </span>
      <span className={`${s.badge} ${s[kind]}`}>{badge}</span>
    </div>
  );
}

/** Anteprima statica dell’area personale, come nel design (desktop e telefono). */
export function DashboardPreview() {
  return (
    <>
      <div className={l.desk} aria-hidden="true">
        <div className={s.bar}>
          <span className={s.brand}>
            <LogoMark size={24} dot="var(--accent)" />
            <span className={s.brandName}>Nest</span>
            <span className={s.sep} />
            <span className={s.area}>Area personale</span>
          </span>
          <span className={s.barRight}>
            <span className={s.bell}>
              <IconBell />
              <span className={s.bellDot} />
            </span>
            <span className={s.couple}>
              <span className={s.avatars}>
                <span className={s.av}>G</span>
                <span className={s.av}>M</span>
              </span>
              <span className={s.coupleName}>Giulia e Marco</span>
            </span>
          </span>
        </div>
        <div className={s.body}>
          <div className={s.side}>
            <span className={`${s.navItem} ${s.navOn}`}>
              <IconPath />
              Il percorso
            </span>
            <span className={s.navItem}>
              <IconFlask />
              Esami
            </span>
            <span className={s.navItem}>
              <IconCalendar />
              Visite
            </span>
            <span className={s.navItem}>
              <IconFolder />
              Documenti
            </span>
            <span className={s.navItem}>
              <IconChat />
              Messaggi
            </span>
            <span className={s.sideFoot}>
              <span className={s.specCard}>
                <span className={s.tiny}>La vostra specialista</span>
                <span className={s.specRow}>
                  <span className={s.ini}>EM</span>
                  <span className={s.col}>
                    <span className={s.t14}>Dott.ssa Marchetti</span>
                    <span className={s.tiny}>Ginecologa</span>
                  </span>
                </span>
              </span>
            </span>
          </div>
          <div className={s.main}>
            <div className={s.greetRow}>
              <div className={s.greet}>
                <span className={s.greetTitle}>Buongiorno, Giulia e Marco</span>
                <span className={s.greetSub}>Siete nella fase degli esami di base. Mancano due referti.</span>
              </div>
              <span className={s.pill}>
                <IconUpload size={17} />
                Carica un referto
              </span>
            </div>
            <ol className={s.phases}>
              <Phase state="done" title="Questionario" sub="Completato" />
              <Phase state="done" title="Prima visita" sub="5 novembre" />
              <Phase state="cur" title="Esami di base" sub="In corso" />
              <Phase state="todo" title="Esito" sub="Con la specialista" />
              <Phase state="todo" title="Piano" sub="Da definire" />
            </ol>
            <div className={s.cols}>
              <div className={s.exams}>
                <div className={s.examsHead}>
                  <span className={s.t18}>Esami</span>
                  <span className={s.t14m}>2 referti su 4</span>
                </div>
                <Row title="AMH, riserva ovarica" sub="Giulia, prelievo del 3 novembre" badge="Referto pronto" kind="bReady" />
                <Row title="Spermiogramma" sub="Marco, consegnato il 4 novembre" badge="In lavorazione" kind="bWork" />
                <Row title="Ecografia pelvica" sub="Giulia, in studio" badge="Lun 16 novembre" kind="bBooked" />
                <Row title="Profilo ormonale" sub="Giulia, al 3° giorno del ciclo" badge="Da prenotare" kind="bTodo" />
              </div>
              <div className={s.right}>
                <div className={s.card}>
                  <span className={s.label14}>Prossima visita</span>
                  <div className={s.visitRow}>
                    <span className={s.dateBox}>
                      <span className={s.dateSm}>gio</span>
                      <span className={s.dateLg}>12</span>
                      <span className={s.dateSm}>nov</span>
                    </span>
                    <span className={s.rowText}>
                      <span className={s.visitTitle}>Controllo con la Dott.ssa Marchetti</span>
                      <span className={s.t14m}>Online, ore 10:30</span>
                    </span>
                  </div>
                  <span className={s.ghost}>Aggiungi al calendario</span>
                </div>
                <div className={`${s.card} ${s.card12}`}>
                  <span className={s.label14}>Dalla vostra specialista</span>
                  <p className={s.quote}>“Il valore di AMH è nella norma per la vostra età. Giovedì lo guardiamo insieme allo spermiogramma e decidiamo i prossimi passi.”</p>
                  <span className={s.from}>
                    <span className={s.ini28}>EM</span>
                    <span>Dott.ssa Elena Marchetti, 2 ore fa</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={l.mob} aria-hidden="true">
        <div className={s.phone}>
          <div className={s.pBar}>
            <span className={s.pBrand}>
              <LogoMark size={22} dot="var(--accent)" />
              <span className={s.pBrandName}>Nest</span>
              <span className={s.pArea}>Area personale</span>
            </span>
            <span className={s.pBell}>
              <IconBell size={17} />
              <span className={s.pBellDot} />
            </span>
          </div>
          <div className={s.pBody}>
            <div className={s.pGreet}>
              <span className={s.pGreetTitle}>Ciao, Giulia e Marco</span>
              <span className={s.t13}>Siete nella fase degli esami di base</span>
            </div>
            <div className={s.pCard}>
              <span className={s.ring}>
                <svg width="56" height="56" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(29,26,56,0.1)" strokeWidth="6" />
                  <circle cx="32" cy="32" r="26" fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" strokeDasharray="98 163.4" transform="rotate(-90 32 32)" />
                </svg>
                <span className={s.ringText}>3/5</span>
              </span>
              <span className={s.rowText}>
                <span className={s.t16}>Esami di base</span>
                <span className={s.t13}>Fase 3 di 5, mancano due referti</span>
              </span>
            </div>
            <div className={s.pList}>
              <span className={s.pListHead}>
                <span className={s.t15}>Esami</span>
                <span className={s.t13}>2 su 4 pronti</span>
              </span>
              <span className={s.pRow}>
                <span>AMH</span>
                <span className={`${s.pBadge} ${s.bReady}`}>Pronto</span>
              </span>
              <span className={s.pRow}>
                <span>Spermiogramma</span>
                <span className={`${s.pBadge} ${s.bWork}`}>In lavorazione</span>
              </span>
              <span className={s.pRow}>
                <span>Ecografia</span>
                <span className={`${s.pBadge} ${s.bBooked}`}>Lun 16 nov</span>
              </span>
            </div>
            <div className={s.pDark}>
              <span className={s.rowText}>
                <span className={s.op75}>Prossima visita</span>
                <span className={s.pVisit}>Gio 12 nov, 10:30</span>
                <span className={s.op75b}>Dott.ssa Marchetti, online</span>
              </span>
              <span className={s.ini40}>EM</span>
            </div>
          </div>
          <div className={s.tabbar}>
            <span className={`${s.tabItem} ${s.tabOn}`}>
              <IconPath />
              Percorso
            </span>
            <span className={s.tabItem}>
              <IconFlask />
              Esami
            </span>
            <span className={s.tabItem}>
              <IconCalendar />
              Visite
            </span>
            <span className={s.tabItem}>
              <IconChat />
              Messaggi
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

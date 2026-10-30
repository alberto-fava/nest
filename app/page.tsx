import Link from "next/link";
import { SpecialistPhoto } from "@/components/SpecialistPhoto";
import { IconCalendar, IconChat, IconDoc, IconFlask, IconLock, IconPath, IconShield, IconSwap, LogoMark } from "@/components/icons";
import { SPECIALISTS } from "@/data/specialists";
import { DashboardPreview } from "./_landing/DashboardPreview";
import { Faq, LandingHeader, PathTabs, StartQuizButton } from "./_landing/Interactive";
import { MiniQuiz } from "./_landing/MiniQuiz";
import s from "./_landing/landing.module.css";

const STEPS = [
  { title: "Il questionario", text: "Età, da quanto cercate, esami già fatti, storia clinica. Si compila in coppia, anche in due momenti diversi." },
  { title: "L’abbinamento", text: "Vi proponiamo lo specialista più adatto e vi spieghiamo perché. Se preferite, ne scegliete un altro con lo stesso focus." },
  { title: "La prima visita", text: "Online o in studio, prenotata dal vostro profilo. Lo specialista conosce già il vostro quadro: si parte da lì, non da zero." },
  { title: "Il percorso", text: "Esami, referti e visite in un’unica dashboard, con i prossimi passi sempre chiari per entrambi." },
];

const FEATURES = [
  { icon: <IconPath size={19} />, title: "Le fasi del percorso", text: "Sapete sempre a che punto siete e qual è il passo successivo." },
  { icon: <IconFlask size={19} />, title: "Esami e referti", text: "Cosa prenotare, cosa è pronto e cosa manca, per entrambi." },
  { icon: <IconChat size={19} />, title: "Il vostro specialista", text: "Visite, note e messaggi con chi vi segue, senza ripetere ogni volta la vostra storia." },
];

const TRUST = [
  { icon: <IconShield />, title: "Specialisti verificati", text: "Controlliamo iscrizione all’albo, formazione ed esperienza in medicina della riproduzione prima di ogni ingresso." },
  { icon: <IconLock size={20} sw={1.6} />, title: "Dati sanitari protetti", text: "Referti e risposte sono cifrati e condivisi solo con gli specialisti a cui date accesso." },
  { icon: <IconSwap size={20} sw={1.6} />, title: "Liberi di cambiare", text: "Se lo specialista proposto non fa per voi, ne scegliete un altro in qualsiasi momento del percorso." },
];

export default function Home() {
  return (
    <div className={s.root}>
      <div aria-hidden="true" className={s.heroBg} />
      <LandingHeader />

      <main>
        <section id="top" className={s.hero}>
          <div className={s.heroInner}>
            <h1 className={`anim-rise ${s.h1}`}>Lo specialista giusto per diventare genitori, fin dal primo passo.</h1>
            <p className={`anim-rise ${s.lead}`}>
              Iniziate da tre domande, qui sotto. Completato il questionario, vi proponiamo il professionista più adatto alla vostra situazione e tenete in ordine esami, visite e referti.
            </p>

            <div className={s.stage}>
              <div className={s.orb} aria-hidden="true">
                <div className={`spin ${s.ring1}`}>
                  <svg width="712" height="712" viewBox="0 0 712 712">
                    <circle cx="356" cy="356" r="352" fill="none" stroke="rgba(29,26,56,0.24)" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="0.1 15" />
                  </svg>
                </div>
                <div className={`spin-r ${s.ring2}`}>
                  <svg width="640" height="640" viewBox="0 0 640 640">
                    <circle cx="320" cy="320" r="318" fill="none" stroke="rgba(29,26,56,0.14)" strokeWidth="1" strokeDasharray="120 10 3 10" />
                  </svg>
                </div>
                <div className={s.halo} />
                <div className={`breathe ${s.egg}`} />
              </div>

              <div className={`anim-rise ${s.sat} ${s.satA}`} aria-hidden="true">
                <span className={s.satIcon}>
                  <IconDoc size={20} sw={1.6} />
                </span>
                <span className={s.satText}>
                  <span className={s.satTitle}>Referto AMH</span>
                  <span className={s.satSub}>Pronto da leggere</span>
                </span>
              </div>
              <div className={`anim-rise ${s.sat} ${s.satB}`} aria-hidden="true">
                <span className={s.satIcon}>
                  <IconCalendar size={20} sw={1.6} />
                </span>
                <span className={s.satText}>
                  <span className={s.satTitle}>Prima visita</span>
                  <span className={s.satSub}>Giovedì, 10:30, online</span>
                </span>
              </div>

              <MiniQuiz />
            </div>

            <p className={`anim-rise ${s.free}`}>
              <IconLock />
              <span>Gratuito e senza impegno. Nessun dato salvato prima della registrazione.</span>
            </p>
          </div>
        </section>

        <section id="come-funziona" className={s.section}>
          <div className={s.wrap} style={{ gap: 64 }}>
            <div className={s.head}>
              <h2 className={s.h2}>Quattro passi, un solo filo dall’inizio alla fine.</h2>
              <p className={s.sub}>Ogni passaggio parte da quello precedente: nessuno vi chiede di ricominciare da capo, e sapete sempre chi vi sta seguendo.</p>
            </div>
            <ol className={s.steps}>
              {STEPS.map((st, i) => (
                <li key={st.title} className={s.step}>
                  {i < STEPS.length - 1 ? <span aria-hidden="true" className={s.hline} /> : null}
                  <span aria-hidden="true" className={s.vline} />
                  <span className={s.node}>{i + 1}</span>
                  <div className={s.stepBody}>
                    <h3 className={s.stepTitle}>{st.title}</h3>
                    <p className={s.stepText}>{st.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="percorsi" className={s.section}>
          <div aria-hidden="true" className={s.pathsBg} />
          <div className={s.wrap} style={{ gap: 48 }}>
            <div className={s.head}>
              <h2 className={s.h2}>Ogni coppia ha la sua strada.</h2>
              <p className={s.sub}>Il questionario serve a capire da quale partire. Questi sono i percorsi che seguiamo, e chi vi accompagna in ognuno.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <PathTabs />
              <p className={s.note}>In ogni percorso potete aggiungere supporto psicologico e consulenza nutrizionale.</p>
            </div>
          </div>
        </section>

        <section id="dashboard" className={s.section}>
          <div aria-hidden="true" className={s.dashBg} />
          <div className={s.wrap} style={{ gap: 56 }}>
            <div className={s.head}>
              <h2 className={s.h2}>La vostra area personale, per tutto il percorso.</h2>
              <p className={s.sub}>Dopo l’abbinamento entrate nella piattaforma Nest: esami, referti, visite e messaggi con lo specialista, in un unico posto condiviso tra voi due.</p>
            </div>
            <figure className={s.figure} style={{ margin: "0 auto" }}>
              <DashboardPreview />
              <figcaption className={s.figcaption}>
                <ol className={s.features}>
                  {FEATURES.map((f) => (
                    <li key={f.title} className={s.feature}>
                      <span aria-hidden="true" className={s.featureIcon}>
                        {f.icon}
                      </span>
                      <span className={s.featureText}>
                        <span className={s.featureTitle}>{f.title}</span>
                        <span className={s.featureSub}>{f.text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className={s.section} style={{ paddingTop: 104, paddingBottom: 104 }}>
          <div className={s.wrap}>
            <figure className={s.quote}>
              <blockquote className={s.blockquote}>Non siete soli. Una persona su sei, nel mondo, affronta l’infertilità nel corso della vita.</blockquote>
              <figcaption className={s.cite}>Organizzazione Mondiale della Sanità, rapporto 2023</figcaption>
            </figure>
          </div>
        </section>

        <section id="garanzie" aria-labelledby="pl-trust-title" className={`${s.section} ${s.trustSection}`}>
          <div className={s.trustWrap}>
            <div className={s.trustLeft}>
              <h2 id="pl-trust-title" className={s.h2}>
                Una rete di specialisti verificati.
              </h2>
              <p className={s.trustLead}>Ogni professionista passa una verifica prima di entrare in Nest. I vostri dati restano protetti, e la scelta resta sempre vostra.</p>
              <div className={s.trustPeople}>
                <span aria-hidden="true" className={s.faces}>
                  {SPECIALISTS.map((sp) => (
                    <SpecialistPhoto key={sp.id} specialist={sp} size={48} ring="0 0 0 3px #F4F5F9" />
                  ))}
                </span>
                <span className={s.trustPeopleText}>Ginecologi, andrologi, specialisti in PMA e psicologi della fertilità.</span>
              </div>
            </div>
            <ul className={s.trustList}>
              {TRUST.map((t) => (
                <li key={t.title} className={s.trustItem}>
                  <span aria-hidden="true" className={s.trustIcon}>
                    {t.icon}
                  </span>
                  <div className={s.trustText}>
                    <h3 className={s.h3}>{t.title}</h3>
                    <p className={s.p15}>{t.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="domande" className={s.section}>
          <div className={s.faqWrap}>
            <div className={s.faqLeft}>
              <h2 className={s.h2}>Le domande che ci fanno più spesso.</h2>
              <p>Non trovate la vostra? Scriveteci a [EMAIL DI CONTATTO].</p>
            </div>
            <Faq />
          </div>
        </section>

        <section className={s.ctaSection}>
          <div className={s.cta}>
            <div aria-hidden="true" className={s.ctaOrb} />
            <div className={s.ctaInner}>
              <h2 className={s.ctaTitle}>Il primo passo richiede tre minuti.</h2>
              <p className={s.ctaText}>Il questionario è gratuito e non vi impegna a nulla. Alla fine vedrete chi vi proponiamo, e perché.</p>
              <StartQuizButton className={s.ctaBtn} />
            </div>
          </div>
          <div className={s.pros}>
            <span className={s.prosText}>
              <span className={s.prosTitle}>Siete specialisti della fertilità?</span>
              <span className={s.prosSub}>Ricevete coppie con un quadro già completo, e seguite il percorso insieme a loro.</span>
            </span>
            <a className={`btn btn-ghost ${s.prosBtn}`} href="#top">
              Entrate nella rete Nest
            </a>
          </div>
        </section>
      </main>

      <footer className={s.footer}>
        <div className={s.footerWrap}>
          <div className={s.footerTop}>
            <div className={s.footerBrand}>
              <span className={s.footerLogo}>
                <LogoMark size={28} />
                <span className={s.footerName}>Nest</span>
              </span>
              <p>Mettiamo in contatto le coppie che desiderano un figlio con gli specialisti della fertilità più adatti a loro.</p>
            </div>
            <div className={s.footerNavs}>
              <nav aria-label="Servizio" className={s.footerNav}>
                <span className={s.footerNavTitle}>Servizio</span>
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
              </nav>
              <nav aria-label="Specialisti" className={s.footerNav}>
                <span className={s.footerNavTitle}>Specialisti</span>
                <a className={s.navLink} href="#top">
                  Entrate nella rete
                </a>
                <a className={s.navLink} href="#top">
                  Area riservata
                </a>
              </nav>
              <nav aria-label="Nest" className={s.footerNav}>
                <span className={s.footerNavTitle}>Nest</span>
                <a className={s.navLink} href="#top">
                  Chi siamo
                </a>
                <a className={s.navLink} href="#top">
                  Privacy
                </a>
                <a className={s.navLink} href="#top">
                  Termini
                </a>
                <Link className={s.navLink} href="/accedi">
                  Accedi
                </Link>
              </nav>
            </div>
          </div>
          <div className={s.footerBottom}>
            <span>© 2026 Nest. [Ragione sociale e partita IVA]</span>
            <span>Le informazioni su Nest non sostituiscono il parere del medico.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

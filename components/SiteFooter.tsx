import Link from "next/link";
import { LogoMark } from "./icons";
import s from "./header.module.css";

/** Piè di pagina compatto (questionario, abbinamento, accedi). */
export function SiteFooter({ links }: { links: { href: string; label: string }[] }) {
  return (
    <footer className={s.footer}>
      <div className={s.footerInner}>
        <span className={s.footerBrand}>
          <LogoMark size={22} />
          <span>© 2026 Nest. [Ragione sociale e partita IVA]</span>
        </span>
        <nav aria-label="Link utili" className={s.footerLinks}>
          {links.map((l) => (
            <Link key={l.label} className="flink" href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <span className={s.footerNote}>Le informazioni su Nest non sostituiscono il parere del medico.</span>
      </div>
    </footer>
  );
}

export const SITE_LINKS = [
  { href: "/", label: "Torna al sito" },
  { href: "/#domande", label: "Domande frequenti" },
  { href: "/#top", label: "Privacy" },
  { href: "/#top", label: "Termini" },
];

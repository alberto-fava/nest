import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "./icons";
import s from "./header.module.css";

interface Props {
  /** Larghezza del design: 1120 in landing, 1200 nelle altre pagine. */
  narrow?: boolean;
  /** In landing il logo porta a #top. */
  homeHref?: string;
  homeLabel?: string;
  /** Etichetta dopo il logo, separata da una linea (es. "Area personale"). */
  section?: ReactNode;
  /** Classe per nascondere l’etichetta su schermi piccoli. */
  sectionClassName?: string;
  /** Contenuto centrale (link della landing). */
  center?: ReactNode;
  right?: ReactNode;
  /** Nasconde il nome "Nest" sotto i 560px (serve quando a destra c’è molto). */
  compactBrand?: boolean;
}

/** Header in vetro, identico su tutte le pagine. */
export function SiteHeader({ narrow, homeHref = "/", homeLabel = "Nest, torna alla home", section, sectionClassName, center, right, compactBrand }: Props) {
  return (
    <header className={s.header}>
      <div aria-hidden="true" className={s.veil} />
      <nav aria-label="Principale" className={`${s.nav} ${narrow ? s.narrow : ""}`}>
        <span className={s.left}>
          <Link href={homeHref} aria-label={homeLabel} className={s.brand}>
            <LogoMark />
            <span className={`${s.brandName} ${compactBrand ? s.hideXs : ""}`}>Nest</span>
          </Link>
          {section ? (
            <>
              <span aria-hidden="true" className={`${s.divider} ${sectionClassName ?? ""}`} />
              <span className={`${s.section} ${sectionClassName ?? ""}`}>{section}</span>
            </>
          ) : null}
        </span>
        {center}
        {right ? <div className={s.right}>{right}</div> : null}
      </nav>
    </header>
  );
}

export const headerStyles = s;

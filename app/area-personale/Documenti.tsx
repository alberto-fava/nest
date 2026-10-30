"use client";

import { useRef, useState, type DragEvent } from "react";
import { IconDownload, IconFile, IconUpload } from "@/components/icons";
import { DOCS, fillNames } from "@/data/area";
import { dayMonth } from "@/lib/format";
import { store } from "@/lib/store";
import { fromSpecialist, type AreaData } from "./shared";
import s from "./area.module.css";

function isoDay(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Scarica un piccolo file di testo al posto del documento di esempio. */
function downloadSample(name: string) {
  const text = `Nest, documento di esempio\n\n"${name}" fa parte dei dati di esempio della demo di Nest: non è un documento reale.\n`;
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name.replace(/\.[a-z0-9]+$/i, "") + ".txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Documenti({ d }: { d: AreaData }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const extra = { daSpecialista: fromSpecialist(d.specialist) };

  async function addFiles(files: FileList | null) {
    if (!files) return;
    for (const f of Array.from(files)) await store.addDoc(d.account.id, f.name);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setOver(false);
    void addFiles(e.dataTransfer.files);
  }

  return (
    <div className={s.section}>
      <div className={s.headText}>
        <h1 className={s.h1}>Documenti</h1>
        <p className={s.lead}>Referti, impegnative e note, in un unico posto.</p>
      </div>

      <div
        className={`${s.drop} ${over ? s.dropActive : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <span aria-hidden="true" className={s.dropIcon}>
          <IconUpload size={22} />
        </span>
        <span className={s.dropTitle}>Trascinate qui un referto</span>
        <span className={s.dropSub}>PDF o foto. Lo vedrà solo {d.specialist.g === "f" ? "la vostra specialista" : "il vostro specialista"}.</span>
        <label htmlFor="pa-file" className="sr-only">
          Scegli un file da caricare
        </label>
        <input
          ref={inputRef}
          id="pa-file"
          type="file"
          accept="application/pdf,image/*"
          multiple
          hidden
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button type="button" className={`btn ${s.dropBtn}`} onClick={() => inputRef.current?.click()}>
          Scegli un file
        </button>
        <span className={s.dropNote}>In questa demo salviamo solo il nome del file, non il contenuto.</span>
      </div>

      <div className={s.listCard}>
        {d.docs.map((doc) => (
          <div key={doc.id} className={s.docRow}>
            <span aria-hidden="true" className={s.rowIcon}>
              <IconFile />
            </span>
            <span className={s.docText}>
              <span className={s.docName}>{doc.name}</span>
              <span className={s.rowMeta}>Caricato da voi, {dayMonth(isoDay(doc.at))}</span>
            </span>
          </div>
        ))}
        {DOCS.map((doc) => (
          <div key={doc.name} className={s.docRow}>
            <span aria-hidden="true" className={s.rowIcon}>
              <IconFile />
            </span>
            <span className={s.docText}>
              <span className={s.docName}>{doc.name}</span>
              <span className={s.rowMeta}>{fillNames(doc.meta, d.names, extra)}</span>
            </span>
            <button type="button" className={`btn ${s.roundBtn}`} aria-label={`Scarica ${doc.name}`} onClick={() => downloadSample(doc.name)}>
              <IconDownload size={17} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

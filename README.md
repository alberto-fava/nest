# Nest

Nest mette in contatto le coppie che cercano una gravidanza con gli specialisti della fertilità.
Questo repository contiene l’MVP del sito: landing con mini-quiz, questionario completo, creazione
del profilo, abbinamento con uno specialista, prenotazione della prima visita e area personale
(percorso, esami, visite, documenti, messaggi).

Non c’è backend: **tutti i dati restano nel browser, in `localStorage`**.

## Stack

- Next.js (App Router) + TypeScript, React 19
- CSS Modules + `app/globals.css`; token di design (colori, raggi, ombre, vetro) in un unico file: `styles/tokens.css`
- Font Albert Sans con `next/font`, icone SVG inline (`components/icons.tsx`)
- Nessun servizio esterno, nessuna variabile d’ambiente, nessuna libreria UI

## Avvio in locale

Serve Node.js 20.9 o successivo.

```bash
npm install
npm run dev
```

Il sito è su <http://localhost:3000>. Per la versione di produzione:

```bash
npm run build
npm start
```

## Deploy su Vercel

1. Pubblicate il repository su GitHub.
2. Su [vercel.com/new](https://vercel.com/new) importate il repository.
3. Lasciate tutto com’è (Vercel riconosce Next.js da solo) e premete **Deploy**.

Non servono variabili d’ambiente né configurazioni aggiuntive.

## Struttura

```
app/
  page.tsx               landing (/), componenti in app/_landing/
  questionario/          questionario di 12 domande e creazione del profilo
  abbinamento/           specialista proposto, alternative, calendario e prenotazione (protetta)
  area-personale/        percorso, esami, visite, documenti, messaggi (protetta)
  accedi/                accesso con email e password
components/              header in vetro, menu utente, footer, protezione delle pagine, icone
data/                    dati statici presi dal design: domande, specialisti, orari, esami, regole di abbinamento
lib/store/               interfaccia unica dei dati (NestStore) e implementazione su localStorage
lib/journey.ts           passaggi che toccano più dati (questionario completato, scelta dello specialista)
styles/tokens.css        token di design
public/medici/           foto degli specialisti (stock, da sostituire)
design/                  mockup originali (riferimento, non usati dal sito)
```

### Dati

Tutto passa da `lib/store` (`store` + gli hook `useSession` e `useStoreQuery`). L’interfaccia
`NestStore` è asincrona: per collegare un backend basta scrivere un’altra implementazione e
sostituirla in `lib/store/instance.ts`, senza toccare i componenti.

Chiavi in `localStorage`, tutte con prefisso `nest:`:

| Chiave | Contenuto |
| --- | --- |
| `nest:accounts` | account di coppia: nome, email, hash SHA-256 della password (con sale), consenso ai dati sanitari con data |
| `nest:session` | sessione attiva |
| `nest:draft` | bozza: mini-quiz e questionario in corso (risposte, città, passo) |
| `nest:questionnaire:<id>` | risposte del questionario, stato e data di completamento |
| `nest:match:<id>` | specialista proposto, specialista scelto, chi l’ha scelto (Nest o la coppia) |
| `nest:bookings` | prenotazioni di tutti gli account: specialista, giorno, ora, modalità, stato |
| `nest:messages:<id>` | messaggi: mittente, testo, data, letto o non letto |
| `nest:docs:<id>` | nomi dei documenti caricati (il contenuto dei file non viene salvato) |

Più account possono convivere nello stesso browser. Gli orari prenotati da un account non sono più
selezionabili dagli altri. Dal menu utente, **Azzera i dati della demo** cancella (dopo conferma) tutte
le chiavi `nest:`.

## Limiti di questa versione

- **I dati restano solo in quel browser.** Cambiando browser o dispositivo, o cancellando i dati del
  sito, profili, risposte e prenotazioni non ci sono più.
- **I dati non sono protetti.** `localStorage` è leggibile da chiunque usi quel browser e da qualunque
  script della pagina. La password è salvata come hash, ma non c’è un server che la verifichi.
- **Non usate dati sanitari reali.** Questa è una demo: per dati veri servono un backend, cifratura,
  autenticazione lato server e il rispetto del GDPR per le categorie particolari di dati.
- Il calendario mostra le due settimane del design (9–20 novembre 2026). Esami, documenti e i primi
  messaggi dello specialista sono dati di esempio.
- Email di conferma, recupero password, caricamento reale dei file e videochiamate non sono attivi.
- I testi tra parentesi quadre (`[TARIFFA]`, `[EMAIL DI CONTATTO]`, `[Ragione sociale e partita IVA]`)
  sono segnaposto da completare.

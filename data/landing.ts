// Percorsi e domande frequenti della landing (design/Main.dc.html).

export interface CarePath {
  name: string;
  desc: string;
  forWho: string;
  who: string[];
  steps: string[];
}

export const PATHS: CarePath[] = [
  { name: "Prima valutazione di coppia", desc: "Il punto di partenza più comune: un quadro della fertilità di entrambi, con esami mirati invece che ripetuti da uno studio all’altro.", forWho: "Per chi cerca una gravidanza da 12 mesi senza risultati, o da 6 dopo i 35 anni.", who: ["Ginecologo esperto in fertilità", "Andrologo"], steps: ["Visita e storia di coppia", "Riserva ovarica ed ecografia", "Spermiogramma"] },
  { name: "Fertilità maschile", desc: "Il fattore maschile conta quanto quello femminile, ma spesso viene valutato per ultimo. Una visita andrologica chiarisce subito se e come intervenire.", forWho: "Per chi ha uno spermiogramma alterato, o non l’ha mai fatto.", who: ["Andrologo", "Endocrinologo"], steps: ["Visita andrologica", "Spermiogramma e approfondimenti", "Eventuale terapia mirata"] },
  { name: "Inseminazione intrauterina", desc: "Una tecnica di primo livello, poco invasiva: gli spermatozoi, preparati in laboratorio, vengono introdotti nell’utero al momento dell’ovulazione.", forWho: "Per alcune situazioni lievi, quando almeno una tuba è pervia.", who: ["Specialista in PMA", "Centro di PMA"], steps: ["Monitoraggio dell’ovulazione", "Preparazione del campione", "Inseminazione"] },
  { name: "FIVET e ICSI", desc: "La fecondazione avviene in laboratorio. Con la ICSI lo spermatozoo viene iniettato direttamente nell’ovocita; l’embrione viene poi trasferito in utero.", forWho: "Quando le tecniche di primo livello non sono indicate o non hanno funzionato.", who: ["Specialista in PMA", "Embriologo", "Psicologo"], steps: ["Stimolazione ovarica", "Prelievo degli ovociti", "Fecondazione e transfer"] },
  { name: "Fecondazione eterologa", desc: "Si utilizzano ovociti o spermatozoi donati, quando quelli della coppia non permettono di arrivare a una gravidanza.", forWho: "Per esempio con riserva ovarica molto ridotta, o in assenza di spermatozoi.", who: ["Specialista in PMA", "Genetista", "Psicologo"], steps: ["Consulenza e consenso informato", "Abbinamento con il donatore, a cura del centro", "Trattamento"] },
  { name: "Preservare la fertilità", desc: "La crioconservazione degli ovociti permette di rimandare la gravidanza, o di proteggere la fertilità prima di cure che possono ridurla.", forWho: "Per chi vuole rimandare, o deve affrontare terapie oncologiche.", who: ["Ginecologo esperto in fertilità", "Centro di PMA"], steps: ["Valutazione della riserva ovarica", "Stimolazione e prelievo", "Crioconservazione"] },
];

export const FAQ = [
  { q: "Nest sostituisce il nostro medico?", a: "No. Nest vi aiuta a trovare lo specialista giusto e a tenere in ordine il percorso. Diagnosi e terapie restano sempre decise dai medici che vi seguono." },
  { q: "Quanto costa?", a: "Il questionario e l’abbinamento sono gratuiti. Visite ed esami seguono le tariffe di ciascuno specialista, sempre indicate prima della prenotazione." },
  { q: "Possiamo scegliere uno specialista diverso da quello proposto?", a: "Sì. Insieme alla proposta vedete altri professionisti adatti alla vostra situazione, e potete cambiare in qualsiasi momento del percorso." },
  { q: "Chi vede i nostri dati sanitari?", a: "Solo voi e gli specialisti a cui date accesso. Referti e risposte al questionario sono cifrati, e potete cancellarli quando volete." },
  { q: "Dobbiamo compilare il questionario insieme?", a: "Non per forza. Ognuno può rispondere alla propria parte, anche in momenti diversi: il profilo di coppia si completa da sé." },
];

"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { store, useSession, type Account } from "@/lib/store";

// Durante "Esci" la pagina protetta non deve rimandare su /accedi: si va alla home.
let leavingUntil = 0;
export function markLeaving(ms = 3000) {
  leavingUntil = Date.now() + ms;
}

/**
 * Protegge una pagina: senza sessione porta su /accedi.
 * Finché la sessione non è letta (anche sul server) non mostra nulla del contenuto protetto.
 */
export function AuthGate({ children, fallback = null }: { children: (account: Account) => ReactNode; fallback?: ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status !== "anon") return;
    let alive = true;
    // Ricontrolla la sessione prima di uscire: lo stato può essere di un attimo prima.
    store.currentAccount().then((account) => {
      if (alive && !account && Date.now() > leavingUntil) router.replace("/accedi");
    });
    return () => {
      alive = false;
    };
  }, [session.status, router]);

  if (session.status !== "auth") return <>{fallback}</>;
  return <>{children(session.account)}</>;
}

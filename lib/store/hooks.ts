"use client";

import { useEffect, useRef, useState } from "react";
import { store } from "./instance";
import type { Account } from "./types";


/**
 * Legge un valore dallo store dopo il montaggio (mai durante il rendering sul server)
 * e lo aggiorna a ogni modifica. `data` è undefined finché non è pronto.
 */
export function useStoreQuery<T>(fetcher: () => Promise<T>, deps: unknown[] = []): { data: T | undefined; ready: boolean; reload: () => void } {
  const [data, setData] = useState<T | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const fetcherRef = useRef(fetcher);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let alive = true;
    const run = () => {
      fetcherRef.current().then((v) => {
        if (!alive) return;
        setData(v);
        setReady(true);
      });
    };
    run();
    const unsub = store.subscribe(run);
    return () => {
      alive = false;
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, ready, reload: () => setTick((t) => t + 1) };
}

export type SessionState =
  | { status: "loading"; account: null }
  | { status: "anon"; account: null }
  | { status: "auth"; account: Account };

/** Sessione attiva. "loading" sul server e al primo rendering, così non ci sono errori di idratazione. */
export function useSession(): SessionState {
  const { data, ready } = useStoreQuery(() => store.currentAccount());
  if (!ready) return { status: "loading", account: null };
  return data ? { status: "auth", account: data } : { status: "anon", account: null };
}

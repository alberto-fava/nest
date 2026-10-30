// Implementazione attiva di NestStore. Per passare a un backend basta
// sostituire `localStore` con un’altra implementazione dell’interfaccia.
import { localStore } from "./local";
import type { NestStore } from "./types";

export const store: NestStore = localStore;

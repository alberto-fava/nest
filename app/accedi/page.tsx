import type { Metadata } from "next";
import { AccediClient } from "./AccediClient";

export const metadata: Metadata = { title: "accedi" };

export default function AccediPage() {
  return <AccediClient />;
}

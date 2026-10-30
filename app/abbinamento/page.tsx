import type { Metadata } from "next";
import { AbbinamentoClient } from "./AbbinamentoClient";

export const metadata: Metadata = { title: "il vostro abbinamento" };

export default function Page() {
  return <AbbinamentoClient />;
}

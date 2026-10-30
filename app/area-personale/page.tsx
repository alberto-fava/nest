import type { Metadata } from "next";
import { AreaClient } from "./AreaClient";

export const metadata: Metadata = { title: "area personale" };

export default function Page() {
  return <AreaClient />;
}

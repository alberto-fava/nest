import type { Metadata } from "next";
import { QuestionarioClient } from "./QuestionarioClient";

export const metadata: Metadata = { title: "questionario" };

export default function Page() {
  return <QuestionarioClient />;
}

import type { Metadata, Viewport } from "next";
import { Albert_Sans } from "next/font/google";
import "./globals.css";

const albertSans = Albert_Sans({
  variable: "--font-albert",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nest, lo specialista giusto per diventare genitori",
    template: "Nest, %s",
  },
  description:
    "Nest mette in contatto le coppie che cercano una gravidanza con gli specialisti della fertilità più adatti a loro.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#F4F5F9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={albertSans.variable}>
      <body>{children}</body>
    </html>
  );
}

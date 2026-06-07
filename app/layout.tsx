import type { Metadata } from "next";
import {
  Patrick_Hand,
  Kalam,
  Newsreader,
  JetBrains_Mono,
  Inter,
} from "next/font/google";
import "./globals.css";

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-patrick-hand",
  display: "swap",
});
const kalam = Kalam({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-kalam",
  display: "swap",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "66 Days — Perception & Judgment System",
  description:
    "A daily journal for sharper perception, judgment, people-reading, and calibrated forecasting.",
};

const fontVars = [
  patrickHand.variable,
  kalam.variable,
  newsreader.variable,
  jetbrainsMono.variable,
  inter.variable,
].join(" ");

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Default to the locked "operator night" dark look; ThemeProvider (M6) will
  // hydrate the user's stored preference. The /night route forces dark regardless.
  return (
    <html lang="en" data-theme="night" className={fontVars}>
      <body className="grain vignette">{children}</body>
    </html>
  );
}

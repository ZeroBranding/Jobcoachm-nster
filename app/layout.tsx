import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";

export const metadata = {
  title: "JobCoach Münster",
  description: "Hilfe beim Online-Antrag: ALG, Kindergeld, Wohngeld u.v.m.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 bg-black text-white px-3 py-2 rounded">Zum Inhalt springen</a>
        <header className="w-full">
          <nav className="container flex items-center justify-between py-4">
            <Link href="/" className="text-lg font-semibold">JobCoach Münster</Link>
            <div className="flex gap-4">
              <Link href="/formulare">Formulare</Link>
              <Link href="/kontakt">Kontakt</Link>
              <Link href="/legal/impressum">Impressum</Link>
            </div>
          </nav>
        </header>
        <main id="main">
          {children}
        </main>
      </body>
    </html>
  );
}


import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "JobCoach Münster",
  description: "Hilfe beim Online-Antrag: ALG, Kindergeld, Wohngeld u.v.m.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}


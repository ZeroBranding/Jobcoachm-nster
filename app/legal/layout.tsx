import { ReactNode } from "react";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 prose prose-invert">
      {children}
    </div>
  );
}


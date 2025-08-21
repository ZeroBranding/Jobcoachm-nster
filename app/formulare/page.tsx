"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";

const formSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  type: z.enum(["ALG2", "Kindergeld", "Wohngeld", "BAföG"]),
  message: z.string().min(10),
  acceptAGB: z.boolean().refine((v) => v, "AGB müssen akzeptiert werden"),
  acceptPrivacy: z.boolean().refine((v) => v, "Datenschutzerklärung muss akzeptiert werden"),
  signedAt: z.string(),
});

export default function FormularePage() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setStatus(null);
    const data = {
      fullName: String(formData.get("fullName") || ""),
      email: String(formData.get("email") || ""),
      type: String(formData.get("type") || "ALG2"),
      message: String(formData.get("message") || ""),
      acceptAGB: Boolean(formData.get("acceptAGB")),
      acceptPrivacy: Boolean(formData.get("acceptPrivacy")),
      signedAt: new Date().toISOString(),
    };

    const parsed = formSchema.safeParse(data);
    if (!parsed.success) {
      setStatus(parsed.error.errors.map(e => e.message).join(", "));
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (res.ok) setStatus("Anfrage erfolgreich übermittelt.");
    else setStatus("Fehler beim Senden: " + (await res.text()));
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <motion.h2 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-3xl font-semibold">Formulare</motion.h2>
      <p className="text-slate-300 mt-2">Wähle den Antragstyp und sende uns deine Anfrage. Wir melden uns zeitnah.</p>

      <form action={onSubmit} className="glass mt-8 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-slate-300">Vollständiger Name</label>
          <input name="fullName" className="mt-1 w-full rounded-lg bg-black/30 border border-white/20 p-3 focus:outline-none" required />
        </div>
        <div>
          <label className="block text-sm text-slate-300">E-Mail</label>
          <input type="email" name="email" className="mt-1 w-full rounded-lg bg-black/30 border border-white/20 p-3 focus:outline-none" required />
        </div>
        <div>
          <label className="block text-sm text-slate-300">Antragstyp</label>
          <select name="type" className="mt-1 w-full rounded-lg bg-black/30 border border-white/20 p-3 focus:outline-none">
            <option value="ALG2">ALG II / Bürgergeld</option>
            <option value="Kindergeld">Kindergeld</option>
            <option value="Wohngeld">Wohngeld</option>
            <option value="BAföG">BAföG</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-300">Nachricht / Details</label>
          <textarea name="message" rows={5} className="mt-1 w-full rounded-lg bg-black/30 border border-white/20 p-3 focus:outline-none" />
        </div>

        <div className="space-y-2 text-sm text-slate-300">
          <label className="flex items-start gap-3">
            <input type="checkbox" name="acceptAGB" className="mt-1" />
            <span>Ich habe die <a className="underline" href="/legal/agb" target="_blank">AGB</a> gelesen und akzeptiere die digitale Signatur zur Auftragserteilung.</span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="acceptPrivacy" className="mt-1" />
            <span>Ich habe die <a className="underline" href="/legal/datenschutz" target="_blank">Datenschutzerklärung</a> gelesen. Ich willige in die Verarbeitung meiner Daten ein und in die Löschung nach Abschluss.</span>
          </label>
        </div>

        <button type="submit" className="mt-4 rounded-xl bg-primary/30 hover:bg-primary/40 border border-primary/40 px-6 py-3">
          Anfrage senden
        </button>

        {status && <p className="text-sm text-slate-200">{status}</p>}
      </form>
    </div>
  );
}


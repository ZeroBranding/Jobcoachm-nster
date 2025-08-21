"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";

const formSchema = z.object({
  fullName: z.string().min(2, "Bitte Vor- und Nachnamen angeben"),
  email: z.string().email("Bitte gültige E-Mail angeben"),
  type: z.enum(["ALG2", "Kindergeld", "Wohngeld", "BAföG"], { errorMap: () => ({ message: "Bitte Antragstyp wählen" }) }),
  message: z.string().min(10, "Bitte mindestens 10 Zeichen eingeben"),
  acceptAGB: z.boolean().refine((v) => v, "AGB müssen akzeptiert werden"),
  acceptPrivacy: z.boolean().refine((v) => v, "Datenschutzerklärung muss akzeptiert werden"),
  signedAt: z.string(),
});

type FormDataShape = z.infer<typeof formSchema>;

export default function FormularePage() {
  const [status, setStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const initial: FormDataShape = useMemo(() => ({
    fullName: "",
    email: "",
    type: "ALG2",
    message: "",
    acceptAGB: false,
    acceptPrivacy: false,
    signedAt: new Date().toISOString(),
  }), []);
  const [values, setValues] = useState<FormDataShape>(initial);

  useEffect(() => {
    const result = formSchema.safeParse(values);
    if (!result.success) {
      const e: Record<string, string> = {};
      for (const err of result.error.errors) {
        const path = (err.path?.[0] as string) || "form";
        if (!e[path]) e[path] = err.message;
      }
      setErrors(e);
    } else {
      setErrors({});
    }
  }, [values]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      setStatus("Bitte korrigiere die markierten Felder.");
      return;
    }
    try {
      setSending(true);
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "") + "/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.ok) {
        setStatus("Anfrage erfolgreich übermittelt.");
        setValues(initial);
      } else {
        setStatus("Fehler beim Senden: " + (await res.text()));
      }
    } catch (err) {
      setStatus("Netzwerkfehler. Bitte später erneut versuchen.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <motion.h2 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-3xl font-semibold">Formulare</motion.h2>
      <p className="text-slate-300 mt-2">Wähle den Antragstyp und sende uns deine Anfrage. Wir melden uns zeitnah.</p>

      <form onSubmit={onSubmit} className="glass mt-8 rounded-2xl p-6 space-y-4" noValidate>
        <div>
          <label htmlFor="fullName" className="block text-sm text-slate-300">Vollständiger Name</label>
          <input
            id="fullName"
            name="fullName"
            aria-label="Vollständiger Name"
            className="mt-1 w-full rounded-lg bg-black/30 border border-white/20 p-3 focus:outline-none"
            required
            value={values.fullName}
            onChange={(e) => setValues(v => ({ ...v, fullName: e.target.value }))}
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-300" role="alert">{errors.fullName}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-slate-300">E-Mail</label>
          <input
            id="email"
            type="email"
            name="email"
            aria-label="E-Mail Adresse"
            className="mt-1 w-full rounded-lg bg-black/30 border border-white/20 p-3 focus:outline-none"
            required
            value={values.email}
            onChange={(e) => setValues(v => ({ ...v, email: e.target.value }))}
          />
          {errors.email && <p className="mt-1 text-xs text-red-300" role="alert">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="type" className="block text-sm text-slate-300">Antragstyp</label>
          <select
            id="type"
            name="type"
            aria-label="Antragstyp"
            className="mt-1 w-full rounded-lg bg-black/30 border border-white/20 p-3 focus:outline-none"
            value={values.type}
            onChange={(e) => setValues(v => ({ ...v, type: e.target.value as FormDataShape["type"] }))}
            required
          >
            <option value="ALG2">ALG II / Bürgergeld</option>
            <option value="Kindergeld">Kindergeld</option>
            <option value="Wohngeld">Wohngeld</option>
            <option value="BAföG">BAföG</option>
          </select>
          {errors.type && <p className="mt-1 text-xs text-red-300" role="alert">{errors.type}</p>}
        </div>
        <div>
          <label htmlFor="message" className="block text-sm text-slate-300">Nachricht / Details</label>
          <textarea
            id="message"
            name="message"
            aria-label="Nachricht oder Details"
            rows={5}
            className="mt-1 w-full rounded-lg bg-black/30 border border-white/20 p-3 focus:outline-none"
            required
            value={values.message}
            onChange={(e) => setValues(v => ({ ...v, message: e.target.value }))}
          />
          {errors.message && <p className="mt-1 text-xs text-red-300" role="alert">{errors.message}</p>}
        </div>

        <div className="space-y-2 text-sm text-slate-300">
          <label htmlFor="acceptAGB" className="flex items-start gap-3">
            <input
              id="acceptAGB"
              type="checkbox"
              name="acceptAGB"
              className="mt-1"
              checked={values.acceptAGB}
              onChange={(e) => setValues(v => ({ ...v, acceptAGB: e.target.checked }))}
              aria-required="true"
            />
            <span>Ich habe die <a className="underline" href="/legal/agb">AGB</a> gelesen und akzeptiere die digitale Signatur zur Auftragserteilung.</span>
          </label>
          {errors.acceptAGB && <p className="mt-1 text-xs text-red-300" role="alert">{errors.acceptAGB}</p>}
          <label htmlFor="acceptPrivacy" className="flex items-start gap-3">
            <input
              id="acceptPrivacy"
              type="checkbox"
              name="acceptPrivacy"
              className="mt-1"
              checked={values.acceptPrivacy}
              onChange={(e) => setValues(v => ({ ...v, acceptPrivacy: e.target.checked }))}
              aria-required="true"
            />
            <span>Ich habe die <a className="underline" href="/legal/datenschutz">Datenschutzerklärung</a> gelesen. Ich willige in die Verarbeitung meiner Daten ein und in die Löschung nach Abschluss.</span>
          </label>
          {errors.acceptPrivacy && <p className="mt-1 text-xs text-red-300" role="alert">{errors.acceptPrivacy}</p>}
        </div>

        <button
          type="submit"
          className="mt-4 rounded-xl bg-primary/30 hover:bg-primary/40 border border-primary/40 px-6 py-3 disabled:opacity-60"
          aria-label="Anfrage senden"
          disabled={sending}
        >
          {sending ? "Senden…" : "Anfrage senden"}
        </button>

        <p aria-live="polite" className="text-sm text-slate-200 min-h-[1.25rem]">{status || ""}</p>
      </form>
    </div>
  );
}


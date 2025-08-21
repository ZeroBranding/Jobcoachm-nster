import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import cron from "node-cron";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || ["*"], credentials: false }));
app.use(helmet());

const prisma = new PrismaClient();

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Create request
app.post("/api/requests", async (req, res) => {
  try {
    const { fullName, email, type, message, acceptAGB, acceptPrivacy, signedAt } = req.body as {
      fullName: string; email: string; type: string; message: string; acceptAGB: boolean; acceptPrivacy: boolean; signedAt: string;
    };
    if (!fullName || !email || !acceptAGB || !acceptPrivacy) return res.status(400).send("Ungültige Eingabe");

    const saved = await prisma.request.create({
      data: { fullName, email, type, message, acceptAGB, acceptPrivacy, signedAt: new Date(signedAt) }
    });

    if (process.env.SMTP_HOST && process.env.NOTIFY_TO) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Boolean(process.env.SMTP_SECURE === "true"),
        auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "no-reply@jobcoach-muenster.de",
        to: process.env.NOTIFY_TO,
        subject: `Neue Anfrage: ${type} – ${fullName}`,
        text: `${fullName} (${email})\nTyp: ${type}\n\n${message}\n\nHinweis: Daten werden nach Abschluss gelöscht.`,
      });
    }

    res.status(201).json({ id: saved.id });
  } catch (e) {
    console.error(e);
    res.status(500).send("Serverfehler");
  }
});

// Admin endpoint to mark request completed
app.post("/api/requests/:id/complete", async (req, res) => {
  try {
    const token = req.header("x-admin-token");
    if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) return res.status(401).send("Unauthorized");
    const updated = await prisma.request.update({ where: { id: req.params.id }, data: { status: "COMPLETED" } });
    res.json({ ok: true, id: updated.id });
  } catch (e) {
    res.status(400).send("Nicht gefunden");
  }
});

// Cron: auto-delete completed requests and emails indication
cron.schedule("0 3 * * *", async () => {
  try {
    const deleted = await prisma.request.deleteMany({ where: { status: "COMPLETED" } });
    if (deleted.count > 0) {
      console.log(`Auto-deleted ${deleted.count} completed requests`);
    }
  } catch (e) {
    console.error("Cron deletion error", e);
  }
});

const port = Number(process.env.BACKEND_PORT || 4000);
app.listen(port, () => {
  console.log(`Backend listening on :${port}`);
});

